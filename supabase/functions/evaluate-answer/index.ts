import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const { studentAnswer, expectedAnswer, marks, questionType, question } =
      await req.json();

    const systemPrompt = `You are a university exam evaluator. Grade the student's written answer exactly like a university examiner would.

QUESTION: ${question}
QUESTION TYPE: ${questionType || "descriptive"}
TOTAL MARKS: ${marks}

EXPECTED ANSWER/KEY POINTS:
${expectedAnswer}

STUDENT'S ANSWER:
${studentAnswer}

Provide evaluation in this JSON format:
{
  "marksAwarded": number,
  "totalMarks": ${marks},
  "percentage": number,
  "rubricBreakdown": [
    {
      "criterion": "Definition/Introduction",
      "maxMarks": number,
      "awarded": number,
      "status": "full|partial|missing",
      "feedback": "What was good/missing"
    }
  ],
  "overallFeedback": "General comments on the answer",
  "improvements": ["Specific thing to add/change"],
  "modelAnswer": "The ideal answer for comparison",
  "grade": "A+|A|B+|B|C+|C|D|F"
}`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Evaluate my answer." },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to evaluate answer" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Evaluate answer error:", e);
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
