import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGroqJson, corsHeaders, requireGroqApiKey } from "../_shared/ai.ts";

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

    const { exams, subjects, currentConfidence, availableHoursPerDay } =
      await req.json();

    const systemPrompt = `You are an AI study planner. Create an optimal day-by-day study schedule.

EXAMS:
${JSON.stringify(exams)}

SUBJECTS & DIFFICULTY:
${JSON.stringify(subjects)}

STUDENT'S CURRENT CONFIDENCE: ${JSON.stringify(currentConfidence)}
AVAILABLE HOURS PER DAY: ${availableHoursPerDay || 4}

Rules for the study plan:
- Harder subjects get more time
- Space out study sessions (don't cram)
- Include revision slots before each exam
- Add break days (every 6-7 days of study)
- Account for diminishing returns (no topic > 3 hours straight)
- Prioritize weak areas first

Return a JSON response:
{
  "planName": "Study Plan for [exams]",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "items": [
    {
      "title": "Study session title",
      "description": "What to cover",
      "scheduledDate": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "durationMinutes": 30-120,
      "priority": "low|medium|high|critical",
      "subject": "Subject name"
    }
  ],
  "tips": ["Study tips for this plan"],
  "weeklyHours": number
}`;

    const plan = await callGroqJson({
      apiKey: groqApiKey,
      systemPrompt,
      userPrompt: "Create my optimal study plan.",
      temperature: 0.5,
      maxTokens: 3000,
    });

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Generate study plan error:", e);
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
