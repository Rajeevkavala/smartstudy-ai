import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote: "I had 6 chapters of OS notes and 48 hours before my exam. SmartExam AI turned my entire PDF into precise 8-mark answers. Scored 89/100.",
    author: "Priya Sharma",
    role: "B.Tech CSE, 3rd Year — VIT Vellore",
    metric: "89/100",
  },
  {
    quote: "I used to spend 3 hours summarizing one chapter. Now I upload it, pick topics, and get exam-formatted summaries in under 2 minutes.",
    author: "Arjun Mehta",
    role: "CA Final Aspirant — Mumbai",
    metric: "3hrs → 2min",
  },
  {
    quote: "The mark-based answer format is exactly what my university expects. It adds the right headings and sub-points. My professors ask if I hired a tutor.",
    author: "Ananya Krishnan",
    role: "M.Sc Data Science — IIT Madras",
    metric: "4.9★ rated",
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent(p => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const next = () => setCurrent((p) => (p + 1) % testimonials.length);
  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-28 px-6 relative">
      {/* Subtle bg gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.015] to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="section-label">💬 Student stories</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Real results from real students
          </h2>
        </div>

        <div className="relative">
          {/* Quote card */}
          <div className="rounded-2xl border border-border/20 bg-surface/60 p-8 md:p-12 min-h-[280px] flex flex-col items-center justify-center">
            {/* Metric badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`metric-${current}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <span className="font-mono text-xs tracking-wider text-primary bg-primary/[0.08] border border-primary/15 px-3 py-1 rounded-full">
                  {testimonials[current].metric}
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-2xl"
              >
                <p className="font-display text-lg md:text-xl text-foreground leading-relaxed">
                  "{testimonials[current].quote}"
                </p>
                <div className="mt-6">
                  <p className="font-display font-semibold text-foreground text-sm">{testimonials[current].author}</p>
                  <p className="text-text-muted text-xs mt-1">{testimonials[current].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={prev} className="w-9 h-9 rounded-full border border-border/20 flex items-center justify-center text-text-muted hover:text-foreground hover:border-primary/20 transition-all cursor-pointer" aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${i === current ? 'bg-primary w-6' : 'bg-text-muted/20 w-1.5 hover:bg-text-muted/40'}`} aria-label={`Testimonial ${i + 1}`} />
              ))}
            </div>
            <button onClick={next} className="w-9 h-9 rounded-full border border-border/20 flex items-center justify-center text-text-muted hover:text-foreground hover:border-primary/20 transition-all cursor-pointer" aria-label="Next">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
