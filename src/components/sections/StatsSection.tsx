import { motion } from 'framer-motion';
import { MessageSquare, GraduationCap, Zap } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stats = [
  { target: 10, suffix: 'M+', label: 'Questions Answered', detail: 'and counting every day', icon: MessageSquare },
  { target: 500, suffix: 'K+', label: 'Students Helped', detail: 'across 120+ countries', icon: GraduationCap },
  { target: 95, suffix: '%', label: 'Faster Exam Prep', detail: 'compared to traditional study', icon: Zap, highlight: true },
];

export default function StatsSection() {
  return (
    <section className="py-16 px-4 border-y border-border/30 bg-surface/20">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              className="stat-divider text-center py-8 md:py-4 px-6"
            >
              <p className={`font-heading text-4xl md:text-[3.5rem] font-bold ${s.highlight ? 'text-accent' : 'text-foreground'}`}>
                <AnimatedCounter target={s.target} />
                <span className="text-text-accent">{s.suffix}</span>
              </p>
              <p className="text-text-secondary text-sm font-medium mt-2 uppercase tracking-wider">{s.label}</p>
              <p className="text-text-muted text-xs mt-1 italic">{s.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
