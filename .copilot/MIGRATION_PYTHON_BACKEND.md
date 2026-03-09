# 🔄 NoteAura / SmartExam — Full Stack Migration Blueprint

## Migrating from Supabase BaaS → Python Backend + Better Auth + MinIO + RAG Pipeline + Groq

> **Goal**: Replace the entire Supabase-dependent backend (Edge Functions, Auth, Storage, Database) with a self-hosted, production-grade Python backend featuring a proper AI RAG pipeline, Better Auth for authentication, MinIO for object storage, and Groq for LLM inference.

---

## 📋 Table of Contents

1. [Migration Overview & Rationale](#1-migration-overview--rationale)
2. [Current vs Target Architecture](#2-current-vs-target-architecture)
3. [Tech Stack Comparison](#3-tech-stack-comparison)
4. [Target Tech Stack Deep Dive](#4-target-tech-stack-deep-dive)
5. [Phase 1 — Core Infrastructure Setup](#5-phase-1--core-infrastructure-setup)
6. [Phase 2 — Authentication with Better Auth](#6-phase-2--authentication-with-better-auth)
7. [Phase 3 — MinIO Object Storage](#7-phase-3--minio-object-storage)
8. [Phase 4 — Database Migration (PostgreSQL)](#8-phase-4--database-migration-postgresql)
9. [Phase 5 — AI RAG Pipeline Architecture](#9-phase-5--ai-rag-pipeline-architecture)
10. [Phase 6 — Groq LLM Integration](#10-phase-6--groq-llm-integration)
11. [Phase 7 — API Endpoint Migration](#11-phase-7--api-endpoint-migration)
12. [Phase 8 — Real-time Features (WebSockets)](#12-phase-8--real-time-features-websockets)
13. [Phase 9 — Frontend Refactor](#13-phase-9--frontend-refactor)
14. [Phase 10 — Stripe & Payment Migration](#14-phase-10--stripe--payment-migration)
15. [Phase 11 — DevOps & Deployment](#15-phase-11--devops--deployment)
16. [Database Schema (Full PostgreSQL)](#16-database-schema-full-postgresql)
17. [Complete API Reference](#17-complete-api-reference)
18. [RAG Pipeline Deep Dive](#18-rag-pipeline-deep-dive)
19. [Security Architecture](#19-security-architecture)
20. [Testing Strategy](#20-testing-strategy)
21. [Migration Checklist](#21-migration-checklist)
22. [Risk Assessment & Rollback Plan](#22-risk-assessment--rollback-plan)

---

## 1. Migration Overview & Rationale

### Why Migrate Away from Supabase?

| Issue | Impact |
|-------|--------|
| **Vendor lock-in** | Entire backend depends on Supabase BaaS — no portability |
| **Edge Function limitations** | Deno runtime, cold starts, 150s execution limit, no persistent connections |
| **No proper RAG pipeline** | Current "context building" is naive text truncation, not vector-based retrieval |
| **Storage limitations** | Supabase Storage has bandwidth limits and no CDN control |
| **Auth inflexibility** | Supabase Auth lacks advanced features (passkeys, device sessions, organization auth) |
| **Cost at scale** | Supabase pricing escalates rapidly with usage (database, storage, edge invocations) |
| **No background jobs** | No task queue for async processing (PDF extraction, embedding generation) |
| **Limited AI pipeline** | No embedding storage, no vector search, no chunking pipeline |

### What We Gain

| Benefit | Description |
|---------|-------------|
| **Full control** | Self-hosted infrastructure, no vendor dependency |
| **Proper RAG** | Vector embeddings + semantic search = dramatically better AI responses |
| **Better Auth** | Modern auth with passkeys, MFA, device management, session control |
| **MinIO storage** | S3-compatible, self-hosted, unlimited storage with CDN support |
| **Background workers** | Celery/Redis for async PDF processing, embedding generation |
| **Custom real-time** | WebSocket server with full control over channels and events |
| **Cost efficiency** | Predictable infrastructure costs, no per-invocation billing |

---

## 2. Current vs Target Architecture

### Current Architecture

```
┌──────────────────────────┐
│    React SPA (Vite)      │
│    TypeScript + Tailwind │
│    + Shadcn/UI           │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│      Supabase BaaS       │
│  ┌─────────────────────┐ │
│  │ Auth (Email/Google)  │ │
│  │ PostgreSQL Database  │ │
│  │ Storage (PDFs)       │ │
│  │ Edge Functions (16x) │ │
│  │ Realtime (WebSocket) │ │
│  └─────────────────────┘ │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   Groq API               │
│   (llama-3.3-70b)        │
└──────────────────────────┘
```

### Target Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    React SPA (Vite + TypeScript)                  │
│              Shadcn/UI + Tailwind + Framer Motion                │
│              Better Auth React SDK for Auth                      │
└──────────────┬────────────────────────────┬──────────────────────┘
               │  REST API                  │  WebSocket
               ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────────────┐
│   Python Backend (FastAPI)│  │  WebSocket Server (FastAPI WS)   │
│                          │  │  - Battle rooms                  │
│   ┌────────────────────┐ │  │  - Chat streaming                │
│   │ Better Auth Server │ │  │  - Real-time notifications       │
│   │ (Node.js sidecar)  │ │  └──────────────────────────────────┘
│   └────────────────────┘ │
│                          │
│   ┌────────────────────┐ │  ┌──────────────────────────────────┐
│   │  API Routes        │ │  │  Celery Workers (Background)     │
│   │  - /api/documents  │ │  │  - PDF text extraction           │
│   │  - /api/chat       │ │  │  - Embedding generation          │
│   │  - /api/exams      │ │  │  - Study plan generation         │
│   │  - /api/flashcards │ │  │  - Weakness analysis             │
│   │  - /api/battles    │ │  │  - PYQ analysis                  │
│   │  - /api/plans      │ │  │  - Score prediction              │
│   │  ...               │ │  └────────────────┬─────────────────┘
│   └────────────────────┘ │                   │
└──────────┬───────────────┘                   │
           │                                   │
     ┌─────┼──────────────────┬────────────────┤
     │     │                  │                │
     ▼     ▼                  ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  ┌────────┐
│ PostgreSQL  │  │ MinIO        │  │ Redis            │  │ Groq   │
│ + pgvector  │  │ (S3-compat)  │  │ (Cache + Broker) │  │ API    │
│             │  │              │  │                  │  │        │
│ - All tables│  │ - PDFs       │  │ - Session cache  │  │ llama  │
│ - Vectors   │  │ - Avatars    │  │ - Task queue     │  │ 3.3-70b│
│ - Full-text │  │ - Exports    │  │ - Rate limiting  │  │        │
│   search    │  │              │  │ - Pub/Sub (WS)   │  │        │
└─────────────┘  └──────────────┘  └─────────────────┘  └────────┘
```

---

## 3. Tech Stack Comparison

| Component | Current (Supabase) | Target (Python) |
|-----------|-------------------|-----------------|
| **Backend Framework** | Supabase Edge Functions (Deno) | **FastAPI** (Python 3.12+) |
| **Authentication** | Supabase Auth | **Better Auth** (Node.js sidecar + React SDK) |
| **Database** | Supabase PostgreSQL (managed) | **PostgreSQL 16** (self-hosted) + **pgvector** |
| **ORM** | Supabase JS Client | **SQLAlchemy 2.0** + **Alembic** |
| **Object Storage** | Supabase Storage | **MinIO** (S3-compatible) |
| **AI LLM** | Groq API (direct HTTP) | **Groq Python SDK** + **LangChain** |
| **Embeddings** | None (naive text truncation) | **sentence-transformers** or **Groq embeddings** |
| **Vector Store** | None | **pgvector** (in PostgreSQL) |
| **RAG Framework** | None | **LangChain** + custom chunking pipeline |
| **Task Queue** | None (synchronous) | **Celery** + **Redis** |
| **Caching** | None | **Redis** |
| **Real-time** | Supabase Realtime | **FastAPI WebSockets** + **Redis Pub/Sub** |
| **PDF Processing** | pdf.js (client-side) | **PyMuPDF (fitz)** + **pdfplumber** (server-side) |
| **Payments** | Stripe (via Edge Functions) | **Stripe Python SDK** |
| **API Docs** | None | **Swagger/OpenAPI** (auto-generated by FastAPI) |
| **Testing** | Vitest (frontend only) | **pytest** + **httpx** (backend) + **Vitest** (frontend) |
| **Monitoring** | Sentry (frontend) | **Sentry** (full-stack) + **Prometheus** + **Grafana** |

---

## 4. Target Tech Stack Deep Dive

### 4.1 FastAPI (Python Backend)

```
Framework: FastAPI 0.115+
Python: 3.12+
ASGI Server: Uvicorn (production: Gunicorn + Uvicorn workers)
```

**Why FastAPI:**
- Async-first — native `async/await` for I/O-bound operations (DB, Groq API, MinIO)
- Auto-generated OpenAPI docs (Swagger UI + ReDoc)
- Pydantic v2 for request/response validation
- Native WebSocket support
- Dependency injection system (auth middleware, DB sessions)
- Type hints throughout — catches bugs at development time

### 4.2 Better Auth

```
Package: better-auth (Node.js)
Frontend SDK: @better-auth/react
```

**Why Better Auth over Supabase Auth:**
- Self-hosted — full data ownership
- Passkey/WebAuthn support
- Device session management
- Organization/team auth
- Plugin system (2FA, magic link, social providers)
- Works with any database (PostgreSQL via adapter)
- Rate limiting built-in

**Architecture**: Better Auth runs as a Node.js sidecar service alongside the Python backend. The React frontend communicates directly with Better Auth for auth operations, and the Python backend validates sessions via Better Auth's API.

### 4.3 MinIO (Object Storage)

```
Server: MinIO (self-hosted or MinIO Cloud)
SDK: minio-py (Python), @aws-sdk/client-s3 (frontend presigned URLs)
```

**Why MinIO over Supabase Storage:**
- S3-compatible API — industry standard
- Self-hosted — no bandwidth limits
- Bucket policies, lifecycle rules, versioning
- Event notifications (webhook on upload)
- Erasure coding for data durability
- Console UI for management
- CDN integration via Nginx/CloudFront

### 4.4 Groq (AI Models)

```
SDK: groq (Python)
Models: llama-3.3-70b-versatile (primary), mixtral-8x7b (fallback)
```

**Current Usage (unchanged):**
- Chat streaming (SSE)
- Question generation (JSON output)
- Answer evaluation (JSON output)
- Summary generation
- Concept extraction
- Weakness analysis
- Study plan generation
- PYQ analysis
- Score prediction
- Feynman teaching
- Battle question generation

**Enhanced with RAG**: Instead of naive text truncation, Groq will receive semantically relevant document chunks retrieved via vector search.

---

## 5. Phase 1 — Core Infrastructure Setup

### 5.1 Project Structure

```
smartstudy-backend/
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment configuration
│   ├── dependencies.py         # Dependency injection (auth, DB)
│   │
│   ├── api/                    # API route modules
│   │   ├── __init__.py
│   │   ├── auth.py             # Auth proxy routes
│   │   ├── documents.py        # Document CRUD + upload
│   │   ├── chat.py             # AI chat streaming
│   │   ├── exams.py            # Exam sessions + question gen
│   │   ├── flashcards.py       # Flashcard CRUD + generation
│   │   ├── battles.py          # Battle rooms + matchmaking
│   │   ├── weakness.py         # Weakness analysis
│   │   ├── study_plans.py      # Study plan generation
│   │   ├── concepts.py         # Knowledge graph
│   │   ├── pyq.py              # PYQ analysis
│   │   ├── scores.py           # Score prediction
│   │   ├── feynman.py          # Feynman teaching mode
│   │   ├── usage.py            # Usage tracking
│   │   ├── subscriptions.py    # Stripe + subscriptions
│   │   └── webhooks.py         # Stripe webhooks
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py             # User/Profile model
│   │   ├── document.py         # Document + DocumentPage
│   │   ├── conversation.py     # Conversation + Message
│   │   ├── exam.py             # ExamSession + Exam
│   │   ├── flashcard.py        # Flashcard + FlashcardReview
│   │   ├── battle.py           # BattleRoom + EloRating
│   │   ├── weakness.py         # WeaknessProfile + MicroLesson
│   │   ├── concept.py          # Concept + ConceptRelationship
│   │   ├── study_plan.py       # StudyPlan + StudyPlanItem
│   │   ├── subscription.py     # Subscription + UsageTracking
│   │   ├── gamification.py     # UserGamification + Achievement
│   │   ├── folder.py           # Folder + DocumentTag
│   │   └── embedding.py        # DocumentChunk (vectors)
│   │
│   ├── schemas/                # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── document.py
│   │   ├── chat.py
│   │   ├── exam.py
│   │   ├── flashcard.py
│   │   ├── battle.py
│   │   ├── weakness.py
│   │   ├── study_plan.py
│   │   ├── concept.py
│   │   ├── subscription.py
│   │   └── usage.py
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── ai_service.py       # Groq API wrapper
│   │   ├── rag_service.py      # RAG pipeline (embed, retrieve, generate)
│   │   ├── embedding_service.py # Embedding generation
│   │   ├── pdf_service.py      # PDF text extraction
│   │   ├── storage_service.py  # MinIO operations
│   │   ├── chat_service.py     # Chat logic + streaming
│   │   ├── exam_service.py     # Question generation + evaluation
│   │   ├── flashcard_service.py
│   │   ├── battle_service.py
│   │   ├── weakness_service.py
│   │   ├── study_plan_service.py
│   │   ├── concept_service.py
│   │   ├── usage_service.py
│   │   └── subscription_service.py
│   │
│   ├── workers/                # Celery background tasks
│   │   ├── __init__.py
│   │   ├── celery_app.py       # Celery configuration
│   │   ├── pdf_worker.py       # PDF extraction + chunking
│   │   ├── embedding_worker.py # Vector embedding generation
│   │   ├── analysis_worker.py  # Weakness/PYQ/score prediction
│   │   └── plan_worker.py      # Study plan generation
│   │
│   ├── core/                   # Core utilities
│   │   ├── __init__.py
│   │   ├── database.py         # SQLAlchemy engine + session
│   │   ├── redis.py            # Redis connection
│   │   ├── minio_client.py     # MinIO client
│   │   ├── security.py         # Auth validation
│   │   └── websocket.py        # WebSocket manager
│   │
│   └── rag/                    # RAG pipeline components
│       ├── __init__.py
│       ├── chunker.py          # Document chunking strategies
│       ├── embedder.py         # Embedding generation
│       ├── retriever.py        # Vector similarity search
│       ├── reranker.py         # Result reranking
│       └── prompt_builder.py   # Context-aware prompt construction
│
├── better-auth/                # Better Auth sidecar
│   ├── package.json
│   ├── index.ts                # Better Auth server config
│   └── .env
│
├── docker-compose.yml          # Full stack orchestration
├── Dockerfile                  # Python backend container
├── Dockerfile.auth             # Better Auth container
├── requirements.txt            # Python dependencies
├── pyproject.toml              # Project metadata
├── alembic.ini                 # Alembic config
├── .env.example                # Environment variables template
└── tests/
    ├── conftest.py
    ├── test_api/
    ├── test_services/
    ├── test_rag/
    └── test_workers/
```

### 5.2 Docker Compose Stack

```yaml
# docker-compose.yml
version: "3.9"

services:
  # --- Core Backend ---
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://noteaura:password@postgres:5432/noteaura
      - REDIS_URL=redis://redis:6379/0
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - GROQ_API_KEY=${GROQ_API_KEY}
      - BETTER_AUTH_URL=http://auth:3000
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
    depends_on:
      - postgres
      - redis
      - minio
      - auth
    volumes:
      - ./app:/app/app

  # --- Better Auth Sidecar ---
  auth:
    build:
      context: ./better-auth
      dockerfile: ../Dockerfile.auth
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://noteaura:password@postgres:5432/noteaura
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=http://localhost:3000
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - postgres

  # --- Celery Worker ---
  worker:
    build: .
    command: celery -A app.workers.celery_app worker -l info -c 4
    environment:
      - DATABASE_URL=postgresql+asyncpg://noteaura:password@postgres:5432/noteaura
      - REDIS_URL=redis://redis:6379/0
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - GROQ_API_KEY=${GROQ_API_KEY}
    depends_on:
      - postgres
      - redis
      - minio

  # --- Celery Beat (Scheduled Tasks) ---
  beat:
    build: .
    command: celery -A app.workers.celery_app beat -l info
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis

  # --- PostgreSQL + pgvector ---
  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=noteaura
      - POSTGRES_USER=noteaura
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # --- Redis ---
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # --- MinIO ---
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 5.3 Python Dependencies

```txt
# requirements.txt

# --- Web Framework ---
fastapi==0.115.6
uvicorn[standard]==0.34.0
gunicorn==23.0.0
python-multipart==0.0.18

# --- Database ---
sqlalchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.14.1
pgvector==0.3.6

# --- AI / RAG ---
groq==0.13.1
langchain==0.3.14
langchain-community==0.3.14
langchain-groq==0.2.4
sentence-transformers==3.3.1
tiktoken==0.8.0

# --- Object Storage ---
minio==7.2.12

# --- Task Queue ---
celery[redis]==5.4.0
redis==5.2.1

# --- PDF Processing ---
pymupdf==1.25.1
pdfplumber==0.11.4

# --- Auth ---
httpx==0.28.1

# --- Payments ---
stripe==11.4.1

# --- Validation ---
pydantic==2.10.4
pydantic-settings==2.7.1

# --- Monitoring ---
sentry-sdk[fastapi]==2.19.2
prometheus-client==0.21.1

# --- Utilities ---
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.1

# --- Testing ---
pytest==8.3.4
pytest-asyncio==0.24.0
httpx==0.28.1
factory-boy==3.3.1
```

### 5.4 Environment Configuration

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    APP_NAME: str = "NoteAura API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_SECURE: bool = False
    MINIO_BUCKET_DOCUMENTS: str = "documents"
    MINIO_BUCKET_AVATARS: str = "avatars"

    # Groq AI
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_FALLBACK_MODEL: str = "mixtral-8x7b-32768"

    # RAG Pipeline
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    TOP_K_RETRIEVAL: int = 8
    RERANK_TOP_K: int = 4

    # Better Auth
    BETTER_AUTH_URL: str = "http://localhost:3000"
    BETTER_AUTH_SECRET: str

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PRO_PRICE_ID: str
    STRIPE_UNIVERSITY_PRICE_ID: str

    # Sentry
    SENTRY_DSN: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 6. Phase 2 — Authentication with Better Auth

### 6.1 Better Auth Server Setup

```typescript
// better-auth/index.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const auth = betterAuth({
  database: pool,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // Refresh every 24 hours
    cookieCacheEnabled: true,
  },

  user: {
    additionalFields: {
      fullName: { type: "string", required: false },
      avatarUrl: { type: "string", required: false },
    },

    // Auto-create profile on signup
    hooks: {
      after: {
        createUser: async (user) => {
          // Insert into profiles table
          await pool.query(
            `INSERT INTO profiles (id, email, full_name, avatar_url)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO NOTHING`,
            [user.id, user.email, user.name, user.image]
          );

          // Create free subscription
          await pool.query(
            `INSERT INTO subscriptions (user_id, plan, status)
             VALUES ($1, 'free', 'active')
             ON CONFLICT (user_id) DO NOTHING`,
            [user.id]
          );

          // Create gamification profile
          await pool.query(
            `INSERT INTO user_gamification (user_id)
             VALUES ($1)
             ON CONFLICT (user_id) DO NOTHING`,
            [user.id]
          );

          // Create initial ELO rating
          await pool.query(
            `INSERT INTO elo_ratings (user_id)
             VALUES ($1)
             ON CONFLICT (user_id) DO NOTHING`,
            [user.id]
          );
        },
      },
    },
  },

  advanced: {
    generateId: () => crypto.randomUUID(),
  },
});

// Start server
const server = Bun.serve({
  port: 3000,
  fetch: auth.handler,
});

console.log(`Better Auth server running on port ${server.port}`);
```

### 6.2 Better Auth Package Configuration

```json
// better-auth/package.json
{
  "name": "noteaura-auth",
  "version": "1.0.0",
  "dependencies": {
    "better-auth": "^1.2.0",
    "pg": "^8.13.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.7.0"
  }
}
```

### 6.3 Python Backend — Auth Validation Middleware

```python
# app/core/security.py
import httpx
from fastapi import Depends, HTTPException, Request
from app.config import settings

async def get_current_user(request: Request) -> dict:
    """
    Validate the session with Better Auth server.
    Extracts session cookie or Authorization header and verifies with Better Auth.
    """
    # Get session token from cookie or header
    session_token = request.cookies.get("better-auth.session_token")

    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]

    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Validate session with Better Auth
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.BETTER_AUTH_URL}/api/auth/get-session",
            headers={"Authorization": f"Bearer {session_token}"},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")

    data = response.json()
    if not data.get("user"):
        raise HTTPException(status_code=401, detail="Session expired")

    return data["user"]

# Dependency shorthand
CurrentUser = Depends(get_current_user)
```

### 6.4 Frontend — Better Auth React Integration

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL, // http://localhost:3000
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
```

### 6.5 Migration from Supabase Auth → Better Auth

| Supabase Auth Feature | Better Auth Equivalent |
|----------------------|----------------------|
| `supabase.auth.signUp()` | `authClient.signUp.email()` |
| `supabase.auth.signInWithPassword()` | `authClient.signIn.email()` |
| `supabase.auth.signInWithOAuth({ provider: 'google' })` | `authClient.signIn.social({ provider: 'google' })` |
| `supabase.auth.signOut()` | `authClient.signOut()` |
| `supabase.auth.resetPasswordForEmail()` | `authClient.forgetPassword()` |
| `supabase.auth.updateUser()` | `authClient.updateUser()` |
| `supabase.auth.getSession()` | `authClient.getSession()` or `useSession()` hook |
| `supabase.auth.onAuthStateChange()` | `useSession()` hook (reactive) |
| JWT-based auth (Bearer token) | Session cookie + Bearer token |
| RLS policies (database-level) | API-level middleware (Python) |

### 6.6 AuthContext Refactor

```typescript
// src/contexts/AuthContext.tsx (REFACTORED)
import { createContext, useContext, ReactNode } from "react";
import { useSession } from "@/lib/auth-client";

interface AuthContextType {
  user: { id: string; email: string; name: string; image?: string } | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null,
      loading: isPending,
      isAuthenticated: !!session?.user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 7. Phase 3 — MinIO Object Storage

### 7.1 MinIO Python Client Setup

```python
# app/core/minio_client.py
from minio import Minio
from app.config import settings

minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)

def init_buckets():
    """Create required buckets on startup."""
    buckets = [
        settings.MINIO_BUCKET_DOCUMENTS,
        settings.MINIO_BUCKET_AVATARS,
    ]
    for bucket in buckets:
        if not minio_client.bucket_exists(bucket):
            minio_client.make_bucket(bucket)
```

### 7.2 Storage Service

```python
# app/services/storage_service.py
import io
import uuid
from datetime import timedelta
from minio import Minio
from app.core.minio_client import minio_client
from app.config import settings

class StorageService:
    def __init__(self):
        self.client = minio_client

    async def upload_document(
        self, user_id: str, file_data: bytes, filename: str, content_type: str
    ) -> str:
        """Upload a PDF document to MinIO. Returns the object path."""
        timestamp = int(datetime.now().timestamp())
        object_name = f"{user_id}/{timestamp}_{filename}"

        self.client.put_object(
            bucket_name=settings.MINIO_BUCKET_DOCUMENTS,
            object_name=object_name,
            data=io.BytesIO(file_data),
            length=len(file_data),
            content_type=content_type,
        )
        return object_name

    async def get_document_url(self, object_name: str, expires: int = 3600) -> str:
        """Generate a presigned download URL."""
        return self.client.presigned_get_object(
            bucket_name=settings.MINIO_BUCKET_DOCUMENTS,
            object_name=object_name,
            expires=timedelta(seconds=expires),
        )

    async def delete_document(self, object_name: str):
        """Delete a document from MinIO."""
        self.client.remove_object(
            bucket_name=settings.MINIO_BUCKET_DOCUMENTS,
            object_name=object_name,
        )

    async def get_document_bytes(self, object_name: str) -> bytes:
        """Download document bytes for processing."""
        response = self.client.get_object(
            bucket_name=settings.MINIO_BUCKET_DOCUMENTS,
            object_name=object_name,
        )
        return response.read()
```

### 7.3 MinIO Bucket Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::avatars/*"]
    }
  ]
}
```

> **Note**: The `documents` bucket stays private. All access is through presigned URLs generated by the backend. Only the `avatars` bucket is publicly readable.

### 7.4 Migration from Supabase Storage → MinIO

| Supabase Storage | MinIO Equivalent |
|-----------------|-----------------|
| `supabase.storage.from('documents').upload(path, file)` | `minio_client.put_object(bucket, path, data, length)` |
| `supabase.storage.from('documents').getPublicUrl(path)` | `minio_client.presigned_get_object(bucket, path, expires)` |
| `supabase.storage.from('documents').download(path)` | `minio_client.get_object(bucket, path)` |
| `supabase.storage.from('documents').remove([path])` | `minio_client.remove_object(bucket, path)` |
| Storage RLS policies | Backend-level authorization checks |
| 50MB file size limit | Configurable via Nginx/MinIO (default: unlimited) |

### 7.5 Frontend Upload Refactor

```typescript
// BEFORE (Supabase)
const { data, error } = await supabase.storage
  .from('documents')
  .upload(filePath, file);

// AFTER (MinIO via Python API)
const formData = new FormData();
formData.append('file', file);

const response = await fetch(`${API_URL}/api/documents/upload`, {
  method: 'POST',
  body: formData,
  credentials: 'include', // Better Auth session cookie
});
const { document } = await response.json();
```

---

## 8. Phase 4 — Database Migration (PostgreSQL)

### 8.1 SQLAlchemy Setup

```python
# app/core/database.py
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### 8.2 Key Model Examples

```python
# app/models/document.py
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_size: Mapped[int | None] = mapped_column(Integer)
    page_count: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="processing")
    extracted_text: Mapped[str | None] = mapped_column(Text)
    folder_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("folders.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="document")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="pages")

    __table_args__ = (
        Index("ix_document_pages_doc_page", "document_id", "page_number", unique=True),
    )


class DocumentChunk(Base):
    """Vector embeddings for RAG pipeline."""
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    page_number: Mapped[int] = mapped_column(Integer)
    chunk_index: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    embedding: Mapped[list] = mapped_column(Vector(384))  # all-MiniLM-L6-v2 = 384 dims
    metadata_: Mapped[dict | None] = mapped_column("metadata", type_=JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index(
            "ix_document_chunks_embedding",
            "embedding",
            postgresql_using="ivfflat",
            postgresql_with={"lists": 100},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )
```

### 8.3 Data Migration Strategy

```
Step 1: Export all data from Supabase PostgreSQL
        → pg_dump from Supabase dashboard or CLI

Step 2: Transform schema
        → Rename auth.users → users (Better Auth manages this)
        → Add document_chunks table (new for RAG)
        → Add vector extension (CREATE EXTENSION vector)

Step 3: Apply Alembic migrations to new PostgreSQL
        → alembic upgrade head

Step 4: Import data
        → pg_restore or custom migration script
        → Re-hash passwords if format differs (Supabase uses bcrypt → compatible)

Step 5: Generate embeddings for all existing documents
        → Run one-time Celery task to embed all document_pages
```

### 8.4 Key Schema Differences

| Supabase Schema | New PostgreSQL Schema |
|----------------|----------------------|
| `auth.users` (managed by Supabase) | `user` table (managed by Better Auth) |
| No vector storage | `document_chunks` with pgvector embeddings |
| RLS policies for authorization | Application-level authorization in Python |
| `gen_random_uuid()` for IDs | Python `uuid.uuid4()` or `gen_random_uuid()` |
| Supabase triggers for profile creation | Better Auth hooks for profile creation |
| Realtime subscriptions on tables | WebSocket events from Python backend |

---

## 9. Phase 5 — AI RAG Pipeline Architecture

### 9.1 Why RAG Matters

**Current approach (Naive):**
```
User question → Truncate document to ~10,000 chars → Send to Groq → Response
```

**Problems:**
- Loses context from large documents (only first ~10K chars used)
- No semantic understanding of relevance
- Entire document sent even for specific questions
- Token waste — most context is irrelevant

**RAG approach (Semantic):**
```
User question → Embed question → Vector search top-K relevant chunks
  → Rerank by relevance → Build focused context → Send to Groq → Response
```

**Benefits:**
- Answers based on the most relevant document sections
- Works with any document size (10 pages or 1000 pages)
- Lower token usage — only relevant context sent
- Better accuracy — AI sees precisely the content it needs
- Source citations — can reference exact pages/sections

### 9.2 RAG Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INGESTION PIPELINE                        │
│                (When document is uploaded)                    │
│                                                              │
│  PDF Upload → Extract Text → Chunk Text → Generate Embeddings│
│      │             │              │               │          │
│      ▼             ▼              ▼               ▼          │
│   MinIO      DocumentPages   DocumentChunks   pgvector       │
│  (raw PDF)   (full text)     (512-token       (384-dim       │
│                               chunks)          vectors)      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RETRIEVAL PIPELINE                         │
│              (When user asks a question)                      │
│                                                              │
│  User Query → Embed Query → Vector Similarity Search         │
│       │            │              │                           │
│       │            ▼              ▼                           │
│       │      Query Vector   Top-K Chunks (cosine similarity) │
│       │                          │                           │
│       │                          ▼                           │
│       │                    Rerank Results                     │
│       │                          │                           │
│       │                          ▼                           │
│       │              Top-N Most Relevant Chunks              │
│       │                          │                           │
│       ▼                          ▼                           │
│  Build Prompt = System Instructions + Relevant Context       │
│       + Conversation History + User Question                 │
│                          │                                   │
│                          ▼                                   │
│                    Groq API (LLM)                             │
│                          │                                   │
│                          ▼                                   │
│               Streaming Response to User                     │
│                 (with source citations)                       │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Document Chunking

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
    Splits document text into overlapping chunks optimized for embedding.
    Uses semantic boundaries (paragraphs, sections) when possible.
    """

    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 50):
        self.chunk_size = chunk_size   # tokens
        self.chunk_overlap = chunk_overlap  # tokens

    def chunk_document(self, pages: list[dict]) -> list[Chunk]:
        """
        Chunk a document's pages into embedding-ready chunks.

        Args:
            pages: List of {"page_number": int, "content": str}

        Returns:
            List of Chunk objects with metadata
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
        """Split a single page into chunks with overlap."""
        # Split by paragraphs first (semantic boundaries)
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        chunks = []
        current_chunk = ""
        current_tokens = 0

        for para in paragraphs:
            para_tokens = len(para.split())  # Approximate token count

            if current_tokens + para_tokens > self.chunk_size and current_chunk:
                # Save current chunk
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

        # Don't forget the last chunk
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

### 9.4 Embedding Generation

```python
# app/rag/embedder.py
from sentence_transformers import SentenceTransformer
from app.config import settings

class Embedder:
    """
    Generates vector embeddings for text using sentence-transformers.

    Model: all-MiniLM-L6-v2
    - Dimensions: 384
    - Speed: Very fast (~14,000 sentences/sec on GPU)
    - Quality: Good for semantic search
    - Size: 80MB
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

### 9.5 Vector Retrieval

```python
# app/rag/retriever.py
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.rag.embedder import Embedder

class VectorRetriever:
    """
    Retrieves the most relevant document chunks using pgvector similarity search.
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
        Find the top-K most relevant chunks for a query.

        Uses cosine similarity via pgvector's <=> operator.
        """
        # Generate query embedding
        query_embedding = self.embedder.embed_text(query)

        # Vector similarity search
        result = await db.execute(
            text("""
                SELECT
                    id,
                    content,
                    page_number,
                    chunk_index,
                    token_count,
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

        rows = result.fetchall()
        return [
            {
                "id": str(row.id),
                "content": row.content,
                "page_number": row.page_number,
                "chunk_index": row.chunk_index,
                "token_count": row.token_count,
                "similarity": float(row.similarity),
            }
            for row in rows
        ]

    async def retrieve_multi_document(
        self,
        db: AsyncSession,
        document_ids: list[str],
        query: str,
        top_k: int = 8,
    ) -> list[dict]:
        """Retrieve across multiple documents (for cross-document knowledge graph)."""
        query_embedding = self.embedder.embed_text(query)

        result = await db.execute(
            text("""
                SELECT
                    dc.id,
                    dc.content,
                    dc.page_number,
                    dc.document_id,
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

### 9.6 Reranker

```python
# app/rag/reranker.py

class Reranker:
    """
    Reranks retrieved chunks to improve relevance.
    Uses a simple cross-encoder approach or keyword overlap scoring.
    """

    def rerank(
        self,
        query: str,
        chunks: list[dict],
        top_k: int = 4,
    ) -> list[dict]:
        """
        Rerank chunks based on:
        1. Keyword overlap with query
        2. Original similarity score
        3. Chunk position (earlier pages may be more introductory)
        """
        query_terms = set(query.lower().split())

        for chunk in chunks:
            content_terms = set(chunk["content"].lower().split())

            # Keyword overlap score
            overlap = len(query_terms & content_terms) / max(len(query_terms), 1)

            # Combined score (70% vector similarity + 30% keyword overlap)
            chunk["rerank_score"] = (
                0.7 * chunk["similarity"]
                + 0.3 * overlap
            )

        # Sort by rerank score and return top-K
        chunks.sort(key=lambda x: x["rerank_score"], reverse=True)
        return chunks[:top_k]
```

### 9.7 Prompt Builder

```python
# app/rag/prompt_builder.py

class PromptBuilder:
    """
    Constructs context-rich prompts for Groq LLM using retrieved RAG chunks.
    """

    def build_chat_prompt(
        self,
        chunks: list[dict],
        mark_level: str = "4M",
        document_title: str = "",
    ) -> str:
        """Build system prompt with RAG context for chat."""
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

    def build_question_generation_prompt(
        self,
        chunks: list[dict],
        difficulty: str,
        count: int,
    ) -> str:
        """Build prompt for exam question generation."""
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
      "marks": 2|4|8|16,
      "expectedAnswer": "...",
      "hint": "..."
    }}
  ]
}}"""

    def build_weakness_analysis_prompt(
        self,
        chunks: list[dict],
        exam_answers: list[dict],
    ) -> str:
        """Build prompt for weakness detection."""
        context = self._format_chunks(chunks)
        answers_text = "\n".join(
            f"Q: {a['question']}\nStudent Answer: {a['answer']}\nExpected: {a.get('expected', 'N/A')}"
            for a in exam_answers
        )

        return f"""Analyze the student's exam performance and identify weaknesses.

## Document Context:
{context}

## Student's Answers:
{answers_text}

Identify weak topics, assign confidence scores (0.0-1.0), and generate micro-lessons.
Respond in JSON format."""

    def _format_chunks(self, chunks: list[dict]) -> str:
        """Format retrieved chunks into readable context."""
        if not chunks:
            return "No relevant context found."

        formatted = []
        for i, chunk in enumerate(chunks, 1):
            page = chunk.get("page_number", "?")
            similarity = chunk.get("similarity", 0)
            formatted.append(
                f"--- Excerpt {i} [Page {page}] (relevance: {similarity:.2f}) ---\n"
                f"{chunk['content']}\n"
            )
        return "\n".join(formatted)
```

### 9.8 Complete RAG Service

```python
# app/services/rag_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.rag.chunker import DocumentChunker
from app.rag.embedder import Embedder
from app.rag.retriever import VectorRetriever
from app.rag.reranker import Reranker
from app.rag.prompt_builder import PromptBuilder
from app.config import settings

class RAGService:
    """
    Orchestrates the full RAG pipeline:
    Ingest → Embed → Store → Retrieve → Rerank → Generate
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
        """
        Full ingestion pipeline: chunk → embed → store vectors.

        Called by Celery worker after PDF text extraction.
        """
        # Step 1: Chunk the document
        chunks = self.chunker.chunk_document(pages)

        # Step 2: Generate embeddings (batch)
        texts = [c.content for c in chunks]
        embeddings = self.embedder.embed_batch(texts)

        # Step 3: Store in database
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
        self,
        db: AsyncSession,
        document_id: str,
        query: str,
        top_k: int = None,
        rerank_top_k: int = None,
    ) -> list[dict]:
        """
        Retrieve and rerank relevant chunks for a query.

        Returns the most relevant document chunks for context injection.
        """
        top_k = top_k or settings.TOP_K_RETRIEVAL
        rerank_top_k = rerank_top_k or settings.RERANK_TOP_K

        # Step 1: Vector similarity search
        chunks = await self.retriever.retrieve(db, document_id, query, top_k=top_k)

        # Step 2: Rerank
        reranked = self.reranker.rerank(query, chunks, top_k=rerank_top_k)

        return reranked

    def build_context_prompt(
        self,
        chunks: list[dict],
        prompt_type: str = "chat",
        **kwargs,
    ) -> str:
        """Build a context-enriched prompt for the LLM."""
        if prompt_type == "chat":
            return self.prompt_builder.build_chat_prompt(
                chunks,
                mark_level=kwargs.get("mark_level", "4M"),
                document_title=kwargs.get("document_title", ""),
            )
        elif prompt_type == "questions":
            return self.prompt_builder.build_question_generation_prompt(
                chunks,
                difficulty=kwargs.get("difficulty", "medium"),
                count=kwargs.get("count", 5),
            )
        elif prompt_type == "weakness":
            return self.prompt_builder.build_weakness_analysis_prompt(
                chunks,
                exam_answers=kwargs.get("exam_answers", []),
            )
        # Add more prompt types as needed
```

---

## 10. Phase 6 — Groq LLM Integration

### 10.1 Groq AI Service

```python
# app/services/ai_service.py
import json
from groq import Groq, AsyncGroq
from app.config import settings

class AIService:
    """
    Groq API wrapper for all LLM operations.
    Supports both streaming and JSON responses.
    """

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
        self.fallback_model = settings.GROQ_FALLBACK_MODEL

    async def chat_stream(
        self,
        system_prompt: str,
        messages: list[dict],
        temperature: float = 0.6,
        max_tokens: int = 1500,
    ):
        """
        Stream a chat response from Groq.
        Yields text chunks for Server-Sent Events.
        """
        full_messages = [
            {"role": "system", "content": system_prompt},
            *messages,
        ]

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )

            async for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield delta.content

        except Exception as e:
            # Fallback to secondary model
            stream = await self.client.chat.completions.create(
                model=self.fallback_model,
                messages=full_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield delta.content

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> dict:
        """
        Generate a JSON response from Groq (non-streaming).
        Used for structured outputs: questions, evaluations, analysis.
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            return json.loads(content)

        except Exception:
            # Fallback model
            response = await self.client.chat.completions.create(
                model=self.fallback_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
            return json.loads(response.choices[0].message.content)

    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.5,
        max_tokens: int = 2000,
    ) -> str:
        """Generate a plain text response (e.g., summaries)."""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
```

### 10.2 Groq Model Configuration per Feature

| Feature | Model | Temperature | Max Tokens | Format |
|---------|-------|-------------|------------|--------|
| Chat (2M) | llama-3.3-70b | 0.6 | 400 | Stream (SSE) |
| Chat (4M) | llama-3.3-70b | 0.6 | 700 | Stream (SSE) |
| Chat (8M) | llama-3.3-70b | 0.6 | 1200 | Stream (SSE) |
| Chat (16M) | llama-3.3-70b | 0.6 | 2000 | Stream (SSE) |
| Question Generation | llama-3.3-70b | 0.7 | 2200 | JSON |
| Answer Evaluation | llama-3.3-70b | 0.3 | 2000 | JSON |
| Summary (chapter) | llama-3.3-70b | 0.5 | 2000 | Text |
| Summary (quick) | llama-3.3-70b | 0.5 | 800 | Text |
| Summary (exam) | llama-3.3-70b | 0.5 | 1500 | Text |
| Summary (flashcards) | llama-3.3-70b | 0.5 | 1500 | Text |
| Flashcard Generation | llama-3.3-70b | 0.5 | 2600 | JSON |
| Weakness Analysis | llama-3.3-70b | 0.2 | 2200 | JSON |
| Concept Extraction | llama-3.3-70b | 0.3 | 3000 | JSON |
| Study Plan | llama-3.3-70b | 0.5 | 3000 | JSON |
| PYQ Analysis | llama-3.3-70b | 0.2 | 2800 | JSON |
| Score Prediction | llama-3.3-70b | 0.3 | 1500 | JSON |
| Feynman (start) | llama-3.3-70b | 0.6 | 1500 | Stream (SSE) |
| Feynman (evaluate) | llama-3.3-70b | 0.6 | 1500 | Stream (SSE) |
| Battle Questions | llama-3.3-70b | 0.6 | 2200 | JSON |

---

## 11. Phase 7 — API Endpoint Migration

### 11.1 Complete Endpoint Mapping

This maps every existing Supabase edge function and direct database call to the new Python API.

#### Documents API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `supabase.from('documents').select()` | `GET /api/documents` | GET |
| `supabase.from('documents').insert()` | `POST /api/documents/upload` | POST (multipart) |
| `supabase.from('documents').delete()` | `DELETE /api/documents/{id}` | DELETE |
| `supabase.from('documents').select().eq('id', id)` | `GET /api/documents/{id}` | GET |
| `supabase.from('document_pages').select()` | `GET /api/documents/{id}/pages` | GET |
| `functions/v1/extract-text` | Background Celery task (auto on upload) | — |

#### Chat API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `supabase.from('conversations').select()` | `GET /api/conversations` | GET |
| `supabase.from('conversations').insert()` | `POST /api/conversations` | POST |
| `supabase.from('messages').select()` | `GET /api/conversations/{id}/messages` | GET |
| `functions/v1/chat` (SSE) | `POST /api/chat/stream` | POST (SSE) |

#### Exam API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `functions/v1/generate-questions` | `POST /api/exams/generate-questions` | POST |
| `functions/v1/evaluate-answer` | `POST /api/exams/evaluate-answer` | POST |
| `supabase.from('exam_sessions').insert()` | `POST /api/exams/sessions` | POST |
| `supabase.from('exam_sessions').update()` | `PATCH /api/exams/sessions/{id}` | PATCH |
| `supabase.from('exam_sessions').select()` | `GET /api/exams/sessions` | GET |

#### Flashcards API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `functions/v1/generate-flashcards` | `POST /api/flashcards/generate` | POST |
| `supabase.from('flashcards').select()` | `GET /api/flashcards` | GET |
| `supabase.from('flashcards').update()` (review) | `POST /api/flashcards/{id}/review` | POST |

#### Battle API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `functions/v1/matchmaking` (create) | `POST /api/battles/create` | POST |
| `functions/v1/matchmaking` (join) | `POST /api/battles/{id}/join` | POST |
| `supabase.from('battle_rooms').select()` | `GET /api/battles` | GET |
| `supabase.from('elo_ratings').select()` | `GET /api/battles/leaderboard` | GET |
| Realtime subscription | `WS /ws/battles/{room_id}` | WebSocket |

#### Analysis API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `functions/v1/analyze-weakness` | `POST /api/weakness/analyze` | POST |
| `supabase.from('weakness_profiles').select()` | `GET /api/weakness` | GET |
| `supabase.from('micro_lessons').update()` | `PATCH /api/weakness/lessons/{id}` | PATCH |
| `functions/v1/analyze-pyq` | `POST /api/pyq/analyze` | POST |
| `functions/v1/predict-score` | `POST /api/scores/predict` | POST |
| `functions/v1/extract-concepts` | `POST /api/concepts/extract` | POST |
| `supabase.from('concepts').select()` | `GET /api/concepts` | GET |

#### Study Plan API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `functions/v1/generate-study-plan` | `POST /api/plans/generate` | POST |
| `supabase.from('study_plans').select()` | `GET /api/plans` | GET |
| `supabase.from('study_plan_items').update()` | `PATCH /api/plans/items/{id}` | PATCH |
| `supabase.from('exams').insert()` | `POST /api/plans/exams` | POST |
| `supabase.from('exams').select()` | `GET /api/plans/exams` | GET |

#### Feynman API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `functions/v1/feynman-session` (start) | `POST /api/feynman/start` | POST (SSE) |
| `functions/v1/feynman-session` (evaluate) | `POST /api/feynman/evaluate` | POST (SSE) |

#### Summary API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `functions/v1/generate-summary` | `POST /api/summaries/generate` | POST |

#### Subscription API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `functions/v1/create-checkout-session` | `POST /api/subscriptions/checkout` | POST |
| `functions/v1/stripe-webhook` | `POST /api/webhooks/stripe` | POST |
| `supabase.from('subscriptions').select()` | `GET /api/subscriptions` | GET |
| `functions/v1/check-usage` | `POST /api/usage/check` | POST |
| `supabase.from('usage_tracking').select()` | `GET /api/usage` | GET |

#### Gamification API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `supabase.from('user_gamification').select()` | `GET /api/gamification/profile` | GET |
| `supabase.from('user_gamification').update()` | `POST /api/gamification/xp` | POST |
| `supabase.from('user_achievements').select()` | `GET /api/gamification/achievements` | GET |

#### Folders & Tags API

| Current (Supabase) | New (FastAPI) | Method |
|--------------------|--------------| -------|
| `supabase.from('folders').select()` | `GET /api/folders` | GET |
| `supabase.from('folders').insert()` | `POST /api/folders` | POST |
| `supabase.from('document_tags').select()` | `GET /api/tags` | GET |
| `supabase.from('document_tag_links').insert()` | `POST /api/documents/{id}/tags` | POST |

### 11.2 Example: Chat Stream Endpoint

```python
# app/api/chat.py
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.schemas.chat import ChatRequest

router = APIRouter(prefix="/api/chat", tags=["chat"])

rag_service = RAGService()
ai_service = AIService()

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stream AI chat response with RAG context."""

    # Step 1: Retrieve relevant context via RAG
    chunks = []
    if request.document_id:
        last_user_message = next(
            (m.content for m in reversed(request.messages) if m.role == "user"),
            "",
        )
        chunks = await rag_service.retrieve_context(
            db, str(request.document_id), last_user_message
        )

    # Step 2: Build prompt with RAG context
    system_prompt = rag_service.build_context_prompt(
        chunks,
        prompt_type="chat",
        mark_level=request.mark_level,
        document_title=request.document_title or "",
    )

    # Step 3: Stream response
    async def event_generator():
        async for chunk in ai_service.chat_stream(
            system_prompt=system_prompt,
            messages=[m.model_dump() for m in request.messages],
            temperature=0.6,
            max_tokens={"2M": 400, "4M": 700, "8M": 1200, "16M": 2000}.get(
                request.mark_level, 700
            ),
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )
```

---

## 12. Phase 8 — Real-time Features (WebSockets)

### 12.1 WebSocket Manager

```python
# app/core/websocket.py
import json
from fastapi import WebSocket
from redis.asyncio import Redis

class WebSocketManager:
    """
    Manages WebSocket connections with Redis Pub/Sub for scalability.
    Replaces Supabase Realtime.
    """

    def __init__(self, redis: Redis):
        self.redis = redis
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: dict):
        """Broadcast to all connections in a room."""
        # Publish to Redis for multi-instance support
        await self.redis.publish(f"ws:{room_id}", json.dumps(message))

        # Local broadcast
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_json(message)
```

### 12.2 Battle WebSocket Endpoint

```python
# app/api/battles.py (WebSocket section)
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket import WebSocketManager

router = APIRouter()

@router.websocket("/ws/battles/{room_id}")
async def battle_websocket(websocket: WebSocket, room_id: str):
    """
    Real-time battle room WebSocket.
    Replaces Supabase Realtime subscriptions on battle_rooms table.
    """
    await ws_manager.connect(websocket, room_id)

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "answer":
                # Process answer, update scores
                result = await process_battle_answer(
                    room_id=room_id,
                    user_id=data["userId"],
                    question_index=data["questionIndex"],
                    answer=data["answer"],
                )
                await ws_manager.broadcast(room_id, {
                    "type": "score_update",
                    "scores": result["scores"],
                })

            elif data["type"] == "complete":
                # End battle
                await ws_manager.broadcast(room_id, {
                    "type": "battle_complete",
                    "winner": result["winner"],
                })

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, room_id)
        await ws_manager.broadcast(room_id, {
            "type": "player_disconnected",
        })
```

### 12.3 Frontend WebSocket Migration

```typescript
// BEFORE (Supabase Realtime)
const channel = supabase
  .channel('battle-updates')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'battle_rooms', filter: `id=eq.${roomId}` },
    (payload) => handleBattleUpdate(payload.new)
  )
  .subscribe();

// AFTER (WebSocket)
const ws = new WebSocket(`${WS_URL}/ws/battles/${roomId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'score_update') handleScoreUpdate(data.scores);
  if (data.type === 'battle_complete') handleBattleComplete(data.winner);
  if (data.type === 'player_disconnected') handleDisconnect();
};

ws.send(JSON.stringify({
  type: 'answer',
  userId: user.id,
  questionIndex: currentQuestion,
  answer: selectedAnswer,
}));
```

---

## 13. Phase 9 — Frontend Refactor

### 13.1 API Client Setup

```typescript
// src/lib/api-client.ts

const API_URL = import.meta.env.VITE_API_URL; // http://localhost:8000

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Send Better Auth session cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
  upload: <T>(endpoint: string, formData: FormData) =>
    apiRequest<T>(endpoint, { method: "POST", body: formData, headers: {} }),
};
```

### 13.2 Hook Migration Examples

```typescript
// BEFORE: useFlashcards.ts (Supabase direct)
const { data: flashcards } = useQuery({
  queryKey: ['flashcards', documentId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('document_id', documentId);
    if (error) throw error;
    return data;
  },
});

// AFTER: useFlashcards.ts (Python API)
const { data: flashcards } = useQuery({
  queryKey: ['flashcards', documentId],
  queryFn: () => api.get(`/api/flashcards?documentId=${documentId}`),
});
```

```typescript
// BEFORE: Chat streaming (Supabase Edge Function)
const response = await fetch(
  `${supabaseUrl}/functions/v1/chat`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, documentId, markLevel }),
  }
);
const reader = response.body.getReader();

// AFTER: Chat streaming (Python API)
const response = await fetch(`${API_URL}/api/chat/stream`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, documentId, markLevel }),
});
const reader = response.body.getReader();
// Same SSE parsing logic — response format is identical
```

### 13.3 Environment Variable Changes

```env
# BEFORE (.env)
VITE_SUPABASE_URL=https://bmtjbactxiccwkshgwcp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhb...
VITE_SENTRY_DSN=...
VITE_POSTHOG_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=...
VITE_APP_URL=http://localhost:5173

# AFTER (.env)
VITE_API_URL=http://localhost:8000
VITE_AUTH_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:8000
VITE_SENTRY_DSN=...
VITE_POSTHOG_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=...
VITE_APP_URL=http://localhost:5173
```

### 13.4 Dependencies to Remove

```bash
# Remove Supabase client
npm uninstall @supabase/supabase-js

# Add Better Auth React SDK
npm install better-auth
```

### 13.5 Files to Delete from Frontend

```
src/integrations/supabase/          # Entire folder — Supabase client + types
src/lib/supabase.ts                 # If exists
```

### 13.6 Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/AuthContext.tsx` | Replace Supabase auth with Better Auth hooks |
| `src/hooks/useBattles.ts` | Replace Supabase queries with `api.get()`, add WebSocket |
| `src/hooks/useFlashcards.ts` | Replace Supabase queries with `api.get/post()` |
| `src/hooks/useGamification.ts` | Replace Supabase queries with `api.get/post()` |
| `src/hooks/useStudyPlan.ts` | Replace Supabase queries with `api.get/post()` |
| `src/hooks/useSubscription.ts` | Replace Supabase queries with `api.get()` |
| `src/hooks/useUsage.ts` | Replace Supabase queries with `api.get/post()` |
| `src/hooks/useWeakness.ts` | Replace Supabase queries with `api.get/post()` |
| `src/pages/Upload.tsx` | Replace Supabase storage with `api.upload()` |
| `src/pages/Study.tsx` | Replace edge function URL with Python API |
| `src/pages/ExamMode.tsx` | Replace edge function URL with Python API |
| `src/pages/Flashcards.tsx` | Replace Supabase queries |
| `src/pages/Battles.tsx` | Replace Supabase Realtime with WebSocket |
| `src/pages/Dashboard.tsx` | Replace Supabase queries |
| `src/pages/Auth.tsx` | Replace Supabase auth with Better Auth |
| `src/pages/Settings.tsx` | Replace Supabase auth/queries |
| `src/pages/Pricing.tsx` | Replace edge function URL |
| `src/pages/FeynmanMode.tsx` | Replace edge function URL |
| `src/pages/KnowledgeGraph.tsx` | Replace Supabase queries |
| `src/pages/WeaknessRadar.tsx` | Replace Supabase queries |
| `src/pages/StudyPlanner.tsx` | Replace Supabase queries |
| `src/pages/PYQAnalyzer.tsx` | Replace edge function URL |
| `src/pages/Leaderboard.tsx` | Replace Supabase queries |

---

## 14. Phase 10 — Stripe & Payment Migration

### 14.1 Python Stripe Integration

```python
# app/services/subscription_service.py
import stripe
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class SubscriptionService:
    async def create_checkout_session(
        self, user_id: str, plan_id: str, email: str
    ) -> str:
        """Create a Stripe checkout session. Returns checkout URL."""
        price_id = {
            "pro": settings.STRIPE_PRO_PRICE_ID,
            "university": settings.STRIPE_UNIVERSITY_PRICE_ID,
        }.get(plan_id)

        if not price_id:
            raise ValueError(f"Invalid plan: {plan_id}")

        # Get or create Stripe customer
        customer = await self._get_or_create_customer(user_id, email)

        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            subscription_data={"trial_period_days": 14},
            success_url=f"{settings.VITE_APP_URL}/settings?checkout=success",
            cancel_url=f"{settings.VITE_APP_URL}/pricing?checkout=canceled",
            metadata={"user_id": user_id, "plan_id": plan_id},
        )

        return session.url
```

### 14.2 Stripe Webhook Handler

```python
# app/api/webhooks.py
from fastapi import APIRouter, Request, HTTPException
import stripe
from app.config import settings

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

@router.post("/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event.type == "checkout.session.completed":
        session = event.data.object
        user_id = session.metadata.get("user_id")
        plan_id = session.metadata.get("plan_id")
        # Update subscription in database
        await update_subscription(db, user_id, plan_id, session.subscription)

    elif event.type == "customer.subscription.updated":
        sub = event.data.object
        await handle_subscription_update(db, sub)

    elif event.type == "customer.subscription.deleted":
        sub = event.data.object
        await handle_subscription_cancellation(db, sub)

    return {"status": "ok"}
```

---

## 15. Phase 11 — DevOps & Deployment

### 15.1 Dockerfile (Python Backend)

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download embedding model at build time
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application code
COPY . .

# Run with Gunicorn + Uvicorn workers
CMD ["gunicorn", "app.main:app", \
     "-w", "4", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120"]
```

### 15.2 Better Auth Dockerfile

```dockerfile
# Dockerfile.auth
FROM oven/bun:1.1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "index.ts"]
```

### 15.3 Nginx Reverse Proxy

```nginx
# nginx.conf
upstream api {
    server api:8000;
}

upstream auth {
    server auth:3000;
}

server {
    listen 80;
    server_name api.noteaura.com;

    # Python API
    location /api/ {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Better Auth
    location /auth/ {
        proxy_pass http://auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # MinIO presigned URLs (optional CDN proxy)
    location /storage/ {
        proxy_pass http://minio:9000/;
    }
}
```

### 15.4 Production Deployment Options

| Option | Best For | Cost |
|--------|----------|------|
| **Railway** | Quick deployment, managed PostgreSQL | $5-20/month |
| **Render** | Easy Docker deployment, free tier | $7-25/month |
| **DigitalOcean App Platform** | Managed containers + DB | $12-50/month |
| **AWS ECS/Fargate** | Production scale, fine control | $20-100+/month |
| **Hetzner + Docker** | Best price/performance, self-managed | $5-20/month |
| **Fly.io** | Edge deployment, global | $5-30/month |

### 15.5 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['smartstudy-backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: pytest --cov=app --cov-report=xml
      - run: alembic upgrade head
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & Push Docker Image
        run: |
          docker build -t noteaura-api .
          docker push registry.example.com/noteaura-api:latest
      - name: Deploy
        run: |
          # Deploy to your chosen platform
          # Example: Railway, Render, or self-hosted
```

---

## 16. Database Schema (Full PostgreSQL)

### 16.1 Complete SQL Schema

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- Better Auth manages: user, session, account, verification
-- These tables are auto-created by Better Auth
-- ============================================================

-- ============================================================
-- APPLICATION TABLES
-- ============================================================

-- Profiles (extends Better Auth user)
CREATE TABLE profiles (
    id UUID PRIMARY KEY,  -- Same as Better Auth user.id
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    page_count INTEGER,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
    extracted_text TEXT,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(user_id, status);

-- Document Pages
CREATE TABLE document_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, page_number)
);

-- Document Chunks (Vector Embeddings for RAG)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    embedding vector(384),  -- all-MiniLM-L6-v2 dimensions
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_chunks_embedding ON document_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Document Tags
CREATE TABLE document_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1'
);

CREATE TABLE document_tag_links (
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES document_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id),
    title TEXT DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_conversations_user ON conversations(user_id);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    mark_level TEXT CHECK (mark_level IN ('2M', '4M', '8M', '16M')),
    sources JSONB DEFAULT '[]',  -- NEW: RAG source citations
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Exam Sessions
CREATE TABLE exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id),
    mode TEXT NOT NULL CHECK (mode IN ('practice', 'timed', 'mock')),
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Exams (Calendar entries)
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    subject TEXT,
    exam_date DATE NOT NULL,
    difficulty INTEGER DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
    confidence INTEGER DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
    actual_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards (SM-2 Spaced Repetition)
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_id UUID REFERENCES documents(id),
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    tags TEXT[],
    ease_factor DECIMAL(4,2) DEFAULT 2.50,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    next_review_date DATE DEFAULT CURRENT_DATE,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_flashcards_review ON flashcards(user_id, next_review_date);

CREATE TABLE flashcard_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    quality INTEGER CHECK (quality BETWEEN 0 AND 5),
    time_taken_ms INTEGER,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'university')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    feature TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feature, period_start)
);

-- Weakness Profiles
CREATE TABLE weakness_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_id UUID REFERENCES documents(id),
    topic TEXT NOT NULL,
    subtopic TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    times_tested INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Micro Lessons
CREATE TABLE micro_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weakness_id UUID NOT NULL REFERENCES weakness_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    lesson_type TEXT CHECK (lesson_type IN ('explanation', 'example', 'practice', 'mnemonic')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concepts (Knowledge Graph)
CREATE TABLE concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id),
    name TEXT NOT NULL,
    definition TEXT,
    category TEXT,
    importance_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE concept_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_a UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    concept_b UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    relationship_type TEXT CHECK (relationship_type IN ('depends_on', 'is_part_of', 'related_to', 'contradicts', 'example_of')),
    strength DECIMAL(3,2) DEFAULT 0.50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Score Predictions
CREATE TABLE score_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_id UUID REFERENCES documents(id),
    predicted_min DECIMAL(5,2),
    predicted_max DECIMAL(5,2),
    confidence DECIMAL(3,2),
    factors JSONB DEFAULT '{}',
    actual_score DECIMAL(5,2),
    predicted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Plans
CREATE TABLE study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME,
    duration_minutes INTEGER DEFAULT 30,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle Rooms
CREATE TABLE battle_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL,
    opponent_id UUID,
    document_id UUID REFERENCES documents(id),
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'abandoned')),
    mode TEXT DEFAULT 'speed' CHECK (mode IN ('speed', 'endurance', 'sudden_death')),
    questions JSONB DEFAULT '[]',
    host_score INTEGER DEFAULT 0,
    opponent_score INTEGER DEFAULT 0,
    winner_id UUID,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ELO Ratings
CREATE TABLE elo_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    rating INTEGER DEFAULT 1200,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification
CREATE TABLE user_gamification (
    user_id UUID PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    total_study_minutes INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'))
);

CREATE TABLE user_achievements (
    user_id UUID NOT NULL,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- Seed achievements
INSERT INTO achievements (code, name, description, icon, xp_reward, rarity) VALUES
    ('on_fire', 'On Fire!', '7-day study streak', '🔥', 200, 'uncommon'),
    ('bookworm', 'Bookworm', 'Upload 10 documents', '📚', 150, 'common'),
    ('einstein', 'Einstein', '100% on a mock exam', '🧠', 500, 'epic'),
    ('gladiator', 'Gladiator', 'Win 10 exam battles', '⚔️', 300, 'rare'),
    ('sharp_shooter', 'Sharp Shooter', '50 correct answers in a row', '🎯', 400, 'rare'),
    ('feynman', 'The Feynman', 'Complete 20 Feynman sessions', '👨‍🏫', 350, 'epic'),
    ('first_steps', 'First Steps', 'Upload your first document', '👶', 50, 'common'),
    ('night_owl', 'Night Owl', 'Study after midnight', '🦉', 100, 'uncommon'),
    ('marathon', 'Marathon Runner', 'Study for 4 hours straight', '🏃', 250, 'rare'),
    ('social_butterfly', 'Social Butterfly', 'Win your first exam battle', '🦋', 100, 'common');
```

---

## 17. Complete API Reference

### 17.1 FastAPI Main Application

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.core.database import engine
from app.core.minio_client import init_buckets

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_buckets()
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
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

### 17.2 Full API Endpoint Summary

```
# Authentication (Better Auth — Port 3000)
POST   /api/auth/sign-up/email          - Email signup
POST   /api/auth/sign-in/email          - Email login
POST   /api/auth/sign-in/social         - Google OAuth
POST   /api/auth/sign-out               - Logout
POST   /api/auth/forget-password        - Request password reset
POST   /api/auth/reset-password         - Reset password
GET    /api/auth/get-session            - Get current session

# Documents (Port 8000)
GET    /api/documents                   - List user's documents
POST   /api/documents/upload            - Upload PDF (multipart/form-data)
GET    /api/documents/{id}              - Get document details
DELETE /api/documents/{id}              - Delete document
GET    /api/documents/{id}/pages        - Get document pages
GET    /api/documents/{id}/download-url - Get presigned MinIO URL

# Chat
POST   /api/chat/stream                 - Stream AI chat (SSE)
GET    /api/conversations               - List conversations
POST   /api/conversations               - Create conversation
GET    /api/conversations/{id}/messages  - Get messages

# Exams
POST   /api/exams/generate-questions    - Generate exam questions (RAG)
POST   /api/exams/evaluate-answer       - Evaluate student answer
GET    /api/exams/sessions              - List exam sessions
POST   /api/exams/sessions              - Create exam session
PATCH  /api/exams/sessions/{id}         - Update exam session

# Flashcards
GET    /api/flashcards                  - List flashcards (with due filter)
POST   /api/flashcards/generate         - Generate flashcards (RAG)
POST   /api/flashcards/{id}/review      - Submit review (SM-2 update)

# Battles
GET    /api/battles                     - List battle rooms
POST   /api/battles/create              - Create battle room
POST   /api/battles/{id}/join           - Join battle room
GET    /api/battles/leaderboard         - Get ELO leaderboard
WS     /ws/battles/{room_id}            - Real-time battle WebSocket

# Weakness Analysis
GET    /api/weakness                    - Get weakness profiles
POST   /api/weakness/analyze            - Run weakness analysis (RAG)
PATCH  /api/weakness/lessons/{id}       - Mark micro-lesson complete

# Study Plans
GET    /api/plans                       - List study plans
POST   /api/plans/generate              - Generate AI study plan
PATCH  /api/plans/items/{id}            - Toggle item completion
GET    /api/plans/exams                 - List exams
POST   /api/plans/exams                 - Add exam

# Concepts (Knowledge Graph)
GET    /api/concepts                    - Get concepts for document
POST   /api/concepts/extract            - Extract concepts (RAG)

# PYQ Analysis
POST   /api/pyq/analyze                 - Analyze previous year questions (RAG)

# Score Prediction
POST   /api/scores/predict              - Predict exam score

# Feynman Mode
POST   /api/feynman/start               - Start Feynman session (SSE)
POST   /api/feynman/evaluate             - Evaluate explanation (SSE)

# Summaries
POST   /api/summaries/generate           - Generate document summary (RAG)

# Usage & Subscriptions
GET    /api/usage                        - Get usage stats
POST   /api/usage/check                  - Check feature usage limit
GET    /api/subscriptions                - Get subscription details
POST   /api/subscriptions/checkout       - Create Stripe checkout

# Gamification
GET    /api/gamification/profile         - Get XP, level, streak
POST   /api/gamification/xp              - Add XP
GET    /api/gamification/achievements    - Get achievements

# Folders & Tags
GET    /api/folders                      - List folders
POST   /api/folders                      - Create folder
GET    /api/tags                         - List tags
POST   /api/documents/{id}/tags          - Add tags to document

# Webhooks
POST   /api/webhooks/stripe              - Stripe webhook handler

# System
GET    /health                           - Health check
```

---

## 18. RAG Pipeline Deep Dive

### 18.1 Ingestion Pipeline (Upload Flow)

```
┌──────────┐     ┌──────────────┐     ┌──────────────────┐
│ User     │     │ FastAPI      │     │ Celery Worker    │
│ uploads  │────▶│ /api/docs/   │────▶│ (Background)     │
│ PDF      │     │ upload       │     │                  │
└──────────┘     └──────┬───────┘     │ 1. Download from │
                        │             │    MinIO          │
                        │             │ 2. Extract text   │
                        ▼             │    (PyMuPDF)      │
                 ┌──────────────┐     │ 3. Chunk text     │
                 │ MinIO        │     │    (512 tokens)   │
                 │ (store PDF)  │     │ 4. Generate       │
                 └──────────────┘     │    embeddings     │
                                      │    (MiniLM-L6)    │
                                      │ 5. Store vectors  │
                                      │    (pgvector)     │
                                      │ 6. Update status  │
                                      │    → 'ready'      │
                                      └──────────────────┘
```

### 18.2 Retrieval Pipeline (Query Flow)

```
┌──────────┐     ┌──────────────────────────────────────────┐
│ User     │     │              RAG Pipeline                 │
│ asks a   │     │                                          │
│ question │     │ 1. Embed query      → [0.12, -0.34, ...] │
│          │────▶│ 2. pgvector search  → Top 8 chunks       │
│          │     │ 3. Rerank           → Top 4 chunks       │
│          │     │ 4. Build prompt     → System + Context    │
│          │     │ 5. Groq API call    → Stream response     │
│          │     │ 6. Return with      → Page citations      │
│          │◀────│    source refs                            │
└──────────┘     └──────────────────────────────────────────┘
```

### 18.3 Embedding Model Comparison

| Model | Dimensions | Speed | Quality | Size |
|-------|-----------|-------|---------|------|
| **all-MiniLM-L6-v2** (recommended) | 384 | Fast | Good | 80MB |
| all-mpnet-base-v2 | 768 | Medium | Very Good | 420MB |
| e5-large-v2 | 1024 | Slow | Excellent | 1.3GB |
| Groq text-embedding (if available) | varies | Fast (API) | Good | 0 (API) |

**Recommendation**: Start with `all-MiniLM-L6-v2` for speed and low resource usage. Upgrade to `all-mpnet-base-v2` if quality needs improvement.

### 18.4 Chunking Strategy

```
Document (50 pages)
    │
    ├── Page 1
    │     ├── Chunk 0 (512 tokens + 50 overlap)
    │     ├── Chunk 1 (512 tokens + 50 overlap)
    │     └── Chunk 2 (remaining tokens)
    │
    ├── Page 2
    │     ├── Chunk 3 ...
    │     └── Chunk 4 ...
    │
    └── Page 50
          └── Chunk N ...

TOTAL: ~200-500 chunks for a 50-page document
EMBEDDINGS: 384 dimensions × ~300 chunks = ~460KB vectors per document
```

### 18.5 Vector Search Performance

```sql
-- pgvector cosine similarity search
-- With IVFFlat index: ~5ms for 100K vectors
-- Without index: ~50ms for 100K vectors

SELECT content, page_number,
       1 - (embedding <=> $1::vector) AS similarity
FROM document_chunks
WHERE document_id = $2
ORDER BY embedding <=> $1::vector
LIMIT 8;
```

---

## 19. Security Architecture

### 19.1 Authentication Flow

```
┌──────────┐                  ┌──────────────┐              ┌──────────────┐
│ React    │  1. Login        │ Better Auth  │              │ PostgreSQL   │
│ Frontend │ ─────────────────▶ (Port 3000)  │──── Verify ──▶             │
│          │                  │              │  credentials │              │
│          │◀─────────────────│              │◀─────────────│              │
│          │  2. Session      │              │              │              │
│          │     Cookie       │              │              │              │
│          │                  └──────────────┘              └──────────────┘
│          │                                                       │
│          │  3. API call     ┌──────────────┐                     │
│          │  + session       │ FastAPI      │   4. Validate        │
│          │  cookie          │ (Port 8000)  │──── session ─────────┘
│          │ ─────────────────▶              │   with Better Auth
│          │                  │              │
│          │◀─────────────────│              │
│          │  5. Response     │              │
└──────────┘                  └──────────────┘
```

### 19.2 Security Checklist

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Auth** | Session-based auth | Better Auth session cookies (HttpOnly, Secure, SameSite) |
| **API** | Request validation | Pydantic models validate all inputs |
| **API** | Rate limiting | Redis-based rate limiter per user |
| **API** | CORS | Explicit origin whitelist |
| **Database** | SQL injection prevention | SQLAlchemy parameterized queries |
| **Storage** | Access control | Presigned URLs with expiry |
| **Storage** | File validation | MIME type + magic bytes check |
| **Payments** | Webhook verification | Stripe signature validation |
| **Infra** | HTTPS | TLS termination at Nginx |
| **Infra** | Secrets | Environment variables, never in code |
| **Monitoring** | Error tracking | Sentry (full-stack) |
| **Monitoring** | Audit logging | Structured logs for all mutations |

### 19.3 Rate Limiting

```python
# app/core/rate_limiter.py
from redis.asyncio import Redis
from fastapi import HTTPException

class RateLimiter:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def check(self, user_id: str, action: str, limit: int, window: int = 60):
        """
        Check rate limit. Raises 429 if exceeded.

        Args:
            user_id: User identifier
            action: Action name (e.g., "chat", "upload")
            limit: Max requests per window
            window: Time window in seconds
        """
        key = f"rate:{action}:{user_id}"
        current = await self.redis.incr(key)

        if current == 1:
            await self.redis.expire(key, window)

        if current > limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {limit} requests per {window}s.",
            )
```

---

## 20. Testing Strategy

### 20.1 Backend Testing

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.main import app
from app.core.database import get_db, Base

TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost:5432/noteaura_test"

@pytest.fixture
async def db_session():
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    session_factory = async_sessionmaker(engine)
    async with session_factory() as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
async def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
```

```python
# tests/test_api/test_documents.py
import pytest

@pytest.mark.asyncio
async def test_upload_document(client, auth_headers):
    with open("tests/fixtures/sample.pdf", "rb") as f:
        response = await client.post(
            "/api/documents/upload",
            files={"file": ("test.pdf", f, "application/pdf")},
            headers=auth_headers,
        )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "test.pdf"
    assert data["status"] == "processing"

@pytest.mark.asyncio
async def test_list_documents(client, auth_headers):
    response = await client.get("/api/documents", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### 20.2 RAG Pipeline Testing

```python
# tests/test_rag/test_chunker.py
from app.rag.chunker import DocumentChunker

def test_chunk_document():
    chunker = DocumentChunker(chunk_size=100, chunk_overlap=10)
    pages = [
        {"page_number": 1, "content": "A " * 200},  # 200 words
        {"page_number": 2, "content": "B " * 50},    # 50 words
    ]
    chunks = chunker.chunk_document(pages)

    assert len(chunks) >= 3  # Page 1 should split, page 2 fits in one
    assert chunks[0].page_number == 1
    assert chunks[-1].page_number == 2

def test_chunk_overlap():
    chunker = DocumentChunker(chunk_size=50, chunk_overlap=10)
    pages = [{"page_number": 1, "content": " ".join(f"word{i}" for i in range(100))}]
    chunks = chunker.chunk_document(pages)

    # Check overlap: end of chunk N should appear in start of chunk N+1
    if len(chunks) > 1:
        last_words_chunk_0 = chunks[0].content.split()[-10:]
        first_words_chunk_1 = chunks[1].content.split()[:10]
        assert last_words_chunk_0 == first_words_chunk_1
```

### 20.3 Test Coverage Targets

| Module | Target |
|--------|--------|
| API routes | 80% |
| Services | 85% |
| RAG pipeline | 90% |
| Models | 70% |
| Workers | 60% |

---

## 21. Migration Checklist

### Pre-Migration

- [ ] Document all current Supabase Edge Function behaviors
- [ ] Export full database dump from Supabase
- [ ] Export all files from Supabase Storage
- [ ] Inventory all environment variables
- [ ] Set up new development environment with Docker Compose
- [ ] Create comprehensive test suite for current API behaviors

### Phase 1: Infrastructure (Week 1)

- [ ] Set up Docker Compose (PostgreSQL + pgvector + Redis + MinIO)
- [ ] Initialize FastAPI project with proper structure
- [ ] Set up Alembic for database migrations
- [ ] Create all SQLAlchemy models matching current schema
- [ ] Add `document_chunks` table for RAG vectors
- [ ] Run initial migration: `alembic upgrade head`
- [ ] Set up Better Auth Node.js sidecar
- [ ] Configure MinIO buckets (documents, avatars)
- [ ] Verify all services start correctly

### Phase 2: Auth Migration (Week 2)

- [ ] Configure Better Auth with PostgreSQL
- [ ] Set up Google OAuth provider
- [ ] Implement session validation middleware in FastAPI
- [ ] Create auth proxy routes in FastAPI
- [ ] Update frontend AuthContext to use Better Auth
- [ ] Update login/signup/logout pages
- [ ] Test password reset flow
- [ ] Migrate existing users (import from Supabase export)

### Phase 3: Storage Migration (Week 2)

- [ ] Implement MinIO storage service
- [ ] Create document upload API endpoint
- [ ] Create presigned URL generation endpoint
- [ ] Migrate existing PDFs from Supabase Storage to MinIO
- [ ] Update frontend Upload page
- [ ] Test upload → download → delete flow

### Phase 4: RAG Pipeline (Week 3)

- [ ] Implement document chunker
- [ ] Implement embedding generator (sentence-transformers)
- [ ] Implement vector retriever (pgvector)
- [ ] Implement reranker
- [ ] Implement prompt builder
- [ ] Set up Celery workers for background processing
- [ ] Create PDF extraction worker (PyMuPDF)
- [ ] Create embedding generation worker
- [ ] Test full pipeline: upload → extract → chunk → embed → query → retrieve

### Phase 5: API Migration (Weeks 3-4)

- [ ] Migrate `/chat` endpoint (streaming SSE)
- [ ] Migrate `/generate-questions` endpoint
- [ ] Migrate `/evaluate-answer` endpoint
- [ ] Migrate `/generate-summary` endpoint
- [ ] Migrate `/generate-flashcards` endpoint
- [ ] Migrate `/analyze-weakness` endpoint
- [ ] Migrate `/extract-concepts` endpoint
- [ ] Migrate `/generate-study-plan` endpoint
- [ ] Migrate `/analyze-pyq` endpoint
- [ ] Migrate `/predict-score` endpoint
- [ ] Migrate `/feynman-session` endpoint
- [ ] Migrate `/matchmaking` endpoint
- [ ] Migrate `/check-usage` endpoint
- [ ] Migrate `/create-checkout-session` endpoint
- [ ] Migrate `/stripe-webhook` endpoint
- [ ] Implement all CRUD endpoints for database tables

### Phase 6: Real-time Migration (Week 4)

- [ ] Implement WebSocket manager with Redis Pub/Sub
- [ ] Create battle room WebSocket endpoint
- [ ] Update frontend to use WebSocket instead of Supabase Realtime
- [ ] Test real-time battle flow

### Phase 7: Frontend Refactor (Week 4-5)

- [ ] Create API client utility (`src/lib/api-client.ts`)
- [ ] Remove `@supabase/supabase-js` dependency
- [ ] Delete `src/integrations/supabase/` directory
- [ ] Update all hooks to use new API client
- [ ] Update all pages to use new API endpoints
- [ ] Update environment variables
- [ ] Test every page and flow end-to-end

### Phase 8: Testing & QA (Week 5)

- [ ] Run full test suite (backend + frontend)
- [ ] Performance testing (RAG latency, API response times)
- [ ] Security audit (auth, CORS, rate limiting, input validation)
- [ ] Load testing (concurrent users, document uploads)
- [ ] Test all Stripe payment flows
- [ ] Test Google OAuth flow
- [ ] Test PDF upload → processing → ready flow
- [ ] Test all AI features (chat, questions, evaluation, etc.)

### Phase 9: Deployment (Week 5-6)

- [ ] Set up production Docker Compose / Kubernetes
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL/TLS certificates
- [ ] Configure production environment variables
- [ ] Deploy PostgreSQL with pgvector (managed or self-hosted)
- [ ] Deploy Redis (managed or self-hosted)
- [ ] Deploy MinIO (managed or self-hosted)
- [ ] Deploy backend services
- [ ] Deploy frontend (Vercel/Cloudflare Pages)
- [ ] Set up monitoring (Sentry, Prometheus, Grafana)
- [ ] Run smoke tests on production

### Post-Migration

- [ ] Monitor error rates for 1 week
- [ ] Compare AI response quality (RAG vs naive)
- [ ] Monitor performance metrics
- [ ] Clean up Supabase project (archive, don't delete immediately)
- [ ] Update documentation
- [ ] Remove all Supabase-related code from codebase

---

## 22. Risk Assessment & Rollback Plan

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Low | Critical | Full backup before migration, staged rollout |
| Auth disruption (users locked out) | Medium | High | Run both auth systems in parallel during transition |
| AI quality degradation | Low | Medium | A/B test RAG vs naive, tune chunk size and top-k |
| Increased latency | Medium | Medium | Profile bottlenecks, add caching, tune pgvector indexes |
| MinIO storage issues | Low | High | S3 compatibility means easy fallback to AWS S3 |
| Embedding model too slow | Medium | Low | Use GPU or switch to faster model |
| WebSocket instability | Medium | Medium | Fallback to polling, stress test connections |

### Rollback Plan

```
Phase 1 Rollback: If infrastructure fails
  → Keep Supabase running, continue using current stack
  → No user impact

Phase 2 Rollback: If auth migration fails
  → Revert frontend to Supabase Auth
  → Users re-login with existing credentials

Phase 3 Rollback: If storage migration fails
  → Serve existing files from Supabase Storage
  → New uploads go to both MinIO and Supabase

Phase 4 Rollback: If RAG pipeline fails
  → Fallback to naive text truncation (current behavior)
  → No user-visible change

Full Rollback: If everything fails
  → Revert to Supabase stack entirely
  → All data remains in Supabase PostgreSQL
  → Estimated recovery time: < 1 hour
```

### Parallel Running Period

For the first 2 weeks after migration:
1. Keep Supabase project active (read-only)
2. Point DNS to new backend
3. Monitor for issues
4. If critical failure → DNS switch back to Supabase
5. After 2 weeks stable → decommission Supabase

---

## Summary

This migration transforms NoteAura from a Supabase-dependent prototype into a production-grade, self-hosted platform:

| What Changes | From | To |
|-------------|------|-----|
| Backend | Supabase Edge Functions (Deno) | **FastAPI (Python 3.12)** |
| Auth | Supabase Auth | **Better Auth (Node.js)** |
| Storage | Supabase Storage | **MinIO (S3-compatible)** |
| Database | Supabase PostgreSQL | **PostgreSQL 16 + pgvector** |
| AI Context | Naive text truncation | **RAG Pipeline (embed → retrieve → rerank)** |
| AI Models | Groq (direct HTTP) | **Groq Python SDK + LangChain** |
| Task Queue | None (synchronous) | **Celery + Redis** |
| Real-time | Supabase Realtime | **FastAPI WebSockets + Redis Pub/Sub** |
| Caching | None | **Redis** |

**Total new Python API endpoints**: 40+
**Total database tables**: 25 (including Better Auth tables)
**Estimated migration time**: 5-6 weeks for a solo developer
