import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildDocumentContext,
  callGroqJson,
  corsHeaders,
  createUserClient,
  requireGroqApiKey,
  requireUser,
} from "../_shared/ai.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqApiKey = requireGroqApiKey();

    const supabase = createUserClient(authHeader);
    await requireUser(supabase);

    const { documentId, count = 10 } = await req.json();
    const ragContext = await buildDocumentContext(supabase, documentId, "flashcards key concepts definitions applications", {
      maxExcerpts: 8,
      maxCharacters: 10_000,
    });

    const systemPrompt = `You are a flashcard generator. Create high-quality flashcards from the study excerpts for spaced repetition.

DOCUMENT TITLE: ${ragContext.document.title}
RELEVANT EXCERPTS:
${ragContext.context}

Generate ${count} flashcards in JSON format:
{
  "flashcards": [
    {
      "front": "Question or prompt (clear, specific)",
      "back": "Answer (concise but complete)",
      "tags": ["topic1", "topic2"]
    }
  ]
}

Rules:
- Questions should test understanding, not just recall
- Answers should be concise but complete
- Mix question types: definitions, explanations, applications
- Tag each card with relevant topics
- Avoid yes/no questions
- Make questions specific enough to have one clear answer
- Use only the supplied study excerpts`;

    const flashcards = await callGroqJson({
      apiKey: groqApiKey,
      systemPrompt,
      userPrompt: `Generate ${count} flashcards from the supplied study excerpts.`,
      temperature: 0.5,
      maxTokens: 2600,
    });

    return new Response(JSON.stringify(flashcards), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Generate flashcards error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
