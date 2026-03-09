import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowLeft, Target, BookOpen, Loader2, CheckCircle2,
  AlertTriangle, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWeakness } from "@/hooks/useWeakness";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type MicroLesson = Database["public"]["Tables"]["micro_lessons"]["Row"];

export default function WeaknessRadar() {
  const { documentId } = useParams();
  const { user } = useAuth();
  const { weaknesses, analyze, completeMicroLesson, isLoading } = useWeakness(documentId);
  const [selectedWeakness, setSelectedWeakness] = useState<string | null>(null);

  const documentsQuery = useQuery({
    queryKey: ["documents-list", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title")
        .eq("user_id", user!.id)
        .eq("status", "ready");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const [selectedDoc, setSelectedDoc] = useState(documentId || "");

  const handleAnalyze = async () => {
    if (!selectedDoc) {
      toast.error("Select a document first");
      return;
    }
    try {
      await analyze.mutateAsync(selectedDoc);
      toast.success("Weakness analysis complete!");
    } catch {
      toast.error("Failed to analyze weaknesses");
    }
  };

  const selectedWeaknessData = weaknesses.find((w) => w.id === selectedWeakness);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold">Weakness Radar</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">AI Weakness Radar</h1>
            <p className="text-text-muted mt-1">Identify and strengthen your weak topics</p>
          </div>
          <div className="flex items-center gap-3">
            {!documentId && (
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm"
              >
                <option value="">Select document...</option>
                {documentsQuery.data?.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            )}
            <Button onClick={handleAnalyze} disabled={analyze.isPending || !selectedDoc}>
              {analyze.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Target className="w-4 h-4 mr-2" /> Analyze</>
              )}
            </Button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : weaknesses.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Target className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No weakness data yet</h3>
            <p className="text-sm text-text-muted">
              Select a document and run analysis to find weak areas
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Weakness list */}
            <div className="lg:col-span-1 space-y-3">
              {weaknesses.map((w) => {
                const score = Number(w.confidence_score) * 100;
                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      selectedWeakness === w.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedWeakness(w.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {score < 40 ? (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      ) : score < 70 ? (
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      <h3 className="font-medium text-sm">{w.topic}</h3>
                    </div>
                    {w.subtopic && (
                      <p className="text-xs text-text-muted mb-2">{w.subtopic}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Progress
                        value={score}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs font-medium w-10 text-right">{score.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {w.times_correct}/{w.times_tested} correct
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-2">
              {selectedWeaknessData ? (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-2">{selectedWeaknessData.topic}</h2>
                  {selectedWeaknessData.subtopic && (
                    <p className="text-text-muted mb-4">{selectedWeaknessData.subtopic}</p>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-muted/20">
                      <p className="text-2xl font-bold">
                        {(Number(selectedWeaknessData.confidence_score) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-text-muted">Confidence</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/20">
                      <p className="text-2xl font-bold">{selectedWeaknessData.times_tested}</p>
                      <p className="text-xs text-text-muted">Times Tested</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/20">
                      <p className="text-2xl font-bold">{selectedWeaknessData.times_correct}</p>
                      <p className="text-xs text-text-muted">Correct</p>
                    </div>
                  </div>

                  {/* Micro lessons */}
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Micro Lessons
                  </h3>
                  <div className="space-y-3">
                    {((selectedWeaknessData as { micro_lessons?: MicroLesson[] }).micro_lessons ?? []).map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`p-4 rounded-lg border transition-opacity ${
                          lesson.completed ? "opacity-60 border-green-500/30" : "border-border/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{lesson.title}</h4>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: "hsl(var(--primary) / 0.1)",
                              color: "hsl(var(--primary))",
                            }}
                          >
                            {lesson.lesson_type}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-3">{lesson.content}</p>
                        {!lesson.completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completeMicroLesson.mutate(lesson.id)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
                          </Button>
                        )}
                      </div>
                    ))}
                    {!((selectedWeaknessData as { micro_lessons?: MicroLesson[] }).micro_lessons ?? []).length && (
                      <p className="text-sm text-text-muted text-center py-4">
                        No micro lessons available yet
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <Target className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted">Select a weakness to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
