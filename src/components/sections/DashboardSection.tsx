import { motion } from 'framer-motion';
import { Bot, FileText, Star, GraduationCap, BarChart3, Copy, ChevronRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sidebarItems = [
  { icon: FileText, label: 'My PDFs', active: true },
  { icon: Bot, label: 'Ask AI', active: false },
  { icon: Star, label: 'Important Questions', active: false },
  { icon: GraduationCap, label: 'Practice Mode', active: false },
  { icon: BarChart3, label: 'Progress', active: false },
];

export default function DashboardSection() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-lg mx-auto">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            🖥 Dashboard
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mt-3"
          >
            <span className="font-drama italic text-primary text-3xl md:text-4xl">Your AI-powered study hub</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="text-text-muted mt-3"
          >
            Everything organized in one clean, intelligent interface
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="relative mt-14 max-w-5xl mx-auto"
        >
          <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),transparent)] blur-3xl -z-10" />

          <div className="rounded-2xl border border-border/20 overflow-hidden bg-card/30"
            style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)' }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/15 bg-card/60">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-mark-16/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-muted/30 rounded-md px-4 py-1 text-xs text-text-muted font-mono">app.smartexam.ai/dashboard</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[420px]">
              {/* Sidebar */}
              <div className="border-r border-border/10 p-3 hidden md:flex flex-col bg-card/20">
                <div className="flex items-center gap-2 mb-5 px-2.5">
                  <Bot size={14} className="text-primary" />
                  <span className="font-display font-semibold text-xs text-foreground">SmartExam AI</span>
                </div>
                <nav className="space-y-0.5 flex-1">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all duration-300 ${
                        item.active
                          ? 'bg-primary/10 text-text-accent border-l-2 border-primary'
                          : 'text-text-muted hover:text-foreground hover:bg-muted/15'
                      }`}
                    >
                      <item.icon size={14} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>
                <div className="border-t border-border/10 pt-3 mt-auto px-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-accent/30" />
                    <div>
                      <span className="text-[11px] text-foreground block leading-none">Student</span>
                      <span className="text-[10px] text-text-muted">Upgrade Plan ↗</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="p-6 bg-background/60">
                <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono mb-5">
                  <span>My PDFs</span>
                  <ChevronRight size={10} />
                  <span>DBMS Notes</span>
                  <ChevronRight size={10} />
                  <span className="text-text-secondary">Chapter 4</span>
                </div>

                {/* Question */}
                <div className="rounded-xl border border-border/15 bg-card/20 p-4 mb-4">
                  <p className="text-foreground font-display font-medium text-sm">Q: Explain the ACID properties of database transactions.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-mark-8 bg-mark-8/10 px-2 py-0.5 rounded border border-mark-8/20">8-MARK ANSWER</span>
                  </div>
                </div>

                {/* Answer */}
                <div className="rounded-xl border border-border/15 bg-card/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot size={13} className="text-text-accent" />
                      <span className="text-xs font-medium text-text-secondary font-display">AI Answer</span>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors" aria-label="Copy answer">
                      <Copy size={12} className="text-text-muted" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-display font-semibold text-foreground text-xs">ACID Properties (8 Marks)</p>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      ACID properties ensure reliable processing of database transactions, maintaining data integrity even in cases of errors or system failures.
                    </p>
                    {[
                      { term: 'Atomicity', def: 'All operations complete or none do — no partial transactions.' },
                      { term: 'Consistency', def: 'Database moves from one valid state to another.' },
                      { term: 'Isolation', def: 'Concurrent transactions don\'t interfere with each other.' },
                      { term: 'Durability', def: 'Committed changes persist even after system failure.' },
                    ].map((item) => (
                      <p key={item.term} className="text-[11px] text-text-secondary leading-relaxed">
                        <span className="text-text-accent font-medium">• {item.term}</span> — {item.def}
                      </p>
                    ))}
                    <p className="font-mono text-[10px] text-text-muted pt-2 border-t border-border/10">~188 words · Ch. 5, Page 67</p>
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
