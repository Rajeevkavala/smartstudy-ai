import { motion } from 'framer-motion';
import { Bot, FileText, Star, GraduationCap, BarChart3, Copy } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const sidebarItems = [
  { icon: FileText, label: 'My PDFs', active: true },
  { icon: Bot, label: 'Ask AI', active: false },
  { icon: Star, label: 'Important Questions', active: false },
  { icon: GraduationCap, label: 'Practice Mode', active: false },
  { icon: BarChart3, label: 'Progress', active: false },
];

export default function DashboardSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <SectionBadge>Dashboard</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>Your AI-powered study hub</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-xl mx-auto">Everything organized in one clean, intelligent interface</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="relative mt-12 max-w-6xl mx-auto">
          <div className="absolute -inset-6 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent)] blur-3xl -z-10" />
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[420px]">
              <div className="bg-surface border-r border-border/50 p-4 hidden md:flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <span className="font-heading font-bold text-sm gradient-text">SmartExam AI</span>
                </div>
                <div className="border-t border-border/50 mb-4" />
                <nav className="space-y-1 flex-1">
                  {sidebarItems.map((item) => (
                    <div key={item.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${item.active ? 'bg-primary/10 border-l-2 border-primary text-text-accent' : 'text-text-muted hover:text-foreground hover:bg-surface-elevated'}`}>
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>
                <div className="border-t border-border/50 pt-3 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20" />
                    <div>
                      <p className="text-xs text-foreground">Student</p>
                      <p className="text-xs text-text-accent cursor-pointer">Upgrade Plan</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0D1525] p-6">
                <div className="flex items-center gap-1 font-mono text-xs text-text-muted mb-4">
                  <FileText size={12} /> <span>My PDFs</span> <span className="mx-1">/</span> <span>DBMS Notes</span> <span className="mx-1">/</span> <span className="text-text-secondary">Chapter 4</span>
                </div>
                <div className="glass-card p-4 mb-4">
                  <p className="text-foreground font-medium text-sm">Q: Explain the ACID properties of database transactions.</p>
                  <span className="section-badge text-[10px] mt-2 inline-block">8-mark answer</span>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot size={14} className="text-text-accent" />
                      <span className="text-sm font-medium text-text-secondary">AI Answer</span>
                    </div>
                    <button className="p-1.5 rounded hover:bg-surface-elevated cursor-pointer transition-colors" aria-label="Copy">
                      <Copy size={14} className="text-text-muted" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-heading font-semibold text-foreground">ACID Properties (8 Marks)</p>
                    {[
                      { term: 'Atomicity', def: 'All operations complete or none do — no partial transactions.' },
                      { term: 'Consistency', def: 'Database moves from one valid state to another.' },
                      { term: 'Isolation', def: "Concurrent transactions don't interfere with each other." },
                      { term: 'Durability', def: 'Committed changes persist even after system failure.' },
                    ].map((item) => (
                      <p key={item.term} className="text-xs text-text-secondary"><strong className="text-foreground">{item.term}:</strong> {item.def}</p>
                    ))}
                    <p className="font-mono text-xs text-text-muted pt-2 border-t border-border/50">~180 words</p>
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
