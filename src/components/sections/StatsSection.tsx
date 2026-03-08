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
    <section className="py-4 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden"
          style={{
            border: '1px solid hsl(var(--border) / 0.3)',
            background: 'hsl(var(--surface))',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="p-6 md:p-8 text-center relative"
              style={{
                borderRight: i < 3 ? '1px solid hsl(var(--border) / 0.15)' : 'none',
              }}
            >
              <p className="font-mono font-bold tracking-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'hsl(var(--foreground))' }}>
                {s.decimal ? <span>{s.target}</span> : <AnimatedCounter target={s.target} />}
                <span className="font-drama italic ml-0.5" style={{ color: 'hsl(var(--primary))', fontSize: '0.7em' }}>{s.suffix}</span>
              </p>
              <p className="text-xs mt-2 tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
