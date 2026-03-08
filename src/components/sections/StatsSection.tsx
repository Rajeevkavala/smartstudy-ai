import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stats = [
  { target: 10, suffix: 'M+', label: 'Questions Answered' },
  { target: 500, suffix: 'K+', label: 'Students Helped' },
  { target: 95, suffix: '%', label: 'Faster Exam Prep' },
  { target: 4.9, suffix: '★', label: 'Average Rating', decimal: true },
];

export default function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="border-y border-border/15 bg-surface-elevated/30 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.1 }}
                className={`p-8 md:p-10 text-center ${i < stats.length - 1 ? 'border-r border-border/10' : ''}`}
              >
                <p className="font-mono text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  {s.decimal ? (
                    <span>{s.target}</span>
                  ) : (
                    <AnimatedCounter target={s.target} />
                  )}
                  <span className="font-drama italic text-primary ml-0.5">{s.suffix}</span>
                </p>
                <p className="text-text-muted text-sm mt-2 font-display">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
