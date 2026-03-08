import { motion } from 'framer-motion';
import { FileText, Bot, Send, Sparkles } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function DemoSection() {
  return (
    <section id="demo" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Split layout: text left, demo right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div>
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
              Live Demo
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground leading-tight">
              See it in action.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.1 }} className="text-text-muted mt-3 text-sm leading-relaxed max-w-md">
              Ask any question from your uploaded material and get perfectly formatted, exam-ready answers with source references.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.2 }} className="mt-8 space-y-4">
              {[
                { label: 'Context-aware', desc: 'Understands your entire document' },
                { label: 'Mark-based', desc: 'Answers tailored to exam requirements' },
                { label: 'Source tracking', desc: 'Every answer cites the exact page' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-accent mt-2 shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-sm text-text-muted ml-1.5">— {item.desc}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Demo mockup */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
            <div className="rounded-2xl border border-border/30 bg-card/30 overflow-hidden shadow-glass">
              {/* Chat header */}
              <div className="px-5 py-2.5 border-b border-border/20 flex items-center gap-2 bg-card/50">
                <Bot size={14} className="text-text-accent" />
                <span className="text-xs font-medium text-text-secondary">SmartExam AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse ml-1" />
              </div>

              <div className="px-5 py-5 space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-foreground max-w-[260px]">
                    What is database normalization?
                  </div>
                </div>

                {/* Mark pills */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted mr-1">Format:</span>
                  {['2 Marks', '4 Marks', '8 Marks'].map((m, i) => (
                    <span key={m} className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${i === 2 ? 'bg-primary/15 text-text-accent border border-primary/25' : 'bg-muted/20 text-text-muted'}`}>
                      {m}
                    </span>
                  ))}
                </div>

                {/* AI response */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={11} className="text-text-accent" />
                    <span className="text-[10px] font-medium text-text-muted">AI Response</span>
                  </div>
                  <div className="bg-muted/15 rounded-xl px-4 py-3 text-sm space-y-2 border border-border/15">
                    <p className="font-heading font-semibold text-foreground text-xs">Database Normalization (8 Marks)</p>
                    <p className="text-text-secondary text-[11px] leading-relaxed">Normalization organizes data to minimize redundancy and improve integrity...</p>
                    <ul className="text-[11px] text-text-secondary space-y-0.5">
                      <li><span className="text-text-accent font-medium">1NF</span> — Eliminate repeating groups</li>
                      <li><span className="text-text-accent font-medium">2NF</span> — Remove partial dependencies</li>
                      <li><span className="text-text-accent font-medium">3NF</span> — Remove transitive dependencies</li>
                    </ul>
                    <p className="font-mono text-[10px] text-text-muted pt-1.5 border-t border-border/15">Ch. 4, Page 42</p>
                  </div>
                </div>

                {/* Typing */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>

              <div className="border-t border-border/20 px-4 py-2.5 flex gap-2">
                <input type="text" placeholder="Ask a question..." className="flex-1 bg-muted/15 rounded-lg px-3.5 py-2 text-sm text-foreground placeholder:text-text-muted/50 border border-border/15 focus:border-primary/30 focus:outline-none transition-colors" readOnly />
                <button className="p-2 rounded-lg bg-primary/15 border border-primary/15 cursor-pointer hover:bg-primary/25 transition-colors" aria-label="Send">
                  <Send size={14} className="text-text-accent" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
