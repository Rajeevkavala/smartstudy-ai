import { motion } from 'framer-motion';
import { Bot, FileText, Star, GraduationCap, BarChart3, Copy, ChevronRight, Clock, TrendingUp } from 'lucide-react';

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
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            Dashboard
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold mt-4 text-foreground tracking-tight">
            Your AI-powered
            <br />
            <span className="gradient-text">study hub.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.1 }} className="text-text-muted mt-4 text-sm max-w-md mx-auto">
            Everything organized in one clean, intelligent interface designed for focused studying.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }} className="relative mt-16 max-w-5xl mx-auto">
          <div className="absolute -inset-12 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none" />
          
          <div className="relative rounded-2xl border border-border/20 overflow-hidden bg-card/20 shadow-[0_20px_80px_-20px_rgba(99,102,241,0.1)]">
            {/* Window chrome */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border/15 bg-card/40">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/40" />
                <div className="w-3 h-3 rounded-full bg-amber-400/40" />
                <div className="w-3 h-3 rounded-full bg-success/40" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-muted/20 rounded-lg px-5 py-1.5 text-[10px] text-text-muted font-mono">smartexam.ai/dashboard</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[440px]">
              {/* Sidebar */}
              <div className="border-r border-border/10 p-4 hidden md:flex flex-col bg-card/15">
                <div className="flex items-center gap-2.5 mb-6 px-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center border border-primary/15">
                    <Bot size={13} className="text-primary" />
                  </div>
                  <span className="font-heading font-bold text-xs text-foreground">SmartExam</span>
                </div>
                <nav className="space-y-1 flex-1">
                  {sidebarItems.map((item) => (
                    <div key={item.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all duration-300 ${item.active ? 'bg-primary/10 text-text-accent border border-primary/10' : 'text-text-muted hover:text-foreground hover:bg-muted/15 border border-transparent'}`}>
                      <item.icon size={15} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  ))}
                </nav>
                <div className="border-t border-border/10 pt-4 mt-auto px-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/30" />
                    <div>
                      <p className="text-[11px] text-foreground font-medium">Student</p>
                      <p className="text-[9px] text-text-muted">Free Plan</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="p-6 bg-background/50">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono mb-6">
                  <span className="hover:text-foreground cursor-pointer transition-colors">My PDFs</span>
                  <ChevronRight size={10} />
                  <span className="hover:text-foreground cursor-pointer transition-colors">DBMS Notes</span>
                  <ChevronRight size={10} />
                  <span className="text-text-secondary">Chapter 4</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: Clock, label: 'Study time', value: '2h 34m' },
                    { icon: TrendingUp, label: 'Questions', value: '47' },
                    { icon: Star, label: 'Saved', value: '12' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border/10 bg-card/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <stat.icon size={10} className="text-text-muted" />
                        <span className="text-[9px] text-text-muted font-mono">{stat.label}</span>
                      </div>
                      <p className="text-sm font-heading font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
                
                {/* Question */}
                <div className="rounded-xl border border-border/15 bg-card/15 p-5 mb-4">
                  <p className="text-foreground font-medium text-sm">Q: Explain the ACID properties of database transactions.</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-mono text-text-accent bg-primary/8 px-2.5 py-1 rounded-lg border border-primary/10">8-mark answer</span>
                    <span className="text-[10px] font-mono text-text-muted">Ch. 4</span>
                  </div>
                </div>

                {/* Answer */}
                <div className="rounded-xl border border-border/15 bg-card/15 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                        <Bot size={11} className="text-text-accent" />
                      </div>
                      <span className="text-xs font-medium text-foreground">AI Answer</span>
                      <span className="text-[9px] font-mono text-success bg-success/8 px-2 py-0.5 rounded">Complete</span>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors" aria-label="Copy">
                      <Copy size={13} className="text-text-muted" />
                    </button>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <p className="font-heading font-bold text-foreground text-[13px]">ACID Properties (8 Marks)</p>
                    {[
                      { term: 'Atomicity', def: 'All operations in a transaction complete or none do.' },
                      { term: 'Consistency', def: 'Database moves from one valid state to another.' },
                      { term: 'Isolation', def: "Concurrent transactions don't interfere with each other." },
                      { term: 'Durability', def: 'Committed changes persist even after system failure.' },
                    ].map((item) => (
                      <p key={item.term} className="text-[11px] text-text-secondary leading-relaxed">
                        <span className="text-text-accent font-semibold">{item.term}</span> — {item.def}
                      </p>
                    ))}
                    <div className="flex items-center gap-3 pt-3 border-t border-border/10">
                      <span className="font-mono text-[10px] text-text-muted">~180 words</span>
                      <span className="font-mono text-[10px] text-text-muted">· Ch. 4, Page 42</span>
                      <span className="font-mono text-[10px] text-success ml-auto">✓ Exam ready</span>
                    </div>
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
