import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function CTASection() {
  return (
    <section id="cta" className="relative py-32 px-6 overflow-hidden bg-primary">
      {/* Floating decorative elements */}
      <div className="absolute top-8 right-12 text-[10rem] font-drama italic text-white/[0.04] select-none pointer-events-none animate-spin-slow" aria-hidden="true">
        ✦
      </div>
      <div className="absolute bottom-8 left-12 text-[8rem] font-drama italic text-white/[0.04] select-none pointer-events-none animate-spin-slow" style={{ animationDirection: 'reverse' }} aria-hidden="true">
        ✦
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-mono font-medium tracking-[0.2em] uppercase text-white/60"
        >
          ✦ Get started today
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="mt-4"
        >
          <span className="font-drama italic text-white block" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            Study smarter
          </span>
          <span className="font-drama italic text-white block" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            with AI
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="text-white/80 text-base md:text-lg max-w-md mx-auto mt-5"
        >
          Upload your notes and start acing your exams today. No credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
        >
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-display font-semibold bg-white text-primary hover:bg-white/90 transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            Upload your notes
            <ArrowRight size={16} />
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-display font-medium border border-white/30 text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
          >
            <Sparkles size={16} />
            Start free
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-xs font-mono text-white/40 mt-6"
        >
          Free plan included · No credit card required
        </motion.p>
      </div>
    </section>
  );
}
