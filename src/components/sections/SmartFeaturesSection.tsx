import { motion } from 'framer-motion';
import { Library, BrainCircuit, FileCheck, SearchCode } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const features = [
  {
    icon: Library,
    title: 'Multi-PDF Knowledge Base',
    desc: 'Upload multiple study materials. AI cross-references across all your documents for comprehensive answers.',
    badge: 'Multi-document',
    badgeColor: 'bg-mark-4/15 text-mark-4 border-mark-4/20',
  },
  {
    icon: BrainCircuit,
    title: 'AI Concept Explanation',
    desc: 'Explains difficult topics in simple language. Understand concepts deeply — not just memorize for exams.',
    badge: 'Deep Learning',
    badgeColor: 'bg-primary/15 text-text-accent border-primary/20',
  },
  {
    icon: FileCheck,
    title: 'Exam Answer Formatting',
    desc: 'Structured answers with headings, subheadings, and bullet points — exactly how examiners want.',
    badge: 'Exam-ready',
    badgeColor: 'bg-success/15 text-success border-success/20',
  },
  {
    icon: SearchCode,
    title: 'Semantic Search',
    desc: 'Find answers inside large textbooks using AI semantic understanding, not just keyword matching.',
    badge: 'AI Powered',
    badgeColor: 'bg-accent/15 text-accent border-accent/20',
  },
];

export default function SmartFeaturesSection() {
  return (
    <section className="relative py-28 px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            ✦ Smart Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground"
          >
            Built for serious students
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="text-text-muted mt-3"
          >
            Advanced AI capabilities that go beyond simple Q&A
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-14">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              className="group rounded-2xl border border-border/15 bg-card/20 p-6 hover:bg-card/40 hover:border-primary/15 transition-all duration-500"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors duration-500">
                  <f.icon size={20} className="text-text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display font-semibold text-base text-foreground">{f.title}</h3>
                    <span className={`text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full border ${f.badgeColor}`}>
                      {f.badge}
                    </span>
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
