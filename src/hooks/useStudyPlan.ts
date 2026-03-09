import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useStudyPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ["study-plans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_plans")
        .select("*, study_plan_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const examsQuery = useQuery({
    queryKey: ["exams", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", user!.id)
        .order("exam_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const generatePlan = useMutation({
    mutationFn: async (params: {
      examName: string;
      examDate: string;
      subjects: string[];
      hoursPerDay: number;
    }) => {
      const exams = [
        {
          name: params.examName,
          date: params.examDate,
          difficulty: 3,
        },
      ];
      const subjects = params.subjects.map((subject) => ({
        name: subject,
        difficulty: "medium",
      }));
      const currentConfidence = Object.fromEntries(
        params.subjects.map((subject) => [subject, 3])
      );

      const res = await supabase.functions.invoke("generate-study-plan", {
        body: {
          exams,
          subjects,
          currentConfidence,
          availableHoursPerDay: params.hoursPerDay,
        },
      });
      if (res.error) throw res.error;

      const generatedPlan = res.data;
      if (!generatedPlan?.planName || !Array.isArray(generatedPlan.items)) {
        throw new Error("Study planner returned an invalid response.");
      }

      const { error: pauseError } = await supabase
        .from("study_plans")
        .update({ status: "paused" })
        .eq("user_id", user!.id)
        .eq("status", "active");
      if (pauseError) throw pauseError;

      const { data: createdPlan, error: planError } = await supabase
        .from("study_plans")
        .insert({
          user_id: user!.id,
          name: generatedPlan.planName,
          start_date: generatedPlan.startDate,
          end_date: generatedPlan.endDate,
          status: "active",
        })
        .select("*")
        .single();
      if (planError) throw planError;

      if (generatedPlan.items.length > 0) {
        const { error: itemsError } = await supabase.from("study_plan_items").insert(
          generatedPlan.items.map((item: {
            title: string;
            description?: string;
            scheduledDate: string;
            startTime?: string;
            durationMinutes?: number;
            priority?: string;
          }) => ({
            plan_id: createdPlan.id,
            title: item.title,
            description: item.description ?? null,
            scheduled_date: item.scheduledDate,
            scheduled_start_time: item.startTime ?? null,
            duration_minutes: item.durationMinutes ?? 60,
            priority: item.priority ?? "medium",
          }))
        );
        if (itemsError) throw itemsError;
      }

      return createdPlan;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["study-plans"] }),
  });

  const toggleItem = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      const { error } = await supabase
        .from("study_plan_items")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["study-plans"] }),
  });

  const addExam = useMutation({
    mutationFn: async (params: {
      name: string;
      subject?: string;
      examDate: string;
      difficulty?: number;
    }) => {
      const { error } = await supabase.from("exams").insert({
        user_id: user!.id,
        name: params.name,
        subject: params.subject,
        exam_date: params.examDate,
        difficulty: params.difficulty || 3,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });

  return {
    plans: plansQuery.data || [],
    exams: examsQuery.data || [],
    generatePlan,
    toggleItem,
    addExam,
    isLoading: plansQuery.isLoading,
  };
}
