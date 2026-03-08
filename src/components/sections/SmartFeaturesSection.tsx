import { motion } from 'framer-motion';
import { Library, BrainCircuit, FileCheck, SearchCode } from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  { icon: Library, title: 'Multi-PDF Knowledge Base', desc: 'Upload multiple study materials. AI cross-references across all your documents for comprehensive answers.', label: 'Multi-doc' },
  { icon: BrainCircuit, title: 'AI Concept Explanation', desc: 'Explains difficult topics in simple language. Understand concepts deeply — not just memorize.', label: 'Deep Learning' },
  { icon: FileCheck, title: 'Exam Answer Formatting', desc: 'Structured answers with headings, subheadings, and bullet points — exactly how examiners want.', label: 'Exam-Ready' },
  { icon: SearchCode, title: 'Semantic Search', desc: 'Find answers inside large textbooks using AI semantic understanding, not just keyword matching.', label: 'AI Search' },
];

export default function SmartFeaturesSection() {
  return (
    <section className="relative py-28 px-6">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header — right-aligned for visual variety */}
        <div className="max-w-xl ml-auto text-right">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            Advanced
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} className="font-heading text-3xl md:text-4xl font-bold mt-3 text-foreground leading-tight">
            Built for serious
            <br />
            <span className="text-text-muted">students.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-14">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease, delay: i * 0.08 }}
              className="group relative rounded-2xl border border-border/20 bg-card/20 p-6 hover:bg-card/40 transition-all duration-500"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors duration-500">
                  <f.icon size={18} className="text-text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-heading font-semibold text-base text-foreground">{f.title}</h3>
                    <span className="text-[10px] font-mono text-text-accent/60 bg-primary/8 px-2 py-0.5 rounded">{f.label}</span>
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
