# GitHub Copilot Development Guide — NoteAura Migration

> End-to-end guide for building the entire NoteAura Python backend using GitHub Copilot as your AI pair-programmer.

---

## Table of Contents

1. [Setup for Copilot](#1-setup-for-copilot)
2. [Workflow Strategy](#2-workflow-strategy)
3. [Phase 1 Prompts — Core Infrastructure](#3-phase-1--core-infrastructure)
4. [Phase 2 Prompts — Authentication](#4-phase-2--authentication)
5. [Phase 3 Prompts — MinIO Storage](#5-phase-3--minio-storage)
6. [Phase 4 Prompts — Database Models](#6-phase-4--database-models)
7. [Phase 5 Prompts — RAG Pipeline](#7-phase-5--rag-pipeline)
8. [Phase 6 Prompts — Groq Integration](#8-phase-6--groq-integration)
9. [Phase 7 Prompts — API Endpoints](#9-phase-7--api-endpoints)
10. [Phase 8 Prompts — WebSockets](#10-phase-8--websockets)
11. [Phase 9 Prompts — Frontend Refactor](#11-phase-9--frontend-refactor)
12. [Phase 10 Prompts — Stripe Payments](#12-phase-10--stripe-payments)
13. [Phase 11 Prompts — DevOps](#13-phase-11--devops)
14. [Debugging with Copilot](#14-debugging-with-copilot)
15. [Testing with Copilot](#15-testing-with-copilot)
16. [Best Practices](#16-best-practices)

---

## 1. Setup for Copilot

### Prerequisites

- VS Code with GitHub Copilot extension installed
- Copilot Chat enabled (Ctrl+Shift+I or Cmd+Shift+I)
- The `.copilot/instructions.md` file in project root (already created)

### How Copilot Uses the Instructions File

The `.copilot/instructions.md` file provides Copilot with context about:
- Project architecture (FastAPI + Better Auth + MinIO + PostgreSQL + pgvector)
- Code conventions (async/await, Pydantic schemas, SQLAlchemy 2.0)
- RAG pipeline configuration
- Database structure and relationships

Copilot reads this file automatically when generating code in the workspace.

### Recommended VS Code Extensions

```
ext install github.copilot
ext install github.copilot-chat
ext install ms-python.python
ext install ms-python.vscode-pylance
ext install ms-python.debugpy
```

---

## 2. Workflow Strategy

### The Phase-by-Phase Approach

```
For each phase:
  1. Open the phase doc (docs/phases/phase-XX.md)
  2. Create the directory structure
  3. Use Copilot to generate each file
  4. Run tests / verify
  5. Commit
```

### Copilot Interaction Patterns

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Inline completion** | Writing code in a file | Type function signature, let Copilot complete |
| **Chat** (Ctrl+Shift+I) | Complex questions, architecture | "How should I structure the RAG pipeline?" |
| **Inline Chat** (Ctrl+I) | Quick edits in context | Select code → "Add error handling" |
| **`/fix`** | Fixing errors | Select broken code → `/fix` |
| **`/tests`** | Generating tests | Select function → `/tests` |
| **`/explain`** | Understanding code | Select code → `/explain` |

### Prompt Engineering Tips

1. **Be specific** — Include technologies, libraries, and patterns
2. **Reference existing files** — "Following the pattern in `app/config.py`..."
3. **Provide schema context** — Paste relevant Pydantic models or DB schemas
4. **Ask for incremental code** — One file/function at a time
5. **Reference the phase docs** — "According to the Phase 5 doc..."

---

## 3. Phase 1 — Core Infrastructure

### Prompt 1.1: Create Project Structure

```
Create the directory structure for a FastAPI backend project called smartstudy-backend with:
- app/ directory with __init__.py, main.py, config.py
- app/api/ for route handlers
- app/models/ for SQLAlchemy models
- app/schemas/ for Pydantic schemas
- app/services/ for business logic
- app/workers/ for Celery tasks
- app/core/ for middleware and utilities
- app/rag/ for RAG pipeline components
- better-auth/ for the Node.js auth sidecar
- alembic/ for database migrations
- tests/ with integration and unit test folders
```

### Prompt 1.2: Configuration

```
Create app/config.py using Pydantic BaseSettings with environment variable support.
Include settings for:
- DATABASE_URL (postgresql+asyncpg://...)
- REDIS_URL
- MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET
- GROQ_API_KEY, GROQ_MODEL (default: llama-3.3-70b-versatile), GROQ_FALLBACK_MODEL
- BETTER_AUTH_SECRET, BETTER_AUTH_URL (default: http://localhost:3000)
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- CORS_ORIGINS as a list of strings
- EMBEDDING_MODEL (default: all-MiniLM-L6-v2)
- CHUNK_SIZE (default: 512), CHUNK_OVERLAP (default: 50)
- TOP_K_RETRIEVAL (default: 8), RERANK_TOP_K (default: 4)
- SENTRY_DSN (optional)

Load from .env file using model_config with env_file=".env".
```

### Prompt 1.3: Database Connection

```
Create app/core/database.py with:
- Async SQLAlchemy engine using create_async_engine with the DATABASE_URL from settings
- AsyncSession factory using async_sessionmaker
- A Base declarative base
- An async generator function get_db() that yields sessions for FastAPI dependency injection
- Pool size of 20 with max overflow 10
```

### Prompt 1.4: FastAPI Main App

```
Create app/main.py with:
- FastAPI app with title "NoteAura API", version from settings
- CORS middleware using settings.CORS_ORIGINS
- Lifespan context manager that runs Alembic migrations on startup
- Include all API routers (documents, chat, exam, flashcards, battle, analysis, study-plan, feynman, summary, subscription, gamification)
- A /health endpoint that checks database, redis, and minio connectivity
- Sentry initialization if SENTRY_DSN is configured
```

### Prompt 1.5: Docker Compose

```
Create docker-compose.yml for local development with these services:
1. postgres: pgvector/pgvector:pg16, port 5432, healthcheck with pg_isready
2. redis: redis:7-alpine, port 6379, healthcheck with redis-cli ping
3. minio: minio/minio, ports 9000 (API) and 9001 (console), command "server /data --console-address :9001"
4. api: build from Dockerfile, port 8000, depends on postgres and redis, env_file .env, volumes mount ./app to /app/app for live reload
5. worker: celery worker, same build as api, depends on postgres and redis
6. auth: build from better-auth/Dockerfile.auth, port 3000, depends on postgres

All services on a shared "noteaura" network with named volumes for data persistence.
```

### Prompt 1.6: Requirements File

```
Create requirements.txt for a FastAPI project with these dependencies:
- fastapi, uvicorn[standard], gunicorn
- sqlalchemy[asyncio], asyncpg, alembic
- pydantic, pydantic-settings
- redis, aioredis
- minio
- groq (Groq Python SDK)
- celery
- langchain, langchain-community
- sentence-transformers
- pgvector (Python package for pgvector)
- PyMuPDF (for PDF processing)
- stripe
- python-multipart
- httpx
- sentry-sdk[fastapi]
- python-dotenv
- bcrypt, python-jose[cryptography]
```

---

## 4. Phase 2 — Authentication

### Prompt 2.1: Better Auth Server

```
Create better-auth/index.ts using Better Auth library with:
- PostgreSQL adapter connecting to the same database
- Email+password authentication
- Google OAuth provider
- Session management with JWT
- Hooks: afterSignUp to create a profile row in the profiles table with default values (full_name from user.name, subscription_tier='free', daily_questions_count=0)
- Run on port 3000
Include the package.json with better-auth, @better-auth/node, pg dependencies.
```

### Prompt 2.2: Auth Middleware

```
Create app/core/security.py with:
- An async function get_current_user that:
  1. Extracts the Bearer token from the Authorization header
  2. Calls Better Auth's introspection endpoint (GET http://localhost:3000/api/auth/get-session) with the token as cookie
  3. Returns user data (id, email, name) or raises HTTPException 401
- Make it a FastAPI dependency using Depends()
- Include type hint for the return value as a dict with id, email, name fields
```

### Prompt 2.3: Frontend Auth Migration

```
Refactor the frontend AuthContext.tsx to:
1. Replace all Supabase auth calls with Better Auth client calls
2. Create src/lib/auth-client.ts using @better-auth/client with baseURL pointing to the backend auth endpoint
3. Replace supabase.auth.signInWithPassword with authClient.signIn.email
4. Replace supabase.auth.signUp with authClient.signUp.email
5. Replace supabase.auth.signInWithOAuth({provider:'google'}) with authClient.signIn.social({provider:'google'})
6. Replace supabase.auth.signOut with authClient.signOut
7. Replace supabase.auth.getSession with authClient.getSession
8. Replace onAuthStateChange with authClient.onSessionChange
Keep the same AuthContext interface so no other components need to change.
```

---

## 5. Phase 3 — MinIO Storage

### Prompt 3.1: MinIO Client

```
Create app/core/minio_client.py with:
- Minio client initialization using settings (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY)
- A StorageService class with async methods:
  - upload_file(bucket, object_name, file_data, content_type) -> str (returns presigned URL)
  - get_presigned_url(bucket, object_name, expiry=3600) -> str
  - delete_file(bucket, object_name) -> None
  - ensure_bucket(bucket) -> None (creates bucket if not exists)
```

### Prompt 3.2: Document Upload Endpoint

```
Create app/api/documents.py with a POST /api/documents/upload endpoint that:
1. Accepts a multipart file upload (UploadFile) and optional folder_id
2. Requires authentication (Depends(get_current_user))
3. Validates file is PDF and under 50MB
4. Uploads to MinIO using StorageService
5. Creates a Document record in the database
6. Triggers a Celery task to process the PDF (extract text, chunk, embed)
7. Returns the document record with status='processing'
```

---

## 6. Phase 4 — Database Models

### Prompt 4.1: Core Models

```
Create SQLAlchemy 2.0 models in app/models/ for the NoteAura application:

app/models/user.py:
- Profile model: id (UUID, FK to auth.users), full_name, avatar_url, subscription_tier (enum: free/pro/university), daily_questions_count, xp_points, level, streak_days, last_active, created_at, updated_at

app/models/document.py:
- Document: id (UUID), user_id, title, file_path (MinIO path), file_size, page_count, status (enum: processing/ready/error), folder_id, created_at
- DocumentPage: id, document_id, page_number, content (text), created_at
- DocumentChunk: id, document_id, page_number, chunk_index, content, embedding (Vector(384) from pgvector), metadata_ (JSON), created_at

Use pgvector's Vector type for embeddings. All IDs are UUID with server_default=gen_random_uuid().
Include proper relationships and indexes (especially HNSW index on embedding column).
```

### Prompt 4.2: Feature Models

```
Continue creating SQLAlchemy models:

app/models/conversation.py:
- Conversation: id, user_id, document_id, title, created_at, updated_at
- Message: id, conversation_id, role (enum: user/assistant), content, sources (JSON), created_at

app/models/exam.py:
- ExamSession: id, user_id, document_id, difficulty, question_count, time_limit, score, completed_at, created_at
- Exam (individual questions): id, session_id, question, options (JSON array), correct_answer, user_answer, explanation, is_correct, created_at

app/models/flashcard.py:
- Flashcard: id, user_id, document_id, front, back, difficulty, ease_factor (default 2.5), interval (default 1), repetitions (default 0), next_review, created_at
- FlashcardReview: id, flashcard_id, quality (0-5), reviewed_at

app/models/battle.py:
- BattleRoom: id, host_id, guest_id, document_id, status (enum: waiting/active/completed), host_score, guest_score, questions (JSON), current_question, started_at, completed_at, created_at
- EloRating: id, user_id, rating (default 1200), wins, losses, created_at

Add all models to app/models/__init__.py with proper imports.
```

### Prompt 4.3: Alembic Setup

```
Set up Alembic for database migrations:
1. Initialize with: alembic init alembic
2. Configure alembic/env.py to use async engine from app.core.database
3. Import all models in env.py so autogenerate detects them
4. Set sqlalchemy.url from app.config settings
5. Create the initial migration: alembic revision --autogenerate -m "initial models"
6. Include pgvector extension creation in the migration (CREATE EXTENSION IF NOT EXISTS vector)
```

---

## 7. Phase 5 — RAG Pipeline

### Prompt 5.1: Document Chunker

```
Create app/rag/chunker.py with a DocumentChunker class that:
- Takes chunk_size=512 tokens and chunk_overlap=50 tokens from settings
- Uses LangChain's RecursiveCharacterTextSplitter with tiktoken tokenizer
- Has a method chunk_text(text: str, metadata: dict) -> list[dict] that returns chunks with:
  - content: the chunk text
  - chunk_index: sequential index
  - metadata: merged with input metadata (page_number, document_id, etc.)
- Has a method chunk_document(pages: list[dict]) -> list[dict] that processes all pages
  Each page dict has {page_number: int, content: str}
```

### Prompt 5.2: Embedder

```
Create app/rag/embedder.py with an Embedder class that:
- Loads the sentence-transformers all-MiniLM-L6-v2 model on initialization
- Has a method embed(texts: list[str]) -> list[list[float]] for batch embedding
- Has a method embed_single(text: str) -> list[float] for single text
- Outputs 384-dimensional vectors
- Uses model.encode() with normalize_embeddings=True
- Handles batching for large text lists (batch_size=32)
- Is a singleton (only one model instance in memory)
```

### Prompt 5.3: Vector Retriever

```
Create app/rag/retriever.py with a VectorRetriever class that:
- Takes an async database session
- Has a method retrieve(query: str, document_id: UUID, top_k: int = 8) -> list[dict]:
  1. Embeds the query using the Embedder
  2. Runs a pgvector cosine similarity search on document_chunks table
  3. Filters by document_id
  4. Returns top_k results with: content, page_number, chunk_index, similarity_score
- Uses SQLAlchemy with: DocumentChunk.embedding.cosine_distance(query_embedding)
- Orders by cosine distance ascending (lower = more similar)
```

### Prompt 5.4: Reranker

```
Create app/rag/reranker.py with a Reranker class that:
- Takes retrieved chunks and the original query
- Computes a combined score: 0.7 * similarity_score + 0.3 * keyword_overlap_score
- keyword_overlap_score = count of query words found in chunk / total query words
- Returns top_k (default 4) reranked chunks
- Method: rerank(query: str, chunks: list[dict], top_k: int = 4) -> list[dict]
```

### Prompt 5.5: RAG Service

```
Create app/rag/service.py with a RAGService class that orchestrates:
1. VectorRetriever.retrieve() to get initial candidates
2. Reranker.rerank() to select best chunks
3. PromptBuilder.build() to create the final prompt with context
4. Returns the built prompt ready for the AI service

Method: async retrieve_and_build(query: str, document_id: UUID, prompt_type: str, db: AsyncSession, **kwargs) -> str

The PromptBuilder (app/rag/prompt_builder.py) should have templates for:
- "chat": You are a study assistant. Use ONLY the context below. Context: {context}. Question: {query}
- "generate_questions": Generate {count} {difficulty} questions from: {context}
- "evaluate_answer": Evaluate this answer: {answer} for question: {question}. Context: {context}
- "generate_summary": Summarize this content: {context}
- "extract_concepts": Extract key concepts from: {context}
- "generate_flashcards": Generate {count} flashcards from: {context}
- "analyze_weakness": Analyze weakness in: {topic}. Wrong answers: {wrong_answers}
```

### Prompt 5.6: PDF Processing Worker

```
Create app/workers/pdf_worker.py with a Celery task process_document(document_id: str) that:
1. Downloads the PDF from MinIO
2. Extracts text per page using PyMuPDF (fitz)
3. Saves DocumentPage records for each page
4. Chunks all pages using DocumentChunker
5. Embeds all chunks using Embedder (batch processing)
6. Saves DocumentChunk records with embeddings
7. Updates document status to 'ready' (or 'error' on failure)
8. Updates document page_count

Also create app/workers/celery_app.py with Celery initialization using Redis as broker.
Use @shared_task decorator and handle errors with automatic retries (max 3).
```

---

## 8. Phase 6 — Groq Integration

### Prompt 6.1: AI Service

```
Create app/services/ai_service.py with an AIService class that:
- Initializes AsyncGroq client with GROQ_API_KEY from settings
- Has 3 main methods:

1. async def chat_stream(messages, model, temperature, max_tokens) -> AsyncGenerator:
   - Uses groq.chat.completions.create(stream=True)
   - Yields content deltas as they arrive
   - Handles GroqError with automatic fallback to GROQ_FALLBACK_MODEL

2. async def generate_json(messages, model, temperature, max_tokens) -> dict:
   - Uses response_format={"type":"json_object"}
   - Parses and returns the JSON response
   - Falls back to GROQ_FALLBACK_MODEL on failure

3. async def generate_text(messages, model, temperature, max_tokens) -> str:
   - Returns the complete text response
   - Falls back to GROQ_FALLBACK_MODEL on failure

Include proper error handling and logging for rate limits (429) and model errors.
```

### Prompt 6.2: AI Config

```
Create app/core/ai_config.py with configuration for each AI feature:

AI_FEATURE_CONFIG = {
    "chat": {"model": "llama-3.3-70b-versatile", "temperature": 0.7, "max_tokens": 2048, "response_type": "stream"},
    "generate_questions": {"model": "llama-3.3-70b-versatile", "temperature": 0.8, "max_tokens": 4096, "response_type": "json"},
    "evaluate_answer": {"model": "llama-3.3-70b-versatile", "temperature": 0.3, "max_tokens": 1024, "response_type": "json"},
    "generate_flashcards": {"model": "llama-3.3-70b-versatile", "temperature": 0.7, "max_tokens": 4096, "response_type": "json"},
    "generate_summary": {"model": "llama-3.3-70b-versatile", "temperature": 0.5, "max_tokens": 4096, "response_type": "text"},
    "extract_concepts": {"model": "llama-3.1-8b-instant", "temperature": 0.3, "max_tokens": 2048, "response_type": "json"},
    "analyze_weakness": {"model": "llama-3.3-70b-versatile", "temperature": 0.5, "max_tokens": 2048, "response_type": "json"},
    "generate_study_plan": {"model": "llama-3.3-70b-versatile", "temperature": 0.6, "max_tokens": 4096, "response_type": "json"},
    "feynman_evaluate": {"model": "llama-3.3-70b-versatile", "temperature": 0.4, "max_tokens": 2048, "response_type": "json"},
    "predict_score": {"model": "llama-3.1-8b-instant", "temperature": 0.3, "max_tokens": 1024, "response_type": "json"},
    "analyze_pyq": {"model": "llama-3.3-70b-versatile", "temperature": 0.5, "max_tokens": 4096, "response_type": "json"},
    "matchmaking_questions": {"model": "llama-3.1-8b-instant", "temperature": 0.8, "max_tokens": 2048, "response_type": "json"},
}

Create a helper function get_ai_config(feature: str) -> dict that returns the config.
```

---

## 9. Phase 7 — API Endpoints

### Prompt 7.1: Chat Endpoint (SSE)

```
Create app/api/chat.py with:

POST /api/chat/stream:
- Request: {document_id, message, conversation_id (optional)}
- Requires authentication
- Uses RAGService to retrieve context from the document
- Streams response using AIService.chat_stream()
- Returns Server-Sent Events (SSE) using StreamingResponse with media_type="text/event-stream"
- Each SSE event: data: {"content": "chunk text"}\n\n
- Final event: data: {"done": true, "sources": [...]}\n\n
- Saves conversation and messages to database

Use FastAPI's StreamingResponse and the ai_config for "chat" feature.
Pattern:
async def event_generator():
    async for chunk in ai_service.chat_stream(...):
        yield f"data: {json.dumps({'content': chunk})}\n\n"
    yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"
return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### Prompt 7.2: Exam Endpoints

```
Create app/api/exam.py with:

POST /api/exam/generate:
- Request: {document_id, difficulty, question_count, time_limit}
- Uses RAGService with "generate_questions" prompt
- Uses AIService.generate_json() to get structured questions
- Creates ExamSession and Exam records
- Returns the session with questions (correct_answer hidden)

POST /api/exam/evaluate:
- Request: {session_id, answers: [{question_id, answer}]}
- Evaluates each answer against correct_answer
- Uses AIService for detailed explanations
- Updates ExamSession with score
- Awards XP based on score
- Returns results with explanations
```

### Prompt 7.3: Flashcard Endpoints

```
Create app/api/flashcards.py with:

POST /api/flashcards/generate:
- Request: {document_id, count}
- Uses RAGService with "generate_flashcards" prompt
- Creates Flashcard records
- Returns generated flashcards

POST /api/flashcards/review:
- Request: {flashcard_id, quality (0-5)}
- Implements SM-2 spaced repetition algorithm:
  if quality >= 3: interval = previous_interval * ease_factor
  else: interval = 1 (reset)
  ease_factor = max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
- Updates flashcard's next_review, ease_factor, interval, repetitions
- Creates FlashcardReview record
- Returns updated flashcard

GET /api/flashcards/due:
- Returns flashcards where next_review <= now
- Ordered by next_review ascending
```

### Prompt 7.4: Analysis Endpoints

```
Create app/api/analysis.py with:

POST /api/analysis/weakness:
- Request: {document_id}
- Fetches user's wrong answers from exam history for this document
- Uses RAGService with "analyze_weakness" prompt
- AIService.generate_json() returns: {topics: [{name, score, suggestions}]}
- Stores weakness profile in weakness_profiles table
- Returns analysis with micro-lesson suggestions

POST /api/analysis/concepts:
- Request: {document_id}
- Uses RAGService with "extract_concepts" prompt
- Returns concept map: {concepts: [{name, description, related_concepts}]}

POST /api/analysis/predict-score:
- Request: {document_id}
- Analyzes exam history and study patterns
- Returns predicted score range
```

### Prompt 7.5: Remaining Endpoints

```
Create the remaining API endpoint files following the same patterns:

app/api/summary.py:
- POST /api/summary/generate: Generate document summary using RAG + AI

app/api/study_plan.py:
- POST /api/study-plan/generate: Generate study plan using AI
- GET /api/study-plan: Get current study plan
- PATCH /api/study-plan/tasks/{task_id}: Update task status

app/api/feynman.py:
- POST /api/feynman/start: Start new Feynman session
- POST /api/feynman/evaluate: Evaluate user's explanation

app/api/gamification.py:
- GET /api/gamification/profile: Get XP, level, streak
- GET /api/gamification/leaderboard: Top users by XP
- POST /api/gamification/award-xp: Internal endpoint to award XP
- GET /api/gamification/achievements: User's achievements

app/api/subscription.py:
- GET /api/subscription/status: Current plan details
- POST /api/subscription/checkout: Create Stripe checkout
- POST /api/subscription/webhook: Stripe webhook handler
- GET /api/usage: Current usage vs limits
```

---

## 10. Phase 8 — WebSockets

### Prompt 8.1: WebSocket Manager

```
Create app/core/websocket_manager.py with:
- WebSocketManager class that manages active WebSocket connections
- Uses Redis Pub/Sub for cross-instance message broadcasting
- Methods:
  - async connect(websocket, room_id, user_id)
  - async disconnect(websocket, room_id, user_id)
  - async broadcast(room_id, message: dict) — sends to all connections in room AND publishes to Redis
  - async send_personal(websocket, message: dict)
- Stores connections as: dict[str, dict[str, WebSocket]] — room_id -> user_id -> websocket
- Redis Pub/Sub channel: "battle:{room_id}"
```

### Prompt 8.2: Battle WebSocket Endpoint

```
Create app/api/battle.py with:

WebSocket endpoint: /ws/battle/{room_id}
- On connect:
  1. Authenticate user from token query parameter
  2. Register connection in WebSocketManager
  3. Broadcast "{user.name} joined" to room
  4. If both players connected, start the battle (send first question)

- On message:
  Handle JSON messages with types:
  - "answer": {question_index, answer} → evaluate, broadcast scores
  - "ready": player is ready for next question
  - "disconnect": clean disconnect

- On disconnect:
  1. Remove from WebSocketManager
  2. Broadcast "{user.name} disconnected"
  3. If both disconnected, complete the battle

REST endpoints:
- POST /api/battle/create: Create a room (status=waiting)
- GET /api/battle/rooms: List open rooms
- GET /api/battle/history: User's battle history
- GET /api/battle/elo: User's ELO rating
```

---

## 11. Phase 9 — Frontend Refactor

### Prompt 9.1: API Client

```
Create src/lib/api-client.ts that replaces all Supabase client calls:

class ApiClient:
  private baseUrl: string
  private getToken(): retrieves the Better Auth session token

  async get<T>(path: string): Promise<T>
  async post<T>(path: string, body: any): Promise<T>
  async patch<T>(path: string, body: any): Promise<T>
  async delete(path: string): Promise<void>
  async upload(path: string, file: File): Promise<T>
  async stream(path: string, body: any, onChunk: (chunk: string) => void): Promise<void>

- All methods include Authorization: Bearer {token} header
- stream() uses fetch with ReadableStream for SSE consumption
- Handles 401 by redirecting to /auth
- Export singleton: export const api = new ApiClient()
```

### Prompt 9.2: Hook Migration

```
Refactor React hooks to use the new API client instead of Supabase.
For each hook in src/hooks/:

useFlashcards.ts:
- Replace supabase.from('flashcards').select() with api.get('/api/flashcards')
- Replace supabase.functions.invoke('generate-flashcards') with api.post('/api/flashcards/generate')
- Replace edge function calls with api.post('/api/flashcards/review')

useBattles.ts:
- Replace Supabase Realtime subscription with WebSocket connection
- new WebSocket(`${WS_URL}/ws/battle/${roomId}?token=${token}`)
- Handle onmessage for score updates, questions, game state

useGamification.ts → api.get('/api/gamification/profile')
useStudyPlan.ts → api.get/post('/api/study-plan')
useSubscription.ts → api.get('/api/subscription/status')
useUsage.ts → api.get('/api/usage')
useWeakness.ts → api.post('/api/analysis/weakness')

Keep the same return type interfaces so pages don't need changes.
```

### Prompt 9.3: Page Migration

```
For each page in src/pages/, migrate from Supabase to the new API:

Study.tsx (Chat page):
- Replace supabase.functions.invoke('chat') with SSE streaming:
  api.stream('/api/chat/stream', {document_id, message}, (chunk) => {
    setMessages(prev => appendToLast(prev, chunk))
  })

Upload.tsx:
- Replace supabase.storage.from('documents').upload() with:
  api.upload('/api/documents/upload', file)

ExamMode.tsx:
- Replace supabase.functions.invoke('generate-questions') with api.post('/api/exam/generate')
- Replace supabase.functions.invoke('evaluate-answer') with api.post('/api/exam/evaluate')

Pricing.tsx:
- Replace supabase.functions.invoke('create-checkout-session') with api.post('/api/subscription/checkout')

Follow the same pattern for all remaining pages.
Update environment variables: remove VITE_SUPABASE_URL, add VITE_API_URL and VITE_WS_URL.
```

---

## 12. Phase 10 — Stripe Payments

### Prompt 10.1: Subscription Service

```
Create app/services/subscription_service.py with:
- get_or_create_customer(user_id, email) → Stripe customer ID
- create_checkout_session(user_id, price_id, success_url, cancel_url) → session URL
- get_subscription(user_id) → subscription details
- cancel_subscription(user_id) → cancelled subscription
- handle_webhook(payload, sig_header) → process Stripe events

Webhook events to handle:
- checkout.session.completed → activate subscription, update profile tier
- customer.subscription.updated → sync tier changes
- customer.subscription.deleted → downgrade to free
- invoice.payment_failed → log and optionally notify

IMPORTANT: Validate webhook signature using stripe.Webhook.construct_event()
```

### Prompt 10.2: Usage Service

```
Create app/services/usage_service.py with:
- Plan limits configuration:
  FREE = {questions: 10/day, flashcards: 20/day, summaries: 3/day, exams: 2/day, chat_messages: 20/day, documents: 5 total, battles: 3/day, study_plans: 1, feynman: 2/day, pyq_analysis: 1/day, weakness_analysis: 1/day}
  PRO = {questions: 100/day, flashcards: 200/day, summaries: 30/day, ...}
  UNIVERSITY = {everything: unlimited}

- check_and_increment(user_id, feature) → {allowed: bool, remaining: int, limit: int}
- get_usage(user_id) → current usage across all features
- reset_daily_usage() → Celery periodic task to reset daily counters at midnight

Use Redis for fast usage tracking with keys like "usage:{user_id}:{feature}:{date}"
with TTL of 25 hours.
```

---

## 13. Phase 11 — DevOps

### Prompt 11.1: Production Docker

```
Create production Dockerfiles:
1. Main API Dockerfile (python:3.12-slim, gunicorn with 4 uvicorn workers)
2. Worker Dockerfile (celery with concurrency=2)
3. Auth Dockerfile (oven/bun:1.1-slim)
4. docker-compose.prod.yml with all services, healthchecks, restart policies, and an nginx reverse proxy

Include:
- Non-root users in all images
- Pre-downloaded embedding model in Python images
- Named volumes for data persistence
- Network isolation
```

### Prompt 11.2: CI/CD

```
Create .github/workflows/deploy.yml with:
1. Test job: Run pytest with PostgreSQL and Redis services, run ruff linting
2. Build job: Build and push Docker images to GitHub Container Registry
3. Deploy job: SSH into server, pull latest images, docker compose up -d

Trigger on push to main branch, only when smartstudy-backend/ files change.
```

---

## 14. Debugging with Copilot

### Common Debug Prompts

```
# When you get an error:
"Explain this error and fix it: [paste error traceback]"

# When a query is slow:
"This SQLAlchemy query is slow. Add proper indexes and optimize: [paste query]"

# When RAG returns bad results:
"The RAG retrieval is returning irrelevant chunks. Here's the query and results.
How can I improve the retrieval? [paste details]"

# When WebSocket drops:
"My WebSocket connection drops after 60 seconds. Show me how to implement
ping/pong keepalive in FastAPI WebSocket."

# When Celery task fails:
"This Celery task fails silently. Add proper error handling, logging,
and retry logic: [paste task code]"
```

### Using Copilot for Database Debugging

```
# Ask Copilot to write a debug query:
"Write a SQLAlchemy query to find all document_chunks for document {id}
where the embedding similarity to '{query}' is above 0.7"

# Check migration issues:
"Compare my SQLAlchemy models with the current Alembic migration.
Are there any missing columns or type mismatches?"
```

---

## 15. Testing with Copilot

### Prompt: Generate Test Suite

```
Generate pytest tests for app/services/ai_service.py:
- Use pytest-asyncio for async tests
- Mock the groq.AsyncGroq client
- Test chat_stream yields chunks correctly
- Test generate_json parses JSON response
- Test fallback to GROQ_FALLBACK_MODEL on error
- Test rate limit handling (429 status)
- Use proper fixtures for the service instance
```

### Prompt: API Integration Tests

```
Generate integration tests for app/api/chat.py using httpx.AsyncClient:
- Use a test database with a pre-seeded document and chunks
- Test the SSE stream endpoint returns proper events
- Test authentication is required (401 without token)
- Test invalid document_id returns 404
- Use pytest fixtures for the app, client, and test user
```

### Prompt: RAG Pipeline Tests

```
Generate tests for the RAG pipeline in app/rag/:
- Test DocumentChunker produces correct chunk sizes and overlaps
- Test Embedder produces 384-dimensional vectors
- Test VectorRetriever returns results ordered by similarity
- Test Reranker reorders based on combined score
- Test RAGService end-to-end with mock database
- Test PromptBuilder includes context in all template types
```

### Test File Naming Convention

```
tests/
├── unit/
│   ├── test_chunker.py
│   ├── test_embedder.py
│   ├── test_reranker.py
│   ├── test_ai_service.py
│   └── test_usage_service.py
├── integration/
│   ├── test_chat_api.py
│   ├── test_exam_api.py
│   ├── test_flashcard_api.py
│   ├── test_document_upload.py
│   └── test_battle_websocket.py
└── conftest.py  ← shared fixtures
```

---

## 16. Best Practices

### Do's

| Practice | Why |
|----------|-----|
| Open the relevant phase doc before coding | Gives Copilot context about what to build |
| Start with type signatures and docstrings | Copilot fills in implementation from good signatures |
| Write small, focused functions | Copilot generates better code for small units |
| Add inline comments before complex logic | Guides Copilot to write correct implementations |
| Run tests after each generated function | Catches errors early |
| Commit after each working feature | Easy to roll back |
| Use `#` comments to describe what you want | Copilot treats comments as prompts |

### Don'ts

| Anti-Pattern | Why It Fails |
|-------------|--------------|
| Generating entire files at once | Too many hallucinations in large outputs |
| Accepting code without reading it | Copilot may use wrong patterns or outdated APIs |
| Skipping type annotations | Copilot needs types for accurate completions |
| Ignoring security suggestions | Auth, SQL injection, and input validation matter |
| Copy-pasting without understanding | Leads to inconsistent patterns across the codebase |

### Copilot Inline Comment Patterns

Use these comments in your code files to guide Copilot:

```python
# TODO: Create async function to fetch user's flashcards with pagination
# Uses SQLAlchemy 2.0 select() with .limit() and .offset()
# Returns list of Flashcard models filtered by user_id

# TODO: Implement SM-2 spaced repetition algorithm
# quality: 0-5, ease_factor: starts at 2.5
# if quality >= 3: interval *= ease_factor
# else: interval = 1 (reset)

# TODO: Stream chat response as SSE events
# Use StreamingResponse with media_type="text/event-stream"
# Each chunk: data: {"content": "..."}\n\n
# Final: data: {"done": true}\n\n
```

### Phase Completion Checklist Template

After completing each phase, use this prompt:

```
Review my implementation of Phase X against the requirements in docs/phases/phase-XX.md.
List:
1. What's implemented correctly
2. What's missing
3. What needs fixing
4. Suggested improvements
```

---

## Quick Reference: Complete File Creation Order

```
Phase 1:  config.py → database.py → redis.py → main.py → docker-compose.yml
Phase 2:  better-auth/index.ts → security.py → auth-client.ts → AuthContext.tsx
Phase 3:  minio_client.py → documents.py (upload endpoint)
Phase 4:  models/*.py → alembic setup → initial migration
Phase 5:  chunker.py → embedder.py → retriever.py → reranker.py → prompt_builder.py → service.py → pdf_worker.py
Phase 6:  ai_service.py → ai_config.py
Phase 7:  chat.py → exam.py → flashcards.py → analysis.py → summary.py → study_plan.py → feynman.py → gamification.py → subscription.py
Phase 8:  websocket_manager.py → battle.py (WS + REST)
Phase 9:  api-client.ts → hooks/*.ts → pages/*.tsx
Phase 10: subscription_service.py → usage_service.py → webhook endpoint
Phase 11: Dockerfiles → nginx.conf → CI/CD → deploy
```

---

**You're ready. Open Phase 1 and start building!** 🚀
