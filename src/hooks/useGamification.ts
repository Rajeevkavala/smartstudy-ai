import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

export function useGamification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const setGamification = useAppStore((s) => s.setGamification);

  const profileQuery = useQuery({
    queryKey: ["gamification", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const achievementsQuery = useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*, achievements(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const allAchievementsQuery = useQuery({
    queryKey: ["all-achievements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("achievements").select("*");
      if (error) throw error;
      return data || [];
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setGamification({
        xp: profileQuery.data.xp,
        level: profileQuery.data.level,
        currentStreak: profileQuery.data.current_streak,
        longestStreak: profileQuery.data.longest_streak,
        totalStudyMinutes: profileQuery.data.total_study_minutes,
      });
    }
  }, [profileQuery.data, setGamification]);

  const addXP = useMutation({
    mutationFn: async (amount: number) => {
      const current = profileQuery.data;
      if (!current) return;
      const newXP = current.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      const { error } = await supabase
        .from("user_gamification")
        .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gamification"] }),
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      const current = profileQuery.data;
      if (!current) return;
      const today = new Date().toISOString().split("T")[0];
      const lastActive = current.last_active_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      let newStreak = current.current_streak;
      if (lastActive === today) return;
      if (lastActive === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      const longestStreak = Math.max(newStreak, current.longest_streak);

      const { error } = await supabase
        .from("user_gamification")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gamification"] }),
  });

  return {
    profile: profileQuery.data,
    achievements: achievementsQuery.data || [],
    allAchievements: allAchievementsQuery.data || [],
    addXP,
    updateStreak,
    isLoading: profileQuery.isLoading,
  };
}
