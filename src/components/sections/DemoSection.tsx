import { motion } from 'framer-motion';
import { FileText, Bot, Send } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function DemoSection() {
  return (
    <section id="demo" className="relative py-24 px-4 bg-surface/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <SectionBadge>See it in action</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>Your AI study companion</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-xl mx-auto">
            Ask any question from your uploaded material and get perfectly formatted exam answers
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="relative mt-12 max-w-5xl mx-auto">
          <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12),transparent)] blur-3xl -z-10" />
          <div className="glass-card rounded-3xl p-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[450px]">
              <div className="lg:col-span-2 bg-surface rounded-tl-3xl lg:rounded-bl-3xl">
                <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                  <FileText size={14} className="text-text-accent" />
                  <span className="font-mono text-sm text-text-secondary">DBMS_Notes.pdf</span>
                  <span className="ml-auto font-mono text-xs text-text-muted">42 / 180</span>
                </div>
                <div className="p-5 space-y-2">
                  <div className="h-5 bg-surface-elevated rounded w-3/4 mb-3" />
                  {[75, 90, 60, 85, 70, 55, 80].map((w, i) => (
                    <div key={i} className="h-3 bg-muted/50 rounded" style={{ width: `${w}%` }} />
                  ))}
                  <div className="bg-primary/10 border-l-2 border-primary rounded-r px-2 py-2 my-3 space-y-2">
                    {[80, 95, 65, 75].map((w, i) => (
                      <div key={i} className="h-3 bg-primary/20 rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  {[70, 55, 80, 65, 75, 60].map((w, i) => (
                    <div key={i} className="h-3 bg-muted/50 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col bg-background/50 rounded-b-3xl lg:rounded-bl-none lg:rounded-r-3xl">
                <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
                  <Bot size={16} className="text-text-accent" />
                  <span className="text-sm font-medium text-text-secondary">SmartExam AI</span>
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                </div>
                <div className="flex-1 px-5 py-4 space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-foreground max-w-xs">
                      What is database normalization?
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Answer length:</span>
                    {['2 Marks', '4 Marks', '8 Marks'].map((m, i) => (
                      <span key={m} className={`text-xs px-3 py-1 rounded-full ${i === 2 ? 'bg-primary/20 border border-primary/40 text-text-accent' : 'glass-card text-text-muted'}`}>
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
                      <p className="text-text-secondary text-xs leading-relaxed"><strong className="text-foreground">Definition:</strong> Database normalization is the process of organizing data to reduce redundancy and improve data integrity.</p>
                      <p className="text-text-secondary text-xs font-semibold text-foreground">Normal Forms:</p>
                      <ul className="text-xs text-text-secondary space-y-1">
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
                  <input type="text" placeholder="Ask a question..." className="flex-1 bg-surface rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted border border-border focus:border-primary/40 focus:outline-none" readOnly />
                  <button className="icon-container p-2.5 cursor-pointer" aria-label="Send">
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
