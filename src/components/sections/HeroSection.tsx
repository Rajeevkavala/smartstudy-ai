import { motion } from 'framer-motion';
import { Upload, Play, BrainCircuit, FileText, Sparkles, Zap, Star, Send, Bot } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
const anim = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay },
});

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <BrainCircuit className="floating-icon top-[15%] left-[8%] text-primary animate-float hidden lg:block" size={36} />
      <FileText className="floating-icon top-[20%] right-[10%] text-accent animate-float-delayed hidden lg:block" size={32} />
      <Sparkles className="floating-icon bottom-[30%] left-[5%] text-primary/50 animate-float-slow hidden lg:block" size={28} />
      <Zap className="floating-icon bottom-[25%] right-[8%] text-primary animate-float hidden lg:block" size={34} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div {...anim(0)}>
          <span className="section-badge">
            <Sparkles size={12} />
            Powered by AI
          </span>
        </motion.div>

        <motion.h1 {...anim(0.15)} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.1] mt-8">
          <span className="text-foreground">Exam preparation,</span>
          <br />
          <span className="font-serif italic text-foreground">
            <span className="gradient-text-hero">redesigned</span> for how
          </span>
          <br />
          <span className="text-foreground">students actually learn.</span>
        </motion.h1>

        {/* Social proof right under headline */}
        <motion.div {...anim(0.3)} className="flex items-center justify-center gap-3 mt-6">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-primary/30" />
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={13} className="text-warning fill-warning" />
            ))}
          </div>
          <span className="text-sm text-text-muted">Trusted by <strong className="text-text-secondary">500K+</strong> students</span>
        </motion.div>

        <motion.p {...anim(0.35)} className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mt-5 leading-relaxed">
          Upload your study material and instantly generate exam-ready answers, summaries, and mark-based responses.
        </motion.p>

        <motion.div {...anim(0.45)} className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a href="#cta" className="btn-primary px-7 py-3.5 text-[15px]">
            <Upload size={17} />
            Start with a PDF
          </a>
          <a href="#demo" className="btn-secondary px-7 py-3.5 text-[15px] group">
            <span className="relative flex items-center justify-center w-5 h-5">
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
              <Play size={14} className="relative z-10 text-primary" />
            </span>
            Watch Demo
          </a>
        </motion.div>

        {/* Browser mockup hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.6 }}
          className="relative mt-16 mx-auto max-w-5xl group"
        >
          <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent)] blur-2xl -z-10" />
          
          {/* Browser chrome */}
          <div
            className="rounded-2xl overflow-hidden shadow-screenshot transition-transform duration-500"
            style={{ transform: 'perspective(1200px) rotateX(2deg)' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'perspective(1200px) rotateX(0deg)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'perspective(1200px) rotateX(2deg)')}
          >
            {/* Title bar */}
            <div className="bg-surface border-b border-border/50 px-4 py-2.5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-warning/60" />
                <span className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-muted/50 rounded-md px-3 py-1 max-w-xs mx-auto">
                  <span className="text-[11px] text-text-muted font-mono">smartexam.ai/dashboard</span>
                </div>
              </div>
            </div>

            {/* App content */}
            <div className="glass-card rounded-none border-0">
              <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[380px]">
                {/* PDF Panel */}
                <div className="lg:col-span-2 bg-surface border-r border-border/50">
                  <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                    <FileText size={14} className="text-text-accent" />
                    <span className="font-mono text-xs text-text-secondary truncate">DBMS_Notes.pdf</span>
                    <span className="ml-auto font-mono text-xs text-text-muted">42 / 180</span>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="h-5 bg-surface-elevated rounded w-3/4 mb-3" />
                    {[75, 90, 60, 85, 70].map((w, i) => (
                      <div key={i} className="h-3 bg-muted/50 rounded" style={{ width: `${w}%` }} />
                    ))}
                    <div className="bg-primary/10 border-l-2 border-primary rounded-r px-2 py-2 my-3 space-y-2">
                      {[80, 95, 65].map((w, i) => (
                        <div key={i} className="h-3 bg-primary/20 rounded" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                    {[70, 55, 80, 65].map((w, i) => (
                      <div key={i} className="h-3 bg-muted/50 rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>

                {/* Chat Panel */}
                <div className="lg:col-span-3 flex flex-col bg-background/50">
                  <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
                    <Bot size={16} className="text-text-accent" />
                    <span className="text-sm font-medium text-text-secondary">SmartExam AI</span>
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  </div>
                  <div className="flex-1 px-5 py-4 space-y-4 overflow-hidden">
                    <div className="flex justify-end">
                      <div className="bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-foreground max-w-xs">
                        What is database normalization?
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Answer length:</span>
                      {['2 Marks', '4 Marks', '8 Marks'].map((m, i) => (
                        <span key={m} className={`text-xs px-3 py-1 rounded-full cursor-pointer transition-all duration-200 ${i === 2 ? 'bg-primary/20 border border-primary/40 text-text-accent' : 'glass-card text-text-muted hover:text-text-secondary'}`}>
                          {m}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bot size={14} className="text-text-accent" />
                        <span className="text-xs font-medium text-text-muted">SmartExam AI</span>
                      </div>
                      <div className="glass-card px-4 py-3 text-sm max-w-sm space-y-2">
                        <p className="font-heading font-semibold text-foreground text-sm">Database Normalization (8 Marks)</p>
                        <p className="text-text-secondary text-xs leading-relaxed">Database normalization is the process of organizing data to reduce redundancy...</p>
                        <ul className="text-xs text-text-secondary space-y-1 list-none">
                          <li>• <strong className="text-foreground">1NF:</strong> Eliminate repeating groups</li>
                          <li>• <strong className="text-foreground">2NF:</strong> Remove partial dependencies</li>
                          <li>• <strong className="text-foreground">3NF:</strong> Remove transitive dependencies</li>
                        </ul>
                        <p className="font-mono text-xs text-text-muted pt-2 border-t border-border/50">Source: Chapter 4, Page 42</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-2 h-2 rounded-full bg-text-muted animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border/50 px-4 py-3 flex gap-2">
                    <input type="text" placeholder="Ask a question..." className="flex-1 bg-surface rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted border border-border focus:border-primary/40 focus:outline-none transition-colors" readOnly />
                    <button className="icon-container p-2.5 cursor-pointer hover:border-primary/40 transition-all" aria-label="Send">
                      <Send size={16} className="text-text-accent" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
