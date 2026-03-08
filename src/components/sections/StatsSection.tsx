import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stats = [
  { target: 10, suffix: 'M+', label: 'Questions answered', decimal: false },
  { target: 500, suffix: 'K+', label: 'Students worldwide', decimal: false },
  { target: 95, suffix: '%', label: 'Faster exam prep', decimal: false },
  { target: 4.9, suffix: '★', label: 'Average rating', decimal: true },
];

export default function StatsSection() {
  return (
    <section className="py-6 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border/20 bg-border/10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              className="bg-surface p-6 md:p-8 text-center"
            >
              <p className="font-mono text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {s.decimal ? <span>{s.target}</span> : <AnimatedCounter target={s.target} />}
                <span className="font-drama italic text-primary ml-0.5 text-xl md:text-2xl">{s.suffix}</span>
              </p>
              <p className="text-text-muted text-xs mt-1.5 font-display tracking-wide">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
