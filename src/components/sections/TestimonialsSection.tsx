import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I had 6 chapters of OS notes and 48 hours before my exam. SmartExam AI turned my entire PDF into precise 8-mark answers. Scored 89/100.",
    author: "Priya Sharma",
    role: "B.Tech CSE, 3rd Year — VIT Vellore",
    metric: "89/100",
    metricLabel: "Score achieved",
  },
  {
    quote: "I used to spend 3 hours summarizing one chapter. Now I upload it, pick topics, and get exam-formatted summaries in under 2 minutes.",
    author: "Arjun Mehta",
    role: "CA Final Aspirant — Mumbai",
    metric: "3hrs → 2min",
    metricLabel: "Time saved",
  },
  {
    quote: "The mark-based answer format is exactly what my university expects. It adds the right headings and sub-points. My professors ask if I hired a tutor.",
    author: "Ananya Krishnan",
    role: "M.Sc Data Science — IIT Madras",
    metric: "4.9★",
    metricLabel: "Student rating",
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent(p => (p + 1) % testimonials.length), 7000);
    return () => clearInterval(interval);
  }, []);

  const next = () => setCurrent((p) => (p + 1) % testimonials.length);
  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--primary) / 0.02), transparent)' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="section-label">💬 Student stories</span>
          <h2 className="font-display font-bold mt-4 text-foreground" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Real students. Real exams. <span className="font-drama italic" style={{ color: 'hsl(var(--primary))' }}>Real results.</span>
          </h2>
        </div>

        <div className="relative">
          <div
            className="rounded-3xl p-10 md:p-14 min-h-[340px] flex flex-col items-center justify-center relative overflow-hidden"
            style={{
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--border) / 0.2)',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4)',
            }}
          >
            {/* Decorative quote */}
            <Quote size={48} className="absolute top-6 left-8 opacity-[0.04]" style={{ color: 'hsl(var(--primary))' }} />

            {/* Metric badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`metric-${current}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="text-center">
                  <span className="font-mono text-2xl font-bold text-shimmer">{testimonials[current].metric}</span>
                  <span className="block text-[10px] font-mono tracking-wider mt-1" style={{ color: 'hsl(var(--text-muted))' }}>{testimonials[current].metricLabel}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-2xl"
              >
                <p className="font-display text-lg md:text-xl text-foreground leading-relaxed font-light">
                  "{testimonials[current].quote}"
                </p>
                <div className="mt-8">
                  <p className="font-display font-semibold text-foreground text-sm">{testimonials[current].author}</p>
                  <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-muted))' }}>{testimonials[current].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer group" style={{ border: '1px solid hsl(var(--border) / 0.2)', color: 'hsl(var(--text-muted))' }} aria-label="Previous">
              <ChevronLeft size={16} className="group-hover:text-foreground transition-colors" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="h-1.5 rounded-full transition-all cursor-pointer"
                  style={{
                    width: i === current ? '28px' : '8px',
                    background: i === current ? 'hsl(var(--primary))' : 'hsl(var(--text-muted) / 0.2)',
                  }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer group" style={{ border: '1px solid hsl(var(--border) / 0.2)', color: 'hsl(var(--text-muted))' }} aria-label="Next">
              <ChevronRight size={16} className="group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
