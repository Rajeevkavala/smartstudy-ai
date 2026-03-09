# Phase 4 — Database Migration (PostgreSQL)

## Overview

Migrate from Supabase's managed PostgreSQL to a self-hosted PostgreSQL 16 with pgvector extension. Define all SQLAlchemy ORM models, set up Alembic migrations, and plan the data export/import strategy.

**Duration**: Week 2-3  
**Dependencies**: Phase 1 (PostgreSQL running in Docker)  
**Deliverables**: All SQLAlchemy models, Alembic migrations, pgvector enabled, data migration script

---

## Key Schema Differences

| Supabase Schema | New PostgreSQL Schema |
|----------------|----------------------|
| `auth.users` (Supabase-managed) | `user` table (Better Auth-managed) |
| No vector storage | `document_chunks` with pgvector 384-dim embeddings |
| RLS policies for auth | Application-level auth in Python middleware |
| `gen_random_uuid()` for IDs | Python `uuid.uuid4()` or `gen_random_uuid()` |
| Supabase triggers for profile creation | Better Auth hooks |
| Realtime subscriptions on tables | WebSocket events from Python |

---

## Step-by-Step Guide

### Step 4.1 — Create SQLAlchemy Database Setup

This was created in Phase 1. Ensure `app/core/database.py` has:

```python
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

### Step 4.2 — Create All SQLAlchemy Models

Create one file per domain in `app/models/`. Below is every model:

**app/models/user.py:**
```python
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**app/models/document.py:**
```python
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_size: Mapped[int | None] = mapped_column(Integer)
    page_count: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="processing")
    extracted_text: Mapped[str | None] = mapped_column(Text)
    folder_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("folders.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

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
    embedding: Mapped[list] = mapped_column(Vector(384))
    metadata_: Mapped[dict | None] = mapped_column("metadata", type_=JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index("ix_document_chunks_doc", "document_id"),
        Index(
            "ix_document_chunks_embedding",
            "embedding",
            postgresql_using="ivfflat",
            postgresql_with={"lists": 100},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )
```

**app/models/conversation.py:**
```python
import uuid
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"))
    title: Mapped[str] = mapped_column(String(500), default="New Conversation")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # 'user' | 'assistant'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    mark_level: Mapped[str | None] = mapped_column(String(5))
    sources: Mapped[dict | None] = mapped_column(type_=JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
```

**app/models/exam.py:**
```python
import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import String, Integer, Text, DateTime, Date, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    document_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    mode: Mapped[str] = mapped_column(String(20), nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, default=0)
    correct_answers: Mapped[int] = mapped_column(Integer, default=0)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)

class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255))
    exam_date: Mapped[date] = mapped_column(Date, nullable=False)
    difficulty: Mapped[int] = mapped_column(Integer, default=3)
    confidence: Mapped[int] = mapped_column(Integer, default=3)
    actual_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**app/models/flashcard.py:**
```python
import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import String, Integer, Text, DateTime, Date, Numeric, ForeignKey, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    document_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("documents.id"))
    front: Mapped[str] = mapped_column(Text, nullable=False)
    back: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[list | None] = mapped_column(ARRAY(String))
    ease_factor: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=Decimal("2.50"))
    interval_days: Mapped[int] = mapped_column(Integer, default=1)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)
    next_review_date: Mapped[date] = mapped_column(Date, default=date.today)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    reviews = relationship("FlashcardReview", back_populates="flashcard", cascade="all, delete-orphan")

class FlashcardReview(Base):
    __tablename__ = "flashcard_reviews"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    flashcard_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("flashcards.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    quality: Mapped[int] = mapped_column(Integer)  # 0-5
    time_taken_ms: Mapped[int | None] = mapped_column(Integer)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    flashcard = relationship("Flashcard", back_populates="reviews")
```

**app/models/battle.py:**
```python
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class BattleRoom(Base):
    __tablename__ = "battle_rooms"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    host_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    opponent_id: Mapped[uuid.UUID | None] = mapped_column()
    document_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("documents.id"))
    status: Mapped[str] = mapped_column(String(20), default="waiting")
    mode: Mapped[str] = mapped_column(String(20), default="speed")
    questions: Mapped[dict | None] = mapped_column(type_=JSON, default=list)
    host_score: Mapped[int] = mapped_column(Integer, default=0)
    opponent_score: Mapped[int] = mapped_column(Integer, default=0)
    winner_id: Mapped[uuid.UUID | None] = mapped_column()
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class EloRating(Base):
    __tablename__ = "elo_ratings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(unique=True, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, default=1200)
    wins: Mapped[int] = mapped_column(Integer, default=0)
    losses: Mapped[int] = mapped_column(Integer, default=0)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    best_streak: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**app/models/weakness.py, concept.py, study_plan.py, subscription.py, gamification.py, folder.py** — follow the same pattern from the full SQL schema in the migration doc.

**Copilot Prompt:**
```
Create SQLAlchemy 2.0 models for all remaining tables: weakness_profiles, micro_lessons, 
concepts, concept_relationships, score_predictions, study_plans, study_plan_items, 
subscriptions, usage_tracking, user_gamification, achievements, user_achievements, 
folders, document_tags, document_tag_links. Use the SQL schema from 
MIGRATION_PYTHON_BACKEND.md section 16. Use mapped_column with type hints.
```

### Step 4.3 — Create Model __init__.py

```python
# app/models/__init__.py
from app.models.user import Profile
from app.models.document import Document, DocumentPage, DocumentChunk
from app.models.conversation import Conversation, Message
from app.models.exam import ExamSession, Exam
from app.models.flashcard import Flashcard, FlashcardReview
from app.models.battle import BattleRoom, EloRating
from app.models.weakness import WeaknessProfile, MicroLesson
from app.models.concept import Concept, ConceptRelationship
from app.models.study_plan import StudyPlan, StudyPlanItem
from app.models.subscription import Subscription, UsageTracking
from app.models.gamification import UserGamification, Achievement, UserAchievement
from app.models.folder import Folder, DocumentTag, DocumentTagLink

__all__ = [
    "Profile", "Document", "DocumentPage", "DocumentChunk",
    "Conversation", "Message", "ExamSession", "Exam",
    "Flashcard", "FlashcardReview", "BattleRoom", "EloRating",
    "WeaknessProfile", "MicroLesson", "Concept", "ConceptRelationship",
    "StudyPlan", "StudyPlanItem", "Subscription", "UsageTracking",
    "UserGamification", "Achievement", "UserAchievement",
    "Folder", "DocumentTag", "DocumentTagLink",
]
```

### Step 4.4 — Enable pgvector Extension

Create an initial Alembic migration that enables the pgvector extension:

```bash
alembic revision --autogenerate -m "enable_pgvector_and_create_tables"
```

Add to the migration's `upgrade()`:
```python
def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    # ... auto-generated table creates
```

### Step 4.5 — Run Migrations

```bash
alembic upgrade head
```

### Step 4.6 — Data Migration Script

If migrating from existing Supabase data:

```python
# scripts/migrate_data.py
"""
One-time script to migrate data from Supabase PostgreSQL export to new schema.

Usage:
  1. Export from Supabase: pg_dump from dashboard
  2. Transform: This script handles the transformation
  3. Import: pg_restore or this script handles direct insert
"""

import asyncio
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

SUPABASE_DUMP = "supabase_export.sql"
NEW_DB_URL = "postgresql+asyncpg://noteaura:password@localhost:5432/noteaura"

async def migrate():
    engine = create_async_engine(NEW_DB_URL)
    async with engine.begin() as conn:
        # Step 1: Users are handled by Better Auth (re-register or import)
        # Step 2: Migrate profiles
        # Step 3: Migrate documents
        # Step 4: Migrate conversations, messages
        # Step 5: Migrate flashcards, exams, etc.
        pass
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
```

**Copilot Prompt:**
```
Create scripts/migrate_data.py that reads a Supabase pg_dump export and migrates data 
to the new schema. Handle table name mapping (auth.users → skip, profiles → profiles, 
etc.) Use async SQLAlchemy. Include steps for each table with conflict handling.
```

---

## Full Table List (25 tables)

| Table | Managed By | New in Migration? |
|-------|-----------|-------------------|
| `user` | Better Auth (auto) | Better Auth replaces auth.users |
| `session` | Better Auth (auto) | New |
| `account` | Better Auth (auto) | New |
| `verification` | Better Auth (auto) | New |
| `profiles` | Application | Exists |
| `folders` | Application | Exists |
| `documents` | Application | Exists |
| `document_pages` | Application | Exists |
| `document_chunks` | Application | **New** (RAG vectors) |
| `document_tags` | Application | Exists |
| `document_tag_links` | Application | Exists |
| `conversations` | Application | Exists |
| `messages` | Application | Modified (added `sources` JSON) |
| `exam_sessions` | Application | Exists |
| `exams` | Application | Exists |
| `flashcards` | Application | Exists |
| `flashcard_reviews` | Application | Exists |
| `subscriptions` | Application | Exists |
| `usage_tracking` | Application | Exists |
| `weakness_profiles` | Application | Exists |
| `micro_lessons` | Application | Exists |
| `concepts` | Application | Exists |
| `concept_relationships` | Application | Exists |
| `score_predictions` | Application | Exists |
| `study_plans` | Application | Exists |
| `study_plan_items` | Application | Exists |
| `battle_rooms` | Application | Exists |
| `elo_ratings` | Application | Exists |
| `user_gamification` | Application | Exists |
| `achievements` | Application | Exists (seed data) |
| `user_achievements` | Application | Exists |

---

## Verification Checklist

- [ ] All SQLAlchemy models created and importable
- [ ] `alembic upgrade head` runs without errors
- [ ] pgvector extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'vector'`
- [ ] All tables created: `\dt` in psql shows 25+ tables
- [ ] `document_chunks` table has a `vector(384)` column
- [ ] IVFFlat index exists on the embedding column
- [ ] Inserting a test row in each table works
- [ ] Foreign key relationships work correctly

---

## Next Phase

Once all models and migrations are complete, proceed to [Phase 5 — RAG Pipeline](phase-05-rag-pipeline.md).
