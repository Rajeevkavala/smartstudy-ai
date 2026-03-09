# Phase 2 — Authentication with Better Auth

## Overview

Replace Supabase Auth with Better Auth — a self-hosted, Node.js-based authentication system. Better Auth runs as a sidecar service alongside FastAPI, handling signup, login, OAuth, sessions, and password reset. The React frontend uses Better Auth's React SDK.

**Duration**: Week 2  
**Dependencies**: Phase 1 (infrastructure running)  
**Deliverables**: Working signup/login, Google OAuth, session validation in FastAPI, frontend auth refactored

---

## Architecture

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   React SPA  │  Login   │  Better Auth │  Verify  │ PostgreSQL   │
│              │─────────▶│  (Port 3000) │─────────▶│              │
│              │◀─────────│              │◀─────────│              │
│              │ Session  │              │          │              │
│              │ Cookie   │              │          │              │
│              │          └──────────────┘          │              │
│              │                                    │              │
│              │ API Call  ┌──────────────┐         │              │
│              │ + Cookie  │   FastAPI    │ Validate │              │
│              │──────────▶│  (Port 8000) │────────▶│              │
│              │◀──────────│              │         │              │
└──────────────┘ Response  └──────────────┘         └──────────────┘
```

**Key Point**: The frontend talks to Better Auth directly for auth operations (login, signup, logout). For all other API calls, the session cookie is sent to FastAPI, which validates it by calling Better Auth's session endpoint.

---

## Step-by-Step Guide

### Step 2.1 — Set Up Better Auth Node.js Sidecar

Create the `better-auth/` directory inside `smartstudy-backend/`:

**better-auth/package.json:**
```json
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

**Copilot Prompt:**
```
Create better-auth/package.json with dependencies: better-auth ^1.2.0, pg ^8.13.0. 
Dev dependencies: @types/bun latest, typescript ^5.7.0.
```

### Step 2.2 — Configure Better Auth Server

**better-auth/index.ts:**
```typescript
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

    hooks: {
      after: {
        createUser: async (user) => {
          // Auto-create profile
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

**Copilot Prompt:**
```
Create better-auth/index.ts with Better Auth configuration. Enable email+password auth, 
Google OAuth. Set session to 7 days with 24h refresh. Add afterCreateUser hook that creates 
entries in profiles, subscriptions, user_gamification, and elo_ratings tables using raw SQL. 
Use Bun.serve on port 3000.
```

### Step 2.3 — Create Better Auth Dockerfile

**Dockerfile.auth:**
```dockerfile
FROM oven/bun:1.1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "index.ts"]
```

### Step 2.4 — Add Auth Service to Docker Compose

Add to `docker-compose.yml`:
```yaml
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
```

### Step 2.5 — Create FastAPI Auth Validation Middleware

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
    session_token = request.cookies.get("better-auth.session_token")

    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]

    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

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

CurrentUser = Depends(get_current_user)
```

**Copilot Prompt:**
```
Create app/core/security.py with a get_current_user FastAPI dependency that:
1. Extracts session token from 'better-auth.session_token' cookie or Authorization header
2. Validates the token by calling Better Auth's GET /api/auth/get-session endpoint
3. Returns the user dict or raises 401 HTTPException
4. Create a CurrentUser = Depends(get_current_user) shorthand
```

### Step 2.6 — Create Frontend Auth Client

Replace Supabase auth with Better Auth React SDK in the frontend:

**src/lib/auth-client.ts:**
```typescript
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

**Copilot Prompt:**
```
Create src/lib/auth-client.ts using better-auth/react createAuthClient. Set baseURL from 
VITE_AUTH_URL env var. Export signIn, signUp, signOut, useSession, getSession.
```

### Step 2.7 — Refactor AuthContext

**src/contexts/AuthContext.tsx (refactored):**
```typescript
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

**Copilot Prompt:**
```
Refactor src/contexts/AuthContext.tsx to use Better Auth instead of Supabase. 
Import useSession from @/lib/auth-client. The AuthProvider should use useSession() hook, 
expose user, loading (isPending), and isAuthenticated. Remove all Supabase imports.
```

### Step 2.8 — Update Login/Signup Pages

**Migration mapping for Auth.tsx:**

| Supabase Call | Better Auth Equivalent |
|---------------|----------------------|
| `supabase.auth.signUp({ email, password })` | `authClient.signUp.email({ email, password, name })` |
| `supabase.auth.signInWithPassword({ email, password })` | `authClient.signIn.email({ email, password })` |
| `supabase.auth.signInWithOAuth({ provider: 'google' })` | `authClient.signIn.social({ provider: 'google' })` |
| `supabase.auth.signOut()` | `authClient.signOut()` |
| `supabase.auth.resetPasswordForEmail(email)` | `authClient.forgetPassword({ email })` |

**Copilot Prompt:**
```
Update src/pages/Auth.tsx to use Better Auth instead of Supabase. Replace signUp with 
authClient.signUp.email(), signIn with authClient.signIn.email(), Google OAuth with 
authClient.signIn.social({ provider: 'google' }). Remove all supabase imports.
```

### Step 2.9 — Update ForgotPassword and ResetPassword Pages

**Copilot Prompt:**
```
Update src/pages/ForgotPassword.tsx and src/pages/ResetPassword.tsx to use Better Auth. 
Replace supabase.auth.resetPasswordForEmail() with authClient.forgetPassword(). 
Replace supabase.auth.updateUser() with authClient.resetPassword().
```

### Step 2.10 — Install Better Auth Frontend Package

```bash
cd smartstudy-ai  # frontend directory
npm install better-auth
```

---

## Auth API Endpoints (Better Auth — Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up/email` | POST | Email signup |
| `/api/auth/sign-in/email` | POST | Email login |
| `/api/auth/sign-in/social` | POST | Google OAuth |
| `/api/auth/sign-out` | POST | Logout |
| `/api/auth/forget-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password |
| `/api/auth/get-session` | GET | Get current session |

---

## Verification Checklist

- [ ] Better Auth service starts on port 3000
- [ ] `POST /api/auth/sign-up/email` creates a user
- [ ] `POST /api/auth/sign-in/email` returns a session cookie
- [ ] `GET /api/auth/get-session` with valid cookie returns user data
- [ ] FastAPI `get_current_user` dependency validates sessions correctly
- [ ] Google OAuth flow works end-to-end
- [ ] After signup, profile/subscription/gamification rows are auto-created
- [ ] Frontend login/signup works with Better Auth
- [ ] Session persists across page refreshes
- [ ] Logout clears the session

---

## Common Issues

1. **CORS errors**: Better Auth and FastAPI must both allow the frontend origin (`http://localhost:5173`)
2. **Cookie not sent**: Ensure `credentials: 'include'` in all fetch calls and CORS `allow_credentials=True`
3. **Session validation slow**: Consider caching session validation results in Redis (TTL: 5 minutes)
4. **Google OAuth redirect**: Set the redirect URL in Google Cloud Console to `http://localhost:3000/api/auth/callback/google`

---

## Next Phase

Once auth is fully working, proceed to [Phase 3 — MinIO Object Storage](phase-03-minio-storage.md).
