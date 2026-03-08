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
    badgeStyle: { background: 'hsl(var(--mark-4) / 0.08)', color: 'hsl(var(--mark-4))', borderColor: 'hsl(var(--mark-4) / 0.15)' },
    visual: ['3 PDFs indexed', 'Cross-referencing Ch.2 + Ch.7', 'Answer synthesized from 2 sources'],
  },
  {
    icon: BrainCircuit,
    title: 'AI Concept Explanation',
    desc: 'Explains difficult topics in plain language. Understand concepts deeply, not just memorize for exams.',
    badge: 'Deep Learning',
    badgeStyle: { background: 'hsl(var(--primary) / 0.08)', color: 'hsl(var(--text-accent))', borderColor: 'hsl(var(--primary) / 0.15)' },
    visual: ['Complex topic detected', 'Simplified explanation ready', 'Analogy: "Think of it as..."'],
  },
  {
    icon: FileCheck,
    title: 'Exam Answer Formatting',
    desc: 'Structured answers with headings, subheadings, and bullet points — exactly how examiners want.',
    badge: 'Exam-ready',
    badgeStyle: { background: 'hsl(var(--success) / 0.08)', color: 'hsl(var(--success))', borderColor: 'hsl(var(--success) / 0.15)' },
    visual: ['Introduction ✓', 'Key Points (4/4) ✓', 'Conclusion ✓'],
  },
  {
    icon: SearchCode,
    title: 'Semantic Search',
    desc: 'Find answers inside large textbooks using AI understanding, not keyword matching.',
    badge: 'AI Powered',
    badgeStyle: { background: 'hsl(var(--accent) / 0.08)', color: 'hsl(var(--accent))', borderColor: 'hsl(var(--accent) / 0.15)' },
    visual: ['Query: "data integrity"', 'Found in: Ch.5, Ch.8, Ch.12', 'Relevance: 97%'],
  },
];

export default function SmartFeaturesSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="relative py-32 px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            ✦ Smart Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="font-display font-bold mt-4 text-foreground"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            Built for <span className="font-drama italic" style={{ color: 'hsl(var(--primary))' }}>serious</span> students
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left tabs */}
          <div className="lg:col-span-2 space-y-1.5">
            {features.map((f, i) => (
              <button
                key={f.title}
                onClick={() => setActiveIdx(i)}
                className="w-full text-left p-4 rounded-2xl transition-all duration-400 cursor-pointer"
                style={{
                  background: i === activeIdx ? 'hsl(var(--surface))' : 'transparent',
                  border: `1px solid ${i === activeIdx ? 'hsl(var(--primary) / 0.1)' : 'transparent'}`,
                  boxShadow: i === activeIdx ? '0 0 24px hsl(var(--primary) / 0.03)' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300"
                    style={{ background: i === activeIdx ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--muted) / 0.1)' }}
                  >
                    <f.icon size={15} className={i === activeIdx ? 'text-text-accent' : 'text-text-muted'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-display font-semibold text-sm transition-colors duration-300" style={{ color: i === activeIdx ? 'hsl(var(--foreground))' : 'hsl(var(--text-secondary))' }}>
                      {f.title}
                    </span>
                    {i === activeIdx && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs leading-relaxed mt-1.5" style={{ color: 'hsl(var(--text-muted))' }}>
                        {f.desc}
                      </motion.p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right visual */}
          <div
            className="lg:col-span-3 rounded-2xl p-8 md:p-10 flex flex-col justify-center min-h-[340px]"
            style={{
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--border) / 0.2)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease }}
              >
                <span className="text-[10px] font-mono tracking-widest px-2.5 py-1 rounded-full border" style={features[activeIdx].badgeStyle}>
                  {features[activeIdx].badge}
                </span>
                <h3 className="font-display font-bold text-xl text-foreground mt-5">{features[activeIdx].title}</h3>
                <p className="text-sm leading-relaxed mt-2 max-w-md" style={{ color: 'hsl(var(--text-secondary))' }}>{features[activeIdx].desc}</p>

                {/* Terminal output */}
                <div className="mt-8 rounded-xl p-5 font-mono text-xs space-y-2.5" style={{ background: 'hsl(var(--background) / 0.8)', border: '1px solid hsl(var(--border) / 0.15)' }}>
                  {features[activeIdx].visual.map((line, i) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.3 }}
                      className="flex items-center gap-2.5"
                    >
                      <span style={{ color: 'hsl(var(--primary) / 0.5)' }}>→</span>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{line}</span>
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
