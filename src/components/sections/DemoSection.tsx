import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Bot, Send, Sparkles, Copy, Check } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const questions = [
  {
    q: 'What is database normalization?',
    mark: '8M',
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
    mark: '8M',
    answer: {
      title: 'ACID Properties (8 Marks)',
      body: 'ACID properties ensure reliable processing of database transactions, maintaining data integrity even in failure scenarios.',
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
    mark: '4M',
    answer: {
      title: 'Indexing in DBMS (4 Marks)',
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
    }, 12);
    return () => clearInterval(interval);
  }, [activeQ]);

  useEffect(() => { const cleanup = typeAnswer(); return cleanup; }, [typeAnswer]);

  return (
    <section id="demo" className="relative py-32 px-6">
      {/* Dramatic bg glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, hsl(var(--primary) / 0.03), transparent)' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            👁 See it in action
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="font-display font-bold mt-4 text-foreground"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            Ask. Get answers. <span className="font-drama italic" style={{ color: 'hsl(var(--primary))' }}>Ace your exam.</span>
          </motion.h2>
        </div>

        {/* Question pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setActiveQ(i)}
              className="text-xs px-5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer font-display font-medium"
              style={{
                background: i === activeQ ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                borderColor: i === activeQ ? 'hsl(var(--primary) / 0.25)' : 'hsl(var(--border) / 0.3)',
                color: i === activeQ ? 'hsl(var(--foreground))' : 'hsl(var(--text-muted))',
                boxShadow: i === activeQ ? '0 0 20px hsl(var(--primary) / 0.06)' : 'none',
              }}
            >
              {q.q}
            </button>
          ))}
        </div>

        {/* Demo window */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid hsl(var(--border) / 0.25)',
              boxShadow: '0 50px 100px -25px rgba(0,0,0,0.6), 0 0 60px hsl(var(--primary) / 0.04), inset 0 1px 0 hsl(var(--foreground) / 0.03)',
            }}
          >
            {/* Chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'hsl(var(--card) / 0.8)', borderBottom: '1px solid hsl(var(--border) / 0.2)' }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded-md px-8 py-1 text-[10px] font-mono flex items-center gap-1.5" style={{ background: 'hsl(var(--muted) / 0.25)', color: 'hsl(var(--text-muted))' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--success) / 0.6)' }} />
                  smartexam.ai/study
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[400px]" style={{ background: 'hsl(var(--background) / 0.9)' }}>
              {/* PDF panel */}
              <div className="lg:col-span-2 p-5" style={{ borderRight: '1px solid hsl(var(--border) / 0.1)' }}>
                <div className="flex items-center gap-1.5 mb-4 pb-2.5" style={{ borderBottom: '1px solid hsl(var(--border) / 0.1)' }}>
                  <FileText size={12} className="text-text-accent" />
                  <span className="font-mono text-[10px]" style={{ color: 'hsl(var(--text-secondary))' }}>DBMS_Notes.pdf</span>
                  <span className="ml-auto font-mono text-[9px]" style={{ color: 'hsl(var(--text-muted))' }}>42 / 180</span>
                </div>
                <div className="space-y-2">
                  {[75, 100, 85, 65, 90, 70, 80, 55].map((w, i) => (
                    <div key={i} className="h-2 rounded" style={{ width: `${w}%`, background: 'hsl(var(--muted) / 0.12)' }} />
                  ))}
                  <div className="rounded-r px-3 py-3 my-3 space-y-1.5" style={{ background: 'hsl(var(--primary) / 0.04)', borderLeft: '2px solid hsl(var(--primary) / 0.35)' }}>
                    <div className="h-2 rounded w-full" style={{ background: 'hsl(var(--primary) / 0.1)' }} />
                    <div className="h-2 rounded w-4/5" style={{ background: 'hsl(var(--primary) / 0.08)' }} />
                    <div className="h-2 rounded w-3/5" style={{ background: 'hsl(var(--primary) / 0.06)' }} />
                  </div>
                  {[60, 80, 50].map((w, i) => (
                    <div key={`b-${i}`} className="h-2 rounded" style={{ width: `${w}%`, background: 'hsl(var(--muted) / 0.1)' }} />
                  ))}
                </div>
              </div>

              {/* Chat panel */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ borderBottom: '1px solid hsl(var(--border) / 0.1)' }}>
                  <Bot size={12} className="text-text-accent" />
                  <span className="text-[10px] font-semibold" style={{ color: 'hsl(var(--text-secondary))' }}>SmartExam AI</span>
                  <span className="relative flex h-1.5 w-1.5 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                  </span>
                </div>

                <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
                  {/* User msg */}
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm px-4 py-2 text-[11px] text-foreground max-w-[260px]" style={{ background: 'hsl(var(--primary) / 0.08)', border: '1px solid hsl(var(--primary) / 0.12)' }}>
                      {current.q}
                    </div>
                  </div>

                  {/* Mark selector */}
                  <div className="flex items-center gap-1.5">
                    {['2M', '4M', '8M', '16M'].map(m => (
                      <span
                        key={m}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-md border font-medium"
                        style={{
                          background: m === current.mark ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                          borderColor: m === current.mark ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border) / 0.15)',
                          color: m === current.mark ? 'hsl(var(--text-accent))' : 'hsl(var(--text-muted))',
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* AI answer */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={10} className="text-text-accent" />
                      <span className="text-[9px] font-mono" style={{ color: 'hsl(var(--text-muted))' }}>AI Response</span>
                    </div>
                    <div className="rounded-xl px-4 py-3 text-[11px] space-y-2" style={{ background: 'hsl(var(--surface) / 0.6)', border: '1px solid hsl(var(--border) / 0.15)' }}>
                      <p className="font-display font-semibold text-foreground text-[11px]">{current.answer.title}</p>
                      <p style={{ color: 'hsl(var(--text-secondary))' }} className="leading-relaxed">
                        {typedAnswer}
                        {isTyping && <span className="typewriter-cursor" />}
                      </p>
                      {!isTyping && (
                        <>
                          <ul className="space-y-1" style={{ color: 'hsl(var(--text-secondary))' }}>
                            {current.answer.points.map(p => (
                              <li key={p.key} className="flex gap-1.5">
                                <span className="text-text-accent font-semibold shrink-0">•</span>
                                <span><span className="text-text-accent font-medium">{p.key}</span> — {p.val}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid hsl(var(--border) / 0.1)' }}>
                            <p className="font-mono text-[9px]" style={{ color: 'hsl(var(--text-muted))' }}>{current.answer.source}</p>
                            <button className="p-1 rounded hover:bg-muted/15 transition-colors cursor-pointer" aria-label="Copy">
                              <Copy size={10} style={{ color: 'hsl(var(--text-muted))' }} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2.5" style={{ borderTop: '1px solid hsl(var(--border) / 0.1)' }}>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Ask a question..." className="flex-1 rounded-xl px-4 py-2 text-[11px] text-foreground placeholder:text-text-muted/30 focus:outline-none transition-colors" style={{ background: 'hsl(var(--muted) / 0.08)', border: '1px solid hsl(var(--border) / 0.1)' }} readOnly />
                    <button className="p-2 rounded-xl cursor-pointer transition-colors" style={{ background: 'hsl(var(--primary) / 0.1)' }} aria-label="Send">
                      <Send size={12} className="text-text-accent" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
