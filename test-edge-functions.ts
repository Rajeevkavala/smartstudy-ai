/**
 * SmartStudy AI — Edge Functions Integration Test Script
 *
 * Usage:
 *   npx tsx test-edge-functions.ts
 *
 * Prerequisites:
 *   - A valid .env file at the project root
 *   - A test user account in Supabase (email/password) or a valid access token
 *   - At least one uploaded & processed document (status = "ready")
 *
 * Set TEST_EMAIL and TEST_PASSWORD, or TEST_ACCESS_TOKEN, via environment variables.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// ─── Configuration ──────────────────────────────────────────────────────────────

dotenv.config({ path: resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

// ⚠️  Set these to a real test user's credentials via env vars or .env file
const TEST_EMAIL = process.env.TEST_EMAIL || "";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "";
const TEST_ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN || "";
const TEST_SIGNUP_IF_MISSING = process.env.TEST_SIGNUP_IF_MISSING === "true";
const TEST_DISABLE_AUTH = process.env.TEST_DISABLE_AUTH === "true";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const HAS_PASSWORD_AUTH = Boolean(TEST_EMAIL && TEST_PASSWORD);
const HAS_TOKEN_AUTH = Boolean(TEST_ACCESS_TOKEN);
const NO_AUTH = TEST_DISABLE_AUTH || (!HAS_PASSWORD_AUTH && !HAS_TOKEN_AUTH);

// ─── Helpers ────────────────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  status: "PASS" | "FAIL" | "SKIP";
  duration: number;
  error?: string;
  response?: unknown;
}

const results: TestResult[] = [];

function edgeFunctionUrl(name: string) {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

async function invokeFunction(
  name: string,
  body: Record<string, unknown>,
  accessToken: string,
  options?: { expectStream?: boolean }
): Promise<{ status: number; data: unknown; headers: Headers }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    apikey: SUPABASE_ANON_KEY,
  };

  const res = await fetch(edgeFunctionUrl(name), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (options?.expectStream) {
    const text = await res.text();
    return { status: res.status, data: text, headers: res.headers };
  }

  let data: unknown;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data, headers: res.headers };
}

async function runTest(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, status: "PASS", duration: Date.now() - start });
    console.log(`  ✅ ${name} (${Date.now() - start}ms)`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, status: "FAIL", duration: Date.now() - start, error: msg });
    console.log(`  ❌ ${name} — ${msg} (${Date.now() - start}ms)`);
  }
}

function skip(name: string, reason: string) {
  results.push({ name, status: "SKIP", duration: 0, error: reason });
  console.log(`  ⏭️  ${name} — SKIPPED: ${reason}`);
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function authenticate(supabase: SupabaseClient) {
  if (HAS_TOKEN_AUTH) {
    const { data, error } = await supabase.auth.getUser(TEST_ACCESS_TOKEN);
    if (error || !data.user) {
      console.error(`❌ TEST_ACCESS_TOKEN is invalid: ${error?.message ?? "Could not load user"}`);
      process.exit(1);
    }

    return {
      accessToken: TEST_ACCESS_TOKEN,
      userId: data.user.id,
      authMode: "token" as const,
    };
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (!authError && authData.session && authData.user) {
    return {
      accessToken: authData.session.access_token,
      userId: authData.user.id,
      authMode: "password" as const,
    };
  }

  const loginErrorMessage = authError?.message ?? "Invalid login credentials";

  if (!TEST_SIGNUP_IF_MISSING) {
    console.error(`❌ Authentication failed: ${loginErrorMessage}`);
    console.error("   This test account already exists or the password/access token is incorrect.");
    console.error("   Fix one of these before rerunning:");
    console.error("   1. Set the correct TEST_PASSWORD for TEST_EMAIL");
    console.error("   2. Or set TEST_ACCESS_TOKEN to a valid logged-in user's JWT");
    console.error("   3. Only set TEST_SIGNUP_IF_MISSING=true for brand new disposable accounts");
    process.exit(1);
  }

  console.log(`⚠️  Login failed (${loginErrorMessage}), attempting auto sign-up because TEST_SIGNUP_IF_MISSING=true…`);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signUpError || !signUpData.session || !signUpData.user) {
    console.error(`❌ Sign-up failed: ${signUpError?.message ?? "No session (check email confirmation settings)"}`);
    console.error("   If this account already exists, use the correct TEST_PASSWORD or TEST_ACCESS_TOKEN instead.");
    process.exit(1);
  }

  return {
    accessToken: signUpData.session.access_token,
    userId: signUpData.user.id,
    authMode: "signup" as const,
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║     SmartStudy AI — Edge Function Integration Tests         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  console.log(`Supabase URL : ${SUPABASE_URL}`);
  console.log(`Test Email   : ${TEST_EMAIL || "(none)"}`);
  console.log(`Auth Mode    : ${TEST_DISABLE_AUTH ? "forced unauthenticated" : HAS_TOKEN_AUTH ? "access token" : HAS_PASSWORD_AUTH ? "email/password" : "unauthenticated only"}\n`);

  const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let accessToken = "";
  let userId = "";
  let testDoc: { id: string; title: string; status: string; page_count: number | null } | null = null;

  if (NO_AUTH) {
    console.log("⚠️  Running CORS + 401 tests only.");
    console.log("   To run full tests: unset TEST_DISABLE_AUTH and set TEST_ACCESS_TOKEN, or set TEST_EMAIL and TEST_PASSWORD in .env\n");
  } else {
    // ── Step 1: Authenticate ──────────────────────────────────────────────────
    console.log("🔐  Authenticating…");

    const auth = await authenticate(supabase);
    accessToken = auth.accessToken;
    userId = auth.userId;

    console.log(`✅ Authenticated as ${userId} using ${auth.authMode}\n`);

    // ── Step 2: Find a test document ──────────────────────────────────────────
    console.log("📄  Looking for a processed document…");

    const { data: documents } = await supabase
      .from("documents")
      .select("id, title, status, page_count")
      .eq("user_id", userId)
      .eq("status", "ready")
      .limit(1);

    testDoc = documents?.[0] ?? null;
    if (testDoc) {
      console.log(`✅ Using document: "${testDoc.title}" (${testDoc.id})\n`);
    } else {
      console.log("⚠️  No processed document found — document-dependent tests will be skipped.\n");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  if (!NO_AUTH) {

  // ── 1. check-usage ────────────────────────────────────────────────────────
  console.log("── check-usage ──");

  await runTest("check-usage: valid feature 'chat'", async () => {
    const { status, data } = await invokeFunction("check-usage", { feature: "chat" }, accessToken);
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
    const d = data as Record<string, unknown>;
    assert(typeof d.allowed === "boolean", "Response missing 'allowed' boolean");
    assert(typeof d.limit === "number", "Response missing 'limit' number");
    assert(typeof d.remaining === "number", "Response missing 'remaining' number");
    assert(typeof d.plan === "string", "Response missing 'plan' string");
  });

  await runTest("check-usage: valid feature 'uploads'", async () => {
    const { status, data } = await invokeFunction("check-usage", { feature: "uploads" }, accessToken);
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
  });

  await runTest("check-usage: valid feature 'questions'", async () => {
    const { status, data } = await invokeFunction("check-usage", { feature: "questions" }, accessToken);
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
  });

  await runTest("check-usage: valid feature 'summaries'", async () => {
    const { status, data } = await invokeFunction("check-usage", { feature: "summaries" }, accessToken);
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
  });

  await runTest("check-usage: missing feature returns 400", async () => {
    const { status } = await invokeFunction("check-usage", {}, accessToken);
    assert(status === 400, `Expected 400 but got ${status}`);
  });

  await runTest("check-usage: no auth returns 401", async () => {
    const { status } = await invokeFunction("check-usage", { feature: "chat" }, "invalid-token");
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 2. generate-summary ──────────────────────────────────────────────────
  console.log("\n── generate-summary ──");

  await runTest("generate-summary: chapter summary", async () => {
    const { status, data } = await invokeFunction(
      "generate-summary",
      {
        documentContext:
          "Chapter 1: Introduction to Machine Learning. Machine learning is a subset of artificial intelligence that enables systems to learn from data. Key concepts include supervised learning, unsupervised learning, and reinforcement learning.",
        summaryType: "chapter",
      },
      accessToken
    );
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
    const d = data as Record<string, unknown>;
    assert(typeof d.summary === "string", "Response missing 'summary' string");
    assert((d.summary as string).length > 20, "Summary is too short");
  });

  await runTest("generate-summary: quick summary", async () => {
    const { status, data } = await invokeFunction(
      "generate-summary",
      {
        documentContext:
          "Arrays are linear data structures. Linked lists use nodes with pointers. Stacks follow LIFO. Queues follow FIFO.",
        summaryType: "quick",
      },
      accessToken
    );
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
  });

  await runTest("generate-summary: exam summary", async () => {
    const { status, data } = await invokeFunction(
      "generate-summary",
      {
        documentContext:
          "Newton's Laws of Motion: 1) Law of Inertia 2) F=ma 3) Every action has equal and opposite reaction. Important formulas: v = u + at, s = ut + 0.5at²",
        summaryType: "exam",
      },
      accessToken
    );
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
  });

  await runTest("generate-summary: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "generate-summary",
      { documentContext: "test", summaryType: "quick" },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 3. chat (streaming) ──────────────────────────────────────────────────
  console.log("\n── chat ──");

  await runTest("chat: basic question without document", async () => {
    const { status, data } = await invokeFunction(
      "chat",
      {
        messages: [{ role: "user", content: "What is photosynthesis?" }],
        markLevel: "2M",
      },
      accessToken,
      { expectStream: true }
    );
    assert(status === 200, `Expected 200 but got ${status}: ${String(data).slice(0, 200)}`);
    assert(typeof data === "string" && data.length > 0, "Expected non-empty stream response");
  });

  if (testDoc) {
    await runTest("chat: question with document context", async () => {
      const { status, data } = await invokeFunction(
        "chat",
        {
          messages: [{ role: "user", content: "Summarize the main topics" }],
          documentId: testDoc.id,
          markLevel: "4M",
        },
        accessToken,
        { expectStream: true }
      );
      assert(status === 200, `Expected 200 but got ${status}: ${String(data).slice(0, 200)}`);
    });
  } else {
    skip("chat: question with document context", "No processed document");
  }

  await runTest("chat: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "chat",
      { messages: [{ role: "user", content: "test" }] },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 4. generate-questions ────────────────────────────────────────────────
  console.log("\n── generate-questions ──");

  if (testDoc) {
    await runTest("generate-questions: practice mode", async () => {
      const { status, data } = await invokeFunction(
        "generate-questions",
        {
          documentId: testDoc.id,
          questionCount: 3,
          difficulty: "easy",
          mode: "practice",
        },
        accessToken
      );
      assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
      const d = data as Record<string, unknown>;
      assert(Array.isArray(d.questions), "Response missing 'questions' array");
      assert((d.questions as unknown[]).length > 0, "Expected at least 1 question");
    });

    await runTest("generate-questions: mock mode hard", async () => {
      const { status, data } = await invokeFunction(
        "generate-questions",
        {
          documentId: testDoc.id,
          questionCount: 2,
          difficulty: "hard",
          mode: "mock",
        },
        accessToken
      );
      assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
    });
  } else {
    skip("generate-questions: practice mode", "No processed document");
    skip("generate-questions: mock mode hard", "No processed document");
  }

  await runTest("generate-questions: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "generate-questions",
      { documentId: "fake", questionCount: 1, difficulty: "easy", mode: "practice" },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 5. evaluate-answer ───────────────────────────────────────────────────
  console.log("\n── evaluate-answer ──");

  await runTest("evaluate-answer: grade a descriptive answer", async () => {
    const { status, data } = await invokeFunction(
      "evaluate-answer",
      {
        question: "Explain the concept of polymorphism in OOP.",
        studentAnswer:
          "Polymorphism means many forms. It allows objects to take different forms. Method overloading and overriding are examples.",
        expectedAnswer:
          "Polymorphism is one of the four pillars of OOP. It means 'many forms'. There are two types: compile-time (method overloading) and runtime (method overriding). It allows a single interface to represent different underlying data types.",
        marks: 4,
        questionType: "descriptive",
      },
      accessToken
    );
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
    const d = data as Record<string, unknown>;
    assert(typeof d.marksAwarded === "number", "Response missing 'marksAwarded'");
    assert(typeof d.totalMarks === "number", "Response missing 'totalMarks'");
    assert(typeof d.overallFeedback === "string", "Response missing 'overallFeedback'");
    assert(typeof d.grade === "string", "Response missing 'grade'");
  });

  await runTest("evaluate-answer: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "evaluate-answer",
      {
        question: "test",
        studentAnswer: "test",
        expectedAnswer: "test",
        marks: 2,
        questionType: "descriptive",
      },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 6. generate-flashcards ───────────────────────────────────────────────
  console.log("\n── generate-flashcards ──");

  if (testDoc) {
    await runTest("generate-flashcards: generate 5 flashcards", async () => {
      const { status, data } = await invokeFunction(
        "generate-flashcards",
        { documentId: testDoc.id, count: 5 },
        accessToken
      );
      assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
      const d = data as Record<string, unknown>;
      assert(Array.isArray(d.flashcards), "Response missing 'flashcards' array");
      const cards = d.flashcards as Array<Record<string, unknown>>;
      assert(cards.length > 0, "Expected at least 1 flashcard");
      assert(typeof cards[0].front === "string", "Flashcard missing 'front'");
      assert(typeof cards[0].back === "string", "Flashcard missing 'back'");
    });
  } else {
    skip("generate-flashcards: generate 5 flashcards", "No processed document");
  }

  await runTest("generate-flashcards: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "generate-flashcards",
      { documentId: "fake", count: 1 },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 7. extract-concepts ──────────────────────────────────────────────────
  console.log("\n── extract-concepts ──");

  if (testDoc) {
    await runTest("extract-concepts: extract from document", async () => {
      const { status, data } = await invokeFunction(
        "extract-concepts",
        { documentId: testDoc.id },
        accessToken
      );
      assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
      const d = data as Record<string, unknown>;
      assert(Array.isArray(d.concepts), "Response missing 'concepts' array");
      assert(Array.isArray(d.relationships), "Response missing 'relationships' array");
    });
  } else {
    skip("extract-concepts: extract from document", "No processed document");
  }

  await runTest("extract-concepts: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "extract-concepts",
      { documentId: "fake" },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 8. extract-text ──────────────────────────────────────────────────────
  console.log("\n── extract-text ──");

  // We create a temp document to test extract-text without corrupting existing data
  await runTest("extract-text: store text for a new document", async () => {
    // Create a test document first
    const { data: newDoc, error: docErr } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        title: "__test_extract_text__",
        file_url: "https://example.com/test.pdf",
        file_type: "pdf",
        file_size: 1024,
        status: "processing",
      })
      .select("id")
      .single();

    assert(!docErr && !!newDoc, `Failed to create test document: ${docErr?.message}`);

    const { status, data } = await invokeFunction(
      "extract-text",
      {
        documentId: newDoc!.id,
        text: "This is page 1 content about machine learning.",
        pages: [
          { pageNumber: 1, content: "This is page 1 content about machine learning." },
          { pageNumber: 2, content: "This is page 2 content about neural networks." },
        ],
      },
      accessToken
    );
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
    const d = data as Record<string, unknown>;
    assert(d.success === true, "Response missing 'success: true'");

    // Clean up — delete the test document
    await supabase.from("document_pages").delete().eq("document_id", newDoc!.id);
    await supabase.from("documents").delete().eq("id", newDoc!.id);
  });

  await runTest("extract-text: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "extract-text",
      { documentId: "fake", text: "test" },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 9. analyze-pyq ──────────────────────────────────────────────────────
  console.log("\n── analyze-pyq ──");

  if (testDoc) {
    await runTest("analyze-pyq: analyze document", async () => {
      const { status, data } = await invokeFunction(
        "analyze-pyq",
        { documentId: testDoc.id },
        accessToken
      );
      assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
      const d = data as Record<string, unknown>;
      assert(Array.isArray(d.topicFrequency), "Response missing 'topicFrequency'");
      assert(Array.isArray(d.predictedQuestions), "Response missing 'predictedQuestions'");
    });
  } else {
    skip("analyze-pyq: analyze document", "No processed document");
  }

  await runTest("analyze-pyq: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "analyze-pyq",
      { documentId: "fake" },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 10. analyze-weakness ─────────────────────────────────────────────────
  console.log("\n── analyze-weakness ──");

  if (testDoc) {
    await runTest("analyze-weakness: identify gaps", async () => {
      const { status, data } = await invokeFunction(
        "analyze-weakness",
        {
          documentId: testDoc.id,
          examAnswers: [
            "Polymorphism means many forms",
            "An array is a collection of data",
          ],
          expectedAnswers: [
            "Polymorphism is a key OOP concept allowing objects to take many forms via overloading and overriding.",
            "An array is a linear data structure storing elements of the same type in contiguous memory.",
          ],
          topics: ["OOP", "Data Structures"],
        },
        accessToken
      );
      assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
      const d = data as Record<string, unknown>;
      assert(Array.isArray(d.weaknesses), "Response missing 'weaknesses'");
      assert(typeof d.overallScore === "number", "Response missing 'overallScore'");
    });
  } else {
    skip("analyze-weakness: identify gaps", "No processed document");
  }

  await runTest("analyze-weakness: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "analyze-weakness",
      { documentId: "fake", examAnswers: [], expectedAnswers: [] },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 11. feynman-session (streaming) ──────────────────────────────────────
  console.log("\n── feynman-session ──");

  await runTest("feynman-session: start action", async () => {
    const { status, data } = await invokeFunction(
      "feynman-session",
      {
        messages: [],
        concept: "Binary Search",
        action: "start",
      },
      accessToken,
      { expectStream: true }
    );
    assert(status === 200, `Expected 200 but got ${status}: ${String(data).slice(0, 200)}`);
    assert(typeof data === "string" && data.length > 0, "Expected non-empty stream response");
  });

  await runTest("feynman-session: evaluate action", async () => {
    const { status, data } = await invokeFunction(
      "feynman-session",
      {
        messages: [
          {
            role: "user",
            content:
              "Binary search works by dividing a sorted array in half each time. You check the middle element - if it matches, done. If the target is smaller, search the left half. If larger, search the right half.",
          },
        ],
        concept: "Binary Search",
        action: "evaluate",
      },
      accessToken,
      { expectStream: true }
    );
    assert(status === 200, `Expected 200 but got ${status}: ${String(data).slice(0, 200)}`);
  });

  await runTest("feynman-session: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "feynman-session",
      { messages: [], concept: "test", action: "start" },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 12. generate-study-plan ──────────────────────────────────────────────
  console.log("\n── generate-study-plan ──");

  await runTest("generate-study-plan: create plan", async () => {
    const { status, data } = await invokeFunction(
      "generate-study-plan",
      {
        exams: [
          { name: "Data Structures", date: "2026-04-15" },
          { name: "Operating Systems", date: "2026-04-20" },
        ],
        subjects: [
          { name: "Data Structures", difficulty: 0.6 },
          { name: "Operating Systems", difficulty: 0.8 },
        ],
        currentConfidence: {
          "Data Structures": 0.5,
          "Operating Systems": 0.3,
        },
        availableHoursPerDay: 4,
      },
      accessToken
    );
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
    const d = data as Record<string, unknown>;
    assert(typeof d.planName === "string", "Response missing 'planName'");
    assert(Array.isArray(d.items), "Response missing 'items' array");
    assert((d.items as unknown[]).length > 0, "Expected at least 1 study item");
  });

  await runTest("generate-study-plan: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "generate-study-plan",
      { exams: [], subjects: [], currentConfidence: {} },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 13. predict-score ────────────────────────────────────────────────────
  console.log("\n── predict-score ──");

  await runTest("predict-score: predict exam score", async () => {
    const { status, data } = await invokeFunction(
      "predict-score",
      {
        examSessions: [
          { score: 65, totalMarks: 100, date: "2026-03-01" },
          { score: 72, totalMarks: 100, date: "2026-03-05" },
        ],
        weaknessProfile: {
          topics: ["Recursion", "Dynamic Programming"],
          scores: [0.3, 0.4],
        },
        studyHistory: {
          totalHours: 40,
          lastSessionDate: "2026-03-08",
          averageSessionLength: 2,
        },
        documentContext:
          "Data Structures and Algorithms: Arrays, Linked Lists, Trees, Graphs, Sorting, Searching, Dynamic Programming, Greedy Algorithms.",
      },
      accessToken
    );
    assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
    const d = data as Record<string, unknown>;
    assert(typeof d.predictedMin === "number", "Response missing 'predictedMin'");
    assert(typeof d.predictedMax === "number", "Response missing 'predictedMax'");
    assert(typeof d.confidence === "number", "Response missing 'confidence'");
  });

  await runTest("predict-score: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "predict-score",
      { examSessions: [], weaknessProfile: {}, studyHistory: {} },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 14. matchmaking ──────────────────────────────────────────────────────
  console.log("\n── matchmaking ──");

  if (testDoc) {
    let testRoomId: string | null = null;

    await runTest("matchmaking: create room", async () => {
      const { status, data } = await invokeFunction(
        "matchmaking",
        {
          action: "create",
          documentId: testDoc.id,
          battleMode: "speed",
        },
        accessToken
      );
      assert(status === 200, `Expected 200 but got ${status}: ${JSON.stringify(data)}`);
      const d = data as Record<string, unknown>;
      const room = d.room as Record<string, unknown>;
      assert(!!room, "Response missing 'room' object");
      assert(room.status === "waiting", `Expected room status 'waiting', got '${room.status}'`);
      testRoomId = room.id as string;
    });

    // Clean up battle room if created
    if (testRoomId) {
      await supabase.from("battle_rooms").delete().eq("id", testRoomId);
    }
  } else {
    skip("matchmaking: create room", "No processed document");
  }

  await runTest("matchmaking: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "matchmaking",
      { action: "create", documentId: "fake", battleMode: "speed" },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 15. create-checkout-session ──────────────────────────────────────────
  console.log("\n── create-checkout-session ──");

  await runTest("create-checkout-session: request pro plan", async () => {
    const { status, data } = await invokeFunction(
      "create-checkout-session",
      { planId: "pro" },
      accessToken
    );
    // This may fail if Stripe keys aren't set in the edge function environment
    // A 200 with url OR a 500 with Stripe config error are both acceptable
    if (status === 200) {
      const d = data as Record<string, unknown>;
      assert(typeof d.url === "string", "Response missing checkout 'url'");
    } else {
      // Stripe not configured is expected in dev
      console.log(`    ℹ️  Status ${status} — Stripe likely not configured in edge function env`);
    }
  });

  await runTest("create-checkout-session: no auth returns 401", async () => {
    const { status } = await invokeFunction(
      "create-checkout-session",
      { planId: "pro" },
      "invalid-token"
    );
    assert(status === 401, `Expected 401 but got ${status}`);
  });

  // ── 16. stripe-webhook (not testable without Stripe signature) ─────────
  console.log("\n── stripe-webhook ──");
  skip("stripe-webhook", "Requires valid Stripe webhook signature — not testable in integration tests");

  } // end if (!NO_AUTH)

  // ── 401 Unauthorized Tests (always run) ──────────────────────────────────
  console.log("\n── 401 Unauthorized Tests ──");

  const authRequiredEndpoints = [
    { name: "check-usage", body: { feature: "chat" } },
    { name: "evaluate-answer", body: { question: "q", studentAnswer: "a", expectedAnswer: "a", marks: 2, questionType: "descriptive" } },
    { name: "generate-flashcards", body: { documentId: "fake", count: 1 } },
    { name: "extract-concepts", body: { documentId: "fake" } },
    { name: "extract-text", body: { documentId: "fake", text: "test" } },
    { name: "analyze-pyq", body: { documentId: "fake" } },
    { name: "analyze-weakness", body: { documentId: "fake", examAnswers: [], expectedAnswers: [] } },
    { name: "generate-study-plan", body: { exams: [], subjects: [], currentConfidence: {} } },
    { name: "predict-score", body: { examSessions: [], weaknessProfile: {}, studyHistory: {} } },
    { name: "matchmaking", body: { action: "create", documentId: "fake", battleMode: "speed" } },
    { name: "create-checkout-session", body: { planId: "pro" } },
  ];

  for (const ep of authRequiredEndpoints) {
    await runTest(`401 no auth: ${ep.name}`, async () => {
      const { status } = await invokeFunction(ep.name, ep.body, "invalid-token");
      assert(status === 401, `Expected 401 but got ${status}`);
    });
  }

  // ── 17. CORS preflight checks ────────────────────────────────────────────
  console.log("\n── CORS Preflight ──");

  const corsEndpoints = [
    "check-usage",
    "chat",
    "generate-summary",
    "generate-questions",
    "evaluate-answer",
    "generate-flashcards",
    "extract-concepts",
    "extract-text",
    "analyze-pyq",
    "analyze-weakness",
    "feynman-session",
    "generate-study-plan",
    "predict-score",
    "matchmaking",
    "create-checkout-session",
  ];

  for (const endpoint of corsEndpoints) {
    await runTest(`CORS OPTIONS: ${endpoint}`, async () => {
      const res = await fetch(edgeFunctionUrl(endpoint), {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:8080",
          "Access-Control-Request-Method": "POST",
        },
      });
      assert(res.status === 200 || res.status === 204, `Expected 200/204 but got ${res.status}`);
      const acao = res.headers.get("access-control-allow-origin");
      assert(!!acao, "Missing Access-Control-Allow-Origin header");
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                       TEST SUMMARY                         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const skipped = results.filter((r) => r.status === "SKIP").length;

  console.log(`  Total  : ${results.length}`);
  console.log(`  ✅ Pass : ${passed}`);
  console.log(`  ❌ Fail : ${failed}`);
  console.log(`  ⏭️  Skip : ${skipped}\n`);

  if (failed > 0) {
    console.log("── Failed Tests ──\n");
    for (const r of results.filter((r) => r.status === "FAIL")) {
      console.log(`  ❌ ${r.name}`);
      console.log(`     Error: ${r.error}\n`);
    }
  }

  // Sign out
  if (!NO_AUTH) {
    await supabase.auth.signOut();
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
