import { motion } from 'framer-motion';
import { ArrowRight, Play, Star } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-end px-6 md:px-16 pb-20 pt-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/[0.04] blur-[120px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
        >
          <span className="section-label">⚡ Powered by AI</span>
        </motion.div>

        {/* Headline — dramatic, left-anchored */}
        <div className="mt-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
            className="font-display font-bold text-foreground leading-[0.95] tracking-tight"
            style={{ fontSize: 'clamp(2.75rem, 7vw, 6rem)' }}
          >
            AI-powered exam
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.4 }}
            className="font-drama italic text-primary leading-[1] tracking-tight"
            style={{ fontSize: 'clamp(2.75rem, 7vw, 6rem)' }}
          >
            preparation
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}
            className="font-display font-bold text-foreground leading-[0.95] tracking-tight"
            style={{ fontSize: 'clamp(2.75rem, 7vw, 6rem)' }}
          >
            from your PDFs.
          </motion.h1>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.6 }}
          className="text-text-secondary text-base md:text-lg max-w-[480px] mt-6 leading-relaxed"
        >
          Upload your study material and instantly generate exam-ready answers, summaries, and mark-based responses.
        </motion.p>

        {/* Social proof — immediately after subtext */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center gap-3 mt-5"
        >
          <div className="flex -space-x-2">
            {[
              'bg-gradient-to-br from-primary/50 to-accent/30',
              'bg-gradient-to-br from-accent/40 to-success/40',
              'bg-gradient-to-br from-mark-16/40 to-primary/40',
            ].map((bg, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-background ${bg}`} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[0,1,2,3,4].map((i) => (
              <Star key={i} size={12} className="text-mark-16 fill-mark-16" />
            ))}
          </div>
          <span className="text-sm text-text-muted">Trusted by 500K+ students worldwide</span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <a href="#cta" className="btn-primary text-base">
            Upload PDF
            <ArrowRight size={16} />
          </a>
          <a href="#demo" className="btn-secondary text-base">
            <Play size={16} />
            Watch Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
