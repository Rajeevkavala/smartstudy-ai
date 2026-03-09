import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Verify the user from the auth token (do not trust userId from body)
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { feature } = await req.json();
    const userId = user.id;

    if (!feature) {
      return new Response(
        JSON.stringify({ error: "feature is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .maybeSingle();

    const plan = subscription?.plan || "free";

    // Define limits per plan
    const limits: Record<string, Record<string, number>> = {
      free: { chat: 10, questions: 10, summaries: 3, uploads: 3 },
      pro: { chat: 100, questions: 50, summaries: 20, uploads: 50 },
      university: {
        chat: 999999,
        questions: 999999,
        summaries: 999999,
        uploads: 999999,
      },
    };

    const limit = limits[plan]?.[feature] ?? 0;

    // Get current usage for today's period
    const today = new Date().toISOString().split("T")[0];
    const { data: usage } = await supabase
      .from("usage_tracking")
      .select("count")
      .eq("user_id", userId)
      .eq("feature", feature)
      .eq("period_start", today)
      .maybeSingle();

    const currentCount = usage?.count || 0;
    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount);
    const percentage = limit > 0 ? Math.round((currentCount / limit) * 100) : 0;

    // If allowed, increment the count
    if (allowed) {
      if (usage) {
        await supabase
          .from("usage_tracking")
          .update({ count: currentCount + 1 })
          .eq("user_id", userId)
          .eq("feature", feature)
          .eq("period_start", today);
      } else {
        await supabase.from("usage_tracking").insert({
          user_id: userId,
          feature,
          count: 1,
          period_start: today,
          period_end: today,
        });
      }
    }

    return new Response(
      JSON.stringify({
        allowed,
        currentCount: allowed ? currentCount + 1 : currentCount,
        limit,
        remaining: allowed ? remaining - 1 : remaining,
        percentage: allowed
          ? Math.round(((currentCount + 1) / limit) * 100)
          : percentage,
        plan,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Check usage error:", e);
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
