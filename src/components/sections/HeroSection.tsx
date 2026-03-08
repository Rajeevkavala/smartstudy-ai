import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, FileText, Bot, Sparkles, Upload, Zap } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function FloatingMockup() {
  const [typed, setTyped] = useState('');
  const [showPoints, setShowPoints] = useState(false);
  const fullText = 'Database normalization is the process of organizing data in a relational database to reduce redundancy and improve data integrity.';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowPoints(true), 300);
      }
    }, 18);
    return () => clearInterval(interval);
  }, []);

  const points = [
    { key: '1NF', val: 'Eliminate repeating groups' },
    { key: '2NF', val: 'Remove partial dependencies' },
    { key: '3NF', val: 'Remove transitive dependencies' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, rotateY: -5 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 1.4, ease, delay: 0.8 }}
      className="relative"
      style={{ perspective: '1500px' }}
    >
      {/* Multi-layer glow */}
      <div className="absolute -inset-20 rounded-full blur-[120px]" style={{ background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.12), transparent 70%)' }} />
      <div className="absolute -inset-10 rounded-full blur-[60px]" style={{ background: 'radial-gradient(ellipse at 30% 50%, hsl(var(--accent) / 0.06), transparent 60%)' }} />

      <div
        className="relative rounded-2xl overflow-hidden border border-border/30"
        style={{ boxShadow: '0 60px 120px -30px rgba(0,0,0,0.8), 0 30px 60px -20px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--foreground) / 0.04)' }}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-card/90 border-b border-border/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-muted/25 rounded-md px-10 py-1 text-[10px] text-text-muted font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success/60" />
              smartexam.ai
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 bg-background/95 min-h-[280px]">
          {/* PDF panel */}
          <div className="col-span-2 border-r border-border/10 p-4">
            <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-border/8">
              <FileText size={11} className="text-text-accent" />
              <span className="font-mono text-[10px] text-text-secondary">DBMS_Notes.pdf</span>
              <span className="ml-auto text-[8px] font-mono text-text-muted">42/180</span>
            </div>
            <div className="space-y-2">
              {[85, 100, 70, 90, 60, 75].map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.08, duration: 0.4 }}
                  className="h-2 bg-muted/15 rounded"
                  style={{ width: `${w}%` }}
                />
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="bg-primary/[0.05] border-l-2 border-primary/40 rounded-r px-2.5 py-2.5 my-2 space-y-1.5"
              >
                <div className="h-2 bg-primary/12 rounded w-full" />
                <div className="h-2 bg-primary/10 rounded w-4/5" />
                <div className="h-2 bg-primary/8 rounded w-3/5" />
              </motion.div>
            </div>
          </div>

          {/* Chat panel */}
          <div className="col-span-3 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Bot size={11} className="text-text-accent" />
              <span className="text-[10px] font-semibold text-text-secondary">SmartExam AI</span>
              <span className="relative flex h-1.5 w-1.5 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
            </div>

            {/* User bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
              className="self-end bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-3.5 py-2 text-[11px] text-foreground max-w-[200px]"
            >
              What is database normalization?
            </motion.div>

            {/* Mark badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.3 }}
              className="flex gap-1.5"
            >
              <span className="text-[8px] font-mono px-2 py-0.5 rounded-md bg-mark-8/10 text-mark-8 border border-mark-8/20 font-medium">8 MARKS</span>
              <span className="text-[8px] font-mono px-2 py-0.5 rounded-md bg-muted/10 text-text-muted border border-border/10">Ch.4 · P.42</span>
            </motion.div>

            {/* AI response */}
            <div className="bg-surface/80 rounded-xl px-3.5 py-3 border border-border/15 space-y-2">
              <p className="text-[10px] text-text-secondary leading-[1.6]">
                {typed}<span className="typewriter-cursor" />
              </p>
              {showPoints && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1 pt-1 border-t border-border/10"
                >
                  {points.map((p, i) => (
                    <motion.div
                      key={p.key}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="text-[9px] text-text-muted"
                    >
                      <span className="text-text-accent font-medium">{p.key}</span> — {p.val}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 2.5, duration: 0.6, ease }}
        className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-xl border border-border/30 rounded-xl px-4 py-2.5 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
            <Zap size={12} className="text-success" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-foreground">Answer generated</p>
            <p className="text-[8px] text-text-muted font-mono">188 words · 1.2s</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] flex items-center px-6 md:px-12 lg:px-16 pt-32 pb-20 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-8%] w-[800px] h-[800px] rounded-full animate-orb" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 60%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full animate-orb-2" style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.05), transparent 60%)' }} />
        <div className="absolute top-[40%] right-[25%] w-[400px] h-[400px] rounded-full animate-orb" style={{ background: 'radial-gradient(circle, hsl(var(--mark-16) / 0.03), transparent 60%)', animationDelay: '-5s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.2) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent" />
        {/* Top vignette */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/60 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left — Copy */}
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-mono tracking-wider" style={{ background: 'hsl(var(--primary) / 0.06)', borderColor: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--text-accent))' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Powered by AI
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mt-8 space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.2 }}
              className="font-display font-extrabold text-foreground leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
            >
              Your notes.
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.35 }}
              className="font-drama italic leading-[1] tracking-[-0.01em]"
              style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', color: 'hsl(var(--primary))' }}
            >
              Exam-ready answers.
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.5 }}
              className="font-display font-extrabold text-foreground leading-[0.9] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
            >
              In seconds.
            </motion.h1>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.6 }}
            className="text-base md:text-lg max-w-[460px] mt-7 leading-relaxed"
            style={{ color: 'hsl(var(--text-secondary))' }}
          >
            Upload any PDF and get structured, mark-based exam answers your examiner actually wants to see.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 mt-9"
          >
            <Link to="/upload" className="btn-primary text-[0.9rem] group">
              <Upload size={15} className="group-hover:translate-y-[-1px] transition-transform" />
              Upload your PDF
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#demo" className="btn-secondary text-[0.9rem]">
              <Play size={14} className="fill-current" />
              Watch Demo
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex items-center gap-4 mt-8 pt-8 border-t"
            style={{ borderColor: 'hsl(var(--foreground) / 0.06)' }}
          >
            <div className="flex -space-x-2">
              {['from-primary/70 to-accent/40', 'from-mark-4/60 to-primary/40', 'from-mark-16/60 to-mark-2/40', 'from-accent/50 to-primary/30', 'from-mark-2/60 to-accent/40'].map((g, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br ${g}`} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={12} className="text-mark-16 fill-mark-16" />
                ))}
                <span className="text-xs font-semibold text-foreground ml-1.5">4.9</span>
              </div>
              <span className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>Trusted by 500K+ students</span>
            </div>
          </motion.div>
        </div>

        {/* Right — Floating product mockup */}
        <div className="hidden lg:block">
          <FloatingMockup />
        </div>
      </div>
    </section>
  );
}
