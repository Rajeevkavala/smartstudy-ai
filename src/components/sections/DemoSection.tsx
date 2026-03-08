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
        { key: '3NF', val: 'Remove transitive dependencies' },
        { key: 'BCNF', val: 'Every determinant must be a candidate key' },
      ],
      source: 'Ch. 4, Page 42 · ~188 words',
    },
  },
  {
    q: 'Explain ACID properties',
    answer: {
      title: 'ACID Properties (8 Marks)',
      body: 'ACID properties ensure reliable processing of database transactions, maintaining data integrity.',
      points: [
        { key: 'Atomicity', val: 'All operations complete or none do' },
        { key: 'Consistency', val: 'Database moves from one valid state to another' },
        { key: 'Isolation', val: 'Concurrent transactions do not interfere' },
        { key: 'Durability', val: 'Committed changes persist after failure' },
      ],
      source: 'Ch. 5, Page 67 · ~156 words',
    },
  },
  {
    q: 'What is indexing in DBMS?',
    answer: {
      title: 'Indexing in DBMS (8 Marks)',
      body: 'An index is a data structure that improves the speed of data retrieval operations on a database table.',
      points: [
        { key: 'Primary', val: 'Index on primary key — one per table' },
        { key: 'Secondary', val: 'Index on non-key attributes for faster lookup' },
        { key: 'Clustered', val: 'Physical reordering of data rows' },
        { key: 'Dense/Sparse', val: 'Entry per record vs entry per block' },
      ],
      source: 'Ch. 7, Page 112 · ~172 words',
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
      if (i >= fullText.length) { clearInterval(interval); setIsTyping(false); }
    }, 14);
    return () => clearInterval(interval);
  }, [activeQ]);

  useEffect(() => { const cleanup = typeAnswer(); return cleanup; }, [typeAnswer]);

  return (
    <section id="demo" className="relative py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            👁 See it in action
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Ask. Get answers. Ace your exam.
          </motion.h2>
        </div>

        {/* Question pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setActiveQ(i)}
              className={`text-xs px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer font-display ${
                i === activeQ
                  ? 'bg-primary/10 border-primary/20 text-foreground'
                  : 'bg-transparent border-border/20 text-text-muted hover:text-text-secondary hover:border-border/40'
              }`}
            >
              {q.q}
            </button>
          ))}
        </div>

        {/* Demo window */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="rounded-2xl border border-border/20 overflow-hidden"
            style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)' }}
          >
            {/* Chrome */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card/70 border-b border-border/15">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                <div className="w-2 h-2 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-muted/20 rounded px-6 py-0.5 text-[10px] text-text-muted font-mono">smartexam.ai/study</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[360px] bg-background/80">
              {/* PDF panel */}
              <div className="lg:col-span-2 border-r border-border/10 p-4">
                <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-border/10">
                  <FileText size={12} className="text-text-accent" />
                  <span className="font-mono text-[10px] text-text-secondary">DBMS_Notes.pdf</span>
                  <span className="ml-auto font-mono text-[9px] text-text-muted">42 / 180</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-muted/15 rounded w-3/4" />
                  <div className="h-2.5 bg-muted/12 rounded w-full" />
                  <div className="h-2.5 bg-muted/12 rounded w-5/6" />
                  <div className="bg-primary/[0.04] border-l-2 border-primary/30 rounded-r px-3 py-2.5 my-3 space-y-1.5">
                    <div className="h-2 bg-primary/8 rounded w-full" />
                    <div className="h-2 bg-primary/8 rounded w-4/5" />
                    <div className="h-2 bg-primary/6 rounded w-3/5" />
                  </div>
                  <div className="h-2.5 bg-muted/12 rounded w-2/3" />
                  <div className="h-2.5 bg-muted/10 rounded w-4/5" />
                  <div className="h-2.5 bg-muted/10 rounded w-1/2" />
                </div>
              </div>

              {/* Chat panel */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="px-4 py-2 border-b border-border/10 flex items-center gap-1.5">
                  <Bot size={12} className="text-text-accent" />
                  <span className="text-[10px] font-medium text-text-secondary">SmartExam AI</span>
                  <span className="w-1 h-1 rounded-full bg-success ml-0.5" />
                </div>

                <div className="flex-1 px-4 py-3 space-y-2.5 overflow-hidden">
                  {/* User msg */}
                  <div className="flex justify-end">
                    <div className="bg-primary/8 border border-primary/12 rounded-xl rounded-tr-sm px-3 py-2 text-[11px] text-foreground max-w-[240px]">
                      {current.q}
                    </div>
                  </div>

                  {/* Mark selector */}
                  <div className="flex items-center gap-1">
                    {[
                      { l: '2M', c: 'text-mark-2 bg-mark-2/8 border-mark-2/15', active: false },
                      { l: '4M', c: 'text-mark-4 bg-mark-4/8 border-mark-4/15', active: false },
                      { l: '8M', c: 'text-mark-8 bg-mark-8/8 border-mark-8/15', active: true },
                    ].map(m => (
                      <span key={m.l} className={`text-[9px] font-mono px-2 py-0.5 rounded border ${m.active ? m.c : 'text-text-muted bg-transparent border-border/15'}`}>{m.l}</span>
                    ))}
                  </div>

                  {/* AI answer */}
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles size={10} className="text-text-accent" />
                      <span className="text-[9px] font-mono text-text-muted">AI Response</span>
                    </div>
                    <div className="bg-surface/60 rounded-lg px-3 py-2.5 border border-border/10 text-[11px] space-y-1.5">
                      <p className="font-display font-semibold text-foreground text-[11px]">{current.answer.title}</p>
                      <p className="text-text-secondary leading-relaxed">
                        {typedAnswer}
                        {isTyping && <span className="typewriter-cursor" />}
                      </p>
                      {!isTyping && (
                        <>
                          <ul className="text-text-secondary space-y-0.5">
                            {current.answer.points.map(p => (
                              <li key={p.key}><span className="text-text-accent font-medium">{p.key}</span> — {p.val}</li>
                            ))}
                          </ul>
                          <p className="font-mono text-[9px] text-text-muted pt-1 border-t border-border/10">{current.answer.source}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/10 px-3 py-2 flex gap-2">
                  <input type="text" placeholder="Ask a question..." className="flex-1 bg-muted/8 rounded-lg px-3 py-1.5 text-[11px] text-foreground placeholder:text-text-muted/30 border border-border/10 focus:outline-none focus:border-primary/20 transition-colors" readOnly />
                  <button className="p-1.5 rounded-lg bg-primary/10 cursor-pointer hover:bg-primary/20 transition-colors" aria-label="Send">
                    <Send size={12} className="text-text-accent" />
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
