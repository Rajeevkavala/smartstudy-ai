# Phase 11 — DevOps & Deployment

## Overview

Set up production-ready Docker images, Nginx reverse proxy, CI/CD pipeline, monitoring, and deployment infrastructure. This phase transforms the development setup into a deployable production system.

**Duration**: Weeks 5-6  
**Dependencies**: All previous phases  
**Deliverables**: Dockerfiles, Nginx config, GitHub Actions CI/CD, monitoring setup

---

## Architecture (Production)

```
┌───────────────────────────────────────────────────────────────────┐
│                        Nginx Reverse Proxy                        │
│                        (TLS Termination)                          │
├──────────┬──────────┬──────────────┬──────────┬──────────────────┤
│ /api/*   │ /ws/*    │ /auth/*      │ /storage │ /* (frontend)    │
│          │          │              │          │                   │
│    ▼     │    ▼     │      ▼       │    ▼     │       ▼          │
│ FastAPI  │ FastAPI  │ Better Auth  │  MinIO   │ Vercel/CloudFront│
│ :8000    │ :8000    │ :3000        │  :9000   │                  │
└──────────┴──────────┴──────────────┴──────────┴──────────────────┘
                │                                       │
        ┌───────┴────────┐                      ┌───────┴────────┐
        │  PostgreSQL    │                      │    Redis       │
        │  + pgvector    │                      │    :6379       │
        │  :5432         │                      │                │
        └────────────────┘                      └────────────────┘
                                                        │
                                                ┌───────┴────────┐
                                                │ Celery Worker  │
                                                │ (PDF + RAG)    │
                                                └────────────────┘
```

---

## Step-by-Step Guide

### Step 11.1 — Python Backend Dockerfile

```dockerfile
# smartstudy-backend/Dockerfile
FROM python:3.12-slim AS base

WORKDIR /app

# Install system dependencies for PyMuPDF and PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download embedding model at build time (avoids download on first request)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home appuser
USER appuser

# Run with Gunicorn + Uvicorn workers
CMD ["gunicorn", "app.main:app", \
     "-w", "4", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--access-logfile", "-"]
```

### Step 11.2 — Better Auth Dockerfile

```dockerfile
# smartstudy-backend/better-auth/Dockerfile.auth
FROM oven/bun:1.1-slim

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY . .

# Create non-root user
RUN adduser --disabled-password --no-create-home appuser
USER appuser

EXPOSE 3000

CMD ["bun", "run", "index.ts"]
```

### Step 11.3 — Celery Worker Dockerfile

```dockerfile
# smartstudy-backend/Dockerfile.worker
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download embedding model
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

RUN useradd --create-home appuser
USER appuser

CMD ["celery", "-A", "app.workers.celery_app", "worker", \
     "--loglevel=info", "--concurrency=2"]
```

### Step 11.4 — Production Docker Compose

```yaml
# docker-compose.prod.yml
version: "3.9"

services:
  # Python FastAPI Backend
  api:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend

  # Celery Worker
  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    restart: always
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend

  # Better Auth (Node.js)
  auth:
    build:
      context: ./better-auth
      dockerfile: Dockerfile.auth
    restart: always
    env_file: .env.production
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - backend

  # PostgreSQL + pgvector
  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  # Redis
  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  # MinIO
  minio:
    image: minio/minio:latest
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - miniodata:/data
    networks:
      - backend

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
      - auth
      - minio
    networks:
      - backend

volumes:
  pgdata:
  redisdata:
  miniodata:

networks:
  backend:
    driver: bridge
```

### Step 11.5 — Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/s;

    # Upstream servers
    upstream api {
        server api:8000;
    }

    upstream auth {
        server auth:3000;
    }

    upstream minio {
        server minio:9000;
    }

    # HTTP → HTTPS redirect
    server {
        listen 80;
        server_name api.noteaura.com;
        return 301 https://$server_name$request_uri;
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name api.noteaura.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Python API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 120s;
            proxy_send_timeout 120s;

            # SSE support
            proxy_buffering off;
            proxy_cache off;
        }

        # WebSocket
        location /ws/ {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_read_timeout 3600s;  # Keep alive for long battles
        }

        # Better Auth
        location /auth/ {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://auth/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # MinIO Storage (presigned URL proxy)
        location /storage/ {
            proxy_pass http://minio/;
            proxy_set_header Host $host;
            client_max_body_size 50M;
        }

        # Health check
        location /health {
            proxy_pass http://api;
        }
    }
}
```

### Step 11.6 — CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['smartstudy-backend/**']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: test_noteaura
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install dependencies
        run: |
          cd smartstudy-backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov httpx

      - name: Run linting
        run: |
          cd smartstudy-backend
          pip install ruff
          ruff check .

      - name: Run tests
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/test_noteaura
          REDIS_URL: redis://localhost:6379
          GROQ_API_KEY: test-key
          BETTER_AUTH_SECRET: test-secret
        run: |
          cd smartstudy-backend
          pytest --cov=app --cov-report=xml -v

      - name: Run database migrations
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/test_noteaura
        run: |
          cd smartstudy-backend
          alembic upgrade head

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: ./smartstudy-backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:latest

      - name: Build and push Worker image
        uses: docker/build-push-action@v5
        with:
          context: ./smartstudy-backend
          file: ./smartstudy-backend/Dockerfile.worker
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/worker:latest

      - name: Build and push Auth image
        uses: docker/build-push-action@v5
        with:
          context: ./smartstudy-backend/better-auth
          file: ./smartstudy-backend/better-auth/Dockerfile.auth
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/auth:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/noteaura
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d
            docker system prune -f
```

### Step 11.7 — Production Environment Variables

```env
# .env.production (DO NOT COMMIT)

# App
APP_NAME=NoteAura
APP_VERSION=1.0.0
ENVIRONMENT=production

# Database
DATABASE_URL=postgresql+asyncpg://noteaura:STRONG_PASSWORD@postgres:5432/noteaura
POSTGRES_DB=noteaura
POSTGRES_USER=noteaura
POSTGRES_PASSWORD=STRONG_PASSWORD

# Redis
REDIS_URL=redis://:REDIS_PASSWORD@redis:6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=MINIO_ACCESS_KEY
MINIO_SECRET_KEY=MINIO_SECRET_KEY
MINIO_BUCKET=documents
MINIO_SECURE=false

# Auth
BETTER_AUTH_SECRET=LONG_RANDOM_SECRET
BETTER_AUTH_URL=https://api.noteaura.com/auth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_FALLBACK_MODEL=llama-3.1-8b-instant

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_UNIVERSITY_PRICE_ID=price_...

# RAG
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=512
CHUNK_OVERLAP=50
TOP_K_RETRIEVAL=8
RERANK_TOP_K=4

# CORS
CORS_ORIGINS=["https://noteaura.com","https://www.noteaura.com"]

# Frontend
VITE_APP_URL=https://noteaura.com

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

### Step 11.8 — Monitoring Setup

#### Sentry (Error Tracking)

```python
# app/main.py — add Sentry
import sentry_sdk
from app.config import settings

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1,  # 10% of transactions
        profiles_sample_rate=0.1,
        environment=settings.ENVIRONMENT,
    )
```

#### Structured Logging

```python
# app/core/logging.py
import logging
import json
import sys

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

def setup_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logging.root.handlers = [handler]
    logging.root.setLevel(logging.INFO)
```

#### Health Check Endpoint

```python
# app/main.py
from sqlalchemy import text as sql_text

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Comprehensive health check."""
    checks = {}

    # Database
    try:
        await db.execute(sql_text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {e}"

    # Redis
    try:
        redis = get_redis()
        await redis.ping()
        checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {e}"

    # MinIO
    try:
        from app.core.minio_client import minio_client
        minio_client.bucket_exists("documents")
        checks["minio"] = "healthy"
    except Exception as e:
        checks["minio"] = f"unhealthy: {e}"

    status = "healthy" if all(v == "healthy" for v in checks.values()) else "degraded"
    return {"status": status, "checks": checks, "version": settings.APP_VERSION}
```

---

## Deployment Options

| Platform | Best For | Estimated Cost | Setup Effort |
|----------|----------|---------------|--------------|
| **Railway** | Quick deploy, managed services | $5-20/mo | Low |
| **Render** | Free tier, easy Docker | $7-25/mo | Low |
| **DigitalOcean** | Managed containers + DB | $12-50/mo | Medium |
| **Hetzner + Docker** | Best price/performance | $5-20/mo | High |
| **AWS ECS/Fargate** | Production scale | $20-100+/mo | High |
| **Fly.io** | Edge deployment | $5-30/mo | Medium |

### Recommended for Solo Developer: Railway or Render

```bash
# Railway deployment
railway init
railway add --database postgres
railway add --database redis
railway up

# Or Render: connect GitHub repo → auto-deploy on push
```

---

## Database Backup Strategy

```bash
# Daily automated backup (add to cron)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U noteaura noteaura | gzip > /backups/noteaura_${TIMESTAMP}.sql.gz

# Keep last 30 days
find /backups -name "*.sql.gz" -mtime +30 -delete
```

---

## SSL/TLS Setup

```bash
# Using Let's Encrypt with Certbot
certbot certonly --standalone -d api.noteaura.com

# Auto-renewal (cron)
0 0 1 * * certbot renew --quiet && docker exec nginx nginx -s reload
```

---

## Verification Checklist

- [ ] All Docker images build successfully
- [ ] `docker compose up` starts all services
- [ ] Nginx routes `/api/*` to FastAPI
- [ ] Nginx routes `/ws/*` with WebSocket upgrade
- [ ] Nginx routes `/auth/*` to Better Auth
- [ ] SSL/TLS works with valid certificate
- [ ] Health check endpoint returns all services healthy
- [ ] GitHub Actions CI runs tests on push
- [ ] GitHub Actions CD builds and pushes images
- [ ] Deployment to server works via SSH
- [ ] Database migrations run on deploy
- [ ] Sentry captures errors
- [ ] Logs output as structured JSON
- [ ] Backup script runs successfully
- [ ] Application handles 50+ concurrent users

---

## Post-Deployment Monitoring

### First Week Checks

- [ ] Error rate < 1% (check Sentry)
- [ ] API response time p95 < 2s
- [ ] RAG query latency < 500ms
- [ ] WebSocket connection stability > 99%
- [ ] PDF processing success rate > 95%
- [ ] Stripe webhooks processing correctly
- [ ] No memory leaks (monitor container RSS)
- [ ] Database connection pool stable

### Performance Benchmarks

| Operation | Target | Method |
|-----------|--------|--------|
| API response (CRUD) | < 100ms | Monitoring |
| RAG retrieval | < 300ms | Monitoring |
| Chat first token | < 1s | Manual test |
| PDF processing (10 pages) | < 30s | Celery monitoring |
| WebSocket roundtrip | < 50ms | Manual test |

---

## Rollback Plan

```bash
# Quick rollback to previous version
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml pull  # uses :previous tag
docker compose -f docker-compose.prod.yml up -d

# Database rollback (if needed)
alembic downgrade -1
```

---

## Migration Complete!

After Phase 11, the full NoteAura migration is complete:

| Component | Before | After |
|-----------|--------|-------|
| Backend | Supabase Edge Functions | FastAPI (Python 3.12) |
| Auth | Supabase Auth | Better Auth (Node.js) |
| Storage | Supabase Storage | MinIO (S3-compatible) |
| Database | Supabase PostgreSQL | PostgreSQL 16 + pgvector |
| AI Context | Naive text truncation | RAG Pipeline |
| AI Models | Groq HTTP (Deno) | Groq Python SDK |
| Task Queue | None | Celery + Redis |
| Real-time | Supabase Realtime | FastAPI WebSockets + Redis Pub/Sub |
| Caching | None | Redis |
| Deployment | Supabase managed | Self-hosted Docker |

See the [Copilot Development Guide](../COPILOT_DEVELOPMENT_GUIDE.md) for end-to-end development workflow with GitHub Copilot.
