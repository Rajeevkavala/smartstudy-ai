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

    const { examSessions, weaknessProfile, studyHistory, documentContext } =
      await req.json();

    const systemPrompt = `You are a predictive analytics engine for student exam performance. Based on the data provided, predict the student's exam score.

STUDY DATA:
- Exam sessions: ${JSON.stringify(examSessions)}
- Weakness profile: ${JSON.stringify(weaknessProfile)}
- Study history: ${JSON.stringify(studyHistory)}

${documentContext ? `DOCUMENT CONTEXT:\n${documentContext}` : ""}

Analyze patterns and return a JSON prediction:
{
  "predictedMin": 0-100,
  "predictedMax": 0-100,
  "confidence": 0.0-1.0,
  "factors": {
    "topicCoverage": 0.0-1.0,
    "consistency": 0.0-1.0,
    "weaknessImprovement": 0.0-1.0,
    "practiceVolume": 0.0-1.0
  },
  "suggestions": [
    "Study X more hours on Topic Y to improve by Z%",
    "Focus on weak area: ..."
  ],
  "riskAreas": ["Topic that could lower score"],
  "strongAreas": ["Topic you'll likely ace"]
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
          {
            role: "user",
            content: "Predict my exam score based on my study data.",
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to predict score" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const prediction = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Predict score error:", e);
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
