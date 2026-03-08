import { motion } from 'framer-motion';
import { Upload, Play, BrainCircuit, FileText, Sparkles, Zap, Star, Send, Bot } from 'lucide-react';
import { fadeUp } from '@/lib/animations';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Floating Icons */}
      <BrainCircuit className="floating-icon top-[15%] left-[8%] text-primary animate-float hidden md:block" size={40} />
      <FileText className="floating-icon top-[20%] right-[10%] text-accent animate-float-delayed hidden md:block" size={36} />
      <Sparkles className="floating-icon bottom-[30%] left-[5%] text-cyan-400 animate-float-slow hidden md:block" size={32} />
      <Zap className="floating-icon bottom-[25%] right-[8%] text-primary animate-float hidden md:block" size={38} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div {...fadeUp}>
          <span className="section-badge">
            <Sparkles size={12} />
            Powered by AI
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mt-8"
        >
          <span className="gradient-text">AI-powered exam preparation</span>
          <br />
          <span className="text-foreground">from your PDFs.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Upload your study material and instantly generate exam-ready answers, summaries, and mark-based responses.
        </motion.p>

        {/* Buttons */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
        >
          <a href="#cta" className="btn-primary px-8 py-4 text-base">
            <Upload size={18} />
            Upload PDF
          </a>
          <a href="#demo" className="btn-secondary px-8 py-4 text-base">
            <Play size={18} />
            Watch Demo
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.4 }}
          className="flex items-center justify-center gap-3 mt-6"
        >
          <div className="flex -space-x-2">
            {[0,1,2].map((i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-background" style={{ background: `linear-gradient(135deg, hsl(${263 + i * 30} 70% ${50 + i * 10}%), hsl(${263 + i * 30} 70% ${70 + i * 5}%))` }} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[0,1,2,3,4].map((i) => (
              <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-text-muted">Trusted by 500K+ students worldwide</span>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.5 }}
          className="relative mt-16 mx-auto max-w-5xl"
        >
          <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15),transparent)] blur-2xl -z-10" />
          <div className="glass-card rounded-3xl p-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[400px]">
              {/* PDF Panel */}
              <div className="lg:col-span-2 bg-surface rounded-tl-3xl lg:rounded-bl-3xl rounded-tr-3xl lg:rounded-tr-none border-r border-border/50">
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
              <div className="lg:col-span-3 flex flex-col bg-background/50 rounded-b-3xl lg:rounded-bl-none lg:rounded-r-3xl">
                <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
                  <Bot size={16} className="text-text-accent" />
                  <span className="text-sm font-medium text-text-secondary">SmartExam AI</span>
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                </div>
                <div className="flex-1 px-5 py-4 space-y-4 overflow-hidden">
                  {/* Student message */}
                  <div className="flex justify-end">
                    <div className="bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-foreground max-w-xs">
                      What is database normalization?
                    </div>
                  </div>
                  {/* Mark selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Answer length:</span>
                    {['2 Marks', '4 Marks', '8 Marks'].map((m, i) => (
                      <span key={m} className={`text-xs px-3 py-1 rounded-full cursor-pointer ${i === 2 ? 'bg-primary/20 border border-primary/40 text-text-accent' : 'glass-card text-text-muted'}`}>
                        {m}
                      </span>
                    ))}
                  </div>
                  {/* AI response */}
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
                  {/* Typing indicator */}
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-text-muted animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
                {/* Input */}
                <div className="border-t border-border/50 px-4 py-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="flex-1 bg-surface rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted border border-border focus:border-primary/40 focus:outline-none"
                    readOnly
                  />
                  <button className="icon-container p-2.5 cursor-pointer hover:border-primary/40 transition-all" aria-label="Send">
                    <Send size={16} className="text-text-accent" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
