# Phase 8 — WebSocket Real-time Features

## Overview

Replace Supabase Realtime subscriptions (postgres_changes) with FastAPI WebSockets backed by Redis Pub/Sub. The primary use case is real-time exam battles, but the architecture supports any future real-time feature.

**Duration**: Week 4  
**Dependencies**: Phase 1 (Redis), Phase 7 (Battle API endpoints)  
**Deliverables**: WebSocketManager, battle WebSocket endpoint, frontend WebSocket client

---

## Architecture

```
┌──────────┐     ┌──────────────┐     ┌─────────┐     ┌──────────────┐
│ Player 1 │◀───▶│              │◀───▶│  Redis  │◀───▶│              │◀───▶ Player 2
│ Browser  │ WS  │ FastAPI      │     │ Pub/Sub │     │ FastAPI      │ WS   Browser
└──────────┘     │ Instance 1   │     └─────────┘     │ Instance 2   │     
                 └──────────────┘                     └──────────────┘
```

Redis Pub/Sub enables horizontal scaling — multiple FastAPI instances can share real-time events.

---

## Step-by-Step Guide

### Step 8.1 — WebSocket Manager

```python
# app/core/websocket.py
import json
import logging
from fastapi import WebSocket
from redis.asyncio import Redis

logger = logging.getLogger(__name__)

class WebSocketManager:
    """
    Manages WebSocket connections with Redis Pub/Sub for multi-instance support.
    Replaces Supabase Realtime.
    """

    def __init__(self, redis: Redis):
        self.redis = redis
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        """Accept a WebSocket connection and add it to a room."""
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        logger.info(f"WebSocket connected to room {room_id}. Total: {len(self.active_connections[room_id])}")

    def disconnect(self, websocket: WebSocket, room_id: str):
        """Remove a WebSocket connection from a room."""
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
            logger.info(f"WebSocket disconnected from room {room_id}")

    async def broadcast(self, room_id: str, message: dict):
        """Broadcast a message to all connections in a room."""
        # Publish to Redis for cross-instance communication
        await self.redis.publish(f"ws:{room_id}", json.dumps(message))

        # Local broadcast to connections on this instance
        if room_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)

            # Clean up broken connections
            for conn in disconnected:
                self.active_connections[room_id].remove(conn)

    async def send_to_user(self, room_id: str, user_id: str, message: dict):
        """Send a message to a specific user in a room (requires user tracking)."""
        await self.redis.publish(f"ws:{room_id}:{user_id}", json.dumps(message))
```

**Copilot Prompt:**
```
Create app/core/websocket.py with a WebSocketManager class. It should:
1. Track active connections per room_id in a dict
2. connect() — accept WebSocket and add to room
3. disconnect() — remove from room, clean up empty rooms
4. broadcast() — send to all connections in room + publish to Redis for scaling
5. Handle broken connections gracefully
Use redis.asyncio.Redis for pub/sub.
```

### Step 8.2 — Initialize Manager in App Startup

```python
# app/main.py — add to lifespan
from app.core.websocket import WebSocketManager
from app.core.redis import get_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = get_redis()
    app.state.ws_manager = WebSocketManager(redis)
    init_buckets()
    yield
    await engine.dispose()
```

### Step 8.3 — Battle WebSocket Endpoint

```python
# app/api/battles.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/api/battles", tags=["battles"])

@router.websocket("/ws/battles/{room_id}")
async def battle_websocket(websocket: WebSocket, room_id: str):
    """
    Real-time battle room WebSocket.
    Replaces Supabase Realtime subscriptions on battle_rooms table.

    Message types:
    - join: Player joins room
    - answer: Player submits answer
    - score_update: Broadcast score changes
    - battle_complete: Battle ended, winner announced
    - player_disconnected: Player left
    """
    ws_manager = websocket.app.state.ws_manager
    await ws_manager.connect(websocket, room_id)

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "join":
                await ws_manager.broadcast(room_id, {
                    "type": "player_joined",
                    "userId": data["userId"],
                    "username": data.get("username", "Player"),
                })

            elif data["type"] == "answer":
                # Process the answer
                result = await process_battle_answer(
                    room_id=room_id,
                    user_id=data["userId"],
                    question_index=data["questionIndex"],
                    answer=data["answer"],
                    time_taken_ms=data.get("timeTakenMs", 0),
                )

                # Broadcast updated scores
                await ws_manager.broadcast(room_id, {
                    "type": "score_update",
                    "scores": result["scores"],
                    "questionIndex": data["questionIndex"],
                    "correct": result["correct"],
                })

                # Check if battle is complete
                if result.get("battle_complete"):
                    await ws_manager.broadcast(room_id, {
                        "type": "battle_complete",
                        "winner": result["winner"],
                        "finalScores": result["scores"],
                        "eloChanges": result.get("elo_changes", {}),
                    })

            elif data["type"] == "ready":
                await ws_manager.broadcast(room_id, {
                    "type": "player_ready",
                    "userId": data["userId"],
                })

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, room_id)
        await ws_manager.broadcast(room_id, {
            "type": "player_disconnected",
            "userId": data.get("userId", "unknown"),
        })


async def process_battle_answer(
    room_id: str, user_id: str,
    question_index: int, answer: str,
    time_taken_ms: int = 0,
) -> dict:
    """Process a battle answer and update scores."""
    from app.core.database import async_session

    async with async_session() as db:
        # Get battle room
        result = await db.execute(
            text("SELECT * FROM battle_rooms WHERE id = :rid"),
            {"rid": room_id},
        )
        room = dict(result.fetchone()._mapping)
        questions = room["questions"]

        # Check answer
        correct_answer = questions[question_index].get("correctAnswer")
        is_correct = answer == correct_answer

        # Update scores
        score_field = "host_score" if user_id == str(room["host_id"]) else "opponent_score"
        if is_correct:
            await db.execute(
                text(f"UPDATE battle_rooms SET {score_field} = {score_field} + 1 WHERE id = :rid"),
                {"rid": room_id},
            )
            await db.commit()

        # Check if battle is complete (all questions answered)
        updated = await db.execute(
            text("SELECT * FROM battle_rooms WHERE id = :rid"),
            {"rid": room_id},
        )
        updated_room = dict(updated.fetchone()._mapping)

        battle_complete = (
            updated_room["host_score"] + updated_room["opponent_score"]
            >= len(questions)
        )

        result = {
            "correct": is_correct,
            "scores": {
                "host": updated_room["host_score"],
                "opponent": updated_room["opponent_score"],
            },
        }

        if battle_complete:
            winner_id = (
                str(room["host_id"])
                if updated_room["host_score"] > updated_room["opponent_score"]
                else str(room["opponent_id"])
            )
            await db.execute(
                text("UPDATE battle_rooms SET status = 'completed', winner_id = :wid, ended_at = NOW() WHERE id = :rid"),
                {"wid": winner_id, "rid": room_id},
            )
            await db.commit()

            result["battle_complete"] = True
            result["winner"] = winner_id

        return result
```

### Step 8.4 — REST Endpoints for Battles

```python
# app/api/battles.py — REST endpoints (same file)

@router.post("/create")
async def create_battle(
    request: dict,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new battle room and generate questions."""
    from app.services.rag_service import RAGService
    from app.services.ai_service import AIService
    from app.services.ai_config import get_ai_config

    rag = RAGService()
    ai = AIService()

    # Generate battle questions via RAG
    chunks = await rag.retrieve_context(
        db, request["document_id"], "key concepts for quiz battle"
    )
    system_prompt = rag.build_context_prompt(
        chunks, prompt_type="questions", difficulty="medium", count=10
    )
    config = get_ai_config("battle_questions")
    questions = await ai.generate_json(
        system_prompt=system_prompt,
        user_prompt="Generate 10 quick battle questions with 4 options each.",
        temperature=config["temperature"],
        max_tokens=config["max_tokens"],
    )

    # Create battle room
    result = await db.execute(
        text("""
            INSERT INTO battle_rooms (host_id, document_id, mode, questions)
            VALUES (:uid, :doc_id, :mode, :questions::jsonb)
            RETURNING *
        """),
        {
            "uid": user["id"],
            "doc_id": request["document_id"],
            "mode": request.get("mode", "speed"),
            "questions": json.dumps(questions.get("questions", [])),
        },
    )
    await db.commit()
    return dict(result.fetchone()._mapping)


@router.post("/{room_id}/join")
async def join_battle(
    room_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Join an existing battle room."""
    result = await db.execute(
        text("""
            UPDATE battle_rooms
            SET opponent_id = :uid, status = 'active', started_at = NOW()
            WHERE id = :rid AND status = 'waiting' AND host_id != :uid
            RETURNING *
        """),
        {"uid": user["id"], "rid": room_id},
    )
    await db.commit()
    row = result.fetchone()
    if not row:
        from fastapi import HTTPException
        raise HTTPException(404, "Battle room not found or already full")

    return dict(row._mapping)


@router.get("/leaderboard")
async def get_leaderboard(
    db: AsyncSession = Depends(get_db),
):
    """Get ELO leaderboard."""
    result = await db.execute(
        text("""
            SELECT e.*, p.full_name, p.avatar_url
            FROM elo_ratings e
            JOIN profiles p ON p.id = e.user_id
            ORDER BY e.rating DESC
            LIMIT 50
        """)
    )
    return [dict(row._mapping) for row in result.fetchall()]
```

---

## Frontend WebSocket Migration

### Before (Supabase Realtime)

```typescript
// src/pages/Battles.tsx — BEFORE
const channel = supabase
  .channel('battle-updates')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'battle_rooms', filter: `id=eq.${roomId}` },
    (payload) => handleBattleUpdate(payload.new)
  )
  .subscribe();

// Cleanup
return () => { supabase.removeChannel(channel); };
```

### After (Native WebSocket)

```typescript
// src/hooks/useBattleWebSocket.ts — AFTER
import { useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL;

interface BattleMessage {
  type: 'player_joined' | 'score_update' | 'battle_complete' | 'player_disconnected' | 'player_ready';
  [key: string]: unknown;
}

export function useBattleWebSocket(
  roomId: string | null,
  onMessage: (data: BattleMessage) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`${WS_URL}/ws/battles/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => console.log('Battle WS connected');

    ws.onmessage = (event) => {
      const data: BattleMessage = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (error) => console.error('Battle WS error:', error);

    ws.onclose = () => {
      console.log('Battle WS disconnected');
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          // Reconnect logic
        }
      }, 3000);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, onMessage]);

  const sendMessage = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { sendMessage };
}
```

### Usage in Battle Page

```typescript
// src/pages/Battles.tsx
import { useBattleWebSocket } from '@/hooks/useBattleWebSocket';

function BattlePage() {
  const [scores, setScores] = useState({ host: 0, opponent: 0 });
  const [winner, setWinner] = useState<string | null>(null);

  const handleMessage = useCallback((data: BattleMessage) => {
    switch (data.type) {
      case 'score_update':
        setScores(data.scores);
        break;
      case 'battle_complete':
        setWinner(data.winner);
        break;
      case 'player_disconnected':
        toast.error('Opponent disconnected');
        break;
    }
  }, []);

  const { sendMessage } = useBattleWebSocket(roomId, handleMessage);

  const submitAnswer = (answer: string) => {
    sendMessage({
      type: 'answer',
      userId: user.id,
      questionIndex: currentQuestion,
      answer,
    });
  };

  // ...
}
```

---

## Redis Pub/Sub Listener (for Multi-Instance)

```python
# app/core/websocket.py — add Redis subscription listener

import asyncio

async def start_redis_listener(ws_manager: WebSocketManager):
    """
    Listen to Redis Pub/Sub for messages from other FastAPI instances.
    Run this as a background task on startup.
    """
    pubsub = ws_manager.redis.pubsub()
    await pubsub.psubscribe("ws:*")

    async for message in pubsub.listen():
        if message["type"] == "pmessage":
            channel = message["channel"].decode()
            data = json.loads(message["data"])
            room_id = channel.split(":")[1]

            # Forward to local WebSocket connections
            if room_id in ws_manager.active_connections:
                for conn in ws_manager.active_connections[room_id]:
                    try:
                        await conn.send_json(data)
                    except Exception:
                        pass
```

Add to app startup:
```python
# app/main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = get_redis()
    app.state.ws_manager = WebSocketManager(redis)
    # Start Redis listener for multi-instance WS support
    asyncio.create_task(start_redis_listener(app.state.ws_manager))
    yield
```

---

## Verification Checklist

- [ ] WebSocketManager tracks connections per room
- [ ] Two browser tabs can connect to same room
- [ ] Answer submission broadcasts score_update to both players
- [ ] Battle completion triggers battle_complete message
- [ ] Disconnection broadcasts player_disconnected
- [ ] Redis Pub/Sub works across multiple FastAPI instances
- [ ] Frontend hook auto-reconnects on connection loss
- [ ] Cleanup removes WebSocket on unmount
- [ ] ELO leaderboard endpoint works

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| WebSocket refuses connection | CORS or missing `ws://` scheme | Use `VITE_WS_URL=ws://localhost:8000` |
| Messages not received by opponent | Different server instances | Enable Redis Pub/Sub listener |
| Connection drops after 60s | Nginx proxy timeout | Add `proxy_read_timeout 3600s;` |
| Stale connections in manager | Client crashed without close | Add heartbeat ping/pong |

---

## Next Phase

Once real-time battles work end-to-end, proceed to [Phase 9 — Frontend Refactor](phase-09-frontend-refactor.md).
