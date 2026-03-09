# Phase 7 — API Endpoint Migration

## Overview

Migrate all 40+ API endpoints from Supabase Edge Functions (Deno/TypeScript) and direct Supabase client calls to FastAPI (Python) routes. Every endpoint uses the RAG pipeline for AI features and the new auth/storage layer.

**Duration**: Weeks 3-4  
**Dependencies**: Phase 2 (Auth), Phase 3 (Storage), Phase 5 (RAG), Phase 6 (Groq)  
**Deliverables**: 16 API router modules, Pydantic schemas, full endpoint coverage

---

## Router Structure

```
app/api/
├── __init__.py
├── documents.py          # Document CRUD + upload
├── chat.py               # Chat streaming (SSE)
├── exams.py              # Question generation + evaluation
├── flashcards.py         # Flashcard generation + SM-2 review
├── battles.py            # Battle rooms + matchmaking
├── weakness.py           # Weakness analysis + micro lessons
├── study_plans.py        # Study plan generation
├── concepts.py           # Concept extraction (knowledge graph)
├── pyq.py                # PYQ analysis
├── scores.py             # Score prediction
├── feynman.py            # Feynman teaching mode
├── summaries.py          # Document summaries
├── usage.py              # Usage tracking + limits
├── subscriptions.py      # Stripe checkout + subscription status
├── webhooks.py           # Stripe webhook handler
├── gamification.py       # XP, levels, achievements
└── folders.py            # Folder CRUD + tags
```

---

## Complete Endpoint Mapping

### Documents API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `supabase.from('documents').select()` | `GET /api/documents` | GET |
| `supabase.from('documents').insert()` | `POST /api/documents/upload` | POST (multipart) |
| `supabase.from('documents').delete()` | `DELETE /api/documents/{id}` | DELETE |
| `supabase.from('documents').select().eq('id', id)` | `GET /api/documents/{id}` | GET |
| `supabase.from('document_pages').select()` | `GET /api/documents/{id}/pages` | GET |
| `functions/v1/extract-text` | Background Celery task (auto on upload) | — |

### Chat API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `supabase.from('conversations').select()` | `GET /api/conversations` | GET |
| `supabase.from('conversations').insert()` | `POST /api/conversations` | POST |
| `supabase.from('messages').select()` | `GET /api/conversations/{id}/messages` | GET |
| `functions/v1/chat` (SSE) | `POST /api/chat/stream` | POST (SSE) |

### Exam API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `functions/v1/generate-questions` | `POST /api/exams/generate-questions` | POST |
| `functions/v1/evaluate-answer` | `POST /api/exams/evaluate-answer` | POST |
| `supabase.from('exam_sessions').insert()` | `POST /api/exams/sessions` | POST |
| `supabase.from('exam_sessions').update()` | `PATCH /api/exams/sessions/{id}` | PATCH |
| `supabase.from('exam_sessions').select()` | `GET /api/exams/sessions` | GET |

### Flashcards API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `functions/v1/generate-flashcards` | `POST /api/flashcards/generate` | POST |
| `supabase.from('flashcards').select()` | `GET /api/flashcards` | GET |
| `supabase.from('flashcards').update()` | `POST /api/flashcards/{id}/review` | POST |

### Battle API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `functions/v1/matchmaking` (create) | `POST /api/battles/create` | POST |
| `functions/v1/matchmaking` (join) | `POST /api/battles/{id}/join` | POST |
| `supabase.from('battle_rooms').select()` | `GET /api/battles` | GET |
| `supabase.from('elo_ratings').select()` | `GET /api/battles/leaderboard` | GET |
| Realtime subscription | `WS /ws/battles/{room_id}` | WebSocket |

### Analysis API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `functions/v1/analyze-weakness` | `POST /api/weakness/analyze` | POST |
| `supabase.from('weakness_profiles').select()` | `GET /api/weakness` | GET |
| `supabase.from('micro_lessons').update()` | `PATCH /api/weakness/lessons/{id}` | PATCH |
| `functions/v1/analyze-pyq` | `POST /api/pyq/analyze` | POST |
| `functions/v1/predict-score` | `POST /api/scores/predict` | POST |
| `functions/v1/extract-concepts` | `POST /api/concepts/extract` | POST |
| `supabase.from('concepts').select()` | `GET /api/concepts` | GET |

### Study Plan API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `functions/v1/generate-study-plan` | `POST /api/plans/generate` | POST |
| `supabase.from('study_plans').select()` | `GET /api/plans` | GET |
| `supabase.from('study_plan_items').update()` | `PATCH /api/plans/items/{id}` | PATCH |
| `supabase.from('exams').insert()` | `POST /api/plans/exams` | POST |
| `supabase.from('exams').select()` | `GET /api/plans/exams` | GET |

### Feynman API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `functions/v1/feynman-session` (start) | `POST /api/feynman/start` | POST (SSE) |
| `functions/v1/feynman-session` (evaluate) | `POST /api/feynman/evaluate` | POST (SSE) |

### Summary API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `functions/v1/generate-summary` | `POST /api/summaries/generate` | POST |

### Subscription & Usage API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `functions/v1/create-checkout-session` | `POST /api/subscriptions/checkout` | POST |
| `functions/v1/stripe-webhook` | `POST /api/webhooks/stripe` | POST |
| `supabase.from('subscriptions').select()` | `GET /api/subscriptions` | GET |
| `functions/v1/check-usage` | `POST /api/usage/check` | POST |
| `supabase.from('usage_tracking').select()` | `GET /api/usage` | GET |

### Gamification API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `supabase.from('user_gamification').select()` | `GET /api/gamification/profile` | GET |
| `supabase.from('user_gamification').update()` | `POST /api/gamification/xp` | POST |
| `supabase.from('user_achievements').select()` | `GET /api/gamification/achievements` | GET |

### Folders & Tags API

| Supabase (Current) | FastAPI (New) | Method |
|--------------------|--------------| -------|
| `supabase.from('folders').select()` | `GET /api/folders` | GET |
| `supabase.from('folders').insert()` | `POST /api/folders` | POST |
| `supabase.from('document_tags').select()` | `GET /api/tags` | GET |
| `supabase.from('document_tag_links').insert()` | `POST /api/documents/{id}/tags` | POST |

---

## Key Implementation Examples

### 7.1 — Chat Stream Endpoint (SSE)

This is the most complex endpoint — it ties RAG + Groq + streaming together:

```python
# app/api/chat.py
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.services.ai_config import get_ai_config
from app.schemas.chat import ChatRequest, MessageCreate

router = APIRouter(prefix="/api/chat", tags=["chat"])

rag_service = RAGService()
ai_service = AIService()

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Stream AI chat response with RAG context.
    Returns Server-Sent Events (SSE).
    """

    # 1. Retrieve relevant context via RAG
    chunks = []
    if request.document_id:
        last_user_message = next(
            (m.content for m in reversed(request.messages) if m.role == "user"),
            "",
        )
        chunks = await rag_service.retrieve_context(
            db, str(request.document_id), last_user_message
        )

    # 2. Build prompt with RAG context
    system_prompt = rag_service.build_context_prompt(
        chunks,
        prompt_type="chat",
        mark_level=request.mark_level,
        document_title=request.document_title or "",
    )

    # 3. Get config for this mark level
    config = get_ai_config(f"chat_{request.mark_level.lower()}")

    # 4. Stream response
    async def event_generator():
        async for chunk in ai_service.chat_stream(
            system_prompt=system_prompt,
            messages=[m.model_dump() for m in request.messages],
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )
```

### 7.2 — Question Generation Endpoint

```python
# app/api/exams.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.services.ai_config import get_ai_config
from app.schemas.exams import GenerateQuestionsRequest, ExamSessionCreate, ExamSessionUpdate

router = APIRouter(prefix="/api/exams", tags=["exams"])

rag = RAGService()
ai = AIService()

@router.post("/generate-questions")
async def generate_questions(
    request: GenerateQuestionsRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate exam questions using RAG context."""

    # Retrieve relevant chunks
    chunks = await rag.retrieve_context(
        db, str(request.document_id),
        f"key concepts for {request.difficulty} difficulty exam"
    )

    # Build prompt
    system_prompt = rag.build_context_prompt(
        chunks, prompt_type="questions",
        difficulty=request.difficulty, count=request.count,
    )

    # Generate with Groq
    config = get_ai_config("question_generation")
    result = await ai.generate_json(
        system_prompt=system_prompt,
        user_prompt=f"Generate {request.count} {request.difficulty} questions.",
        temperature=config["temperature"],
        max_tokens=config["max_tokens"],
    )

    return result


@router.post("/evaluate-answer")
async def evaluate_answer(
    request: dict,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Evaluate a student's exam answer using RAG context."""

    chunks = await rag.retrieve_context(
        db, str(request["document_id"]), request["question"]
    )

    system_prompt = rag.build_context_prompt(chunks, prompt_type="chat")

    config = get_ai_config("answer_evaluation")
    result = await ai.generate_json(
        system_prompt=system_prompt + "\nEvaluate the student's answer. Return JSON with: score (0-100), feedback, correct_answer, strengths, weaknesses.",
        user_prompt=f"Question: {request['question']}\nStudent Answer: {request['answer']}",
        temperature=config["temperature"],
        max_tokens=config["max_tokens"],
    )

    return result


@router.get("/sessions")
async def list_sessions(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's exam sessions."""
    from sqlalchemy import text
    result = await db.execute(
        text("SELECT * FROM exam_sessions WHERE user_id = :uid ORDER BY started_at DESC"),
        {"uid": user["id"]},
    )
    return [dict(row._mapping) for row in result.fetchall()]


@router.post("/sessions")
async def create_session(
    request: ExamSessionCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new exam session."""
    from sqlalchemy import text
    result = await db.execute(
        text("""
            INSERT INTO exam_sessions (user_id, document_id, mode, total_questions)
            VALUES (:uid, :doc_id, :mode, :total)
            RETURNING *
        """),
        {"uid": user["id"], "doc_id": str(request.document_id), "mode": request.mode, "total": request.total_questions},
    )
    await db.commit()
    return dict(result.fetchone()._mapping)


@router.patch("/sessions/{session_id}")
async def update_session(
    session_id: str,
    request: ExamSessionUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update exam session (score, completion)."""
    from sqlalchemy import text
    updates = {k: v for k, v in request.model_dump().items() if v is not None}
    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["sid"] = session_id
    updates["uid"] = user["id"]

    result = await db.execute(
        text(f"UPDATE exam_sessions SET {set_clause} WHERE id = :sid AND user_id = :uid RETURNING *"),
        updates,
    )
    await db.commit()
    return dict(result.fetchone()._mapping)
```

### 7.3 — Flashcards Endpoint

```python
# app/api/flashcards.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.services.ai_config import get_ai_config

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])

rag = RAGService()
ai = AIService()

@router.get("")
async def list_flashcards(
    document_id: str = Query(None),
    due_only: bool = Query(False),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List flashcards, optionally filtered by document or due date."""
    query = "SELECT * FROM flashcards WHERE user_id = :uid"
    params = {"uid": user["id"]}

    if document_id:
        query += " AND document_id = :doc_id"
        params["doc_id"] = document_id

    if due_only:
        query += " AND next_review_date <= CURRENT_DATE"

    query += " ORDER BY next_review_date ASC"

    result = await db.execute(text(query), params)
    return [dict(row._mapping) for row in result.fetchall()]


@router.post("/generate")
async def generate_flashcards(
    request: dict,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate flashcards using RAG context."""
    chunks = await rag.retrieve_context(
        db, request["document_id"], "key concepts and definitions"
    )

    system_prompt = rag.build_context_prompt(
        chunks, prompt_type="flashcards", count=request.get("count", 10)
    )

    config = get_ai_config("flashcard_generation")
    result = await ai.generate_json(
        system_prompt=system_prompt,
        user_prompt=f"Generate {request.get('count', 10)} flashcards.",
        temperature=config["temperature"],
        max_tokens=config["max_tokens"],
    )

    # Store generated flashcards
    for card in result.get("flashcards", []):
        await db.execute(
            text("""
                INSERT INTO flashcards (user_id, document_id, front, back, tags)
                VALUES (:uid, :doc_id, :front, :back, :tags)
            """),
            {
                "uid": user["id"],
                "doc_id": request["document_id"],
                "front": card["front"],
                "back": card["back"],
                "tags": card.get("tags", []),
            },
        )
    await db.commit()

    return result


@router.post("/{flashcard_id}/review")
async def review_flashcard(
    flashcard_id: str,
    request: dict,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a flashcard review using SM-2 spaced repetition algorithm."""
    quality = request["quality"]  # 0-5

    # SM-2 algorithm
    card = await db.execute(
        text("SELECT * FROM flashcards WHERE id = :fid AND user_id = :uid"),
        {"fid": flashcard_id, "uid": user["id"]},
    )
    card = dict(card.fetchone()._mapping)

    ease = float(card["ease_factor"])
    interval = int(card["interval_days"])
    reps = int(card["repetitions"])

    if quality >= 3:
        if reps == 0:
            interval = 1
        elif reps == 1:
            interval = 6
        else:
            interval = round(interval * ease)
        reps += 1
        ease = max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    else:
        reps = 0
        interval = 1

    await db.execute(
        text("""
            UPDATE flashcards
            SET ease_factor = :ease, interval_days = :interval, repetitions = :reps,
                next_review_date = CURRENT_DATE + :interval, last_reviewed_at = NOW()
            WHERE id = :fid
        """),
        {"ease": ease, "interval": interval, "reps": reps, "fid": flashcard_id},
    )

    await db.execute(
        text("""
            INSERT INTO flashcard_reviews (flashcard_id, user_id, quality, time_taken_ms)
            VALUES (:fid, :uid, :quality, :time)
        """),
        {"fid": flashcard_id, "uid": user["id"], "quality": quality, "time": request.get("time_taken_ms")},
    )

    await db.commit()
    return {"next_review_date": str(interval), "ease_factor": ease}
```

### 7.4 — Weakness Analysis Endpoint

```python
# app/api/weakness.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.services.ai_config import get_ai_config

router = APIRouter(prefix="/api/weakness", tags=["weakness"])

rag = RAGService()
ai = AIService()

@router.get("")
async def get_weakness_profiles(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's weakness profiles with micro lessons."""
    result = await db.execute(
        text("""
            SELECT wp.*, json_agg(ml.*) as micro_lessons
            FROM weakness_profiles wp
            LEFT JOIN micro_lessons ml ON ml.weakness_id = wp.id
            WHERE wp.user_id = :uid
            GROUP BY wp.id
            ORDER BY wp.confidence_score ASC
        """),
        {"uid": user["id"]},
    )
    return [dict(row._mapping) for row in result.fetchall()]

@router.post("/analyze")
async def analyze_weakness(
    request: dict,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run weakness analysis using exam performance + RAG context."""
    chunks = await rag.retrieve_context(
        db, request["document_id"],
        "topics and concepts covered in this document"
    )

    system_prompt = rag.build_context_prompt(
        chunks, prompt_type="weakness",
        exam_answers=request.get("exam_answers", []),
    )

    config = get_ai_config("weakness_analysis")
    result = await ai.generate_json(
        system_prompt=system_prompt,
        user_prompt="Analyze weaknesses and generate micro-lessons.",
        temperature=config["temperature"],
        max_tokens=config["max_tokens"],
    )

    # Store weakness profiles and micro lessons
    for weakness in result.get("weaknesses", []):
        wp_result = await db.execute(
            text("""
                INSERT INTO weakness_profiles (user_id, document_id, topic, subtopic, confidence_score)
                VALUES (:uid, :doc_id, :topic, :subtopic, :score)
                RETURNING id
            """),
            {
                "uid": user["id"],
                "doc_id": request["document_id"],
                "topic": weakness["topic"],
                "subtopic": weakness.get("subtopic"),
                "score": weakness["confidence_score"],
            },
        )
        wp_id = wp_result.fetchone().id

        for lesson in weakness.get("micro_lessons", []):
            await db.execute(
                text("""
                    INSERT INTO micro_lessons (weakness_id, title, content, lesson_type)
                    VALUES (:wid, :title, :content, :type)
                """),
                {"wid": str(wp_id), "title": lesson["title"],
                 "content": lesson["content"], "type": lesson.get("type", "explanation")},
            )

    await db.commit()
    return result
```

### 7.5 — Pydantic Schemas

```python
# app/schemas/chat.py
from pydantic import BaseModel
from uuid import UUID

class MessageInput(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    document_id: UUID | None = None
    document_title: str | None = None
    conversation_id: UUID | None = None
    messages: list[MessageInput]
    mark_level: str = "4M"

# app/schemas/exams.py
class GenerateQuestionsRequest(BaseModel):
    document_id: UUID
    difficulty: str = "medium"  # easy, medium, hard
    count: int = 5

class ExamSessionCreate(BaseModel):
    document_id: UUID
    mode: str = "practice"
    total_questions: int = 0

class ExamSessionUpdate(BaseModel):
    correct_answers: int | None = None
    time_spent_seconds: int | None = None
    completed_at: str | None = None
```

---

## Register All Routers in Main App

```python
# app/main.py — mount all routers
from app.api import (
    documents, chat, exams, flashcards, battles,
    weakness, study_plans, concepts, pyq, scores,
    feynman, summaries, usage, subscriptions, webhooks,
    gamification, folders
)

app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(exams.router)
app.include_router(flashcards.router)
app.include_router(battles.router)
app.include_router(weakness.router)
app.include_router(study_plans.router)
app.include_router(concepts.router)
app.include_router(pyq.router)
app.include_router(scores.router)
app.include_router(feynman.router)
app.include_router(summaries.router)
app.include_router(usage.router)
app.include_router(subscriptions.router)
app.include_router(webhooks.router)
app.include_router(gamification.router)
app.include_router(folders.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
```

---

## Full API Summary

```
# Authentication (Better Auth — Port 3000)
POST   /api/auth/sign-up/email
POST   /api/auth/sign-in/email
POST   /api/auth/sign-in/social
POST   /api/auth/sign-out
POST   /api/auth/forget-password
POST   /api/auth/reset-password
GET    /api/auth/get-session

# Documents (Port 8000)
GET    /api/documents
POST   /api/documents/upload
GET    /api/documents/{id}
DELETE /api/documents/{id}
GET    /api/documents/{id}/pages
GET    /api/documents/{id}/download-url

# Chat
POST   /api/chat/stream              (SSE)
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/{id}/messages

# Exams
POST   /api/exams/generate-questions
POST   /api/exams/evaluate-answer
GET    /api/exams/sessions
POST   /api/exams/sessions
PATCH  /api/exams/sessions/{id}

# Flashcards
GET    /api/flashcards
POST   /api/flashcards/generate
POST   /api/flashcards/{id}/review

# Battles
GET    /api/battles
POST   /api/battles/create
POST   /api/battles/{id}/join
GET    /api/battles/leaderboard
WS     /ws/battles/{room_id}

# Weakness
GET    /api/weakness
POST   /api/weakness/analyze
PATCH  /api/weakness/lessons/{id}

# Study Plans
GET    /api/plans
POST   /api/plans/generate
PATCH  /api/plans/items/{id}
GET    /api/plans/exams
POST   /api/plans/exams

# Concepts
GET    /api/concepts
POST   /api/concepts/extract

# Analysis
POST   /api/pyq/analyze
POST   /api/scores/predict

# Feynman
POST   /api/feynman/start             (SSE)
POST   /api/feynman/evaluate           (SSE)

# Summaries
POST   /api/summaries/generate

# Usage
GET    /api/usage
POST   /api/usage/check

# Subscriptions
GET    /api/subscriptions
POST   /api/subscriptions/checkout

# Gamification
GET    /api/gamification/profile
POST   /api/gamification/xp
GET    /api/gamification/achievements

# Folders & Tags
GET    /api/folders
POST   /api/folders
GET    /api/tags
POST   /api/documents/{id}/tags

# Webhooks
POST   /api/webhooks/stripe

# System
GET    /health
```

---

## Verification Checklist

- [ ] Every Supabase Edge Function has a FastAPI equivalent
- [ ] Every `supabase.from('table')` call has a FastAPI CRUD endpoint
- [ ] Chat streaming works end-to-end (SSE)
- [ ] Question generation returns valid JSON with questions
- [ ] SM-2 flashcard review updates ease/interval correctly
- [ ] Weakness analysis stores profiles + micro lessons
- [ ] All endpoints require authentication (`Depends(get_current_user)`)
- [ ] Pydantic schemas validate all request bodies
- [ ] Error responses use proper HTTP status codes

---

## Copilot Prompt for Each Router

```
Create app/api/{module}.py with a FastAPI APIRouter. 
Prefix: /api/{module}
Tags: ["{module}"]

Endpoints:
- GET / — list user's {resources}
- POST / — create {resource}
- GET /{id} — get single {resource}
- PATCH /{id} — update {resource}
- DELETE /{id} — delete {resource}

All endpoints should:
1. Use Depends(get_current_user) for auth
2. Use Depends(get_db) for database session
3. Filter by user_id for data isolation
4. Use SQLAlchemy text() with parameterized queries
5. Return JSON responses
```

---

## Next Phase

Once all API endpoints are migrated, proceed to [Phase 8 — WebSocket Real-time Features](phase-08-websockets.md).
