import { motion } from 'framer-motion';
import { Upload, Play, Sparkles } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const anim = (delay = 0) => ({ initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, ease, delay } });

export default function CTASection() {
  return (
    <section id="cta" className="relative py-24 px-4 overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)' }}>
      <Sparkles className="floating-icon top-[15%] left-[10%] text-primary/40 animate-float hidden md:block" size={20} />
      <Sparkles className="floating-icon top-[20%] right-[12%] text-accent/40 animate-float-delayed hidden md:block" size={16} />
      <Sparkles className="floating-icon bottom-[25%] left-[15%] text-primary/40 animate-float-slow hidden md:block" size={18} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div {...anim()}><SectionBadge>Get Started Today</SectionBadge></motion.div>
        <motion.h2 {...anim(0.1)} className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mt-6">
          <GradientText>Study smarter with AI</GradientText>
        </motion.h2>
        <motion.p {...anim(0.2)} className="text-text-muted text-lg mt-4">
          Upload your notes and start acing your exams today. No credit card required.
        </motion.p>
        <motion.div {...anim(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <a href="#" className="btn-primary px-8 py-4 text-base">
            <Upload size={18} />
            Upload your notes
          </a>
          <a href="#" className="btn-secondary px-8 py-4 text-base">
            <Play size={18} />
            Start free
          </a>
        </motion.div>
        <motion.p {...anim(0.4)} className="text-xs text-text-muted mt-6 opacity-60">
          Free plan included. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
