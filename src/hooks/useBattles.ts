import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function useBattles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const battlesQuery = useQuery({
    queryKey: ["battles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("battle_rooms")
        .select("*")
        .or(`host_id.eq.${user!.id},opponent_id.eq.${user!.id}`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const eloQuery = useQuery({
    queryKey: ["elo", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("elo_ratings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("elo_ratings")
        .select("*")
        .order("rating", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });

  const createBattle = useMutation({
    mutationFn: async ({ documentId, mode }: { documentId: string; mode: string }) => {
      const res = await supabase.functions.invoke("matchmaking", {
        body: { action: "create", documentId, battleMode: mode },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["battles"] }),
  });

  const joinBattle = useMutation({
    mutationFn: async (roomId: string) => {
      const res = await supabase.functions.invoke("matchmaking", {
        body: { action: "join", roomId },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["battles"] }),
  });

  // Real-time subscription to battle room updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("battle-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battle_rooms" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["battles"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return {
    battles: battlesQuery.data || [],
    elo: eloQuery.data,
    leaderboard: leaderboardQuery.data || [],
    createBattle,
    joinBattle,
    isLoading: battlesQuery.isLoading,
  };
}
