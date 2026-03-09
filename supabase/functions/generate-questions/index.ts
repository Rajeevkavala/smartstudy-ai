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

    const { documentId, questionCount = 5, difficulty = "medium", mode = "practice" } = await req.json();
    const ragContext = await buildDocumentContext(
      supabase,
      documentId,
      `${difficulty} ${mode} exam questions`
    );

    const systemPrompt = `You are an exam question generator. Based on the provided study excerpts, generate ${questionCount} exam-style questions.

DOCUMENT TITLE: ${ragContext.document.title}
RELEVANT EXCERPTS:
${ragContext.context}

REQUIREMENTS:
- Difficulty level: ${difficulty}
- Question type: Mix of conceptual, application, and analytical questions
- Mode: ${mode === "mock" ? "Full exam format with time estimates" : "Practice questions with hints"}
- Keep every question anchored in the provided excerpts and page references

Return the questions in this JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "type": "conceptual|application|analytical",
      "marks": 2|4|8|16,
      "expectedAnswer": "Key points that should be in the answer",
      "hint": "A helpful hint for practice mode"
    }
  ]
}`;

    const questions = await callGroqJson({
      apiKey: groqApiKey,
      systemPrompt,
      userPrompt: "Generate the exam questions based on the provided excerpts.",
      temperature: 0.7,
      maxTokens: 2200,
    });

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Generate questions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
