import { motion } from 'framer-motion';
import { FileUp, MessageSquare, ListChecks, Zap, Target, BarChart3, ArrowUpRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  { icon: FileUp, title: 'Upload Study Material', desc: 'Upload PDFs, notes, or textbooks. Our AI processes and indexes your content instantly.', span: 'lg:col-span-2' },
  { icon: MessageSquare, title: 'Ask Questions', desc: 'Ask questions directly from the uploaded document. Get precise, contextual answers.', span: '' },
  { icon: ListChecks, title: 'Mark-based Answers', desc: 'Generate structured answers for 2, 4, 8, and 16-mark exam questions.', span: '' },
  { icon: Zap, title: 'Instant Summaries', desc: 'Get chapter and topic summaries instantly. Focus on what matters for your exam.', span: 'lg:col-span-2' },
  { icon: Target, title: 'Smart Exam Mode', desc: 'Focus only on frequently asked questions. Maximize your study efficiency.', span: '' },
  { icon: BarChart3, title: 'Topic Insights', desc: 'Know which topics are most asked. Prioritize your sessions strategically.', span: '' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header — left-aligned for variety */}
        <div className="max-w-xl">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            Features
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground leading-tight">
            Everything you need to
            <br />
            <span className="text-text-muted">ace your exams.</span>
          </motion.h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-14">
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
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center">
                  <f.icon size={18} className="text-text-accent" />
                </div>
                <ArrowUpRight size={14} className="text-text-muted/0 group-hover:text-text-muted transition-all duration-300" />
              </div>
              <h3 className="font-heading font-semibold text-base text-foreground mb-1.5">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
