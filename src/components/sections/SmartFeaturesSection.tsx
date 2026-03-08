import { motion } from 'framer-motion';
import { Library, BrainCircuit, FileCheck, SearchCode, ArrowUpRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  { icon: Library, title: 'Multi-PDF Knowledge Base', desc: 'Upload multiple study materials. AI cross-references across all your documents for comprehensive, connected answers.', label: 'Multi-doc', color: 'from-primary/15 to-secondary/10' },
  { icon: BrainCircuit, title: 'AI Concept Explanation', desc: 'Complex topics explained in simple language. Build real understanding instead of surface-level memorization.', label: 'Deep Learning', color: 'from-accent/15 to-primary/10' },
  { icon: FileCheck, title: 'Exam Answer Formatting', desc: 'Structured answers with proper headings, subheadings, bullet points, and diagrams — exactly how examiners expect.', label: 'Exam-Ready', color: 'from-success/15 to-accent/10' },
  { icon: SearchCode, title: 'Semantic Search', desc: 'Find answers inside large textbooks using AI semantic understanding. Goes far beyond simple keyword matching.', label: 'AI Search', color: 'from-secondary/15 to-primary/10' },
];

export default function SmartFeaturesSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header — right-aligned */}
        <div className="max-w-xl ml-auto text-right">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            Advanced
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold mt-4 text-foreground leading-[1.1] tracking-tight">
            Built for serious
            <br />
            <span className="gradient-text">students.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.1 }} className="text-text-muted mt-4 text-sm leading-relaxed">
            Advanced AI capabilities that go far beyond simple Q&A.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              className="group relative rounded-2xl border border-border/15 bg-card/15 p-7 hover:bg-card/30 hover:border-border/25 transition-all duration-500"
            >
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} border border-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500`}>
                  <f.icon size={22} className="text-text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading font-semibold text-[15px] text-foreground">{f.title}</h3>
                    <span className="text-[9px] font-mono text-text-accent/70 bg-primary/8 px-2 py-0.5 rounded-md border border-primary/10">{f.label}</span>
                    <ArrowUpRight size={13} className="text-text-muted/0 group-hover:text-text-muted/50 transition-all duration-500 ml-auto shrink-0" />
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
