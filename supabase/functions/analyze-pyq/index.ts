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
    const ragContext = await buildDocumentContext(supabase, documentId, "past year questions marks trends repeated topics important questions", {
      maxExcerpts: 10,
      maxCharacters: 11_000,
    });

    const systemPrompt = `You are a Previous Year Question (PYQ) pattern analyzer. Analyze the provided question-paper excerpts and identify patterns.

DOCUMENT TITLE: ${ragContext.document.title}
QUESTION PAPER EXCERPTS:
${ragContext.context}

Analyze and return JSON:
{
  "topicFrequency": [
    {
      "topic": "Topic name",
      "frequency": number,
      "totalMarks": number,
      "trend": "increasing|stable|decreasing",
      "lastAppeared": "Year/Session"
    }
  ],
  "predictedQuestions": [
    {
      "question": "Predicted question text",
      "topic": "Topic",
      "probability": 0.0-1.0,
      "marks": number,
      "reasoning": "Why this is likely to appear"
    }
  ],
  "markDistribution": {
    "2M": number,
    "4M": number,
    "8M": number,
    "16M": number
  },
  "importantTopics": ["Topic1", "Topic2"],
  "safeToSkip": ["Topic with very low frequency"],
  "insights": "Overall analysis summary"
}

Base your analysis only on the supplied question-paper excerpts.`;

    const analysis = await callGroqJson({
      apiKey: groqApiKey,
      systemPrompt,
      userPrompt: "Analyze these previous year question excerpts and predict likely future questions.",
      temperature: 0.2,
      maxTokens: 2800,
    });

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analyze PYQ error:", e);
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
