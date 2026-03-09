# Phase 6 — Groq LLM Integration

## Overview

Replace the direct Groq HTTP calls from Supabase Edge Functions with a Python-native `AIService` using the official Groq Python SDK. This service handles all LLM operations: streaming chat, structured JSON responses, and plain text generation — with automatic model fallback.

**Duration**: Week 3 (alongside Phase 5)  
**Dependencies**: Phase 1 (Project scaffold), Phase 5 (RAG pipeline for context)  
**Deliverables**: AIService class, model configuration, feature-specific wrappers

---

## Architecture

```
┌────────────┐     ┌──────────────┐     ┌──────────────┐
│ FastAPI    │     │ AIService    │     │ Groq Cloud   │
│ Endpoint   │────▶│              │────▶│ API          │
│            │     │ - chat_stream│     │              │
│            │◀────│ - gen_json   │◀────│ llama-3.3-70b│
│ (SSE/JSON) │     │ - gen_text   │     │ (fallback:   │
└────────────┘     └──────────────┘     │  llama-3.1-8b│
                                        └──────────────┘
```

---

## Step-by-Step Guide

### Step 6.1 — Install Dependencies

Add to `requirements.txt`:
```
groq>=0.9.0
```

### Step 6.2 — Configuration Settings

Add to `app/config.py`:
```python
class Settings(BaseSettings):
    # ... existing settings ...

    # Groq
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_FALLBACK_MODEL: str = "llama-3.1-8b-instant"
```

### Step 6.3 — AI Service

```python
# app/services/ai_service.py
import json
import logging
from groq import AsyncGroq
from app.config import settings

logger = logging.getLogger(__name__)

class AIService:
    """
    Groq API wrapper for all LLM operations.
    Supports streaming (SSE), structured JSON, and plain text responses.
    Automatic fallback to a smaller model on failure.
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
        Yields text chunks for Server-Sent Events (SSE).

        Usage:
            async for chunk in ai_service.chat_stream(prompt, messages):
                yield f"data: {chunk}\\n\\n"
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
            logger.warning(f"Primary model failed: {e}. Falling back to {self.fallback_model}")
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
        Generate a structured JSON response from Groq (non-streaming).
        Used for: question generation, answer evaluation, weakness analysis,
        concept extraction, flashcard generation, study plans, etc.
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

        except Exception as e:
            logger.warning(f"Primary model failed: {e}. Falling back.")
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
        """
        Generate a plain text response (e.g., summaries, explanations).
        """
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

**Copilot Prompt:**
```
Create app/services/ai_service.py with an AIService class using the Groq AsyncGroq client.
Three methods:
1. chat_stream - async generator yielding text chunks for SSE streaming
2. generate_json - returns parsed dict using response_format json_object
3. generate_text - returns plain text string
All methods should have automatic fallback to GROQ_FALLBACK_MODEL on failure.
Use settings.GROQ_API_KEY, settings.GROQ_MODEL, settings.GROQ_FALLBACK_MODEL.
```

### Step 6.4 — Model Configuration Per Feature

Each AI feature uses specific temperature and max_tokens settings optimized for its task:

```python
# app/services/ai_config.py

# Centralized AI model configuration per feature
AI_FEATURE_CONFIG = {
    "chat_2m": {
        "temperature": 0.6,
        "max_tokens": 400,
        "response_type": "stream",
        "description": "Brief, concise answers (2-3 sentences)",
    },
    "chat_4m": {
        "temperature": 0.6,
        "max_tokens": 700,
        "response_type": "stream",
        "description": "Short, structured answers (4-5 key points)",
    },
    "chat_8m": {
        "temperature": 0.6,
        "max_tokens": 1200,
        "response_type": "stream",
        "description": "Detailed answers with examples",
    },
    "chat_16m": {
        "temperature": 0.6,
        "max_tokens": 2000,
        "response_type": "stream",
        "description": "Exhaustive, essay-style answers",
    },
    "question_generation": {
        "temperature": 0.7,
        "max_tokens": 2200,
        "response_type": "json",
        "description": "Generate exam questions with expected answers",
    },
    "answer_evaluation": {
        "temperature": 0.3,
        "max_tokens": 2000,
        "response_type": "json",
        "description": "Evaluate student answers — low temp for consistency",
    },
    "summary_chapter": {
        "temperature": 0.5,
        "max_tokens": 2000,
        "response_type": "text",
        "description": "Detailed chapter summary",
    },
    "summary_quick": {
        "temperature": 0.5,
        "max_tokens": 800,
        "response_type": "text",
        "description": "Brief 5-bullet summary",
    },
    "summary_exam": {
        "temperature": 0.5,
        "max_tokens": 1500,
        "response_type": "text",
        "description": "Exam-focused summary",
    },
    "flashcard_generation": {
        "temperature": 0.5,
        "max_tokens": 2600,
        "response_type": "json",
        "description": "Generate question/answer flashcards",
    },
    "weakness_analysis": {
        "temperature": 0.2,
        "max_tokens": 2200,
        "response_type": "json",
        "description": "Weakness detection — low temp for accuracy",
    },
    "concept_extraction": {
        "temperature": 0.3,
        "max_tokens": 3000,
        "response_type": "json",
        "description": "Extract concepts and relationships for knowledge graph",
    },
    "study_plan": {
        "temperature": 0.5,
        "max_tokens": 3000,
        "response_type": "json",
        "description": "Generate personalized study plan",
    },
    "pyq_analysis": {
        "temperature": 0.2,
        "max_tokens": 2800,
        "response_type": "json",
        "description": "Previous year question pattern analysis",
    },
    "score_prediction": {
        "temperature": 0.3,
        "max_tokens": 1500,
        "response_type": "json",
        "description": "Predict exam score based on performance data",
    },
    "feynman_start": {
        "temperature": 0.6,
        "max_tokens": 1500,
        "response_type": "stream",
        "description": "Start Feynman teaching session",
    },
    "feynman_evaluate": {
        "temperature": 0.6,
        "max_tokens": 1500,
        "response_type": "stream",
        "description": "Evaluate student's Feynman explanation",
    },
    "battle_questions": {
        "temperature": 0.6,
        "max_tokens": 2200,
        "response_type": "json",
        "description": "Generate battle mode questions",
    },
}

def get_ai_config(feature: str) -> dict:
    """Get AI configuration for a specific feature."""
    return AI_FEATURE_CONFIG.get(feature, {
        "temperature": 0.5,
        "max_tokens": 1500,
        "response_type": "text",
    })
```

### Step 6.5 — Feature-Specific Service Wrappers

Example: Connecting RAG + AI for question generation:

```python
# app/services/exam_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.services.ai_config import get_ai_config

rag = RAGService()
ai = AIService()

class ExamService:
    async def generate_questions(
        self, db: AsyncSession, document_id: str, difficulty: str, count: int
    ) -> dict:
        """Generate exam questions using RAG context + Groq."""

        # 1. Retrieve relevant content via RAG
        chunks = await rag.retrieve_context(db, document_id, f"key concepts for {difficulty} exam")

        # 2. Build prompt
        system_prompt = rag.build_context_prompt(
            chunks, prompt_type="questions", difficulty=difficulty, count=count
        )

        # 3. Get AI config for this feature
        config = get_ai_config("question_generation")

        # 4. Generate with Groq
        result = await ai.generate_json(
            system_prompt=system_prompt,
            user_prompt=f"Generate {count} {difficulty} exam questions from the provided content.",
            temperature=config["temperature"],
            max_tokens=config["max_tokens"],
        )

        return result
```

---

## Integration Pattern: RAG + AI

Every AI-powered feature follows this pattern:

```
1. Retrieve context     →  RAGService.retrieve_context(db, doc_id, query)
2. Build prompt         →  RAGService.build_context_prompt(chunks, type, **kwargs)
3. Get AI config        →  get_ai_config("feature_name")
4. Call Groq            →  AIService.chat_stream / generate_json / generate_text
5. Return response      →  StreamingResponse (SSE) or JSON
```

---

## Verification Checklist

- [ ] Groq API key configured and validated
- [ ] `chat_stream` yields chunks correctly via SSE
- [ ] `generate_json` returns valid parsed JSON
- [ ] `generate_text` returns plain text
- [ ] Fallback model activates on primary model failure
- [ ] All 18 feature configs are defined in `ai_config.py`
- [ ] Integration test: RAG context → Groq prompt → valid response
- [ ] Error handling: invalid API key, rate limit, timeout

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `groq.AuthenticationError` | Invalid API key | Check `GROQ_API_KEY` in `.env` |
| JSON parse error | Model didn't return valid JSON | Use `response_format={"type": "json_object"}` |
| Rate limit 429 | Too many requests | Implement retry with exponential backoff |
| Timeout | Large response | Increase `max_tokens`, check network |
| Fallback always triggered | Primary model down | Check Groq status page, verify model name |

---

## Next Phase

Once Groq integration is working with RAG context, proceed to [Phase 7 — API Endpoint Migration](phase-07-api-endpoints.md).
