import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowLeft, Plus, Calendar, Clock, CheckCircle2, Circle,
  ChevronRight, Brain, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database } from "@/integrations/supabase/types";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { toast } from "sonner";

type StudyPlanItem = Database["public"]["Tables"]["study_plan_items"]["Row"];

export default function StudyPlanner() {
  const { plans, exams, generatePlan, toggleItem, addExam, isLoading } = useStudyPlan();
  const [showGenerate, setShowGenerate] = useState(false);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [subjects, setSubjects] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!examName || !examDate || !subjects) {
      toast.error("Please fill all fields");
      return;
    }
    setGenerating(true);
    try {
      await generatePlan.mutateAsync({
        examName,
        examDate,
        subjects: subjects.split(",").map((s) => s.trim()),
        hoursPerDay,
      });
      toast.success("Study plan generated!");
      setShowGenerate(false);
    } catch {
      toast.error("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const activePlan = plans.find((p) => p.status === "active");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold">Study Planner</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            Your Study Plans
          </motion.h1>

          <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Generate AI Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Study Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Exam Name</Label>
                  <Input
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Data Structures Final"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Exam Date</Label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Subjects (comma-separated)</Label>
                  <Input
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    placeholder="e.g. Arrays, Trees, Graphs, Sorting"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Hours per day: {hoursPerDay}</Label>
                  <Input
                    type="range"
                    min={1}
                    max={12}
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleGenerate} disabled={generating} className="w-full">
                  {generating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Brain className="w-4 h-4 mr-2" /> Generate Plan</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Upcoming exams */}
        {exams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold mb-4">Upcoming Exams</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam) => {
                const daysLeft = Math.ceil(
                  (new Date(exam.exam_date).getTime() - Date.now()) / 86400000
                );
                return (
                  <div key={exam.id} className="glass-card p-4">
                    <h3 className="font-medium">{exam.name}</h3>
                    {exam.subject && (
                      <p className="text-sm text-text-muted">{exam.subject}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                      <span className={`ml-auto font-medium ${daysLeft <= 7 ? "text-destructive" : "text-primary"}`}>
                        {daysLeft > 0 ? `${daysLeft}d left` : "Today!"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Active plan */}
        {isLoading ? (
          <div className="glass-card p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : activePlan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4">{activePlan.name}</h2>
            <div className="space-y-3">
              {((activePlan as { study_plan_items?: StudyPlanItem[] }).study_plan_items ?? [])
                .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
                .map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card p-4 flex items-center gap-4 cursor-pointer transition-opacity ${
                      item.completed ? "opacity-60" : ""
                    }`}
                    onClick={() => toggleItem.mutate({ itemId: item.id, completed: !item.completed })}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-text-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${item.completed ? "line-through" : ""}`}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-text-muted truncate">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-muted shrink-0">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.scheduled_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.duration_minutes}m
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background:
                            item.priority === "critical"
                              ? "hsl(var(--destructive) / 0.1)"
                              : item.priority === "high"
                              ? "hsl(var(--primary) / 0.1)"
                              : "hsl(var(--muted) / 0.3)",
                          color:
                            item.priority === "critical"
                              ? "hsl(var(--destructive))"
                              : item.priority === "high"
                              ? "hsl(var(--primary))"
                              : "hsl(var(--text-muted))",
                        }}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No study plans yet</h3>
            <p className="text-sm text-text-muted mb-4">
              Generate an AI-powered study plan tailored for your exams
            </p>
            <Button onClick={() => setShowGenerate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Your First Plan
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
