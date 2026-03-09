import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useWeakness(documentId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const weaknessQuery = useQuery({
    queryKey: ["weakness", user?.id, documentId],
    queryFn: async () => {
      let query = supabase
        .from("weakness_profiles")
        .select("*, micro_lessons(*)")
        .eq("user_id", user!.id)
        .order("confidence_score", { ascending: true });
      if (documentId) query = query.eq("document_id", documentId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const analyze = useMutation({
    mutationFn: async (docId: string) => {
      const { data: document, error: documentError } = await supabase
        .from("documents")
        .select("id, title, status")
        .eq("id", docId)
        .eq("user_id", user!.id)
        .single();
      if (documentError) throw documentError;
      if (document.status !== "ready") {
        throw new Error("Document indexing is still in progress. Please wait until processing finishes.");
      }

      const res = await supabase.functions.invoke("analyze-weakness", {
        body: {
          documentId: docId,
          topics: [document.title],
        },
      });
      if (res.error) throw res.error;

      const weaknesses = Array.isArray(res.data?.weaknesses) ? res.data.weaknesses : [];
      if (weaknesses.length === 0) {
        throw new Error("No weaknesses were identified for this document.");
      }

      const { error: deleteError } = await supabase
        .from("weakness_profiles")
        .delete()
        .eq("user_id", user!.id)
        .eq("document_id", docId);
      if (deleteError) throw deleteError;

      const weaknessRows = weaknesses.map((weakness: {
        topic: string;
        subtopic?: string;
        confidenceScore?: number;
      }) => ({
        user_id: user!.id,
        document_id: docId,
        topic: weakness.topic,
        subtopic: weakness.subtopic ?? null,
        confidence_score: weakness.confidenceScore ?? 0,
        times_tested: 0,
        times_correct: 0,
        last_tested_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("weakness_profiles")
        .insert(weaknessRows)
        .select("*");
      if (error) throw error;

      const lessons = weaknesses.flatMap((weakness: {
        topic: string;
        subtopic?: string;
        microLessons?: Array<{
          title: string;
          content: string;
          type?: string;
        }>;
      }) => {
        const savedWeakness = data.find(
          (row) => row.topic === weakness.topic && (row.subtopic ?? null) === (weakness.subtopic ?? null)
        );
        if (!savedWeakness) return [];

        return (weakness.microLessons ?? []).map((lesson) => ({
          weakness_id: savedWeakness.id,
          title: lesson.title,
          content: lesson.content,
          lesson_type: lesson.type ?? "explanation",
        }));
      });

      if (lessons.length > 0) {
        const { error: lessonsError } = await supabase
          .from("micro_lessons")
          .insert(lessons);
        if (lessonsError) throw lessonsError;
      }

      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["weakness"] }),
  });

  const completeMicroLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from("micro_lessons")
        .update({ completed: true })
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["weakness"] }),
  });

  return {
    weaknesses: weaknessQuery.data || [],
    analyze,
    completeMicroLesson,
    isLoading: weaknessQuery.isLoading,
  };
}
