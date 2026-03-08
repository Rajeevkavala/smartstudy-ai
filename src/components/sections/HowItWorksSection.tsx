import { motion } from 'framer-motion';
import { Upload, Search, SlidersHorizontal, CheckCircle } from 'lucide-react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';
import { staggerItem } from '@/lib/animations';

const steps = [
  { icon: Upload, title: 'Upload your PDF', desc: 'Upload your notes, textbooks, or study material. Supports multi-PDF knowledge base.' },
  { icon: Search, title: 'Ask questions', desc: 'Ask any question from your uploaded material. AI understands full document context.' },
  { icon: SlidersHorizontal, title: 'Choose answer length', desc: 'Select 2-mark, 4-mark, 8-mark, or 16-mark answer format for your exam type.' },
  { icon: CheckCircle, title: 'Get perfect answers', desc: 'AI generates structured, exam-ready answers with proper headings and bullet points.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <SectionBadge>How it Works</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>From PDF to exam answers in seconds</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-xl mx-auto">A simple 4-step workflow designed for busy students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px z-0" style={{ background: 'linear-gradient(90deg, #7C3AED, #6366F1, #3B82F6, #06B6D4)' }} />

          {steps.map((s, i) => (
            <motion.div key={s.title} {...staggerItem} transition={{ ...staggerItem.transition, delay: i * 0.15 }} className="glass-card p-6 text-center relative z-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm mx-auto mb-4 text-foreground" style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)' }}>
                {i + 1}
              </div>
              <div className="icon-container mx-auto mb-3 w-14 h-14">
                <s.icon size={24} className="text-text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mt-3 mb-2">{s.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
