# Phase 9 — Frontend Refactor

## Overview

Refactor the React/TypeScript frontend to replace all Supabase client calls with the new Python API. This involves: creating an API client utility, migrating all hooks and pages, updating auth context, removing Supabase dependencies, and updating environment variables.

**Duration**: Weeks 4-5  
**Dependencies**: Phase 2 (Auth), Phase 7 (API endpoints), Phase 8 (WebSockets)  
**Deliverables**: API client, migrated hooks, migrated pages, clean Supabase removal

---

## Migration Strategy

```
1. Create api-client.ts utility
2. Create auth-client.ts (Better Auth)
3. Migrate AuthContext.tsx
4. Migrate each hook (one at a time, test after each)
5. Migrate each page (one at a time, test after each)
6. Remove Supabase dependencies
7. Update environment variables
```

---

## Step-by-Step Guide

### Step 9.1 — API Client Utility

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
  get: <T>(endpoint: string) =>
    apiRequest<T>(endpoint),

  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type with boundary
    }),

  stream: (endpoint: string, data?: unknown) =>
    fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};
```

**Copilot Prompt:**
```
Create src/lib/api-client.ts with a typed API client utility.
Base URL from VITE_API_URL. Uses fetch with credentials: "include" for session cookies.
Methods: get, post, patch, delete (all return Promise<T>), upload (FormData), stream (raw Response).
Handle errors by parsing JSON error body and throwing Error.
```

### Step 9.2 — Better Auth Client

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

const AUTH_URL = import.meta.env.VITE_AUTH_URL; // http://localhost:3000

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  forgetPassword,
  resetPassword,
} = authClient;
```

### Step 9.3 — Migrate AuthContext

```typescript
// src/contexts/AuthContext.tsx — AFTER

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signUp, signOut, forgetPassword, resetPassword } from "@/lib/auth-client";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetUserPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      }
    : null;

  const signInWithEmail = async (email: string, password: string) => {
    await signIn.email({ email, password });
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    await signUp.email({ email, password, name: name || "" });
  };

  const signInWithGoogle = async () => {
    await signIn.social({ provider: "google" });
  };

  const logout = async () => {
    await signOut();
  };

  const forgotPasswordHandler = async (email: string) => {
    await forgetPassword({ email, redirectTo: `${window.location.origin}/reset-password` });
  };

  const resetUserPassword = async (token: string, newPassword: string) => {
    await resetPassword({ token, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isPending,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        forgotPassword: forgotPasswordHandler,
        resetUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

### Step 9.4 — Hook Migration Examples

Each hook follows the same pattern: replace `supabase.from()` calls with `api.get/post()`.

#### useFlashcards.ts

```typescript
// BEFORE
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

// AFTER
import { api } from '@/lib/api-client';

const { data: flashcards } = useQuery({
  queryKey: ['flashcards', documentId],
  queryFn: () => api.get(`/api/flashcards?documentId=${documentId}`),
});
```

#### useBattles.ts

```typescript
// BEFORE: Supabase Realtime
const channel = supabase.channel('battle-room')
  .on('postgres_changes', { ... }, handleUpdate)
  .subscribe();

// AFTER: WebSocket
import { useBattleWebSocket } from '@/hooks/useBattleWebSocket';
const { sendMessage } = useBattleWebSocket(roomId, handleMessage);
```

#### useGamification.ts

```typescript
// BEFORE
const { data } = await supabase
  .from('user_gamification')
  .select('*')
  .eq('user_id', user.id)
  .single();

// AFTER
const { data } = useQuery({
  queryKey: ['gamification'],
  queryFn: () => api.get('/api/gamification/profile'),
});
```

#### useStudyPlan.ts

```typescript
// BEFORE
const { data } = await supabase.from('study_plans').select('*, study_plan_items(*)');

// AFTER
const { data } = useQuery({
  queryKey: ['study-plans'],
  queryFn: () => api.get('/api/plans'),
});
```

#### useSubscription.ts

```typescript
// BEFORE
const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();

// AFTER
const { data } = useQuery({
  queryKey: ['subscription'],
  queryFn: () => api.get('/api/subscriptions'),
});
```

#### useUsage.ts

```typescript
// BEFORE
const response = await supabase.functions.invoke('check-usage', { body: { feature } });

// AFTER
const checkUsage = async (feature: string) => {
  return api.post('/api/usage/check', { feature });
};
```

#### useWeakness.ts

```typescript
// BEFORE
const { data } = await supabase.from('weakness_profiles').select('*, micro_lessons(*)');

// AFTER
const { data } = useQuery({
  queryKey: ['weakness'],
  queryFn: () => api.get('/api/weakness'),
});
```

### Step 9.5 — Page Migration Examples

#### Study.tsx (Chat Streaming)

```typescript
// BEFORE: Edge Function SSE
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

// AFTER: Python API SSE
const response = await api.stream('/api/chat/stream', {
  messages,
  documentId,
  markLevel,
  documentTitle,
});

// SSE parsing logic stays the same — response format is identical
const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      setStreamingText(prev => prev + data);
    }
  }
}
```

#### Upload.tsx

```typescript
// BEFORE: Supabase Storage
const { data, error } = await supabase.storage
  .from('documents')
  .upload(filePath, file);

// AFTER: Python API
const formData = new FormData();
formData.append('file', file);
formData.append('title', file.name);
if (folderId) formData.append('folderId', folderId);

const result = await api.upload('/api/documents/upload', formData);
```

#### ExamMode.tsx

```typescript
// BEFORE
const response = await supabase.functions.invoke('generate-questions', {
  body: { documentId, difficulty, count },
});

// AFTER
const questions = await api.post('/api/exams/generate-questions', {
  documentId,
  difficulty,
  count,
});
```

#### Pricing.tsx

```typescript
// BEFORE
const response = await supabase.functions.invoke('create-checkout-session', {
  body: { planId },
});

// AFTER  
const { url } = await api.post('/api/subscriptions/checkout', { planId });
window.location.href = url;
```

---

## Complete File Changes List

### Files to DELETE

```
src/integrations/supabase/          # Entire folder
├── client.ts
├── types.ts
└── types/
    └── ...
```

### Files to CREATE

```
src/lib/api-client.ts               # API client utility
src/lib/auth-client.ts              # Better Auth client
src/hooks/useBattleWebSocket.ts     # Battle WebSocket hook
```

### Files to MODIFY

| File | Changes Required |
|------|-----------------|
| `src/contexts/AuthContext.tsx` | Replace Supabase Auth with Better Auth `useSession` hook |
| `src/hooks/useBattles.ts` | Replace `supabase.from()` with `api.get/post()`, add WebSocket |
| `src/hooks/useFlashcards.ts` | Replace `supabase.from()` with `api.get/post()` |
| `src/hooks/useGamification.ts` | Replace `supabase.from()` with `api.get/post()` |
| `src/hooks/useStudyPlan.ts` | Replace `supabase.from()` with `api.get/post()` |
| `src/hooks/useSubscription.ts` | Replace `supabase.from()` with `api.get()` |
| `src/hooks/useUsage.ts` | Replace `supabase.functions.invoke()` with `api.post()` |
| `src/hooks/useWeakness.ts` | Replace `supabase.from()` with `api.get/post()` |
| `src/pages/Auth.tsx` | Replace Supabase auth calls with `signIn`/`signUp` from auth-client |
| `src/pages/Battles.tsx` | Replace Supabase Realtime with `useBattleWebSocket` |
| `src/pages/Dashboard.tsx` | Replace `supabase.from()` queries with `api.get()` |
| `src/pages/ExamMode.tsx` | Replace `supabase.functions.invoke()` with `api.post()` |
| `src/pages/FeynmanMode.tsx` | Replace edge function URL with `api.stream()` |
| `src/pages/Flashcards.tsx` | Replace `supabase.from()` queries |
| `src/pages/ForgotPassword.tsx` | Replace Supabase auth with `forgetPassword` from auth-client |
| `src/pages/KnowledgeGraph.tsx` | Replace `supabase.from()` with `api.get()` |
| `src/pages/Leaderboard.tsx` | Replace `supabase.from()` with `api.get()` |
| `src/pages/Pricing.tsx` | Replace edge function with `api.post('/api/subscriptions/checkout')` |
| `src/pages/PYQAnalyzer.tsx` | Replace edge function with `api.post('/api/pyq/analyze')` |
| `src/pages/ResetPassword.tsx` | Replace Supabase auth with `resetPassword` from auth-client |
| `src/pages/Settings.tsx` | Replace Supabase auth/profile queries |
| `src/pages/Study.tsx` | Replace edge function SSE with `api.stream('/api/chat/stream')` |
| `src/pages/StudyPlanner.tsx` | Replace `supabase.from()` with `api.get/post()` |
| `src/pages/Upload.tsx` | Replace Supabase Storage with `api.upload()` |
| `src/pages/WeaknessRadar.tsx` | Replace `supabase.from()` with `api.get()` |

---

## Environment Variable Changes

```env
# REMOVE these:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhb...

# ADD these:
VITE_API_URL=http://localhost:8000
VITE_AUTH_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:8000
```

Keep unchanged:
```env
VITE_SENTRY_DSN=...
VITE_POSTHOG_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=...
VITE_APP_URL=http://localhost:5173
```

---

## Dependency Changes

```bash
# Remove
npm uninstall @supabase/supabase-js

# Add
npm install better-auth
```

---

## Migration Order (Recommended)

Migrate in this order to minimize breakage:

1. **Create** `api-client.ts` and `auth-client.ts` (no impact yet)
2. **Migrate** `AuthContext.tsx` → test login/signup/logout
3. **Migrate** `Auth.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` → test auth pages
4. **Migrate** `Dashboard.tsx` → test data loading
5. **Migrate** `Upload.tsx` → test file upload
6. **Migrate** `Study.tsx` → test chat streaming
7. **Migrate** `ExamMode.tsx` → test question generation + evaluation
8. **Migrate** `Flashcards.tsx` + `useFlashcards.ts` → test flashcards
9. **Migrate** `Battles.tsx` + `useBattles.ts` → test WebSocket battles
10. **Migrate** remaining pages one by one
11. **Delete** `src/integrations/supabase/` folder
12. **Remove** `@supabase/supabase-js` from `package.json`
13. **Update** `.env` variables

---

## Verification Checklist

- [ ] API client sends requests with session cookies
- [ ] Auth login/signup/logout works with Better Auth
- [ ] Google OAuth redirects correctly
- [ ] Dashboard loads user data from new API
- [ ] PDF upload works via `api.upload()`
- [ ] Chat streaming displays tokens in real-time
- [ ] Exam question generation returns valid questions
- [ ] Flashcard review updates SM-2 scheduling
- [ ] Battle WebSocket connects and syncs in real-time
- [ ] All hooks use `api.get/post()` instead of Supabase
- [ ] No references to `supabase` remain in codebase
- [ ] `src/integrations/supabase/` folder is deleted
- [ ] `@supabase/supabase-js` is removed from `package.json`
- [ ] App builds without errors: `npm run build`

---

## Next Phase

Once the frontend is fully migrated, proceed to [Phase 10 — Stripe Payment Migration](phase-10-stripe-payments.md).
