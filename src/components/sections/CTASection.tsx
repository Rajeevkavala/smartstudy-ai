import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const anim = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease, delay } });

export default function CTASection() {
  return (
    <section id="cta" className="relative py-28 px-6 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.h2 {...anim()} className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.08] tracking-tight">
          Start studying
          <br />
          <span className="gradient-text">smarter today.</span>
        </motion.h2>
        <motion.p {...anim(0.1)} className="text-text-muted text-base mt-5 max-w-md mx-auto">
          Upload your notes and get AI-generated exam answers in seconds. No credit card needed.
        </motion.p>
        <motion.div {...anim(0.2)} className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a href="#" className="btn-primary">
            Get Started Free
            <ArrowRight size={16} />
          </a>
          <a href="#" className="btn-secondary">
            View Documentation
          </a>
        </motion.div>
        <motion.p {...anim(0.3)} className="text-[11px] text-text-muted/50 mt-6 font-mono">
          Free plan included · No credit card required
        </motion.p>
      </div>
    </section>
  );
}
