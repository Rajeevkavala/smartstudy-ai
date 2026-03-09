import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowLeft, Send, Loader2, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Message {
  role: "user" | "ai";
  content: string;
  feedback?: string;
}

export default function FeynmanMode() {
  const { documentId } = useParams();
  const { user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState(documentId || "");
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const documentsQuery = useQuery({
    queryKey: ["documents-feynman", user?.id],
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callFeynmanSession = async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/feynman-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Feynman service is not deployed for the configured Supabase project.");
      }

      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.error || "Failed to get response");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    if (!reader) {
      return fullContent;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
          }
        } catch {
          // Ignore incomplete SSE chunks until the next read.
        }
      }
    }

    return fullContent.trim();
  };

  const startSession = async () => {
    if (!selectedDoc || !topic) {
      toast.error("Select a document and enter a topic");
      return;
    }
    setLoading(true);
    try {
      const response = await callFeynmanSession({
        action: "start",
        concept: topic,
        documentId: selectedDoc,
      });
      setMessages([{
        role: "ai",
        content: response || "Great! Let's start the Feynman session. Please teach me about this topic as if I'm a complete beginner. Use simple language and analogies.",
      }]);
      setSessionActive(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start session";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const requestMessages = [...messages, { role: "user", content: userMessage }].map(({ role, content }) => ({
        role: role === "ai" ? "assistant" : role,
        content,
      }));
      const response = await callFeynmanSession({
        action: "evaluate",
        documentId: selectedDoc,
        concept: topic,
        messages: requestMessages,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: response || "Let me evaluate your explanation...",
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get response";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold">Feynman Teaching Mode</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {!sessionActive ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="glass-card p-8 w-full max-w-md">
              <div className="text-center mb-6">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
                <h2 className="text-xl font-bold">Feynman Teaching Mode</h2>
                <p className="text-sm text-text-muted mt-2">
                  "If you can't explain it simply, you don't understand it well enough."
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Document</label>
                  <select
                    value={selectedDoc}
                    onChange={(e) => setSelectedDoc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                  >
                    <option value="">Select a document...</option>
                    {documentsQuery.data?.map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Topic to teach</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Binary Search Trees"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                  />
                </div>

                <Button onClick={startSession} disabled={loading} className="w-full">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting...</>
                  ) : (
                    <><BookOpen className="w-4 h-4 mr-2" /> Start Teaching</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "glass-card rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.feedback && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span className="text-xs font-medium">Feedback</span>
                        </div>
                        <p className="text-xs opacity-80">{msg.feedback}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass-card p-4 rounded-2xl rounded-bl-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-2 glass-card rounded-2xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Explain the concept in your own words..."
                className="flex-1 px-4 py-2 bg-transparent text-sm outline-none"
              />
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
