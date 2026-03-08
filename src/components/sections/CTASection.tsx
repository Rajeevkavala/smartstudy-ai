import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CTASection() {
  return (
    <section id="cta" className="relative py-32 px-6 overflow-hidden">
      {/* Layered glows */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 60%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[150px] pointer-events-none" />

      {/* Floating decorations */}
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[15%] left-[15%] hidden md:block">
        <Sparkles size={18} className="text-primary/15" />
      </motion.div>
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute top-[20%] right-[18%] hidden md:block">
        <Sparkles size={14} className="text-accent/15" />
      </motion.div>
      <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute bottom-[25%] left-[20%] hidden md:block">
        <Sparkles size={16} className="text-secondary/15" />
      </motion.div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
          <span className="section-badge">
            <Sparkles size={12} />
            Get Started Today
          </span>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: 0.1 }} className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.05] tracking-tight mt-8">
          Start studying
          <br />
          <span className="gradient-text">smarter today.</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.2 }} className="text-text-muted text-base mt-6 max-w-md mx-auto leading-relaxed">
          Upload your notes and get AI-generated exam answers in seconds. No credit card needed.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <a href="#" className="btn-primary text-[15px]">
            Get Started Free
            <ArrowRight size={16} />
          </a>
          <a href="#" className="btn-secondary text-[15px]">
            View Documentation
          </a>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="text-[11px] text-text-muted/40 mt-8 font-mono">
          Free plan included · No credit card required
        </motion.p>
      </div>
    </section>
  );
}
