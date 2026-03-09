import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildDocumentContext,
  callGroqStream,
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

    const supabase = createUserClient(authHeader);
    await requireUser(supabase);
    const groqApiKey = requireGroqApiKey();

    const { messages = [], documentId, markLevel } = await req.json();
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
    const ragContext = documentId
      ? await buildDocumentContext(supabase, documentId, latestUserMessage?.content ?? "")
      : null;

    // Build the system prompt based on mark level
    const markInstructions = {
      "2M": "Provide a brief, concise answer in 2-3 sentences. Focus only on the key point.",
      "4M": "Provide a short answer with 4-5 key points. Include brief explanations.",
      "8M": "Provide a detailed answer with comprehensive coverage. Include definitions, explanations, and examples.",
      "16M": "Provide an exhaustive answer covering all aspects. Include definitions, detailed explanations, multiple examples, diagrams descriptions, and comparisons where applicable.",
    };

    const systemPrompt = `You are SmartExam AI, an intelligent study assistant that helps students prepare for exams. You answer questions using the grounded study excerpts first, and only use general knowledge when the answer is not contained in the material.

${ragContext ? `DOCUMENT TITLE: ${ragContext.document.title}\nDOCUMENT EXCERPTS:\n${ragContext.context}\n\n` : ""}

ANSWER FORMAT INSTRUCTIONS:
${markInstructions[markLevel as keyof typeof markInstructions] || markInstructions["4M"]}

Always structure your answers clearly with:
- A clear opening statement
- Key points (numbered or bulleted)
- Examples where relevant
- A brief conclusion if appropriate
- Cite supporting excerpts using page references like [Page 3] whenever you rely on the document.

If the question cannot be answered from the document excerpts, say that directly and then provide the best general guidance you can.`;

    const response = await callGroqStream({
      apiKey: groqApiKey,
      systemPrompt,
      messages,
      temperature: 0.6,
      maxTokens: markLevel === "16M" ? 2000 : markLevel === "8M" ? 1200 : markLevel === "4M" ? 700 : 400,
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
