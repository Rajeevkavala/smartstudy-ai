import { motion } from 'framer-motion';
import { Upload, Search, SlidersHorizontal, CheckCircle } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const steps = [
  { icon: Upload, title: 'Upload', desc: 'Drop your PDF notes, textbooks, or study material.' },
  { icon: Search, title: 'Ask', desc: 'Ask any question. AI understands the full document context.' },
  { icon: SlidersHorizontal, title: 'Choose', desc: 'Select 2, 4, 8, or 16-mark answer format.' },
  { icon: CheckCircle, title: 'Get Answers', desc: 'Receive structured, exam-ready answers with sources.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-lg mx-auto">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            How it works
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Four steps to better grades.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-px mt-16 bg-border/20 rounded-2xl overflow-hidden border border-border/20">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease, delay: i * 0.1 }}
              className="bg-background p-8 text-center relative group hover:bg-card/50 transition-colors duration-500"
            >
              {/* Step number */}
              <span className="text-[10px] font-mono text-text-muted/40 absolute top-4 left-4">0{i + 1}</span>
              
              <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 transition-colors duration-500">
                <s.icon size={20} className="text-text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{s.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
