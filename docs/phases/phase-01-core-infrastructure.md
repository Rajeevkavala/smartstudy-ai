# Phase 1 — Core Infrastructure Setup

## Overview

This phase sets up the entire development environment from scratch: Docker Compose stack, FastAPI project scaffolding, PostgreSQL with pgvector, Redis, and the complete project file structure.

**Duration**: Week 1  
**Dependencies**: None (starting phase)  
**Deliverables**: Running Docker stack, FastAPI hello-world, database connection verified

---

## Step-by-Step Guide

### Step 1.1 — Create the Backend Project Directory

Create the `smartstudy-backend/` directory alongside the existing frontend:

```
smartstudy-ai/                  ← existing frontend
smartstudy-backend/             ← new backend (create this)
```

**Copilot Prompt:**
```
Create the full directory structure for a FastAPI backend project called smartstudy-backend 
with the following folders: app/, app/api/, app/models/, app/schemas/, app/services/, 
app/workers/, app/core/, app/rag/, alembic/, better-auth/, tests/, tests/test_api/, 
tests/test_services/, tests/test_rag/, tests/test_workers/. 
Add __init__.py in every Python package.
```

### Step 1.2 — Create requirements.txt

```txt
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
factory-boy==3.3.1
```

**Copilot Prompt:**
```
Create a requirements.txt with all dependencies for a FastAPI backend with SQLAlchemy async, 
pgvector, Groq SDK, LangChain, sentence-transformers, MinIO, Celery+Redis, PyMuPDF, Stripe, 
Pydantic Settings, Sentry, httpx, pytest-asyncio. Pin all versions.
```

### Step 1.3 — Create Environment Configuration

Create `app/config.py` using Pydantic Settings:

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

**Copilot Prompt:**
```
Create app/config.py using pydantic-settings BaseSettings. Include settings for: 
DATABASE_URL, REDIS_URL, MINIO (endpoint, access_key, secret_key, secure, buckets), 
GROQ (api_key, model, fallback_model), RAG (embedding_model, chunk_size, chunk_overlap, 
top_k_retrieval, rerank_top_k), BETTER_AUTH (url, secret), STRIPE (secret_key, 
webhook_secret, price IDs), SENTRY_DSN, CORS_ORIGINS, APP_NAME, APP_VERSION, DEBUG. 
Load from .env file.
```

### Step 1.4 — Create .env.example

```env
# App
DEBUG=true
CORS_ORIGINS=["http://localhost:5173"]

# Database
DATABASE_URL=postgresql+asyncpg://noteaura:password@localhost:5432/noteaura

# Redis
REDIS_URL=redis://localhost:6379/0

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_SECURE=false

# Groq AI
GROQ_API_KEY=gsk_your_key_here

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_UNIVERSITY_PRICE_ID=price_yyy

# Sentry
SENTRY_DSN=
```

### Step 1.5 — Create Database Connection Module

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

**Copilot Prompt:**
```
Create app/core/database.py with async SQLAlchemy 2.0 setup. Include create_async_engine 
with pool settings from config, async_sessionmaker, a DeclarativeBase class, and a get_db 
async generator dependency that yields sessions and handles commit/rollback.
```

### Step 1.6 — Create Redis Connection Module

```python
# app/core/redis.py
from redis.asyncio import Redis, from_url
from app.config import settings

redis_client: Redis | None = None

async def get_redis() -> Redis:
    global redis_client
    if redis_client is None:
        redis_client = from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
```

### Step 1.7 — Create FastAPI Main Application

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.core.database import engine
from app.core.redis import close_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    yield
    # Shutdown tasks
    await engine.dispose()
    await close_redis()

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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
```

**Copilot Prompt:**
```
Create app/main.py with FastAPI application. Use asynccontextmanager for lifespan events 
(startup: init MinIO buckets, shutdown: dispose engine + close redis). Add CORS middleware 
with settings, a /health endpoint returning status and version. Don't mount routers yet.
```

### Step 1.8 — Create Docker Compose Stack

```yaml
# docker-compose.yml
version: "3.9"

services:
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
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - STRIPE_PRO_PRICE_ID=${STRIPE_PRO_PRICE_ID}
      - STRIPE_UNIVERSITY_PRICE_ID=${STRIPE_UNIVERSITY_PRICE_ID}
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./app:/app/app

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

  beat:
    build: .
    command: celery -A app.workers.celery_app beat -l info
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis

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

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
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

**Copilot Prompt:**
```
Create docker-compose.yml with services: api (FastAPI, port 8000), worker (Celery), 
beat (Celery beat), postgres (pgvector/pgvector:pg16, port 5432), redis (redis:7-alpine, 
port 6379), minio (minio/minio:latest, ports 9000+9001). Use volumes for data persistence. 
Pass env vars from host for secrets.
```

### Step 1.9 — Create Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download embedding model
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### Step 1.10 — Initialize Alembic

```bash
cd smartstudy-backend
pip install -r requirements.txt
alembic init alembic
```

Update `alembic/env.py` to use async engine:

```python
# alembic/env.py
import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.core.database import Base
from app.config import settings

# Import all models so Alembic can detect them
from app.models import *  # noqa

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    url = settings.DATABASE_URL
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = create_async_engine(settings.DATABASE_URL)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
```

**Copilot Prompt:**
```
Update alembic/env.py for async SQLAlchemy. Import Base metadata from app.core.database, 
import all models from app.models, use create_async_engine with DATABASE_URL from settings. 
Support both offline and online (async) migration modes.
```

### Step 1.11 — Create pyproject.toml

```toml
[project]
name = "noteaura-backend"
version = "2.0.0"
description = "NoteAura AI Study Platform - Python Backend"
requires-python = ">=3.12"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "W", "F", "I"]
```

---

## Verification Checklist

After completing this phase, verify:

- [ ] `docker compose up` starts all 6 services without errors
- [ ] `curl http://localhost:8000/health` returns `{"status": "healthy", "version": "2.0.0"}`
- [ ] PostgreSQL is accessible on port 5432 with pgvector extension
- [ ] Redis is accessible on port 6379
- [ ] MinIO console is accessible at `http://localhost:9001`
- [ ] Alembic can run migrations: `alembic upgrade head`
- [ ] FastAPI Swagger docs accessible at `http://localhost:8000/docs`

---

## Copilot Tips for This Phase

1. **Scaffolding**: Ask Copilot to "Create all __init__.py files for the project structure" after creating directories
2. **Docker issues**: If Docker builds fail, ask Copilot to debug the Dockerfile
3. **Database connection**: If the connection fails, check the `DATABASE_URL` format — it must use `postgresql+asyncpg://` (not `postgresql://`)
4. **Hot reload**: The `volumes: ./app:/app/app` mount in Docker Compose enables hot reload during development

---

## Next Phase

Once all services are running and verified, proceed to [Phase 2 — Authentication with Better Auth](phase-02-authentication.md).
