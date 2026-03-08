import { motion } from 'framer-motion';
import { Upload, Search, SlidersHorizontal, CheckCircle } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const steps = [
  { icon: Upload, num: '01', title: 'Upload your PDF', desc: 'Drop in your notes, textbooks, or study material. Supports multiple files.' },
  { icon: Search, num: '02', title: 'Ask questions', desc: 'AI understands full document context — ask anything.' },
  { icon: SlidersHorizontal, num: '03', title: 'Choose mark depth', desc: 'Select 2, 4, 8, or 16-mark answer format for your exam.' },
  { icon: CheckCircle, num: '04', title: 'Get exam answers', desc: 'Structured, formatted, exam-ready. With source references.' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, hsl(var(--primary) / 0.015), transparent)' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center max-w-lg mx-auto mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            ⚡ How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="font-display font-bold mt-4 text-foreground"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            PDF to answers in 4 steps
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              className="group relative p-6 rounded-2xl text-center transition-all duration-500 hover:translate-y-[-4px]"
              style={{
                background: 'hsl(var(--surface))',
                border: '1px solid hsl(var(--border) / 0.3)',
              }}
            >
              {/* Large decorative number */}
              <span
                className="absolute top-3 right-4 font-mono font-bold text-[3rem] leading-none pointer-events-none"
                style={{ color: 'hsl(var(--primary) / 0.04)' }}
              >
                {s.num}
              </span>

              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-all duration-500 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                style={{ background: 'hsl(var(--primary) / 0.06)' }}
              >
                <s.icon size={20} className="text-text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground mt-4 text-sm">{s.title}</h3>
              <p className="text-xs leading-relaxed mt-2" style={{ color: 'hsl(var(--text-muted))' }}>{s.desc}</p>

              {/* Connector arrow (hidden on last) */}
              {i < 3 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 10H14M14 10L10 6M14 10L10 14" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
