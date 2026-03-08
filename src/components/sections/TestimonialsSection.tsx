import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I had 6 chapters of OS notes and 48 hours before my exam. SmartExam AI turned my entire PDF into precise 8-mark answers for every PYQ topic. Scored 89/100.",
    author: "Priya Sharma",
    role: "B.Tech CSE, 3rd Year — VIT Vellore",
  },
  {
    quote: "I used to spend 3 hours summarizing a single chapter. Now I upload it, pick the topics, and get exam-formatted summaries in under 2 minutes. No exaggeration.",
    author: "Arjun Mehta",
    role: "CA Final Aspirant — Mumbai",
  },
  {
    quote: "The mark-based answer format is exactly what my university expects. It even adds the right headings and sub-points. My professors ask if I hired a tutor.",
    author: "Ananya Krishnan",
    role: "M.Sc Data Science — IIT Madras",
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((p) => (p + 1) % testimonials.length);
  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-label">💬 Student stories</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Real students. Real exams. Real results.
          </h2>
        </div>

        {/* Testimonial */}
        <div className="relative min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto"
            >
              {/* Large decorative quote */}
              <Quote size={48} className="text-primary/20 mx-auto mb-4" />

              <p className="font-display text-lg md:text-xl text-foreground leading-relaxed">
                "{testimonials[current].quote}"
              </p>

              <div className="mt-8">
                <p className="font-display font-semibold text-foreground text-sm">{testimonials[current].author}</p>
                <p className="text-text-muted text-sm mt-1">{testimonials[current].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-border/20 flex items-center justify-center text-text-muted hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === current ? 'bg-primary w-6' : 'bg-text-muted/30 hover:bg-text-muted/50'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-border/20 flex items-center justify-center text-text-muted hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
