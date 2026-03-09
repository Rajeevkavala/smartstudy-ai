import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, FileText, MessageSquare, Brain, TrendingUp, 
  Clock, Upload, Sparkles, LogOut, User, ChevronRight,
  Flame, Star, Target, Swords, BookOpen, CalendarDays,
  BarChart3, Settings, Trophy, Layers, Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useGamification } from "@/hooks/useGamification";
import { useSubscription } from "@/hooks/useSubscription";

interface Document {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalDocuments: number;
  totalConversations: number;
  totalQuestions: number;
  studyTime: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    totalConversations: 0,
    totalQuestions: 0,
    studyTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const { profile: gamification } = useGamification();
  const { subscription, isPro } = useSubscription();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load documents
      const { data: docs, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (docsError) throw docsError;
      setDocuments(docs || []);

      // Load stats
      const { count: docCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });

      const { count: convCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true });

      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");

      setStats({
        totalDocuments: docCount || 0,
        totalConversations: convCount || 0,
        totalQuestions: msgCount || 0,
        studyTime: Math.floor((msgCount || 0) * 2.5), // Estimated 2.5 min per question
      });
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const statCards = [
    { label: "Documents", value: stats.totalDocuments, icon: FileText, color: "primary" },
    { label: "Conversations", value: stats.totalConversations, icon: MessageSquare, color: "accent" },
    { label: "Questions Asked", value: stats.totalQuestions, icon: Brain, color: "secondary" },
    { label: "Study Time", value: `${stats.studyTime}m`, icon: Clock, color: "success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            <span className="font-display font-bold text-lg">SmartExam</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary hidden sm:block">
              {user?.email}
            </span>
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-text-secondary">
            Ready to ace your exams? Upload a document or continue studying.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `hsl(var(--${stat.color}) / 0.1)` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: `hsl(var(--${stat.color}))` }} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Gamification bar */}
        {gamification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-4 mb-8 flex items-center gap-6 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-bold">Level {gamification.level}</span>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-xs">
              <Progress value={((gamification.xp % 500) / 500) * 100} className="h-2 flex-1" />
              <span className="text-xs text-text-muted">{gamification.xp} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">{gamification.current_streak}</span>
              <span className="text-xs text-text-muted">day streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">{gamification.total_study_minutes}m studied</span>
            </div>
            {!isPro && (
              <Link to="/pricing" className="ml-auto text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                Upgrade to Pro
              </Link>
            )}
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/upload">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Upload</h3>
                  <p className="text-xs text-text-muted">Add PDFs</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/exam-mode">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Exam Mode</h3>
                  <p className="text-xs text-text-muted">Practice questions</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/flashcards">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <Layers className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Flashcards</h3>
                  <p className="text-xs text-text-muted">Spaced repetition</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/battles">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <Swords className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Battles</h3>
                  <p className="text-xs text-text-muted">Challenge friends</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/study-planner">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Study Plan</h3>
                  <p className="text-xs text-text-muted">AI scheduler</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/weakness-radar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Weakness Radar</h3>
                  <p className="text-xs text-text-muted">Find weak spots</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/pyq-analyzer">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <BarChart3 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">PYQ Analyzer</h3>
                  <p className="text-xs text-text-muted">Past year patterns</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/leaderboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Leaderboard</h3>
                  <p className="text-xs text-text-muted">Rankings & badges</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Recent documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Link to="/documents" className="text-sm text-text-accent hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="glass-card p-8 text-center">
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : documents.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No documents yet</h3>
              <p className="text-text-secondary text-sm mb-4">
                Upload your first PDF to start studying
              </p>
              <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Link key={doc.id} to={`/study/${doc.id}`}>
                  <div className="glass-card-hover p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.title}</h3>
                      <p className="text-sm text-text-muted">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: doc.status === "ready" 
                            ? "hsl(var(--success) / 0.1)" 
                            : "hsl(var(--primary) / 0.1)",
                          color: doc.status === "ready" 
                            ? "hsl(var(--success))" 
                            : "hsl(var(--primary))",
                        }}
                      >
                        {doc.status === "ready" ? "Ready" : "Processing"}
                      </span>
                      <ChevronRight className="w-5 h-5 text-text-muted" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
