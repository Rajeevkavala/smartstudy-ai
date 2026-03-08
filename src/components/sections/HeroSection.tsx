import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, FileText, Bot, Send, Sparkles } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-8 pb-20 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <span className="section-label">AI-Powered Study Assistant</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.1 }} className="font-heading text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.08] mt-6 tracking-tight">
          <span className="text-foreground">Turn your PDFs into</span>
          <br />
          <span className="gradient-text">exam-ready answers.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.2 }} className="text-base md:text-lg text-text-muted max-w-lg mx-auto mt-5 leading-relaxed">
          Upload your study material. Ask any question. Get structured, mark-based answers instantly — powered by AI.
        </motion.p>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a href="#cta" className="btn-primary">
            Get Started Free
            <ArrowRight size={16} />
          </a>
          <a href="#demo" className="btn-secondary">
            <Play size={16} />
            See How It Works
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="flex items-center justify-center gap-4 mt-8">
          <div className="flex -space-x-2">
            {[
              'bg-gradient-to-br from-primary/40 to-accent/40',
              'bg-gradient-to-br from-accent/40 to-success/40',
              'bg-gradient-to-br from-success/40 to-primary/40',
              'bg-gradient-to-br from-secondary/40 to-primary/40',
            ].map((bg, i) => (
              <div key={i} className={`w-7 h-7 rounded-full border-2 border-background ${bg}`} />
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            {[0,1,2,3,4].map((i) => (
              <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-xs text-text-muted">500K+ students</span>
        </motion.div>
      </div>

      {/* Hero Visual — Product mockup */}
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.4 }} className="relative z-10 mt-14 w-full max-w-4xl mx-auto">
        <div className="absolute -inset-6 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.08),transparent)] blur-3xl -z-10" />
        
        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-glass">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-card/80">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-muted/40 rounded-md px-4 py-1 text-xs text-text-muted font-mono">smartexam.ai</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[380px]">
            {/* PDF Panel */}
            <div className="lg:col-span-2 border-r border-border/20 bg-card/30">
              <div className="px-4 py-2.5 border-b border-border/20 flex items-center gap-2">
                <FileText size={13} className="text-text-accent" />
                <span className="font-mono text-xs text-text-secondary truncate">DBMS_Notes.pdf</span>
                <span className="ml-auto font-mono text-[10px] text-text-muted">42 / 180</span>
              </div>
              <div className="p-5 space-y-2">
                <div className="h-4 bg-muted/30 rounded w-2/3 mb-4" />
                {[72, 88, 56, 82, 68].map((w, i) => (
                  <div key={i} className="h-2.5 bg-muted/20 rounded" style={{ width: `${w}%` }} />
                ))}
                <div className="bg-primary/8 border-l-2 border-primary/50 rounded-r px-3 py-3 my-4 space-y-2">
                  {[78, 92, 62].map((w, i) => (
                    <div key={i} className="h-2.5 bg-primary/15 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
                {[66, 52, 78, 60].map((w, i) => (
                  <div key={i} className="h-2.5 bg-muted/20 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="lg:col-span-3 flex flex-col bg-background/40">
              <div className="px-5 py-2.5 border-b border-border/20 flex items-center gap-2">
                <Bot size={14} className="text-text-accent" />
                <span className="text-xs font-medium text-text-secondary">SmartExam AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse ml-1" />
              </div>
              <div className="flex-1 px-5 py-4 space-y-3 overflow-hidden">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-foreground max-w-[240px]">
                    What is database normalization?
                  </div>
                </div>
                
                {/* Mark selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted mr-1">Answer for:</span>
                  {['2 Marks', '4 Marks', '8 Marks'].map((m, i) => (
                    <span key={m} className={`text-[10px] px-2.5 py-1 rounded-md cursor-pointer transition-all ${i === 2 ? 'bg-primary/15 text-text-accent border border-primary/25' : 'bg-muted/20 text-text-muted hover:bg-muted/30'}`}>
                      {m}
                    </span>
                  ))}
                </div>

                {/* AI response */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={11} className="text-text-accent" />
                    <span className="text-[10px] font-medium text-text-muted">AI Response</span>
                  </div>
                  <div className="bg-muted/15 rounded-xl px-4 py-3 text-sm max-w-[320px] space-y-2 border border-border/20">
                    <p className="font-heading font-semibold text-foreground text-xs">Database Normalization (8 Marks)</p>
                    <p className="text-text-secondary text-[11px] leading-relaxed">Database normalization organizes data to minimize redundancy and dependency...</p>
                    <ul className="text-[11px] text-text-secondary space-y-0.5">
                      <li><span className="text-text-accent font-medium">1NF</span> — Eliminate repeating groups</li>
                      <li><span className="text-text-accent font-medium">2NF</span> — Remove partial dependencies</li>
                      <li><span className="text-text-accent font-medium">3NF</span> — Remove transitive dependencies</li>
                    </ul>
                    <p className="font-mono text-[10px] text-text-muted pt-1.5 border-t border-border/20">Ch. 4, Page 42</p>
                  </div>
                </div>

                {/* Typing */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
              <div className="border-t border-border/20 px-4 py-2.5 flex gap-2">
                <input type="text" placeholder="Ask a question..." className="flex-1 bg-muted/20 rounded-lg px-3.5 py-2 text-sm text-foreground placeholder:text-text-muted/60 border border-border/20 focus:border-primary/30 focus:outline-none transition-colors" readOnly />
                <button className="p-2 rounded-lg bg-primary/15 border border-primary/20 cursor-pointer hover:bg-primary/25 transition-colors" aria-label="Send">
                  <Send size={14} className="text-text-accent" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
