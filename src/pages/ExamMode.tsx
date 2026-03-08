import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Clock, CheckCircle2, XCircle, Play, Pause, RotateCcw, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  type: string;
  marks: number;
  expectedAnswer: string;
  hint: string;
}

interface ExamSession {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>;
  timeSpent: number;
  mode: "practice" | "timed" | "mock";
}

export default function ExamMode() {
  const { documentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mode, setMode] = useState<"practice" | "timed" | "mock">("practice");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error) throw error;
      setDocument(data);
    } catch (error) {
      console.error("Error loading document:", error);
      toast.error("Document not found");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!document) return;
    setGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            documentContext: document.extracted_text || "Sample document about database concepts including normalization, ACID properties, indexing, and SQL queries.",
            questionCount,
            difficulty,
            mode,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate questions");

      const data = await response.json();
      
      setSession({
        questions: data.questions,
        currentIndex: 0,
        answers: {},
        timeSpent: 0,
        mode,
      });
      setTimer(0);
      setIsTimerRunning(mode === "timed");
      
    } catch (error: any) {
      console.error("Generate error:", error);
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNextQuestion = () => {
    if (!session) return;

    // Save answer
    setSession({
      ...session,
      answers: { ...session.answers, [session.currentIndex]: userAnswer },
      currentIndex: session.currentIndex + 1,
    });
    setUserAnswer("");
    setShowAnswer(false);
  };

  const handlePreviousQuestion = () => {
    if (!session || session.currentIndex === 0) return;
    setSession({
      ...session,
      currentIndex: session.currentIndex - 1,
    });
    setUserAnswer(session.answers[session.currentIndex - 1] || "");
    setShowAnswer(false);
  };

  const handleFinish = async () => {
    if (!session || !user) return;
    setIsTimerRunning(false);

    try {
      await supabase.from("exam_sessions").insert({
        user_id: user.id,
        document_id: documentId,
        mode: session.mode,
        total_questions: session.questions.length,
        correct_answers: Object.keys(session.answers).length,
        time_spent_seconds: timer,
        completed_at: new Date().toISOString(),
      });

      toast.success("Exam completed! Check your insights for results.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  const currentQuestion = session?.questions[session.currentIndex];
  const progress = session ? ((session.currentIndex + 1) / session.questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to={documentId ? `/study/${documentId}` : "/dashboard"} className="flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>

          {session && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-text-muted" />
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
              <span className="text-sm text-text-muted">
                {session.currentIndex + 1} / {session.questions.length}
              </span>
            </div>
          )}

          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!session ? (
          /* Setup screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Exam Mode</h1>
            <p className="text-text-secondary mb-8">
              Test your knowledge with AI-generated questions
            </p>

            <div className="glass-card p-6 text-left space-y-6">
              {/* Mode selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Select Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "practice", label: "Practice", desc: "With hints" },
                    { value: "timed", label: "Timed", desc: "Against clock" },
                    { value: "mock", label: "Mock Exam", desc: "Full exam" },
                  ].map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value as any)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        mode === m.value
                          ? "border-primary bg-primary/10"
                          : "border-border/30 hover:border-primary/30"
                      }`}
                    >
                      <div className="font-medium">{m.label}</div>
                      <div className="text-xs text-text-muted">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div>
                <label className="block text-sm font-medium mb-3">Number of Questions</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        questionCount === n
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/30 hover:border-primary/30"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium mb-3">Difficulty</label>
                <div className="flex gap-2">
                  {[
                    { value: "easy", label: "Easy" },
                    { value: "medium", label: "Medium" },
                    { value: "hard", label: "Hard" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value as any)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        difficulty === d.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/30 hover:border-primary/30"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full btn-primary"
                onClick={generateQuestions}
                disabled={generating}
              >
                {generating ? (
                  <>Generating Questions...</>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Exam
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Question screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Progress value={progress} className="h-2 mb-8" />

            {currentQuestion && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm px-3 py-1 rounded-lg bg-primary/10 text-text-accent">
                    {currentQuestion.marks} Marks
                  </span>
                  <span className="text-sm text-text-muted capitalize">
                    {currentQuestion.type}
                  </span>
                </div>

                <h2 className="text-xl font-semibold mb-6">
                  {currentQuestion.question}
                </h2>

                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[150px] mb-4"
                />

                {session.mode === "practice" && !showAnswer && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswer(true)}
                    className="mb-4"
                  >
                    Show Hint
                  </Button>
                )}

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20"
                  >
                    <div className="text-sm font-medium text-success mb-2">Expected Answer:</div>
                    <p className="text-sm">{currentQuestion.expectedAnswer}</p>
                    {currentQuestion.hint && (
                      <p className="text-sm text-text-muted mt-2">
                        <strong>Hint:</strong> {currentQuestion.hint}
                      </p>
                    )}
                  </motion.div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={session.currentIndex === 0}
                  >
                    Previous
                  </Button>

                  {session.currentIndex === session.questions.length - 1 ? (
                    <Button onClick={handleFinish} className="btn-primary">
                      Finish Exam
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion}>
                      Next Question
                    </Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
