import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildDocumentContext,
  callGroqJson,
  corsHeaders,
  createServiceRoleClient,
  createUserClient,
  requireGroqApiKey,
  requireUser,
} from "../_shared/ai.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const groqApiKey = requireGroqApiKey();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createUserClient(authHeader);
    const serviceSupabase = createServiceRoleClient();

    let user;
    try {
      user = await requireUser(supabase);
    } catch {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, documentId, battleMode, mode, roomId } = await req.json();

    if (action === "create") {
      // Create a battle room
      const { data: room, error } = await supabase
        .from("battle_rooms")
        .insert({
          host_id: user.id,
          document_id: documentId,
          mode: battleMode || mode || "speed",
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ room }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "join") {

      // Join an existing battle room
      const { data: room, error } = await supabase
        .from("battle_rooms")
        .update({
          opponent_id: user.id,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("id", roomId)
        .eq("status", "waiting")
        .select()
        .single();

      if (error || !room) {
        return new Response(
          JSON.stringify({ error: "Room not found or already started" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Generate questions for the battle
      if (room.document_id) {
        const ragContext = await buildDocumentContext(
          serviceSupabase,
          room.document_id,
          "quick fire MCQ battle questions",
          { maxExcerpts: 8, maxCharacters: 9_000 }
        );

        const questions = await callGroqJson({
          apiKey: groqApiKey,
          systemPrompt: `Generate 10 quick-fire multiple-choice battle questions from the supplied study excerpts.

DOCUMENT TITLE: ${ragContext.document.title}
DOCUMENT EXCERPTS:
${ragContext.context}

Return JSON:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "timeLimit": 15
    }
  ]
}

Rules:
- Exactly 4 options per question
- Exactly one correct answer
- Keep questions short and fast-paced
- Use only the supplied excerpts`,
          userPrompt: "Generate battle questions.",
          temperature: 0.6,
          maxTokens: 2200,
        });

        await serviceSupabase
          .from("battle_rooms")
          .update({ questions })
          .eq("id", roomId);

        room.questions = questions;
      }

      return new Response(JSON.stringify({ room }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Matchmaking error:", e);
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
