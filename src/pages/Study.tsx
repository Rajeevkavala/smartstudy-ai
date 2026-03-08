import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Send, FileText, Bot, Sparkles, Copy, Check,
  BookOpen, Brain, ListChecks, ChevronDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mark_level?: string;
}

interface Document {
  id: string;
  title: string;
  status: string;
  extracted_text?: string;
}

const markLevels = [
  { value: "2M", label: "2 Marks", description: "Brief answer" },
  { value: "4M", label: "4 Marks", description: "Short answer" },
  { value: "8M", label: "8 Marks", description: "Detailed answer" },
  { value: "16M", label: "16 Marks", description: "Comprehensive" },
];

export default function Study() {
  const { documentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [document, setDocument] = useState<Document | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [markLevel, setMarkLevel] = useState("4M");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      loadDocument();
      loadMessages();
    }
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const loadMessages = async () => {
    try {
      // Find or create conversation
      let { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("document_id", documentId)
        .single();

      if (!conv && user) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            document_id: documentId,
            title: "Study Session",
          })
          .select()
          .single();
        conv = newConv;
      }

      if (conv) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });

        setMessages(msgs?.map(m => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          mark_level: m.mark_level,
        })) || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      mark_level: markLevel,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setStreaming(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: userMessage.content }],
            documentContext: document?.extracted_text || "",
            markLevel,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        throw new Error("Failed to get response");
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantMessage.id
                        ? { ...m, content: fullContent }
                        : m
                    )
                  );
                }
              } catch {
                // Ignore parse errors for incomplete JSON
              }
            }
          }
        }
      }

      // Save messages to database
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("document_id", documentId)
        .single();

      if (conv) {
        await supabase.from("messages").insert([
          {
            conversation_id: conv.id,
            user_id: user.id,
            role: "user",
            content: userMessage.content,
            mark_level: markLevel,
          },
          {
            conversation_id: conv.id,
            user_id: user.id,
            role: "assistant",
            content: fullContent,
          },
        ]);
      }

    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to get response");
      // Remove the empty assistant message
      setMessages(prev => prev.filter(m => m.id !== assistantMessage.id));
    } finally {
      setSending(false);
      setStreaming(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-text-secondary hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium truncate max-w-[200px]">
                {document?.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/exam-mode/${documentId}`}>
              <Button variant="outline" size="sm">
                <Brain className="w-4 h-4 mr-2" />
                Exam Mode
              </Button>
            </Link>
            <Link to={`/summary/${documentId}`}>
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Summary
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Start studying</h2>
              <p className="text-text-secondary mb-4">
                Ask any question about your document
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["What are the key concepts?", "Explain the main topics", "Give me a summary"].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-sm px-4 py-2 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-surface border border-border/20"
                } rounded-2xl ${message.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"} px-4 py-3`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                    <Bot className="w-4 h-4" />
                    <span>SmartExam AI</span>
                    {streaming && message.content === "" && (
                      <span className="animate-pulse">Thinking...</span>
                    )}
                  </div>
                )}

                {message.mark_level && message.role === "user" && (
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-text-accent mb-2 inline-block">
                    {message.mark_level}
                  </span>
                )}

                <div className="prose prose-invert prose-sm max-w-none">
                  {message.content}
                  {streaming && message.role === "assistant" && message.content && (
                    <span className="animate-pulse">▊</span>
                  )}
                </div>

                {message.role === "assistant" && message.content && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleCopy(message.id, message.content)}
                      className="p-1 hover:bg-muted/20 rounded transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-text-muted" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/30 bg-background/80 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          {/* Mark level selector */}
          <div className="flex gap-2 mb-3">
            {markLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setMarkLevel(level.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  markLevel === level.value
                    ? "bg-primary/10 border-primary/30 text-text-accent"
                    : "border-border/30 text-text-muted hover:border-primary/20"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your document..."
              className="resize-none min-h-[52px] max-h-32"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
