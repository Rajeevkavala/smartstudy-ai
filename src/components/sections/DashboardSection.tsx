import { motion } from 'framer-motion';
import { Bot, FileText, Star, GraduationCap, BarChart3, Copy, ChevronRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sidebarItems = [
  { icon: FileText, label: 'My PDFs', active: true },
  { icon: Bot, label: 'Ask AI', active: false },
  { icon: Star, label: 'Important', active: false },
  { icon: GraduationCap, label: 'Practice', active: false },
  { icon: BarChart3, label: 'Progress', active: false },
];

export default function DashboardSection() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-lg mx-auto">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            Dashboard
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Your study hub.
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.1 }} className="text-text-muted mt-3 text-sm">
            Everything organized in one clean, intelligent interface.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="relative mt-14 max-w-5xl mx-auto">
          <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent)] blur-3xl -z-10" />
          
          <div className="rounded-2xl border border-border/30 overflow-hidden bg-card/30 shadow-glass">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/20 bg-card/60">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] min-h-[400px]">
              {/* Sidebar */}
              <div className="border-r border-border/15 p-3 hidden md:flex flex-col bg-card/20">
                <div className="flex items-center gap-2 mb-5 px-2">
                  <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                    <Bot size={12} className="text-primary" />
                  </div>
                  <span className="font-heading font-semibold text-xs text-foreground">SmartExam</span>
                </div>
                <nav className="space-y-0.5 flex-1">
                  {sidebarItems.map((item) => (
                    <div key={item.label} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all duration-300 ${item.active ? 'bg-primary/10 text-text-accent' : 'text-text-muted hover:text-foreground hover:bg-muted/20'}`}>
                      <item.icon size={14} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>
                <div className="border-t border-border/15 pt-3 mt-auto px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30" />
                    <span className="text-[10px] text-text-muted">Free Plan</span>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="p-5 bg-background/60">
                <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono mb-4">
                  <span>My PDFs</span>
                  <ChevronRight size={10} />
                  <span>DBMS Notes</span>
                  <ChevronRight size={10} />
                  <span className="text-text-secondary">Chapter 4</span>
                </div>
                
                {/* Question */}
                <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-3">
                  <p className="text-foreground font-medium text-sm">Q: Explain the ACID properties of database transactions.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-text-accent bg-primary/8 px-2 py-0.5 rounded">8-mark answer</span>
                  </div>
                </div>

                {/* Answer */}
                <div className="rounded-xl border border-border/20 bg-card/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot size={13} className="text-text-accent" />
                      <span className="text-xs font-medium text-text-secondary">AI Answer</span>
                    </div>
                    <button className="p-1 rounded hover:bg-muted/20 cursor-pointer transition-colors" aria-label="Copy">
                      <Copy size={12} className="text-text-muted" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-heading font-semibold text-foreground text-xs">ACID Properties (8 Marks)</p>
                    {[
                      { term: 'Atomicity', def: 'All operations complete or none do.' },
                      { term: 'Consistency', def: 'Database moves from one valid state to another.' },
                      { term: 'Isolation', def: "Concurrent transactions don't interfere." },
                      { term: 'Durability', def: 'Committed changes persist after failure.' },
                    ].map((item) => (
                      <p key={item.term} className="text-[11px] text-text-secondary leading-relaxed">
                        <span className="text-text-accent font-medium">{item.term}</span> — {item.def}
                      </p>
                    ))}
                    <p className="font-mono text-[10px] text-text-muted pt-2 border-t border-border/15">~180 words · Ch. 4, Page 42</p>
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
