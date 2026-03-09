import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowLeft, ChevronLeft, ChevronRight, RotateCcw,
  ThumbsUp, ThumbsDown, Loader2, Plus, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFlashcards } from "@/hooks/useFlashcards";
import { toast } from "sonner";

export default function Flashcards() {
  const { documentId } = useParams();
  const { cards, dueCards, generateCards, reviewCard, isLoading } = useFlashcards(documentId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mode, setMode] = useState<"all" | "due">("due");

  const activeCards = mode === "due" ? dueCards : cards;
  const currentCard = activeCards[currentIndex];

  const handleRate = async (quality: number) => {
    if (!currentCard) return;
    try {
      await reviewCard.mutateAsync({ cardId: currentCard.id, quality });
      setShowAnswer(false);
      if (currentIndex < activeCards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        toast.success("Review session complete!");
        setCurrentIndex(0);
      }
    } catch {
      toast.error("Failed to save review");
    }
  };

  const handleGenerate = async () => {
    if (!documentId) {
      toast.error("Select a document first");
      return;
    }
    try {
      await generateCards.mutateAsync(documentId);
      toast.success("Flashcards generated!");
    } catch {
      toast.error("Failed to generate flashcards");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold">Flashcards</span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant={mode === "due" ? "default" : "outline"}
              size="sm"
              onClick={() => { setMode("due"); setCurrentIndex(0); setShowAnswer(false); }}
            >
              Due ({dueCards.length})
            </Button>
            <Button
              variant={mode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => { setMode("all"); setCurrentIndex(0); setShowAnswer(false); }}
            >
              All ({cards.length})
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeCards.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <RotateCcw className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-semibold mb-2">
              {mode === "due" ? "No cards due for review" : "No flashcards yet"}
            </h3>
            <p className="text-sm text-text-muted mb-4">
              {mode === "due"
                ? "Great job! All cards are reviewed. Come back later."
                : "Generate flashcards from your documents"}
            </p>
            {documentId && (
              <Button onClick={handleGenerate} disabled={generateCards.isPending}>
                {generateCards.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> Generate Flashcards</>
                )}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-text-muted mb-2">
                <span>Card {currentIndex + 1} of {activeCards.length}</span>
                <span>{Math.round(((currentIndex + 1) / activeCards.length) * 100)}%</span>
              </div>
              <Progress value={((currentIndex + 1) / activeCards.length) * 100} />
            </div>

            {/* Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard?.id + (showAnswer ? "-back" : "-front")}
                initial={{ opacity: 0, rotateY: showAnswer ? -90 : 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: showAnswer ? 90 : -90 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                <div className="text-xs text-text-muted mb-4 flex items-center gap-1">
                  {showAnswer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showAnswer ? "Answer" : "Question"} — Click to flip
                </div>
                <p className="text-xl font-medium leading-relaxed">
                  {showAnswer ? currentCard?.back : currentCard?.front}
                </p>
                {currentCard?.tags && currentCard.tags.length > 0 && (
                  <div className="flex gap-2 mt-6">
                    {currentCard.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setShowAnswer(false); }}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {showAnswer && (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRate(1)}
                    disabled={reviewCard.isPending}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" /> Again
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRate(3)}
                    disabled={reviewCard.isPending}
                  >
                    Hard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRate(4)}
                    disabled={reviewCard.isPending}
                  >
                    Good
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRate(5)}
                    disabled={reviewCard.isPending}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" /> Easy
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentIndex(Math.min(activeCards.length - 1, currentIndex + 1));
                  setShowAnswer(false);
                }}
                disabled={currentIndex >= activeCards.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
