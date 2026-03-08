import { motion } from 'framer-motion';
import { staggerItem } from '@/lib/animations';

const logos = ['MIT OpenCourseware', 'Coursera', 'edX', 'Khan Academy', 'IIT Bombay', 'Stanford Online'];

export default function TrustSection() {
  return (
    <section className="py-12 border-y border-border/30 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-xs text-text-muted uppercase tracking-[0.15em] font-medium text-center mb-8">
          Trusted by students and educators worldwide
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {logos.map((name, i) => (
            <motion.div
              key={name}
              {...staggerItem}
              transition={{ ...staggerItem.transition, delay: i * 0.1 }}
              className="text-text-muted/30 hover:text-text-muted/60 transition-all duration-300 cursor-pointer font-heading font-semibold text-sm"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
