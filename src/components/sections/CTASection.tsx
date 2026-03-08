import { motion } from 'framer-motion';
import { Upload, ArrowRight, Sparkles } from 'lucide-react';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
const anim = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, ease, delay } });

export default function CTASection() {
  return (
    <section id="cta" className="relative py-28 px-4 overflow-hidden bg-cta-glow">
      {/* Glowing orb */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.15),transparent)] blur-3xl pointer-events-none" />

      <Sparkles className="floating-icon top-[15%] left-[10%] text-primary/30 animate-float hidden md:block" size={20} />
      <Sparkles className="floating-icon top-[20%] right-[12%] text-accent/30 animate-float-delayed hidden md:block" size={16} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div {...anim()}>
          <span className="section-badge">Get Started Today</span>
        </motion.div>
        <motion.h2 {...anim(0.1)} className="font-heading text-4xl sm:text-5xl md:text-[3.5rem] font-bold mt-6 leading-tight">
          Study <span className="font-serif italic"><GradientText>smarter</GradientText></span>, not harder
        </motion.h2>
        <motion.p {...anim(0.2)} className="text-text-muted text-lg mt-5 max-w-md mx-auto">
          Upload your notes and start acing your exams today.
        </motion.p>
        <motion.div {...anim(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a href="#" className="btn-primary px-8 py-4 text-base">
            <Upload size={18} />
            Start with a PDF
          </a>
          <a href="#" className="btn-secondary px-8 py-4 text-base">
            Try free — no card needed
            <ArrowRight size={16} />
          </a>
        </motion.div>
        <motion.p {...anim(0.4)} className="text-xs text-text-muted mt-6 opacity-50">
          No credit card required. Free forever plan included.
        </motion.p>
      </div>
    </section>
  );
}
