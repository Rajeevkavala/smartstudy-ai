import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFlashcards(documentId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cardsQuery = useQuery({
    queryKey: ["flashcards", user?.id, documentId],
    queryFn: async () => {
      let query = supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user!.id)
        .order("next_review_date", { ascending: true });
      if (documentId) query = query.eq("document_id", documentId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const dueCards = cardsQuery.data?.filter(
    (c) => new Date(c.next_review_date) <= new Date()
  ) || [];

  const generateCards = useMutation({
    mutationFn: async (docId: string) => {
      const { data: document, error: documentError } = await supabase
        .from("documents")
        .select("id, status")
        .eq("id", docId)
        .eq("user_id", user!.id)
        .single();
      if (documentError) throw documentError;
      if (document.status !== "ready") {
        throw new Error("Document indexing is still in progress. Please wait until processing finishes.");
      }

      const res = await supabase.functions.invoke("generate-flashcards", {
        body: { documentId: docId, count: 10 },
      });
      if (res.error) throw res.error;

      const generatedCards = Array.isArray(res.data?.flashcards) ? res.data.flashcards : [];
      if (generatedCards.length === 0) {
        throw new Error("No flashcards were generated for this document.");
      }

      const { error: deleteError } = await supabase
        .from("flashcards")
        .delete()
        .eq("user_id", user!.id)
        .eq("document_id", docId);
      if (deleteError) throw deleteError;

      const { data, error } = await supabase
        .from("flashcards")
        .insert(
          generatedCards.map((card) => ({
            user_id: user!.id,
            document_id: docId,
            front: card.front,
            back: card.back,
            tags: Array.isArray(card.tags) ? card.tags : [],
          }))
        )
        .select("*");
      if (error) throw error;

      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["flashcards"] }),
  });

  const reviewCard = useMutation({
    mutationFn: async ({ cardId, quality }: { cardId: string; quality: number }) => {
      // SM-2 algorithm
      const card = cardsQuery.data?.find((c) => c.id === cardId);
      if (!card) throw new Error("Card not found");

      let ef = card.ease_factor ?? 2.5;
      let interval = card.interval_days ?? 0;
      let reps = card.repetitions ?? 0;

      if (quality >= 3) {
        if (reps === 0) interval = 1;
        else if (reps === 1) interval = 6;
        else interval = Math.round(interval * ef);
        reps += 1;
      } else {
        reps = 0;
        interval = 1;
      }

      ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (ef < 1.3) ef = 1.3;

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);

      const { error: reviewError } = await supabase.from("flashcard_reviews").insert({
        flashcard_id: cardId,
        user_id: user!.id,
        quality,
        reviewed_at: new Date().toISOString(),
      });
      if (reviewError) throw reviewError;

      const { error } = await supabase
        .from("flashcards")
        .update({
          ease_factor: ef,
          interval_days: interval,
          repetitions: reps,
          next_review_date: nextReview.toISOString().split("T")[0],
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", cardId);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["flashcards"] }),
  });

  return { cards: cardsQuery.data || [], dueCards, generateCards, reviewCard, isLoading: cardsQuery.isLoading };
}
