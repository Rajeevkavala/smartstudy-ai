import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  free: { documents: 5, questions: 20, chat: 30, flashcards: 50, battles: 3 },
  pro: { documents: 100, questions: 500, chat: 1000, flashcards: 2000, battles: 50 },
  university: { documents: -1, questions: -1, chat: -1, flashcards: -1, battles: -1 },
};

export function useUsage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["usage", user?.id],
    queryFn: async () => {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("usage_tracking")
        .select("*")
        .eq("user_id", user!.id)
        .gte("period_start", periodStart);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const checkUsage = useMutation({
    mutationFn: async (feature: string) => {
      const res = await supabase.functions.invoke("check-usage", {
        body: { feature },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usage", user?.id] }),
  });

  const getFeatureUsage = (feature: string) => {
    const record = query.data?.find((u) => u.feature === feature);
    return record?.count || 0;
  };

  return { ...query, checkUsage, getFeatureUsage, PLAN_LIMITS };
}
