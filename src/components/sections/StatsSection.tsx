import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stats = [
  { target: 10, suffix: 'M+', label: 'Questions answered', desc: 'by students worldwide' },
  { target: 500, suffix: 'K+', label: 'Students helped', desc: 'across 120+ countries' },
  { target: 95, suffix: '%', label: 'Faster exam prep', desc: 'compared to traditional study' },
];

export default function StatsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-border/15">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              className={`bg-card/10 p-10 md:p-12 text-center relative ${i < stats.length - 1 ? 'md:border-r border-b md:border-b-0 border-border/10' : ''}`}
            >
              <p className="font-heading text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                <AnimatedCounter target={s.target} />
                <span className="gradient-text">{s.suffix}</span>
              </p>
              <p className="text-foreground text-sm font-medium mt-3">{s.label}</p>
              <p className="text-text-muted text-xs mt-1">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
