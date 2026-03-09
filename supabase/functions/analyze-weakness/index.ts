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

    const { examAnswers, expectedAnswers, documentId, topics } = await req.json();
    const ragContext = await buildDocumentContext(
      supabase,
      documentId,
      `${topics?.join(" ") ?? ""} weak spots misconceptions difficult topics`
    );

    const systemPrompt = `You are an expert learning analyst. Analyze the study material and the student's performance signals to identify weak areas.

DOCUMENT TITLE: ${ragContext.document.title}
DOCUMENT EXCERPTS:
${ragContext.context}

STUDENT'S ANSWERS:
${JSON.stringify(examAnswers ?? [])}

EXPECTED ANSWERS:
${JSON.stringify(expectedAnswers ?? [])}

TOPICS COVERED: ${topics?.join(", ") || "General"}

Analyze each answer and return a JSON response:
{
  "weaknesses": [
    {
      "topic": "Topic name",
      "subtopic": "Specific subtopic",
      "confidenceScore": 0.0-1.0,
      "reason": "Why this is a weak area",
      "microLessons": [
        {
          "title": "Lesson title",
          "content": "Brief lesson content in markdown",
          "type": "explanation|example|practice|mnemonic"
        }
      ]
    }
  ],
  "strengths": ["Topic1", "Topic2"],
  "overallScore": 0.0-1.0,
  "improvementPlan": "Brief description of what to focus on"
}

If no exam answers are provided, infer likely weak spots from the conceptual density and prerequisite structure of the material.`;

    const analysis = await callGroqJson({
      apiKey: groqApiKey,
      systemPrompt,
      userPrompt: "Analyze the weaknesses and suggest micro-lessons grounded in the supplied excerpts.",
      temperature: 0.2,
      maxTokens: 2200,
    });

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analyze weakness error:", e);
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
