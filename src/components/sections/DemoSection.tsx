import { motion } from 'framer-motion';
import { FileText, Bot, Send, Sparkles, Copy, CheckCheck } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function DemoSection() {
  return (
    <section id="demo" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
              Live Demo
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold mt-4 text-foreground leading-[1.1] tracking-tight">
              See it in action.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.1 }} className="text-text-muted mt-4 text-sm leading-relaxed max-w-md">
              Ask any question from your uploaded material and get perfectly formatted, exam-ready answers with source references and word counts.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.2 }} className="mt-10 space-y-5">
              {[
                { label: 'Context-aware', desc: 'Understands your entire document — not just keywords' },
                { label: 'Mark-based formatting', desc: 'Answers tailored to 2, 4, 8, or 16-mark requirements' },
                { label: 'Source tracking', desc: 'Every answer cites the exact chapter and page' },
                { label: 'Copy & export', desc: 'One-click copy or export to your notes app' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/15 group-hover:border-primary/20 transition-all duration-500">
                    <CheckCheck size={14} className="text-text-accent" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <p className="text-sm text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Demo mockup */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
            <div className="relative">
              <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.08),transparent_60%)] pointer-events-none" />
              <div className="relative rounded-2xl border border-border/20 bg-card/30 overflow-hidden shadow-[0_16px_64px_-16px_rgba(124,58,237,0.12)]">
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-border/15 flex items-center gap-2.5 bg-card/40">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot size={12} className="text-text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">SmartExam AI</span>
                  <span className="flex items-center gap-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-success font-mono">Active</span>
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-[9px] font-mono text-text-muted bg-muted/20 px-2 py-0.5 rounded">GPT-4</span>
                  </div>
                </div>

                <div className="px-5 py-5 space-y-4">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-primary/10 border border-primary/12 rounded-2xl rounded-tr-md px-4 py-3 text-sm text-foreground max-w-[260px]">
                      What is database normalization? Explain for 8 marks.
                    </div>
                  </div>

                  {/* Mark pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-mono">Format:</span>
                    {['2 Marks', '4 Marks', '8 Marks'].map((m, i) => (
                      <span key={m} className={`text-[10px] px-3 py-1 rounded-lg transition-all ${i === 2 ? 'bg-primary/12 text-text-accent border border-primary/20' : 'bg-muted/15 text-text-muted border border-transparent'}`}>
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* AI response */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} className="text-text-accent" />
                      <span className="text-[10px] font-mono text-text-muted">AI RESPONSE</span>
                    </div>
                    <div className="bg-muted/8 rounded-xl px-5 py-4 text-sm space-y-2.5 border border-border/10">
                      <div className="flex items-center justify-between">
                        <p className="font-heading font-bold text-foreground text-[13px]">Database Normalization (8 Marks)</p>
                        <button className="p-1.5 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors" aria-label="Copy">
                          <Copy size={12} className="text-text-muted" />
                        </button>
                      </div>
                      <p className="text-text-secondary text-[11px] leading-relaxed">Normalization organizes data to minimize redundancy and improve integrity...</p>
                      <ul className="text-[11px] text-text-secondary space-y-1.5">
                        <li className="flex gap-2"><span className="text-text-accent font-semibold">1NF</span><span>— Eliminate repeating groups</span></li>
                        <li className="flex gap-2"><span className="text-text-accent font-semibold">2NF</span><span>— Remove partial dependencies</span></li>
                        <li className="flex gap-2"><span className="text-text-accent font-semibold">3NF</span><span>— Remove transitive dependencies</span></li>
                      </ul>
                      <div className="flex items-center gap-3 pt-2 border-t border-border/10">
                        <span className="font-mono text-[10px] text-text-muted">Ch. 4, Page 42</span>
                        <span className="font-mono text-[10px] text-text-muted">· ~180 words</span>
                        <span className="font-mono text-[10px] text-success ml-auto">✓ Exam ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Typing */}
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-text-accent/30 animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/15 px-4 py-3 flex gap-2">
                  <input type="text" placeholder="Ask a question..." className="flex-1 bg-muted/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted/40 border border-border/10 focus:border-primary/25 focus:outline-none transition-colors" readOnly />
                  <button className="p-2.5 rounded-xl bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/15 cursor-pointer hover:from-primary/25 hover:to-secondary/25 transition-all duration-300" aria-label="Send">
                    <Send size={14} className="text-text-accent" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
