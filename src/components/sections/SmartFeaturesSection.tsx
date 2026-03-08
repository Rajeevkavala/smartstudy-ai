import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, BrainCircuit, FileCheck, SearchCode, Bot, FileText } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const features = [
  {
    icon: Library,
    title: 'Multi-PDF Knowledge Base',
    desc: 'Upload multiple study materials. AI cross-references across all your documents for comprehensive answers.',
    badge: 'Multi-document',
    visual: 'multi-pdf',
  },
  {
    icon: BrainCircuit,
    title: 'AI Concept Explanation',
    desc: 'Explains difficult topics in simple language. Understand concepts deeply, not just memorize for exams.',
    badge: 'Deep Learning',
    visual: 'concept',
  },
  {
    icon: FileCheck,
    title: 'Exam Answer Formatting',
    desc: 'Structured answers with headings, subheadings, bullet points — exactly how examiners want to see them.',
    badge: 'Exam-Ready',
    visual: 'formatting',
  },
  {
    icon: SearchCode,
    title: 'Semantic Search',
    desc: 'Find answers inside large textbooks instantly using AI semantic understanding, not just keyword matching.',
    badge: 'AI Powered',
    visual: 'search',
  },
];

function FeatureVisual({ visual }: { visual: string }) {
  if (visual === 'multi-pdf') {
    return (
      <div className="space-y-2">
        {['DBMS_Notes.pdf', 'OS_Textbook.pdf', 'CN_Slides.pdf'].map((name, i) => (
          <div key={name} className="flex items-center gap-2 glass-card px-3 py-2 rounded-lg" style={{ opacity: 1 - i * 0.15 }}>
            <FileText size={14} className="text-text-accent shrink-0" />
            <span className="font-mono text-xs text-text-secondary">{name}</span>
            <span className="ml-auto text-[10px] text-text-muted">{['42pg', '180pg', '65pg'][i]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 mt-2">
          <Bot size={12} className="text-accent" />
          <span className="text-[10px] text-accent">Cross-referencing 3 documents...</span>
        </div>
      </div>
    );
  }
  if (visual === 'formatting') {
    return (
      <div className="glass-card px-3 py-3 rounded-lg space-y-1.5">
        <div className="h-3 bg-primary/20 rounded w-2/3" />
        <div className="h-2 bg-muted/40 rounded w-full" />
        <div className="h-2 bg-muted/40 rounded w-5/6" />
        <div className="flex gap-1 mt-1">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-text-accent">Heading</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/15 text-accent">Bullets</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/15 text-success">Diagram</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function SmartFeaturesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative py-24 px-4 bg-surface/15">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center">
          <SectionBadge>Advanced</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>Built for serious students</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-lg mx-auto">Advanced AI capabilities that go beyond simple Q&A</p>
        </div>

        {/* Desktop: tabbed layout */}
        <div className="hidden md:grid grid-cols-[280px_1fr] gap-8 mt-16">
          <div className="space-y-1">
            {features.map((f, i) => (
              <button
                key={f.title}
                onClick={() => setActive(i)}
                className={`w-full text-left px-4 py-4 rounded-lg transition-all duration-300 cursor-pointer border-l-[3px] ${
                  active === i
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-elevated/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <f.icon size={18} className={active === i ? 'text-text-accent' : 'text-text-muted'} />
                  <span className="text-sm font-medium">{f.title}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="glass-card p-8 rounded-2xl min-h-[280px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease }}
              >
                <span className="section-badge text-[10px] mb-3 inline-block">{features[active].badge}</span>
                <h3 className="font-heading font-semibold text-xl text-foreground mb-3">{features[active].title}</h3>
                <p className="text-text-muted text-sm leading-relaxed max-w-md mb-6">{features[active].desc}</p>
                <FeatureVisual visual={features[active].visual} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: accordion */}
        <div className="md:hidden mt-12 space-y-3">
          {features.map((f, i) => (
            <div key={f.title} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setActive(active === i ? -1 : i)}
                className="w-full text-left px-5 py-4 flex items-center gap-3 cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  active === i ? 'bg-primary/20' : 'bg-muted/30'
                }`}>
                  <f.icon size={16} className={active === i ? 'text-text-accent' : 'text-text-muted'} />
                </div>
                <span className={`text-sm font-medium ${active === i ? 'text-foreground' : 'text-text-muted'}`}>{f.title}</span>
              </button>
              <AnimatePresence>
                {active === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <span className="section-badge text-[10px] mb-2 inline-block">{f.badge}</span>
                      <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
