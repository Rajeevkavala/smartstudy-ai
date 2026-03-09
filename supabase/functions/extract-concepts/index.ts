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

    const { documentId } = await req.json();
    const ragContext = await buildDocumentContext(
      supabase,
      documentId,
      "key concepts definitions relationships dependencies",
      { maxExcerpts: 10, maxCharacters: 11_000 }
    );

    const systemPrompt = `You are a knowledge extraction engine. Extract key concepts from the supplied study excerpts and identify relationships between them.

DOCUMENT TITLE: ${ragContext.document.title}
DOCUMENT EXCERPTS:
${ragContext.context}

Extract concepts and return JSON:
{
  "concepts": [
    {
      "name": "Concept name",
      "definition": "Brief definition",
      "category": "Category/Topic",
      "importanceScore": 0.0-1.0
    }
  ],
  "relationships": [
    {
      "from": "Concept A name",
      "to": "Concept B name",
      "type": "depends_on|is_part_of|related_to|contradicts|example_of",
      "strength": 0.0-1.0
    }
  ]
}

Rules:
- Extract 10-30 key concepts
- Identify meaningful relationships
- Use clear, concise definitions
- Score importance based on how fundamental a concept is
- Use only the supplied excerpts`;

    const concepts = await callGroqJson({
      apiKey: groqApiKey,
      systemPrompt,
      userPrompt: "Extract concepts and relationships from these study excerpts.",
      temperature: 0.3,
      maxTokens: 3000,
    });

    return new Response(JSON.stringify(concepts), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Extract concepts error:", e);
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
