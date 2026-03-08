import { motion } from 'framer-motion';
import { FileUp, MessageSquare, ListChecks, Zap, Target, BarChart3, ArrowRight } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const features = [
  { icon: FileUp, title: 'Drop in any PDF', desc: 'Upload notes, textbooks, or handouts. AI indexes everything in seconds.', accent: 'primary' },
  { icon: MessageSquare, title: 'Ask anything', desc: 'Ask questions directly from your material. Get precise, contextual answers every time.', accent: 'primary', wide: true },
  { icon: ListChecks, title: 'Match exact mark schemes', desc: 'Structured answers for 2, 4, 8, and 16-mark questions — exactly how examiners want.', accent: 'accent' },
  { icon: Target, title: 'Exam mode: real pressure', desc: 'Focus on frequently asked and high-priority questions. Maximize your study ROI.', accent: 'primary', wide: true },
  { icon: Zap, title: 'Condensed to what matters', desc: 'Chapter and topic summaries, instantly. Cut through noise, study what counts.', accent: 'accent' },
  { icon: BarChart3, title: 'Topic priority map', desc: 'See which topics appear most in exams. Prioritize strategically, not randomly.', accent: 'primary' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center">
          <SectionBadge>Features</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>Everything you need to ace exams</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-lg mx-auto">
            Built for students who are serious, time-pressured, and ambitious.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              className={`glass-card-hover p-6 group ${f.wide ? 'lg:col-span-2' : ''}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                f.accent === 'accent'
                  ? 'bg-accent/15 border border-accent/20'
                  : 'bg-primary/15 border border-primary/20'
              }`}>
                <f.icon size={20} className={f.accent === 'accent' ? 'text-accent' : 'text-text-accent'} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-4">{f.desc}</p>
              <span className="text-xs text-text-accent font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Learn more <ArrowRight size={12} />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
