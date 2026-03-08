import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Bot, Send, Sparkles } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const questions = [
  {
    q: 'What is database normalization?',
    answer: {
      title: 'Database Normalization (8 Marks)',
      body: 'Database normalization is the process of organizing a relational database to reduce redundancy and improve data integrity.',
      points: [
        { key: '1NF', val: 'Eliminate repeating groups, ensure atomicity' },
        { key: '2NF', val: 'Remove partial dependencies on composite keys' },
        { key: '3NF', val: 'Remove transitive dependencies between non-key attributes' },
        { key: 'BCNF', val: 'Every determinant must be a candidate key' },
      ],
      source: 'Ch. 4, Page 42',
    },
  },
  {
    q: 'Explain ACID properties',
    answer: {
      title: 'ACID Properties (8 Marks)',
      body: 'ACID properties ensure reliable processing of database transactions.',
      points: [
        { key: 'Atomicity', val: 'All operations complete or none do' },
        { key: 'Consistency', val: 'Database moves from one valid state to another' },
        { key: 'Isolation', val: 'Concurrent transactions do not interfere' },
        { key: 'Durability', val: 'Committed changes persist after failure' },
      ],
      source: 'Ch. 5, Page 67',
    },
  },
  {
    q: 'What is indexing?',
    answer: {
      title: 'Indexing in DBMS (8 Marks)',
      body: 'An index is a data structure that improves the speed of data retrieval operations.',
      points: [
        { key: 'Primary', val: 'Index on primary key — one per table' },
        { key: 'Secondary', val: 'Index on non-key attributes for faster lookup' },
        { key: 'Clustered', val: 'Physical reordering of data rows' },
        { key: 'Dense vs Sparse', val: 'Entry per record vs entry per block' },
      ],
      source: 'Ch. 7, Page 112',
    },
  },
];

export default function DemoSection() {
  const [activeQ, setActiveQ] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const current = questions[activeQ];

  const typeAnswer = useCallback(() => {
    setIsTyping(true);
    setTypedAnswer('');
    const fullText = current.answer.body;
    let i = 0;
    const interval = setInterval(() => {
      setTypedAnswer(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [activeQ]);

  useEffect(() => {
    const cleanup = typeAnswer();
    return cleanup;
  }, [typeAnswer]);

  return (
    <section id="demo" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            👁 See it in action
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mt-3"
          >
            <span className="font-drama italic text-primary text-3xl md:text-4xl">Your AI study companion</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="text-text-muted mt-3"
          >
            Ask any question from your uploaded material and get perfectly formatted exam answers
          </motion.p>
        </div>

        {/* Question selector pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setActiveQ(i)}
              className={`text-sm px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
                i === activeQ
                  ? 'bg-primary/15 border-primary/30 text-foreground'
                  : 'bg-muted/10 border-border/20 text-text-muted hover:border-border/40 hover:text-text-secondary'
              }`}
            >
              {q.q}
            </button>
          ))}
        </motion.div>

        {/* Demo UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border/30 bg-card/30 overflow-hidden shadow-glass"
            style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20 bg-card/60">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-mark-16/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-muted/30 rounded-md px-4 py-1 text-xs text-text-muted font-mono">smartexam.ai</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[400px]">
              {/* PDF Panel */}
              <div className="lg:col-span-2 border-r border-border/15 bg-card/20">
                <div className="px-4 py-2.5 border-b border-border/15 flex items-center gap-2">
                  <FileText size={13} className="text-text-accent" />
                  <span className="font-mono text-xs text-text-secondary truncate">DBMS_Notes.pdf</span>
                  <span className="ml-auto font-mono text-[10px] text-text-muted">42 / 180</span>
                </div>
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-muted/20 rounded w-2/3 mb-4" />
                  {[72, 88, 56, 82, 68].map((w, i) => (
                    <div key={i} className="h-2.5 bg-muted/15 rounded" style={{ width: `${w}%` }} />
                  ))}
                  <div className="bg-primary/5 border-l-2 border-primary/40 rounded-r px-3 py-3 my-4 space-y-2">
                    {[78, 92, 62].map((w, i) => (
                      <div key={i} className="h-2.5 bg-primary/10 rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  {[66, 52, 78, 60].map((w, i) => (
                    <div key={i} className="h-2.5 bg-muted/15 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>

              {/* Chat Panel */}
              <div className="lg:col-span-3 flex flex-col bg-background/40">
                <div className="px-5 py-2.5 border-b border-border/15 flex items-center gap-2">
                  <Bot size={14} className="text-text-accent" />
                  <span className="text-xs font-medium text-text-secondary">SmartExam AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse ml-1" />
                </div>

                <div className="flex-1 px-5 py-4 space-y-3 overflow-hidden">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-foreground max-w-[280px]">
                      {current.q}
                    </div>
                  </div>

                  {/* Mark selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-text-muted mr-1">Answer for:</span>
                    {[
                      { label: '2 Marks', color: 'bg-mark-2/15 text-mark-2 border-mark-2/20' },
                      { label: '4 Marks', color: 'bg-mark-4/15 text-mark-4 border-mark-4/20' },
                      { label: '8 Marks', color: 'bg-mark-8/15 text-mark-8 border-mark-8/20' },
                    ].map((m, i) => (
                      <span key={m.label} className={`text-[10px] px-2.5 py-1 rounded-md border transition-all ${i === 2 ? m.color : 'bg-muted/15 text-text-muted border-transparent'}`}>
                        {m.label}
                      </span>
                    ))}
                  </div>

                  {/* AI response */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={11} className="text-text-accent" />
                      <span className="text-[10px] font-medium text-text-muted font-mono">AI Response</span>
                    </div>
                    <div className="bg-muted/10 rounded-xl px-4 py-3 text-sm space-y-2 border border-border/15">
                      <p className="font-display font-semibold text-foreground text-xs">{current.answer.title}</p>
                      <p className="text-text-secondary text-[11px] leading-relaxed">
                        {typedAnswer}
                        {isTyping && <span className="typewriter-cursor" />}
                      </p>
                      {!isTyping && (
                        <>
                          <ul className="text-[11px] text-text-secondary space-y-0.5">
                            {current.answer.points.map((p) => (
                              <li key={p.key}>
                                <span className="text-text-accent font-medium">{p.key}</span> — {p.val}
                              </li>
                            ))}
                          </ul>
                          <p className="font-mono text-[10px] text-text-muted pt-1.5 border-t border-border/15">{current.answer.source}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted/50 animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border/15 px-4 py-2.5 flex gap-2">
                  <input type="text" placeholder="Ask a question..." className="flex-1 bg-muted/10 rounded-lg px-3.5 py-2 text-sm text-foreground placeholder:text-text-muted/40 border border-border/15 focus:border-primary/30 focus:outline-none transition-colors" readOnly />
                  <button className="p-2 rounded-lg bg-primary/15 border border-primary/15 cursor-pointer hover:bg-primary/25 transition-colors" aria-label="Send">
                    <Send size={14} className="text-text-accent" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
