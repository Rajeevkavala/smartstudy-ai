import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function CTASection() {
  return (
    <section id="cta" className="relative py-28 md:py-36 px-6 overflow-hidden">
      {/* Gradient bg — not flat purple, more subtle */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.12] via-primary/[0.06] to-background pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.08] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-label"
        >
          ✦ Get started
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="mt-5"
        >
          <span className="font-drama italic text-foreground block" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
            Study smarter,
          </span>
          <span className="font-drama italic text-primary block" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
            not harder
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="text-text-secondary text-base max-w-sm mx-auto mt-5"
        >
          Upload your notes and start getting exam-ready answers in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
        >
          <a href="#" className="btn-primary text-[0.9rem]">
            Upload your notes
            <ArrowRight size={15} />
          </a>
          <a href="#" className="btn-secondary text-[0.9rem]">
            Try free — no card needed
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-[11px] font-mono text-text-muted/50 mt-5"
        >
          Free plan included · No credit card required
        </motion.p>
      </div>
    </section>
  );
}
