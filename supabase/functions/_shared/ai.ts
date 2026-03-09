import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = "llama-3.3-70b-versatile";

type DocumentRow = {
  id: string;
  title: string;
  status: string | null;
  extracted_text: string | null;
  page_count: number | null;
};

type DocumentPageRow = {
  page_number: number;
  content: string;
};

type DocumentSegment = {
  pageNumber: number;
  segmentIndex: number;
  text: string;
  score: number;
};

export type RagContext = {
  document: Pick<DocumentRow, "id" | "title" | "status" | "page_count">;
  context: string;
  citations: number[];
  excerptCount: number;
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function requireGroqApiKey() {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured in the Supabase Edge Function environment. Set it with: supabase secrets set GROQ_API_KEY=your_key"
    );
  }
  return apiKey;
}

export function createUserClient(authHeader: string) {
  return createClient(getRequiredEnv("SUPABASE_URL"), getRequiredEnv("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: authHeader } },
  });
}

export function createServiceRoleClient() {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export async function requireUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

async function getDocumentRecord(supabase: SupabaseClient, documentId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, status, extracted_text, page_count")
    .eq("id", documentId)
    .single<DocumentRow>();

  if (error || !data) {
    throw new Error("Document not found or access denied");
  }

  return data;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function tokenize(value: string) {
  return Array.from(
    new Set(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 2)
    )
  );
}

function countOccurrences(haystack: string, needle: string) {
  const matches = haystack.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
  return matches?.length ?? 0;
}

function splitIntoSegments(pageNumber: number, content: string) {
  const normalized = normalizeWhitespace(content);
  if (!normalized) {
    return [] as DocumentSegment[];
  }

  const words = normalized.split(" ");
  const windowSize = 220;
  const overlap = 40;

  if (words.length <= windowSize) {
    return [{ pageNumber, segmentIndex: 0, text: normalized, score: 0 }];
  }

  const segments: DocumentSegment[] = [];
  let start = 0;
  let segmentIndex = 0;

  while (start < words.length) {
    const slice = words.slice(start, start + windowSize).join(" ").trim();
    if (slice) {
      segments.push({ pageNumber, segmentIndex, text: slice, score: 0 });
      segmentIndex += 1;
    }

    if (start + windowSize >= words.length) {
      break;
    }

    start += windowSize - overlap;
  }

  return segments;
}

function scoreSegment(segment: DocumentSegment, query: string) {
  const lowered = segment.text.toLowerCase();
  const terms = tokenize(query);

  if (terms.length === 0) {
    return 1 / (segment.pageNumber + segment.segmentIndex + 1);
  }

  let score = 0;
  const normalizedQuery = normalizeWhitespace(query).toLowerCase();

  if (normalizedQuery && lowered.includes(normalizedQuery)) {
    score += 12;
  }

  for (const term of terms) {
    const occurrences = countOccurrences(lowered, term);
    if (occurrences > 0) {
      score += occurrences * 4;
      if (lowered.startsWith(term) || lowered.includes(`${term}:`)) {
        score += 1;
      }
    }
  }

  score += Math.max(0, 2 - segment.segmentIndex * 0.25);
  score += Math.max(0, 1.5 - (segment.pageNumber - 1) * 0.05);

  return score;
}

export async function buildDocumentContext(
  supabase: SupabaseClient,
  documentId: string,
  query: string,
  options?: {
    maxExcerpts?: number;
    maxCharacters?: number;
  }
): Promise<RagContext> {
  const document = await getDocumentRecord(supabase, documentId);

  const { data: pages, error: pagesError } = await supabase
    .from("document_pages")
    .select("page_number, content")
    .eq("document_id", documentId)
    .order("page_number", { ascending: true })
    .returns<DocumentPageRow[]>();

  if (pagesError) {
    throw pagesError;
  }

  const segments = (pages ?? []).flatMap((page) => splitIntoSegments(page.page_number, page.content));

  if (segments.length === 0 && document.extracted_text) {
    segments.push(...splitIntoSegments(1, document.extracted_text));
  }

  if (segments.length === 0) {
    throw new Error("Document content is not available yet. Re-upload the PDF or wait for processing to finish.");
  }

  const rankedSegments = segments
    .map((segment) => ({ ...segment, score: scoreSegment(segment, query) }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (left.pageNumber !== right.pageNumber) {
        return left.pageNumber - right.pageNumber;
      }
      return left.segmentIndex - right.segmentIndex;
    });

  const maxExcerpts = options?.maxExcerpts ?? 6;
  const maxCharacters = options?.maxCharacters ?? 8_000;
  const selected: DocumentSegment[] = [];
  const seenKeys = new Set<string>();
  let totalCharacters = 0;

  for (const segment of rankedSegments) {
    const key = `${segment.pageNumber}-${segment.segmentIndex}`;
    if (seenKeys.has(key)) {
      continue;
    }

    const block = `[Page ${segment.pageNumber}]\n${segment.text}`;
    if (selected.length > 0 && totalCharacters + block.length > maxCharacters) {
      continue;
    }

    selected.push(segment);
    seenKeys.add(key);
    totalCharacters += block.length;

    if (selected.length >= maxExcerpts || totalCharacters >= maxCharacters) {
      break;
    }
  }

  const finalSegments = selected.length > 0 ? selected : rankedSegments.slice(0, Math.min(maxExcerpts, rankedSegments.length));
  const citations = Array.from(new Set(finalSegments.map((segment) => segment.pageNumber))).sort((a, b) => a - b);
  const context = finalSegments
    .map((segment) => `[Page ${segment.pageNumber}]\n${segment.text}`)
    .join("\n\n");

  return {
    document: {
      id: document.id,
      title: document.title,
      status: document.status,
      page_count: document.page_count,
    },
    context,
    citations,
    excerptCount: finalSegments.length,
  };
}

export async function callGroqJson(options: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 1800,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  return JSON.parse(payload.choices?.[0]?.message?.content ?? "{}");
}

export async function callGroqStream(options: {
  apiKey: string;
  systemPrompt: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}) {
  return fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: options.systemPrompt }, ...options.messages],
      stream: true,
      temperature: options.temperature ?? 0.5,
      max_tokens: options.maxTokens ?? 1200,
    }),
  });
}