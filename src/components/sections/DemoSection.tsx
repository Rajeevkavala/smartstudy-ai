import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const question = "What are the ACID properties?";
const answerLines = [
  { type: 'heading', text: 'ACID Properties (8 Marks)' },
  { type: 'body', text: 'ACID is a set of properties that guarantee reliable database transactions:' },
  { type: 'bullet', text: '• Atomicity — All operations complete or none do.' },
  { type: 'bullet', text: '• Consistency — Database moves from one valid state to another.' },
  { type: 'bullet', text: '• Isolation — Concurrent transactions don\'t interfere.' },
  { type: 'bullet', text: '• Durability — Committed changes persist after failure.' },
  { type: 'source', text: 'Source: Chapter 4, Page 42' },
];

const capabilities = [
  'Context-aware answers',
  'Mark-based formatting',
  'Source referencing',
  'Multi-document search',
];

export default function DemoSection() {
  const [typedQuestion, setTypedQuestion] = useState('');
  const [showThinking, setShowThinking] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [activeCapability, setActiveCapability] = useState(-1);
  const [hasPlayed, setHasPlayed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const playAnimation = useCallback(() => {
    setTypedQuestion('');
    setShowThinking(false);
    setVisibleLines(0);
    setActiveCapability(-1);

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      setTypedQuestion(question.slice(0, charIndex));
      if (charIndex >= question.length) {
        clearInterval(typeInterval);
        setShowThinking(true);
        setActiveCapability(0);
        setTimeout(() => {
          setShowThinking(false);
          let lineIndex = 0;
          const lineInterval = setInterval(() => {
            lineIndex++;
            setVisibleLines(lineIndex);
            if (lineIndex === 2) setActiveCapability(1);
            if (lineIndex === 4) setActiveCapability(2);
            if (lineIndex === 6) setActiveCapability(3);
            if (lineIndex >= answerLines.length) clearInterval(lineInterval);
          }, 300);
        }, 1200);
      }
    }, 45);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasPlayed) {
          setHasPlayed(true);
          setTimeout(playAnimation, 400);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasPlayed, playAnimation]);

  return (
    <section ref={sectionRef} id="demo" className="relative py-24 px-4 bg-surface/15">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <SectionBadge>See it in action</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>What it feels like to use</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-lg mx-auto">
            Ask any question. Get an exam-ready answer in seconds.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="relative mt-12 max-w-5xl mx-auto"
        >
          <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent)] blur-3xl -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
            {/* Chat interface */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2 bg-surface/50">
                <Bot size={16} className="text-text-accent" />
                <span className="text-sm font-medium text-text-secondary">SmartExam AI</span>
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </div>
              <div className="px-5 py-5 space-y-4 min-h-[350px]">
                {/* User message */}
                {typedQuestion && (
                  <div className="flex justify-end">
                    <div className="bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-foreground max-w-xs">
                      {typedQuestion}
                      {typedQuestion.length < question.length && (
                        <span className="inline-block w-0.5 h-4 bg-foreground ml-0.5 animate-blink" />
                      )}
                    </div>
                  </div>
                )}

                {/* Thinking dots */}
                {showThinking && (
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-text-muted animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                )}

                {/* AI response */}
                {visibleLines > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot size={14} className="text-text-accent" />
                      <span className="text-xs font-medium text-text-muted">SmartExam AI</span>
                    </div>
                    <div className="glass-card px-4 py-3 text-sm max-w-md space-y-2">
                      {answerLines.slice(0, visibleLines).map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease }}
                        >
                          {line.type === 'heading' && (
                            <p className="font-heading font-semibold text-foreground text-sm">{line.text}</p>
                          )}
                          {line.type === 'body' && (
                            <p className="text-text-secondary text-xs leading-relaxed">{line.text}</p>
                          )}
                          {line.type === 'bullet' && (
                            <p className="text-xs text-text-secondary">{line.text}</p>
                          )}
                          {line.type === 'source' && (
                            <p className="font-mono text-xs text-text-muted pt-2 border-t border-border/50">{line.text}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-border/50 px-4 py-3 flex gap-2">
                <input type="text" placeholder="Ask a question..." className="flex-1 bg-surface rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted border border-border focus:border-primary/40 focus:outline-none transition-colors" readOnly />
                <button className="icon-container p-2.5 cursor-pointer hover:border-primary/40 transition-all" aria-label="Send">
                  <Send size={16} className="text-text-accent" />
                </button>
              </div>
            </div>

            {/* Capabilities list */}
            <div className="hidden lg:flex flex-col gap-2 pt-16">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">Capabilities</p>
              {capabilities.map((cap, i) => (
                <div
                  key={cap}
                  className={`px-4 py-3 rounded-lg text-sm transition-all duration-300 border-l-2 ${
                    i <= activeCapability
                      ? 'border-primary bg-primary/10 text-text-accent'
                      : 'border-transparent text-text-muted'
                  }`}
                >
                  {cap}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
