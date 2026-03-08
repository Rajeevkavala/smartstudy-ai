import { motion } from 'framer-motion';
import { Upload, Search, SlidersHorizontal, CheckCircle, ArrowRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const steps = [
  { icon: Upload, title: 'Upload your PDF', desc: 'Drop your notes, textbooks, or study material. Supports multi-PDF knowledge base.' },
  { icon: Search, title: 'Ask any question', desc: 'AI understands the full document context and finds relevant passages automatically.' },
  { icon: SlidersHorizontal, title: 'Choose format', desc: 'Select 2, 4, 8, or 16-mark answer format based on your exam requirements.' },
  { icon: CheckCircle, title: 'Get perfect answers', desc: 'Receive structured, exam-ready answers with proper headings and source references.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            How it works
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold mt-4 text-foreground tracking-tight">
            From PDF to exam answers
            <br />
            <span className="gradient-text">in seconds.</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mt-20 relative">
          {/* Desktop connector line */}
          <div className="hidden md:block absolute top-14 left-[12%] right-[12%] h-px step-connector opacity-20 z-0" />

          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.12 }}
              className="relative z-10 text-center px-4 py-8 group"
            >
              {/* Step number ring */}
              <div className="relative mx-auto mb-6 w-14 h-14">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/15 to-secondary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all duration-500">
                  <s.icon size={22} className="text-text-accent" />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-primary/30 flex items-center justify-center text-[9px] font-mono font-bold text-text-accent">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-heading font-semibold text-base text-foreground mb-2">{s.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-[200px] mx-auto">{s.desc}</p>

              {/* Arrow between steps (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 -right-2 z-20">
                  <ArrowRight size={14} className="text-text-muted/20" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
