import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stats = [
  { target: 10, suffix: 'M+', label: 'Questions answered' },
  { target: 500, suffix: 'K+', label: 'Students helped' },
  { target: 95, suffix: '%', label: 'Faster exam prep' },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/15 rounded-2xl overflow-hidden border border-border/15">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease, delay: i * 0.1 }}
              className="bg-background p-10 text-center"
            >
              <p className="font-heading text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                <AnimatedCounter target={s.target} />
                <span className="text-text-accent">{s.suffix}</span>
              </p>
              <p className="text-text-muted text-sm mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
