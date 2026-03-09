# NoteAura / SmartExam — Copilot Instructions

## Project Overview

NoteAura (SmartExam) is an AI-powered study platform being migrated from **Supabase BaaS** to a **self-hosted Python backend**. The migration replaces all Supabase dependencies (Edge Functions, Auth, Storage, Database) with FastAPI, Better Auth, MinIO, PostgreSQL + pgvector, and a RAG pipeline powered by Groq.

## Architecture

### Current (Being Migrated Away)
- **Frontend**: React SPA (Vite + TypeScript + Tailwind + Shadcn/UI)
- **Backend**: Supabase Edge Functions (Deno) — 16 functions
- **Auth**: Supabase Auth (email + Google OAuth)
- **Database**: Supabase PostgreSQL (managed)
- **Storage**: Supabase Storage (PDFs)
- **AI**: Groq API (llama-3.3-70b) with naive text truncation

### Target (Being Built)
- **Frontend**: Same React SPA, refactored to call Python API
- **Backend**: FastAPI (Python 3.12+) — async-first
- **Auth**: Better Auth (Node.js sidecar) with session cookies
- **Database**: PostgreSQL 16 + pgvector (self-hosted)
- **ORM**: SQLAlchemy 2.0 + Alembic migrations
- **Storage**: MinIO (S3-compatible, self-hosted)
- **AI**: Groq Python SDK + LangChain with full RAG pipeline
- **Task Queue**: Celery + Redis (background PDF processing, embedding generation)
- **Real-time**: FastAPI WebSockets + Redis Pub/Sub
- **Caching**: Redis

## Backend Project Structure

```
smartstudy-backend/
├── alembic/                    # Database migrations
├── app/
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Pydantic Settings
│   ├── dependencies.py         # DI (auth, DB)
│   ├── api/                    # Route modules (documents, chat, exams, etc.)
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── services/               # Business logic layer
│   ├── workers/                # Celery background tasks
│   ├── core/                   # Database, Redis, MinIO, Security, WebSocket
│   └── rag/                    # RAG pipeline (chunker, embedder, retriever, reranker, prompt_builder)
├── better-auth/                # Better Auth Node.js sidecar
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── tests/
```

## Key Conventions

### Python Backend
- Use **async/await** everywhere for I/O (database, API calls, MinIO)
- Use **Pydantic v2** models for all request/response validation
- Use **SQLAlchemy 2.0** mapped columns with type hints
- Use **Alembic** for all database migrations — never raw SQL in code
- Use **dependency injection** via FastAPI's `Depends()` for auth and DB sessions
- All API routes go in `app/api/` with one file per domain
- Business logic goes in `app/services/` — routes should be thin
- Background tasks go in `app/workers/` via Celery
- Use `uuid.uuid4()` for all primary keys
- Use `datetime.utcnow()` for timestamps
- All user-facing errors return proper HTTP status codes with JSON error bodies

### RAG Pipeline
- Documents are chunked into 512-token segments with 50-token overlap
- Embeddings use `all-MiniLM-L6-v2` (384 dimensions)
- Vector search uses pgvector with IVFFlat index and cosine similarity
- Retrieval fetches top-8 chunks, reranker narrows to top-4
- Prompts always include page citations: `[Page X]`

### Authentication
- Better Auth runs as a separate Node.js service on port 3000
- FastAPI validates sessions by calling Better Auth's `/api/auth/get-session`
- Frontend uses session cookies (`credentials: 'include'`)
- All protected routes use `Depends(get_current_user)` middleware
- No JWT handling in Python — Better Auth manages all tokens

### Database
- PostgreSQL 16 with pgvector extension enabled
- Tables: profiles, documents, document_pages, document_chunks, conversations, messages, exam_sessions, exams, flashcards, flashcard_reviews, subscriptions, usage_tracking, weakness_profiles, micro_lessons, concepts, concept_relationships, score_predictions, study_plans, study_plan_items, battle_rooms, elo_ratings, user_gamification, achievements, user_achievements, folders, document_tags, document_tag_links
- Better Auth auto-creates: user, session, account, verification tables

### Frontend
- Use `api.get()`, `api.post()`, `api.patch()`, `api.delete()` from `src/lib/api-client.ts`
- Use `api.upload()` for file uploads (FormData)
- All API calls include `credentials: 'include'` for session cookies
- Auth state managed via Better Auth's `useSession()` hook
- WebSocket connections for battles at `ws://API_URL/ws/battles/{room_id}`
- Environment variables: `VITE_API_URL`, `VITE_AUTH_URL`, `VITE_WS_URL`

### Storage (MinIO)
- Buckets: `documents` (private, presigned URLs), `avatars` (public read)
- Upload flow: Frontend → `POST /api/documents/upload` (multipart) → MinIO
- Download flow: `GET /api/documents/{id}/download-url` → presigned URL
- Max file size configurable via Nginx/MinIO

### Groq AI Models
- Primary: `llama-3.3-70b-versatile`
- Fallback: `mixtral-8x7b-32768`
- Chat uses SSE streaming, structured outputs use JSON mode
- Temperature varies by feature (0.2 for analysis, 0.6 for chat, 0.7 for generation)

### Testing
- Backend: pytest + pytest-asyncio + httpx (AsyncClient)
- Frontend: Vitest
- Use factory-boy for test data generation
- Test database: separate PostgreSQL database (`noteaura_test`)
- Coverage targets: API routes 80%, Services 85%, RAG 90%

### Docker Services
- `api` — FastAPI backend (port 8000)
- `auth` — Better Auth sidecar (port 3000)
- `worker` — Celery workers
- `beat` — Celery beat scheduler
- `postgres` — PostgreSQL 16 + pgvector (port 5432)
- `redis` — Redis 7 (port 6379)
- `minio` — MinIO storage (API: 9000, Console: 9001)

## Code Style
- Python: follow PEP 8, use type hints, prefer f-strings
- TypeScript: strict mode, no `any` types, use interfaces over types where possible
- Use descriptive variable names — no single-letter variables except loop counters
- Keep functions focused — one function, one responsibility
- Prefer composition over inheritance
- Error messages should be user-friendly, not stack traces

## Security Requirements
- Validate all user inputs with Pydantic
- Use parameterized queries (SQLAlchemy handles this)
- Rate limit AI endpoints (chat, questions, analysis)
- Verify Stripe webhook signatures
- Check document ownership before any operation
- Use HttpOnly, Secure, SameSite cookies for auth
- Never log secrets or tokens
- File uploads: validate MIME type + magic bytes, reject non-PDF

## Migration Reference
- Full migration blueprint: `MIGRATION_PYTHON_BACKEND.md`
- Detailed phase guides: `docs/phases/`
- Copilot development guide: `docs/COPILOT_DEVELOPMENT_GUIDE.md`
