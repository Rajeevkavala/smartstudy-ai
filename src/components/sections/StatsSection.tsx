import { motion } from 'framer-motion';
import { MessageSquare, GraduationCap, Zap } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { staggerItem } from '@/lib/animations';

const stats = [
  { target: 10, suffix: 'M+', label: 'Questions Answered', icon: MessageSquare },
  { target: 500, suffix: 'K+', label: 'Students Helped', icon: GraduationCap },
  { target: 95, suffix: '%', label: 'Faster Exam Prep', icon: Zap },
];

export default function StatsSection() {
  return (
    <section className="py-24 px-4 bg-surface/30">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} {...staggerItem} transition={{ ...staggerItem.transition, delay: i * 0.15 }} className="glass-card p-8 text-center">
              <div className="icon-container mx-auto mb-4">
                <s.icon size={22} className="text-text-accent" />
              </div>
              <p className="font-heading text-4xl font-bold text-foreground">
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
