import { motion } from 'framer-motion';
import { Upload, Search, SlidersHorizontal, CheckCircle } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const steps = [
  { icon: Upload, num: '01', title: 'Upload your PDF', desc: 'Drop in your notes, textbooks, or study material.' },
  { icon: Search, num: '02', title: 'Ask questions', desc: 'AI understands full document context instantly.' },
  { icon: SlidersHorizontal, num: '03', title: 'Choose mark depth', desc: 'Select 2, 4, 8, or 16-mark answer format.' },
  { icon: CheckCircle, num: '04', title: 'Get exam answers', desc: 'Structured, formatted, ready to submit.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 px-6 relative">
      {/* Subtle bg shift */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-elevated/20 to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center max-w-lg mx-auto mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            ⚡ How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground"
          >
            PDF to answers in 4 steps
          </motion.h2>
        </div>

        {/* Steps — clean cards with left number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-border/30 bg-surface/50 hover:bg-surface hover:border-primary/10 transition-all duration-500"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/[0.06] flex items-center justify-center font-mono text-sm font-bold text-primary/60 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500">
                {s.num}
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground">{s.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed mt-1">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
