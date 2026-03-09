import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

export function useSubscription() {
  const { user } = useAuth();
  const setSubscription = useAppStore((s) => s.setSubscription);

  const query = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setSubscription({
        plan: query.data.plan as "free" | "pro" | "university",
        status: query.data.status,
        currentPeriodEnd: query.data.current_period_end,
      });
    }
  }, [query.data, setSubscription]);

  const isPro = query.data?.plan === "pro" || query.data?.plan === "university";

  return { ...query, isPro };
}
