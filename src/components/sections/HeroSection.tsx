import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, FileText, Bot, Sparkles } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function FloatingMockup() {
  const [typed, setTyped] = useState('');
  const fullText = 'Database normalization is the process of organizing data to reduce redundancy...';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, ease, delay: 1 }}
      className="relative"
      style={{ perspective: '1200px' }}
    >
      {/* Glow behind */}
      <div className="absolute -inset-12 bg-primary/[0.07] blur-[80px] rounded-full" />
      
      <div className="relative rounded-2xl overflow-hidden border border-border/20"
        style={{ boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)' }}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-card/80 border-b border-border/15">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <div className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-muted/20 rounded px-8 py-0.5 text-[10px] text-text-muted font-mono">smartexam.ai</div>
          </div>
        </div>

        <div className="grid grid-cols-5 bg-background/90">
          {/* Mini PDF panel */}
          <div className="col-span-2 border-r border-border/10 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <FileText size={11} className="text-text-accent" />
              <span className="font-mono text-[10px] text-text-secondary">DBMS_Notes.pdf</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-muted/20 rounded w-4/5" />
              <div className="h-2 bg-muted/15 rounded w-full" />
              <div className="h-2 bg-muted/15 rounded w-3/4" />
              <div className="bg-primary/[0.06] border-l-2 border-primary/30 rounded-r px-2 py-2 my-2">
                <div className="h-2 bg-primary/10 rounded w-full mb-1" />
                <div className="h-2 bg-primary/10 rounded w-4/5" />
              </div>
              <div className="h-2 bg-muted/15 rounded w-5/6" />
              <div className="h-2 bg-muted/15 rounded w-2/3" />
            </div>
          </div>

          {/* Chat panel */}
          <div className="col-span-3 p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Bot size={11} className="text-text-accent" />
              <span className="text-[10px] font-medium text-text-secondary">SmartExam AI</span>
              <span className="w-1 h-1 rounded-full bg-success ml-0.5" />
            </div>
            {/* User bubble */}
            <div className="self-end bg-primary/10 border border-primary/15 rounded-xl rounded-tr-sm px-3 py-1.5 text-[10px] text-foreground max-w-[180px]">
              What is database normalization?
            </div>
            {/* Mark badge */}
            <div className="flex gap-1">
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-mark-8/10 text-mark-8 border border-mark-8/20">8 MARKS</span>
            </div>
            {/* AI response */}
            <div className="bg-muted/10 rounded-lg px-3 py-2 border border-border/10">
              <p className="text-[10px] text-text-secondary leading-relaxed">
                {typed}<span className="typewriter-cursor" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center px-6 md:px-12 lg:px-16 pt-28 pb-16 overflow-hidden">
      {/* Background — layered gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-primary/[0.05] blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[150px]" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-mark-16/[0.02] blur-[120px]" />
        {/* Dot grid — not lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary) / 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left — Copy */}
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/[0.08] border border-primary/15 text-text-accent text-xs font-mono tracking-wider">
              <Sparkles size={10} />
              Powered by AI
            </span>
          </motion.div>

          {/* Headline */}
          <div className="mt-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.2 }}
            >
              <h1
                className="font-display font-extrabold text-foreground leading-[0.92] tracking-[-0.03em]"
                style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)' }}
              >
                Your notes.
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
            >
              <h1
                className="font-drama italic text-primary leading-[1.05] tracking-[-0.01em]"
                style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)' }}
              >
                Exam-ready answers.
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.4 }}
            >
              <h1
                className="font-display font-extrabold text-foreground leading-[0.92] tracking-[-0.03em]"
                style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5rem)' }}
              >
                In seconds.
              </h1>
            </motion.div>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.5 }}
            className="text-text-secondary text-base md:text-[1.05rem] max-w-[420px] mt-6 leading-relaxed"
          >
            Upload any PDF and get structured, mark-based exam answers your examiner wants to see.
          </motion.p>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-3 mt-5"
          >
            <div className="flex -space-x-2.5">
              {['from-primary/60 to-secondary/40', 'from-accent/50 to-success/40', 'from-mark-16/50 to-primary/40', 'from-mark-4/50 to-accent/30'].map((g, i) => (
                <div key={i} className={`w-7 h-7 rounded-full border-[1.5px] border-background bg-gradient-to-br ${g}`} />
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={11} className="text-mark-16 fill-mark-16" />
              ))}
            </div>
            <span className="text-xs text-text-muted">500K+ students</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <a href="#cta" className="btn-primary text-[0.9rem]">
              Start with a PDF
              <ArrowRight size={15} />
            </a>
            <a href="#demo" className="btn-secondary text-[0.9rem]">
              <Play size={14} className="fill-current" />
              Watch Demo
            </a>
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
