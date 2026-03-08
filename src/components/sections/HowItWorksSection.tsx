import { motion, useInView } from 'framer-motion';
import { Upload, Search, SlidersHorizontal, CheckCircle } from 'lucide-react';
import { useRef } from 'react';
import SectionBadge from '@/components/ui/SectionBadge';
import GradientText from '@/components/ui/GradientText';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const steps = [
  { icon: Upload, title: 'Drop in a PDF', desc: 'Upload notes, textbooks, or any study material. Multi-PDF knowledge base supported.' },
  { icon: Search, title: 'Ask questions', desc: 'Ask anything from your uploaded material. AI understands full document context.' },
  { icon: SlidersHorizontal, title: 'Pick mark length', desc: 'Select 2, 4, 8, or 16-mark format to match your exact exam requirements.' },
  { icon: CheckCircle, title: 'Get answers examiners want', desc: 'Structured, exam-ready answers with headings, bullet points, and citations.' },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <SectionBadge>How it Works</SectionBadge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4">
            <GradientText>From PDF to exam answers in seconds</GradientText>
          </h2>
          <p className="text-text-muted mt-4 max-w-lg mx-auto">A simple 4-step workflow designed for busy students</p>
        </div>

        <div ref={ref} className="relative mt-16">
          {/* Connector line — desktop */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px z-0 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out ${isInView ? 'w-full' : 'w-0'}`}
              style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))' }}
            />
          </div>

          {/* Mobile vertical line */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-px z-0 overflow-hidden">
            <div
              className={`w-full transition-all duration-1000 ease-out ${isInView ? 'h-full' : 'h-0'}`}
              style={{ background: 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)))' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.15 }}
                className="glass-card p-6 text-center relative z-10 md:ml-0 ml-10"
              >
                {/* Large background step number */}
                <span className="absolute top-2 right-4 text-6xl font-heading font-bold text-foreground/[0.03] select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm mx-auto mb-4 text-primary-foreground bg-primary">
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
      </div>
    </section>
  );
}
