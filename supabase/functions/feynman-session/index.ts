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

    const groqApiKey = requireGroqApiKey();

    const supabase = createUserClient(authHeader);
    await requireUser(supabase);

    const { messages = [], documentId, concept, action } = await req.json();
    const queryText = action === "start"
      ? concept || "core concepts"
      : [...messages].reverse().find((message) => message.role === "user")?.content || concept || "concept explanation";
    const ragContext = documentId
      ? await buildDocumentContext(supabase, documentId, queryText, {
          maxExcerpts: action === "start" ? 4 : 6,
          maxCharacters: action === "start" ? 6_000 : 8_000,
        })
      : null;

    let systemPrompt: string;

    if (action === "start") {
      systemPrompt = `You are a Feynman Teaching Mode AI. You implement the Feynman Technique by making the student teach the idea back in simple language.

${ragContext ? `DOCUMENT TITLE: ${ragContext.document.title}
DOCUMENT EXCERPTS:
${ragContext.context}

` : ""}Select a key concept from the document${concept ? ` (preferably: "${concept}")` : ""} and ask the student to explain it as if teaching a 10-year-old.

Rules:
- Pick ONE specific concept
- Ask them to explain it simply
- Be encouraging but rigorous
- Your response should ONLY ask the question, nothing else
- Choose a concept that is clearly supported by the supplied excerpts
- Mention page references like [Page 2] if you point the student to source material`;
    } else {
      systemPrompt = `You are evaluating a student's explanation using the Feynman Technique.

${ragContext ? `DOCUMENT TITLE: ${ragContext.document.title}
DOCUMENT EXCERPTS:
${ragContext.context}

` : ""}The student just explained a concept. Evaluate their explanation for:

1. **Accuracy** - Are the facts correct?
2. **Completeness** - Did they cover all key aspects?
3. **Clarity** - Would a 10-year-old understand?
4. **Simplicity** - Did they avoid jargon?

Provide your response in this format:
- Start with a score: "📊 **Teaching Score: X/10**"
- List what they got right ✅
- List what they missed or got wrong ❌
- Suggest improvements 💡
- If they did well, ask a follow-up: "Can you also explain how [concept] connects to [related concept]?"
- If they struggled, provide a brief clear explanation to help fill the gaps
- Cite document support as [Page X] when using the supplied excerpts`;
    }

    const response = await callGroqStream({
      apiKey: groqApiKey,
      systemPrompt,
      messages,
      temperature: 0.6,
      maxTokens: 1500,
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Feynman session error:", e);
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
