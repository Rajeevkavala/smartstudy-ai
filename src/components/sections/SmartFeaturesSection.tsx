import { motion } from 'framer-motion';
import { Library, BrainCircuit, FileCheck, SearchCode } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';
import { staggerItem } from '@/lib/animations';

const features = [
  { icon: Library, title: 'Multi-PDF Knowledge Base', desc: 'Upload multiple study materials. AI cross-references across all your documents for comprehensive answers.', badge: 'Multi-document' },
  { icon: BrainCircuit, title: 'AI Concept Explanation', desc: 'Explains difficult topics in simple language. Understand concepts deeply, not just memorize for exams.', badge: 'Deep Learning' },
  { icon: FileCheck, title: 'Exam Answer Formatting', desc: 'Structured answers with headings, subheadings, bullet points, and diagrams — exactly how examiners want.', badge: 'Exam-Ready' },
  { icon: SearchCode, title: 'Semantic Search', desc: 'Find answers inside large textbooks instantly using AI semantic understanding, not just keyword matching.', badge: 'AI Powered' },
];

export default function SmartFeaturesSection() {
  return (
    <section className="relative py-24 px-4 bg-surface/20">
      <div className="absolute inset-0 bg-section-glow pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center">
          <SectionBadge>Smart Features</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>Built for serious students</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-xl mx-auto">Advanced AI capabilities that go beyond simple Q&A</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {features.map((f, i) => (
            <motion.div key={f.title} {...staggerItem} transition={{ ...staggerItem.transition, delay: i * 0.1 }} className="glass-card-hover p-6">
              <div className="flex items-start gap-4">
                <div className="icon-container shrink-0">
                  <f.icon size={22} className="text-text-accent" />
                </div>
                <div>
                  <span className="section-badge text-[10px] mb-2 inline-block">{f.badge}</span>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{f.title}</h3>
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
