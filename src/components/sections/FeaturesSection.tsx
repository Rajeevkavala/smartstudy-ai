import { motion } from 'framer-motion';
import { FileUp, MessageSquare, ListChecks, Zap, Target, BarChart3 } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const features = [
  { icon: FileUp, title: 'Upload Study Material', desc: 'Upload PDFs, notes, or textbooks. Our AI processes and indexes your content instantly.' },
  { icon: MessageSquare, title: 'Ask Questions', desc: 'Ask questions directly from the uploaded document. Get precise, contextual answers.' },
  { icon: ListChecks, title: 'Mark-based Answers', desc: 'Generate structured answers for 2-mark, 4-mark, 8-mark, and 16-mark questions.' },
  { icon: Zap, title: 'Instant Summaries', desc: 'Get chapter and topic summaries instantly. Focus on what matters for your exam.' },
  { icon: Target, title: 'Smart Exam Mode', desc: 'Focus only on frequently asked and examinable questions. Maximize your study ROI.' },
  { icon: BarChart3, title: 'Topic Insights', desc: 'Know which topics are most asked in exams. Prioritize your study sessions strategically.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center">
          <SectionBadge>Features</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>Accelerate your exam preparation</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-xl mx-auto">
            Everything you need to ace your exams with AI-powered intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              className="glass-card-hover p-6"
            >
              <div className="icon-container mb-4">
                <f.icon size={22} className="text-text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
