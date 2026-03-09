# Phase 5 — AI RAG Pipeline Architecture

## Overview

This is the **core differentiator** of the migration. Replace the naive text truncation approach (first ~10K chars of a document) with a proper Retrieval-Augmented Generation (RAG) pipeline: chunk documents, generate vector embeddings, store in pgvector, retrieve semantically relevant chunks, rerank, and build context-rich prompts for Groq.

**Duration**: Week 3  
**Dependencies**: Phase 1 (PostgreSQL + pgvector), Phase 4 (DocumentChunk model)  
**Deliverables**: Chunker, Embedder, Retriever, Reranker, PromptBuilder, RAGService, Celery workers

---

## Why RAG Matters

### Current Approach (Naive)
```
User question → Truncate document to ~10,000 chars → Send to Groq → Response
```

**Problems:**
- Loses context from large documents (only first ~10K chars used)
- No semantic understanding of what's relevant
- Entire document sent even for specific questions
- Token waste — most context is irrelevant to the question
- Poor answers on topics at the end of long documents

### RAG Approach (Semantic)
```
User question → Embed question → Vector search top-K relevant chunks
  → Rerank by relevance → Build focused context → Send to Groq → Response
```

**Benefits:**
- Answers based on the most relevant sections
- Works with any document size (10 pages or 1000 pages)
- Lower token usage — only relevant context sent
- Better accuracy — AI sees precisely what it needs
- Source citations — references exact pages/sections

---

## Pipeline Architecture

### Ingestion Pipeline (Document Upload)

```
PDF Upload → Extract Text (PyMuPDF) → Chunk Text (512 tokens, 50 overlap)
         → Generate Embeddings (all-MiniLM-L6-v2, 384 dims)
         → Store in pgvector (document_chunks table)
```

### Retrieval Pipeline (User Query)

```
User Query → Embed Query → pgvector Cosine Similarity Search (top 8)
         → Rerank (top 4) → Build Prompt (system + context + history + question)
         → Groq API (stream) → Response with [Page X] citations
```

---

## Step-by-Step Guide

### Step 5.1 — Document Chunker

```python
# app/rag/chunker.py
from dataclasses import dataclass

@dataclass
class Chunk:
    content: str
    page_number: int
    chunk_index: int
    token_count: int
    metadata: dict

class DocumentChunker:
    """
    Splits document text into overlapping chunks for embedding.
    Uses paragraph boundaries when possible for semantic coherence.
    """

    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 50):
        self.chunk_size = chunk_size    # max tokens per chunk
        self.chunk_overlap = chunk_overlap  # overlap tokens between chunks

    def chunk_document(self, pages: list[dict]) -> list[Chunk]:
        """
        Chunk a document's pages into embedding-ready chunks.

        Args:
            pages: List of {"page_number": int, "content": str}

        Returns:
            List of Chunk objects with content, page info, and metadata
        """
        chunks = []
        chunk_index = 0

        for page in pages:
            page_chunks = self._chunk_page(
                page["content"],
                page["page_number"],
                chunk_index,
            )
            chunks.extend(page_chunks)
            chunk_index += len(page_chunks)

        return chunks

    def _chunk_page(self, text: str, page_number: int, start_index: int) -> list[Chunk]:
        """Split a single page into chunks with overlap at paragraph boundaries."""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        chunks = []
        current_chunk = ""
        current_tokens = 0

        for para in paragraphs:
            para_tokens = len(para.split())  # approximate word ≈ token count

            if current_tokens + para_tokens > self.chunk_size and current_chunk:
                chunks.append(Chunk(
                    content=current_chunk.strip(),
                    page_number=page_number,
                    chunk_index=start_index + len(chunks),
                    token_count=current_tokens,
                    metadata={"page": page_number},
                ))

                # Keep overlap from end of current chunk
                overlap_text = " ".join(current_chunk.split()[-self.chunk_overlap:])
                current_chunk = overlap_text + " " + para
                current_tokens = len(current_chunk.split())
            else:
                current_chunk += " " + para if current_chunk else para
                current_tokens += para_tokens

        # Last chunk
        if current_chunk.strip():
            chunks.append(Chunk(
                content=current_chunk.strip(),
                page_number=page_number,
                chunk_index=start_index + len(chunks),
                token_count=len(current_chunk.split()),
                metadata={"page": page_number},
            ))

        return chunks
```

**Copilot Prompt:**
```
Create app/rag/chunker.py with a DocumentChunker class. It should split document pages 
into overlapping chunks of ~512 tokens with 50-token overlap. Use paragraph boundaries 
(\n\n) as natural split points. Return Chunk dataclass objects with content, page_number, 
chunk_index, token_count, metadata.
```

### Step 5.2 — Embedding Generator

```python
# app/rag/embedder.py
from sentence_transformers import SentenceTransformer
from app.config import settings

class Embedder:
    """
    Generates 384-dimensional vector embeddings using sentence-transformers.
    Model: all-MiniLM-L6-v2 (80MB, fast, good quality)
    """

    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

    def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        return self.model.encode(text, normalize_embeddings=True).tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts (batch processing)."""
        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
            batch_size=64,
            show_progress_bar=True,
        )
        return embeddings.tolist()

    @property
    def dimensions(self) -> int:
        return self.model.get_sentence_embedding_dimension()
```

**Copilot Prompt:**
```
Create app/rag/embedder.py with an Embedder class using sentence-transformers. 
Load model from settings.EMBEDDING_MODEL (default: all-MiniLM-L6-v2, 384 dims). 
Methods: embed_text (single string → list[float]), embed_batch (list[str] → 
list[list[float]] with batch_size=64). Normalize all embeddings.
```

### Step 5.3 — Vector Retriever

```python
# app/rag/retriever.py
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.rag.embedder import Embedder

class VectorRetriever:
    """
    Retrieves the most relevant document chunks using pgvector cosine similarity.
    """

    def __init__(self, embedder: Embedder):
        self.embedder = embedder

    async def retrieve(
        self,
        db: AsyncSession,
        document_id: str,
        query: str,
        top_k: int = 8,
    ) -> list[dict]:
        """
        Find the top-K most relevant chunks for a query within one document.
        Uses pgvector's <=> (cosine distance) operator.
        """
        query_embedding = self.embedder.embed_text(query)

        result = await db.execute(
            text("""
                SELECT
                    id, content, page_number, chunk_index, token_count,
                    1 - (embedding <=> :query_embedding::vector) AS similarity
                FROM document_chunks
                WHERE document_id = :document_id
                ORDER BY embedding <=> :query_embedding::vector
                LIMIT :top_k
            """),
            {
                "query_embedding": str(query_embedding),
                "document_id": document_id,
                "top_k": top_k,
            },
        )

        return [
            {
                "id": str(row.id),
                "content": row.content,
                "page_number": row.page_number,
                "chunk_index": row.chunk_index,
                "token_count": row.token_count,
                "similarity": float(row.similarity),
            }
            for row in result.fetchall()
        ]

    async def retrieve_multi_document(
        self,
        db: AsyncSession,
        document_ids: list[str],
        query: str,
        top_k: int = 8,
    ) -> list[dict]:
        """Retrieve across multiple documents (cross-document search)."""
        query_embedding = self.embedder.embed_text(query)

        result = await db.execute(
            text("""
                SELECT
                    dc.id, dc.content, dc.page_number, dc.document_id,
                    d.title as document_title,
                    1 - (dc.embedding <=> :query_embedding::vector) AS similarity
                FROM document_chunks dc
                JOIN documents d ON d.id = dc.document_id
                WHERE dc.document_id = ANY(:document_ids)
                ORDER BY dc.embedding <=> :query_embedding::vector
                LIMIT :top_k
            """),
            {
                "query_embedding": str(query_embedding),
                "document_ids": document_ids,
                "top_k": top_k,
            },
        )

        return [dict(row._mapping) for row in result.fetchall()]
```

**Copilot Prompt:**
```
Create app/rag/retriever.py with a VectorRetriever class. Methods: retrieve (single 
document, embed query → pgvector cosine similarity search → return top-K chunks with 
similarity scores), retrieve_multi_document (same but across multiple document IDs). 
Use SQLAlchemy text() with parameterized queries.
```

### Step 5.4 — Reranker

```python
# app/rag/reranker.py

class Reranker:
    """
    Reranks retrieved chunks by combining vector similarity with keyword overlap.
    This improves relevance without needing a cross-encoder model.
    """

    def rerank(self, query: str, chunks: list[dict], top_k: int = 4) -> list[dict]:
        """
        Rerank using combined scoring:
        - 70% vector similarity (from pgvector)
        - 30% keyword overlap (simple but effective)
        """
        query_terms = set(query.lower().split())

        for chunk in chunks:
            content_terms = set(chunk["content"].lower().split())
            overlap = len(query_terms & content_terms) / max(len(query_terms), 1)

            chunk["rerank_score"] = (
                0.7 * chunk["similarity"]
                + 0.3 * overlap
            )

        chunks.sort(key=lambda x: x["rerank_score"], reverse=True)
        return chunks[:top_k]
```

### Step 5.5 — Prompt Builder

```python
# app/rag/prompt_builder.py

class PromptBuilder:
    """
    Constructs context-rich prompts for Groq using retrieved RAG chunks.
    Supports different prompt types: chat, question generation, weakness analysis, etc.
    """

    def build_chat_prompt(self, chunks: list[dict], mark_level: str = "4M",
                          document_title: str = "") -> str:
        context = self._format_chunks(chunks)

        mark_instructions = {
            "2M": "Give brief, concise answers (2-3 sentences). Focus on key definitions.",
            "4M": "Give short, structured answers (4-5 key points with brief explanations).",
            "8M": "Give detailed answers with examples, diagrams, and comprehensive explanations.",
            "16M": "Give exhaustive, essay-style answers covering all aspects with examples, comparisons, and critical analysis.",
        }

        return f"""You are an expert study assistant for the document: "{document_title}".

Answer the student's questions using ONLY the provided context from their study material.
If the answer is not in the context, say so clearly.

{mark_instructions.get(mark_level, mark_instructions["4M"])}

Always cite the page number when referencing information: [Page X].

## Relevant Context:
{context}
"""

    def build_question_generation_prompt(self, chunks: list[dict],
                                          difficulty: str, count: int) -> str:
        context = self._format_chunks(chunks)

        return f"""Generate {count} exam questions from the following content.
Difficulty: {difficulty}

Mix question types: conceptual, application, and analytical.
Assign marks (2M, 4M, 8M, 16M) based on complexity.
Include expected answers and hints.

## Source Content:
{context}

Respond in JSON format:
{{
  "questions": [
    {{
      "id": 1,
      "question": "...",
      "type": "conceptual|application|analytical",
      "marks": 2,
      "expectedAnswer": "...",
      "hint": "..."
    }}
  ]
}}"""

    def build_weakness_analysis_prompt(self, chunks: list[dict],
                                        exam_answers: list[dict]) -> str:
        context = self._format_chunks(chunks)
        answers_text = "\\n".join(
            f"Q: {a['question']}\\nStudent Answer: {a['answer']}\\nExpected: {a.get('expected', 'N/A')}"
            for a in exam_answers
        )

        return f"""Analyze the student's exam performance and identify weaknesses.

## Document Context:
{context}

## Student's Answers:
{answers_text}

Identify weak topics, assign confidence scores (0.0-1.0), and generate micro-lessons.
Respond in JSON format."""

    def build_summary_prompt(self, chunks: list[dict], summary_type: str) -> str:
        context = self._format_chunks(chunks)
        type_instructions = {
            "chapter": "Create a detailed chapter summary with key points, definitions, and examples.",
            "quick": "Create a brief 5-bullet summary of the main ideas.",
            "exam": "Create an exam-focused summary highlighting testable concepts.",
            "flashcards": "Summarize in a way that would help create effective flashcards.",
        }
        return f"""{type_instructions.get(summary_type, type_instructions["chapter"])}

## Content:
{context}
"""

    def build_concept_extraction_prompt(self, chunks: list[dict]) -> str:
        context = self._format_chunks(chunks)
        return f"""Extract key concepts and their relationships from this content.

## Content:
{context}

Return JSON:
{{
  "concepts": [
    {{"name": "...", "definition": "...", "category": "...", "importance": 0.9}}
  ],
  "relationships": [
    {{"from": "concept_a", "to": "concept_b", "type": "depends_on|is_part_of|related_to", "strength": 0.8}}
  ]
}}"""

    def build_flashcard_generation_prompt(self, chunks: list[dict], count: int) -> str:
        context = self._format_chunks(chunks)
        return f"""Generate {count} flashcards from this study content.

## Content:
{context}

Return JSON:
{{
  "flashcards": [
    {{"front": "Question or term", "back": "Answer or definition", "tags": ["topic1"]}}
  ]
}}"""

    def _format_chunks(self, chunks: list[dict]) -> str:
        if not chunks:
            return "No relevant context found."

        formatted = []
        for i, chunk in enumerate(chunks, 1):
            page = chunk.get("page_number", "?")
            similarity = chunk.get("similarity", 0)
            formatted.append(
                f"--- Excerpt {i} [Page {page}] (relevance: {similarity:.2f}) ---\\n"
                f"{chunk['content']}\\n"
            )
        return "\\n".join(formatted)
```

**Copilot Prompt:**
```
Create app/rag/prompt_builder.py with a PromptBuilder class. Build prompts for: 
chat (with mark level 2M/4M/8M/16M and page citations), question generation (JSON output),
weakness analysis, summary generation (chapter/quick/exam/flashcards types), concept 
extraction (JSON), flashcard generation (JSON). Include a _format_chunks helper that 
formats retrieved chunks with page numbers and relevance scores.
```

### Step 5.6 — RAG Service (Orchestrator)

```python
# app/services/rag_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.rag.chunker import DocumentChunker
from app.rag.embedder import Embedder
from app.rag.retriever import VectorRetriever
from app.rag.reranker import Reranker
from app.rag.prompt_builder import PromptBuilder
from app.config import settings

class RAGService:
    """
    Orchestrates the full RAG pipeline:
    Ingest → Embed → Store → Retrieve → Rerank → Build Prompt
    """

    def __init__(self):
        self.chunker = DocumentChunker(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
        )
        self.embedder = Embedder()
        self.retriever = VectorRetriever(self.embedder)
        self.reranker = Reranker()
        self.prompt_builder = PromptBuilder()

    async def ingest_document(self, db: AsyncSession, document_id: str, pages: list[dict]):
        """Full ingestion: chunk → embed → store vectors."""
        chunks = self.chunker.chunk_document(pages)
        texts = [c.content for c in chunks]
        embeddings = self.embedder.embed_batch(texts)

        for chunk, embedding in zip(chunks, embeddings):
            await db.execute(
                text("""
                    INSERT INTO document_chunks
                        (id, document_id, page_number, chunk_index, content, token_count, embedding)
                    VALUES
                        (gen_random_uuid(), :doc_id, :page, :idx, :content, :tokens, :embedding::vector)
                """),
                {
                    "doc_id": document_id,
                    "page": chunk.page_number,
                    "idx": chunk.chunk_index,
                    "content": chunk.content,
                    "tokens": chunk.token_count,
                    "embedding": str(embedding),
                },
            )
        await db.commit()

    async def retrieve_context(
        self, db: AsyncSession, document_id: str, query: str,
        top_k: int = None, rerank_top_k: int = None,
    ) -> list[dict]:
        """Retrieve and rerank relevant chunks for a query."""
        top_k = top_k or settings.TOP_K_RETRIEVAL
        rerank_top_k = rerank_top_k or settings.RERANK_TOP_K

        chunks = await self.retriever.retrieve(db, document_id, query, top_k=top_k)
        reranked = self.reranker.rerank(query, chunks, top_k=rerank_top_k)
        return reranked

    def build_context_prompt(self, chunks: list[dict], prompt_type: str = "chat", **kwargs) -> str:
        """Build a context-enriched prompt for the LLM."""
        builders = {
            "chat": lambda: self.prompt_builder.build_chat_prompt(
                chunks, mark_level=kwargs.get("mark_level", "4M"),
                document_title=kwargs.get("document_title", "")),
            "questions": lambda: self.prompt_builder.build_question_generation_prompt(
                chunks, difficulty=kwargs.get("difficulty", "medium"),
                count=kwargs.get("count", 5)),
            "weakness": lambda: self.prompt_builder.build_weakness_analysis_prompt(
                chunks, exam_answers=kwargs.get("exam_answers", [])),
            "summary": lambda: self.prompt_builder.build_summary_prompt(
                chunks, summary_type=kwargs.get("summary_type", "chapter")),
            "concepts": lambda: self.prompt_builder.build_concept_extraction_prompt(chunks),
            "flashcards": lambda: self.prompt_builder.build_flashcard_generation_prompt(
                chunks, count=kwargs.get("count", 10)),
        }
        builder = builders.get(prompt_type, builders["chat"])
        return builder()
```

**Copilot Prompt:**
```
Create app/services/rag_service.py with a RAGService class that orchestrates the full 
pipeline. Methods: ingest_document (chunk + batch embed + store in pgvector), 
retrieve_context (vector search + rerank), build_context_prompt (dispatch to appropriate 
PromptBuilder method based on prompt_type). Use settings for chunk_size, top_k, etc.
```

### Step 5.7 — Celery Workers for Background Processing

**PDF Extraction Worker:**
```python
# app/workers/pdf_worker.py
import fitz  # PyMuPDF
from app.workers.celery_app import celery_app
from app.services.storage_service import StorageService
from app.services.rag_service import RAGService

storage = StorageService()
rag = RAGService()

@celery_app.task(name="process_document")
def process_document(document_id: str, file_path: str):
    """
    Background task: Download PDF → Extract text → Chunk → Embed → Store vectors.
    Triggered automatically after document upload.
    """
    import asyncio
    asyncio.run(_process(document_id, file_path))

async def _process(document_id: str, file_path: str):
    from app.core.database import async_session

    # 1. Download PDF from MinIO
    pdf_bytes = await storage.get_document_bytes(file_path)

    # 2. Extract text page by page
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    full_text_parts = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        pages.append({"page_number": page_num + 1, "content": text})
        full_text_parts.append(text)

    doc.close()

    # 3. Store pages + run RAG ingestion
    async with async_session() as db:
        # Store document pages
        for page in pages:
            await db.execute(
                text("""
                    INSERT INTO document_pages (id, document_id, page_number, content, word_count)
                    VALUES (gen_random_uuid(), :doc_id, :page_num, :content, :word_count)
                """),
                {
                    "doc_id": document_id,
                    "page_num": page["page_number"],
                    "content": page["content"],
                    "word_count": len(page["content"].split()),
                },
            )

        # 4. RAG ingestion (chunk + embed + store vectors)
        await rag.ingest_document(db, document_id, pages)

        # 5. Update document status
        full_text = "\n\n".join(full_text_parts)
        await db.execute(
            text("""
                UPDATE documents
                SET status = 'ready', extracted_text = :text,
                    page_count = :page_count, updated_at = NOW()
                WHERE id = :doc_id
            """),
            {"doc_id": document_id, "text": full_text, "page_count": len(pages)},
        )
        await db.commit()
```

**Celery App Configuration:**
```python
# app/workers/celery_app.py
from celery import Celery
from app.config import settings

celery_app = Celery(
    "noteaura",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# Auto-discover tasks
celery_app.autodiscover_tasks(["app.workers"])
```

**Copilot Prompt:**
```
Create app/workers/celery_app.py with Celery config using Redis broker from settings.
Create app/workers/pdf_worker.py with a process_document task that:
1. Downloads PDF from MinIO
2. Extracts text page-by-page using PyMuPDF (fitz)  
3. Stores document_pages in database
4. Runs RAG ingestion (chunk + embed + store vectors)
5. Updates document status to 'ready'
```

### Step 5.8 — Trigger Worker from Upload Endpoint

Update the upload endpoint (Phase 3) to trigger the Celery task:

```python
# In app/api/documents.py, after creating the document record:
from app.workers.pdf_worker import process_document

# Trigger background processing
process_document.delay(doc_id, file_path)
```

---

## Chunking Strategy Details

```
Document (50 pages, ~25K words)
    │
    ├── Page 1 (500 words)
    │   └── Chunk 0 (500 words — fits in one chunk)
    │
    ├── Page 2 (1200 words)
    │   ├── Chunk 1 (512 words + 50 overlap from previous)
    │   └── Chunk 2 (remaining ~738 words)
    │
    ├── Page 3-50...
    │
    └── Total: ~200-500 chunks

Storage: 384 dims × 4 bytes × 300 chunks ≈ 460 KB vectors per document
```

## Embedding Model Comparison

| Model | Dimensions | Speed | Quality | Size |
|-------|-----------|-------|---------|------|
| **all-MiniLM-L6-v2** *(recommended)* | 384 | Fast | Good | 80MB |
| all-mpnet-base-v2 | 768 | Medium | Very Good | 420MB |
| e5-large-v2 | 1024 | Slow | Excellent | 1.3GB |

Start with `all-MiniLM-L6-v2` for speed. Upgrade if quality needs improvement.

---

## Verification Checklist

- [ ] Chunker splits a test document correctly with proper overlap
- [ ] Embedder generates 384-dim vectors
- [ ] Batch embedding works for 100+ chunks
- [ ] Ingested chunks appear in `document_chunks` table with vectors
- [ ] Vector similarity search returns relevant results
- [ ] Reranker improves ordering of results
- [ ] PromptBuilder creates well-formatted prompts with page citations
- [ ] Celery worker processes PDFs end-to-end: upload → extract → chunk → embed → ready
- [ ] Full pipeline test: upload PDF → ask question → get relevant answer with page refs

---

## Testing

```python
# tests/test_rag/test_chunker.py
from app.rag.chunker import DocumentChunker

def test_chunk_document():
    chunker = DocumentChunker(chunk_size=100, chunk_overlap=10)
    pages = [
        {"page_number": 1, "content": "A " * 200},
        {"page_number": 2, "content": "B " * 50},
    ]
    chunks = chunker.chunk_document(pages)
    assert len(chunks) >= 3
    assert chunks[0].page_number == 1

def test_chunk_overlap():
    chunker = DocumentChunker(chunk_size=50, chunk_overlap=10)
    pages = [{"page_number": 1, "content": " ".join(f"word{i}" for i in range(100))}]
    chunks = chunker.chunk_document(pages)
    if len(chunks) > 1:
        last_words = chunks[0].content.split()[-10:]
        first_words = chunks[1].content.split()[:10]
        assert last_words == first_words
```

**Copilot Prompt:**
```
Create tests for the RAG pipeline: test_chunker.py (test splitting, overlap, edge cases), 
test_embedder.py (test dimensions, batch processing), test_retriever.py (test similarity 
search with mock data), test_reranker.py (test score combining and ordering).
```

---

## Next Phase

Once the RAG pipeline is working end-to-end, proceed to [Phase 6 — Groq LLM Integration](phase-06-groq-integration.md).
