import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, BrainCircuit, FileCheck, SearchCode } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const features = [
  {
    icon: Library,
    title: 'Multi-PDF Knowledge Base',
    desc: 'Upload multiple documents. AI cross-references across all your materials for comprehensive answers that connect concepts across chapters.',
    badge: 'Multi-document',
    badgeColor: 'bg-mark-4/10 text-mark-4 border-mark-4/15',
    visual: ['3 PDFs indexed', 'Cross-referencing Ch.2 + Ch.7', 'Answer synthesized from 2 sources'],
  },
  {
    icon: BrainCircuit,
    title: 'AI Concept Explanation',
    desc: 'Explains difficult topics in plain language. Understand concepts deeply, not just memorize for exams.',
    badge: 'Deep Learning',
    badgeColor: 'bg-primary/10 text-text-accent border-primary/15',
    visual: ['Complex topic detected', 'Simplified explanation ready', 'Analogy: "Think of it as..."'],
  },
  {
    icon: FileCheck,
    title: 'Exam Answer Formatting',
    desc: 'Structured answers with headings, subheadings, and bullet points — exactly how examiners want.',
    badge: 'Exam-ready',
    badgeColor: 'bg-success/10 text-success border-success/15',
    visual: ['Introduction ✓', 'Key Points (4/4) ✓', 'Conclusion ✓'],
  },
  {
    icon: SearchCode,
    title: 'Semantic Search',
    desc: 'Find answers inside large textbooks using AI understanding, not keyword matching.',
    badge: 'AI Powered',
    badgeColor: 'bg-accent/10 text-accent border-accent/15',
    visual: ['Query: "data integrity"', 'Found in: Ch.5, Ch.8, Ch.12', 'Relevance: 97%'],
  },
];

export default function SmartFeaturesSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="relative py-28 px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            ✦ Smart Features
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Built for serious students
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Left tabs */}
          <div className="lg:col-span-2 space-y-2">
            {features.map((f, i) => (
              <button
                key={f.title}
                onClick={() => setActiveIdx(i)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-400 cursor-pointer ${
                  i === activeIdx
                    ? 'bg-surface border-primary/15 shadow-[0_0_20px_rgba(124,58,237,0.04)]'
                    : 'bg-transparent border-transparent hover:bg-surface/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${i === activeIdx ? 'bg-primary/10' : 'bg-muted/10'}`}>
                    <f.icon size={15} className={i === activeIdx ? 'text-text-accent' : 'text-text-muted'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-display font-semibold text-sm transition-colors duration-300 ${i === activeIdx ? 'text-foreground' : 'text-text-secondary'}`}>
                        {f.title}
                      </span>
                    </div>
                    {i === activeIdx && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-text-muted text-xs leading-relaxed mt-1.5">
                        {f.desc}
                      </motion.p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right visual */}
          <div className="lg:col-span-3 rounded-2xl border border-border/20 bg-surface p-6 md:p-8 flex flex-col justify-center min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease }}
              >
                <span className={`text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full border ${features[activeIdx].badgeColor}`}>
                  {features[activeIdx].badge}
                </span>
                <h3 className="font-display font-bold text-xl text-foreground mt-4">{features[activeIdx].title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mt-2 max-w-md">{features[activeIdx].desc}</p>

                {/* Simulated terminal output */}
                <div className="mt-6 rounded-xl bg-background/80 border border-border/15 p-4 font-mono text-xs space-y-2">
                  {features[activeIdx].visual.map((line, i) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-primary/50">→</span>
                      <span className="text-text-secondary">{line}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
