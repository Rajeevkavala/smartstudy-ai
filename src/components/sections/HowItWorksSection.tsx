import { motion } from 'framer-motion';
import { Upload, Search, SlidersHorizontal, CheckCircle } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const steps = [
  { icon: Upload, num: '01', title: 'Upload your PDF', desc: 'Upload your notes, textbooks, or study material. Supports multi-PDF knowledge base.' },
  { icon: Search, num: '02', title: 'Ask questions', desc: 'Ask any question from your uploaded material. AI understands full document context.' },
  { icon: SlidersHorizontal, num: '03', title: 'Choose answer length', desc: 'Select 2-mark, 4-mark, 8-mark, or 16-mark answer format for your exam type.' },
  { icon: CheckCircle, num: '04', title: 'Get perfect answers', desc: 'AI generates structured, exam-ready answers with proper headings and bullet points.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-lg mx-auto">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            ⚡ How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground"
          >
            From PDF to exam answers in seconds
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="text-text-muted mt-3"
          >
            A simple 4-step workflow designed for busy students
          </motion.p>
        </div>

        {/* Steps — horizontal with connectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mt-16">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.12 }}
              className="relative text-center px-6 py-8 group"
            >
              {/* Large decorative number */}
              <span
                className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[4rem] font-bold text-primary/[0.04] leading-none select-none pointer-events-none"
              >
                {s.num}
              </span>

              {/* Connector line — hidden on last & mobile */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 w-8 h-px z-10">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease, delay: i * 0.12 + 0.3 }}
                    className="w-full h-px bg-gradient-to-r from-primary/40 to-transparent origin-left"
                  />
                </div>
              )}

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 transition-colors duration-500">
                  <s.icon size={22} className="text-text-accent" />
                </div>
                <h3 className="font-display font-semibold text-base text-foreground mb-2">{s.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed max-w-[200px] mx-auto">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
