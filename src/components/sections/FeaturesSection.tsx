import { motion } from 'framer-motion';
import { FileUp, MessageSquare, ListChecks, Zap, Target, BarChart3, ArrowUpRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  { icon: FileUp, title: 'Upload Study Material', desc: 'Upload PDFs, notes, or textbooks. Our AI processes and indexes your content instantly for deep understanding.', span: 'md:col-span-2 lg:col-span-2', highlight: true },
  { icon: MessageSquare, title: 'Ask Questions', desc: 'Ask questions directly from uploaded documents. Get precise, contextual answers backed by your study material.', span: '', highlight: false },
  { icon: ListChecks, title: 'Mark-based Answers', desc: 'Generate structured answers for 2, 4, 8, and 16-mark exam questions with proper formatting.', span: '', highlight: false },
  { icon: Zap, title: 'Instant Summaries', desc: 'Get chapter and topic summaries instantly. Focus on what matters most for your upcoming exam.', span: 'md:col-span-2 lg:col-span-2', highlight: true },
  { icon: Target, title: 'Smart Exam Mode', desc: 'Focus on frequently asked questions. Maximize your study efficiency with intelligent prioritization.', span: '', highlight: false },
  { icon: BarChart3, title: 'Topic Insights', desc: 'Know which topics appear most in exams. Prioritize your study sessions strategically.', span: '', highlight: false },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="max-w-2xl">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            Features
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold mt-4 text-foreground leading-[1.1] tracking-tight">
            Everything you need to
            <br />
            <span className="gradient-text">ace your exams.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.1 }} className="text-text-muted mt-4 text-sm leading-relaxed max-w-md">
            Powerful AI tools designed specifically for students who want structured, exam-ready study material.
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease, delay: i * 0.06 }}
              className={`bento-card group ${f.span}`}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${f.highlight ? 'bg-gradient-to-br from-primary/15 to-secondary/10 border border-primary/15 group-hover:border-primary/30' : 'bg-muted/20 border border-border/30 group-hover:bg-primary/10 group-hover:border-primary/15'}`}>
                  <f.icon size={18} className={`transition-colors duration-500 ${f.highlight ? 'text-text-accent' : 'text-text-muted group-hover:text-text-accent'}`} />
                </div>
                <ArrowUpRight size={14} className="text-text-muted/0 group-hover:text-text-muted/60 transition-all duration-500 translate-y-1 group-hover:translate-y-0" />
              </div>
              <h3 className="font-heading font-semibold text-[15px] text-foreground mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
