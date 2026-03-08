import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Upload } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function CTASection() {
  return (
    <section id="cta" className="relative py-32 md:py-40 px-6 overflow-hidden">
      {/* Full purple background */}
      <div className="absolute inset-0" style={{ background: 'hsl(var(--primary))' }} />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, hsl(263 70% 68% / 0.4), transparent)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 80% at 50% 100%, hsl(263 70% 40% / 0.5), transparent)' }} />

      {/* Decorative elements */}
      <span className="absolute top-12 right-16 text-[10rem] font-drama italic leading-none pointer-events-none select-none" style={{ color: 'rgba(255,255,255,0.04)' }} aria-hidden="true">✦</span>
      <span className="absolute bottom-8 left-12 text-[8rem] font-drama italic leading-none pointer-events-none select-none animate-spin-slow" style={{ color: 'rgba(255,255,255,0.03)' }} aria-hidden="true">✦</span>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[11px] font-mono tracking-[0.25em] uppercase"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          ✦ Get started today
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="mt-6"
        >
          <h2 className="font-drama italic text-white leading-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Study smarter
          </h2>
          <h2 className="font-drama italic leading-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'rgba(255,255,255,0.7)' }}>
            with AI
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="text-base max-w-md mx-auto mt-6"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          Upload your notes and start acing your exams today. No credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
        >
          <a href="#" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]" style={{ background: 'white', color: 'hsl(var(--primary))' }}>
            <Upload size={15} />
            Upload your notes
            <ArrowRight size={15} />
          </a>
          <a href="#" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm text-white cursor-pointer transition-all duration-300 hover:translate-y-[-1px]" style={{ border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)' }}>
            Start free
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-[11px] font-mono mt-6"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Free plan included · No credit card required
        </motion.p>
      </div>
    </section>
  );
}
