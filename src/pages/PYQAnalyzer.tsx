import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowLeft, BarChart3, Loader2, TrendingUp, Calendar,
  BookOpen, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface PYQResult {
  patterns: Array<{
    topic: string;
    frequency: number;
    years: string[];
    difficulty: string;
  }>;
  predictedQuestions: Array<{
    question: string;
    topic: string;
    probability: string;
  }>;
  topicDistribution: Record<string, number>;
}

export default function PYQAnalyzer() {
  const { documentId } = useParams();
  const { user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState(documentId || "");
  const [result, setResult] = useState<PYQResult | null>(null);

  const documentsQuery = useQuery({
    queryKey: ["documents-pyq", user?.id],
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

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data: document, error: documentError } = await supabase
        .from("documents")
        .select("id, title, status")
        .eq("id", selectedDoc)
        .eq("user_id", user!.id)
        .single();
      if (documentError) throw documentError;
      if (document.status !== "ready") {
        throw new Error("Document indexing is still in progress. Please wait until processing finishes.");
      }

      const res = await supabase.functions.invoke("analyze-pyq", {
        body: {
          documentId: document.id,
        },
      });
      if (res.error) throw res.error;

      const topicFrequency = Array.isArray(res.data?.topicFrequency) ? res.data.topicFrequency : [];
      const predictedQuestions = Array.isArray(res.data?.predictedQuestions)
        ? res.data.predictedQuestions
        : [];

      return {
        patterns: topicFrequency.map((item: {
          topic: string;
          frequency?: number;
          lastAppeared?: string;
          trend?: string;
        }) => ({
          topic: item.topic,
          frequency: Number(item.frequency) || 0,
          years: item.lastAppeared ? [String(item.lastAppeared)] : [],
          difficulty:
            item.trend === "increasing"
              ? "hard"
              : item.trend === "decreasing"
              ? "easy"
              : "medium",
        })),
        predictedQuestions: predictedQuestions.map((question: {
          question: string;
          topic: string;
          probability?: number;
        }) => ({
          question: question.question,
          topic: question.topic,
          probability: `${Math.round((Number(question.probability) || 0) * 100)}%`,
        })),
        topicDistribution: Object.fromEntries(
          topicFrequency.map((item: { topic: string; frequency?: number }) => [
            item.topic,
            Number(item.frequency) || 0,
          ])
        ),
      } as PYQResult;
    },
    onSuccess: (data) => setResult(data),
  });

  const handleAnalyze = () => {
    if (!selectedDoc) {
      toast.error("Select a document first");
      return;
    }
    analyzeMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold">PYQ Analyzer</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Previous Year Question Analyzer</h1>
          <p className="text-text-muted">
            Upload PYQ papers and let AI identify patterns to predict future questions
          </p>
        </motion.div>

        {/* Controls */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center gap-4">
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
            >
              <option value="">Select a PYQ document...</option>
              {documentsQuery.data?.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.title}</option>
              ))}
            </select>
            <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending || !selectedDoc}>
              {analyzeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><BarChart3 className="w-4 h-4 mr-2" /> Analyze PYQ</>
              )}
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-8">
            {/* Topic frequency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Topic Frequency
              </h2>
              <div className="glass-card p-6">
                <div className="space-y-4">
                  {result.patterns
                    .sort((a, b) => b.frequency - a.frequency)
                    .map((pattern) => (
                      <div key={pattern.topic}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{pattern.topic}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                background:
                                  pattern.difficulty === "hard"
                                    ? "hsl(var(--destructive) / 0.1)"
                                    : pattern.difficulty === "medium"
                                    ? "hsl(var(--primary) / 0.1)"
                                    : "hsl(var(--muted) / 0.3)",
                                color:
                                  pattern.difficulty === "hard"
                                    ? "hsl(var(--destructive))"
                                    : pattern.difficulty === "medium"
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--text-muted))",
                              }}
                            >
                              {pattern.difficulty}
                            </span>
                            <span className="text-xs text-text-muted">{pattern.frequency}x</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.min(100, (pattern.frequency / Math.max(...result.patterns.map((p) => p.frequency))) * 100)}%`,
                            }}
                          />
                        </div>
                        {pattern.years.length > 0 && (
                          <p className="text-xs text-text-muted mt-1">
                            Years: {pattern.years.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>

            {/* Predicted questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Predicted Questions
              </h2>
              <div className="space-y-3">
                {result.predictedQuestions.map((q, i) => (
                  <div key={i} className="glass-card p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{q.question}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-text-muted">{q.topic}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                            {q.probability} likely
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
