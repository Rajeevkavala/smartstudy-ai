import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, FileText, MessageSquare, Brain, TrendingUp, 
  Clock, Upload, Sparkles, LogOut, User, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link to="/upload">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upload Document</h3>
                  <p className="text-sm text-text-muted">Add PDFs to start studying</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/exam-mode">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Brain className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Exam Mode</h3>
                  <p className="text-sm text-text-muted">Practice with AI questions</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/insights">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bento-card group cursor-pointer h-full"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <TrendingUp className="w-7 h-7 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">View Insights</h3>
                  <p className="text-sm text-text-muted">Track your progress</p>
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
