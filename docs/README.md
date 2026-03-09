# NoteAura Migration Documentation

## Overview

This `docs/` folder contains the complete, detailed phase-by-phase migration guide for moving NoteAura from Supabase BaaS to a self-hosted Python backend stack.

## Quick Links

| Document | Description |
|----------|-------------|
| [Phase 1 — Core Infrastructure](phases/phase-01-core-infrastructure.md) | Docker Compose, FastAPI project scaffolding, PostgreSQL + pgvector, Redis, file structure |
| [Phase 2 — Authentication](phases/phase-02-authentication.md) | Better Auth setup, session management, auth middleware, frontend auth refactor |
| [Phase 3 — MinIO Storage](phases/phase-03-minio-storage.md) | MinIO setup, storage service, presigned URLs, file upload/download migration |
| [Phase 4 — Database Migration](phases/phase-04-database-migration.md) | SQLAlchemy models, Alembic migrations, data export/import, schema mapping |
| [Phase 5 — RAG Pipeline](phases/phase-05-rag-pipeline.md) | Document chunking, embedding generation, vector search, reranking, prompt building |
| [Phase 6 — Groq LLM Integration](phases/phase-06-groq-integration.md) | AI service, streaming, JSON mode, model config per feature |
| [Phase 7 — API Endpoint Migration](phases/phase-07-api-endpoints.md) | Full endpoint mapping, route implementation, request/response schemas |
| [Phase 8 — Real-time WebSockets](phases/phase-08-websockets.md) | WebSocket manager, Redis Pub/Sub, battle rooms, frontend WS migration |
| [Phase 9 — Frontend Refactor](phases/phase-09-frontend-refactor.md) | API client, hook migration, page updates, env vars, dependency cleanup |
| [Phase 10 — Stripe Payments](phases/phase-10-stripe-payments.md) | Python Stripe SDK, checkout sessions, webhook handling, subscription management |
| [Phase 11 — DevOps & Deployment](phases/phase-11-devops-deployment.md) | Dockerfiles, Nginx, CI/CD, production deployment, monitoring |
| [Copilot Development Guide](COPILOT_DEVELOPMENT_GUIDE.md) | End-to-end guide for developing this migration using GitHub Copilot |

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    React SPA (Vite + TypeScript)                  │
│              Shadcn/UI + Tailwind + Framer Motion                │
└──────────────┬────────────────────────────┬──────────────────────┘
               │  REST API                  │  WebSocket
               ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────────────┐
│   Python Backend (FastAPI)│  │  WebSocket Server (FastAPI WS)   │
│   + Better Auth sidecar   │  │  + Redis Pub/Sub                 │
│   + Celery Workers        │  │                                  │
└──────────┬───────────────┘  └──────────────────────────────────┘
           │
     ┌─────┼──────────────────┬────────────────┐
     ▼     ▼                  ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  ┌────────┐
│ PostgreSQL  │  │ MinIO        │  │ Redis            │  │ Groq   │
│ + pgvector  │  │ (S3-compat)  │  │ (Cache + Broker) │  │ API    │
└─────────────┘  └──────────────┘  └─────────────────┘  └────────┘
```

## Migration Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Week 1 | Infrastructure + project scaffolding |
| Phase 2 | Week 2 | Authentication with Better Auth |
| Phase 3 | Week 2 | MinIO object storage |
| Phase 4 | Week 2-3 | Database migration + models |
| Phase 5 | Week 3 | RAG pipeline (core differentiator) |
| Phase 6 | Week 3 | Groq LLM integration |
| Phase 7 | Weeks 3-4 | All API endpoints |
| Phase 8 | Week 4 | Real-time WebSockets |
| Phase 9 | Weeks 4-5 | Frontend refactor |
| Phase 10 | Week 5 | Stripe payments |
| Phase 11 | Weeks 5-6 | Deployment + monitoring |

## Getting Started

1. Read the [Copilot Development Guide](COPILOT_DEVELOPMENT_GUIDE.md) first
2. Start with [Phase 1](phases/phase-01-core-infrastructure.md) and work sequentially
3. Each phase document includes exact Copilot prompts to use
4. Test each phase before moving to the next
