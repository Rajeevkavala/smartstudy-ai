import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const { messages, documentContext, markLevel } = await req.json();

    // Build the system prompt based on mark level
    const markInstructions = {
      "2M": "Provide a brief, concise answer in 2-3 sentences. Focus only on the key point.",
      "4M": "Provide a short answer with 4-5 key points. Include brief explanations.",
      "8M": "Provide a detailed answer with comprehensive coverage. Include definitions, explanations, and examples.",
      "16M": "Provide an exhaustive answer covering all aspects. Include definitions, detailed explanations, multiple examples, diagrams descriptions, and comparisons where applicable.",
    };

    const systemPrompt = `You are SmartExam AI, an intelligent study assistant that helps students prepare for exams. You answer questions based on the provided document context.

${documentContext ? `DOCUMENT CONTEXT:\n${documentContext}\n\n` : ""}

ANSWER FORMAT INSTRUCTIONS:
${markInstructions[markLevel as keyof typeof markInstructions] || markInstructions["4M"]}

Always structure your answers clearly with:
- A clear opening statement
- Key points (numbered or bulleted)
- Examples where relevant
- A brief conclusion if appropriate

If the question cannot be answered from the document context, politely indicate that and provide general guidance based on your knowledge.`;

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
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: markLevel === "16M" ? 2000 : markLevel === "8M" ? 1200 : markLevel === "4M" ? 600 : 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
