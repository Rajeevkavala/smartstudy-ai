import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, FileText, Bot, Send, Sparkles, BrainCircuit, Zap } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] rounded-full bg-primary/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

      {/* Floating decorative icons */}
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[15%] left-[8%] hidden lg:block">
        <BrainCircuit size={28} className="text-primary/20" />
      </motion.div>
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute top-[20%] right-[10%] hidden lg:block">
        <FileText size={24} className="text-accent/20" />
      </motion.div>
      <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute bottom-[30%] left-[5%] hidden lg:block">
        <Sparkles size={20} className="text-secondary/20" />
      </motion.div>
      <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute bottom-[25%] right-[7%] hidden lg:block">
        <Zap size={22} className="text-primary/15" />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider bg-primary/8 border border-primary/15 text-text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            AI-Powered Study Assistant
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.1 }} className="font-heading text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mt-8 tracking-tight">
          <span className="text-foreground">Turn your PDFs into</span>
          <br />
          <span className="gradient-text">exam-ready answers.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.2 }} className="text-base md:text-lg text-text-muted max-w-xl mx-auto mt-6 leading-relaxed">
          Upload study material. Ask any question. Get structured, mark-based answers — all powered by AI that understands your content.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <a href="#cta" className="btn-primary text-[15px]">
            Get Started Free
            <ArrowRight size={16} />
          </a>
          <a href="#demo" className="btn-secondary text-[15px]">
            <Play size={15} />
            Watch Demo
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="flex items-center justify-center gap-5 mt-10">
          <div className="flex -space-x-2.5">
            {[
              'from-primary/50 to-accent/50',
              'from-accent/50 to-success/50',
              'from-success/50 to-primary/50',
              'from-secondary/50 to-primary/50',
              'from-primary/40 to-secondary/40',
            ].map((g, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br ${g}`} />
            ))}
          </div>
          <div className="h-5 w-px bg-border/50" />
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-0.5">
              {[0,1,2,3,4].map((i) => (
                <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="text-xs text-foreground font-medium ml-1">4.9</span>
            </div>
            <span className="text-[11px] text-text-muted">Trusted by 500K+ students</span>
          </div>
        </motion.div>
      </div>

      {/* Hero Product Mockup */}
      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.5 }} className="relative z-10 mt-16 w-full max-w-5xl mx-auto">
        {/* Glow behind */}
        <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1),transparent_60%)] pointer-events-none" />
        <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_70%_50%,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none" />
        
        <div className="relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden shadow-[0_20px_80px_-20px_rgba(124,58,237,0.15),0_0_0_1px_rgba(255,255,255,0.03)]">
          {/* Chrome bar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border/20 bg-card/60">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/50 hover:bg-destructive/70 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-amber-400/50 hover:bg-amber-400/70 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-success/50 hover:bg-success/70 transition-colors" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-muted/30 rounded-lg px-6 py-1.5 text-[11px] text-text-muted font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success/60" />
                smartexam.ai/dashboard
              </div>
            </div>
            <div className="w-14" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[420px]">
            {/* PDF Panel */}
            <div className="lg:col-span-2 border-r border-border/15 bg-card/20">
              <div className="px-4 py-3 border-b border-border/15 flex items-center gap-2">
                <FileText size={14} className="text-text-accent" />
                <span className="font-mono text-xs text-text-secondary truncate">DBMS_Notes.pdf</span>
                <span className="ml-auto font-mono text-[10px] text-text-muted bg-muted/30 px-2 py-0.5 rounded">pg 42/180</span>
              </div>
              <div className="p-5 space-y-2.5">
                <div className="h-5 bg-muted/25 rounded w-3/5 mb-5" />
                {[75, 90, 60, 85, 72].map((w, i) => (
                  <div key={i} className="h-2.5 bg-muted/15 rounded" style={{ width: `${w}%` }} />
                ))}
                {/* Highlighted AI reading block */}
                <div className="bg-primary/6 border-l-[3px] border-primary/40 rounded-r-lg px-4 py-4 my-5 space-y-2">
                  {[82, 95, 70, 55].map((w, i) => (
                    <div key={i} className="h-2.5 bg-primary/12 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
                {[68, 54, 80].map((w, i) => (
                  <div key={i} className="h-2.5 bg-muted/15 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="lg:col-span-3 flex flex-col bg-background/50">
              <div className="px-5 py-3 border-b border-border/15 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot size={12} className="text-text-accent" />
                </div>
                <span className="text-xs font-semibold text-foreground">SmartExam AI</span>
                <span className="flex items-center gap-1 text-[10px] text-success font-mono ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex-1 px-5 py-5 space-y-4 overflow-hidden">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-md px-4 py-3 text-sm text-foreground max-w-[260px]">
                    What is database normalization?
                  </div>
                </div>

                {/* Mark selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted font-mono">Format:</span>
                  {['2 Mark', '4 Mark', '8 Mark', '16 Mark'].map((m, i) => (
                    <span key={m} className={`text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-300 ${i === 2 ? 'bg-primary/15 text-text-accent border border-primary/20 shadow-[0_0_12px_rgba(124,58,237,0.1)]' : 'bg-muted/15 text-text-muted hover:bg-muted/25 border border-transparent'}`}>
                      {m}
                    </span>
                  ))}
                </div>

                {/* AI response */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-text-accent" />
                    <span className="text-[10px] font-medium text-text-muted font-mono">AI RESPONSE</span>
                  </div>
                  <div className="bg-muted/10 rounded-xl px-5 py-4 text-sm max-w-[340px] space-y-2.5 border border-border/15">
                    <p className="font-heading font-bold text-foreground text-[13px]">Database Normalization (8 Marks)</p>
                    <p className="text-text-secondary text-[11px] leading-relaxed">Normalization organizes data to reduce redundancy and improve data integrity...</p>
                    <ul className="text-[11px] text-text-secondary space-y-1">
                      <li className="flex items-start gap-2"><span className="text-text-accent font-semibold shrink-0">1NF</span><span>— Eliminate repeating groups</span></li>
                      <li className="flex items-start gap-2"><span className="text-text-accent font-semibold shrink-0">2NF</span><span>— Remove partial dependencies</span></li>
                      <li className="flex items-start gap-2"><span className="text-text-accent font-semibold shrink-0">3NF</span><span>— Remove transitive dependencies</span></li>
                    </ul>
                    <div className="flex items-center gap-3 pt-2.5 border-t border-border/15">
                      <span className="font-mono text-[10px] text-text-muted">Ch. 4, Page 42</span>
                      <span className="font-mono text-[10px] text-text-muted">· ~180 words</span>
                    </div>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex items-center gap-1.5 pl-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-text-accent/40 animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
              {/* Input bar */}
              <div className="border-t border-border/15 px-4 py-3 flex gap-2">
                <input type="text" placeholder="Ask a question from your PDF..." className="flex-1 bg-muted/15 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted/50 border border-border/15 focus:border-primary/30 focus:outline-none transition-colors" readOnly />
                <button className="p-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/15 cursor-pointer hover:from-primary/30 hover:to-secondary/30 transition-all duration-300" aria-label="Send">
                  <Send size={14} className="text-text-accent" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
}
