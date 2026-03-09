import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceRoleClient, corsHeaders } from "../_shared/ai.ts";

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

    const supabase = createServiceRoleClient();

    const { documentId, text, pages } = await req.json();

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "documentId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update document status to extracting
    await supabase
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // If pages array is provided, insert per-page content
    if (pages && Array.isArray(pages)) {
      await supabase.from("document_pages").delete().eq("document_id", documentId);

      const pageRows = pages.map(
        (page: { pageNumber: number; content: string }) => ({
          document_id: documentId,
          page_number: page.pageNumber,
          content: page.content,
          word_count: page.content.split(/\s+/).length,
        })
      );

      const { error: pagesError } = await supabase
        .from("document_pages")
        .upsert(pageRows, {
          onConflict: "document_id,page_number",
        });

      if (pagesError) {
        console.error("Pages insert error:", pagesError);
      }
    }

    // Update document with full extracted text and set status to ready
    const fullText = text || (pages ? pages.map((p: { content: string }) => p.content).join("\n\n") : "");
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        extracted_text: fullText,
        status: "ready",
        page_count: pages ? pages.length : null,
      })
      .eq("id", documentId);

    if (updateError) {
      await supabase
        .from("documents")
        .update({ status: "error" })
        .eq("id", documentId);

      return new Response(JSON.stringify({ error: "Failed to update document" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, pageCount: pages?.length || 0 }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Extract text error:", e);
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
