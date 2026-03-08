import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: "Will it work with my university's specific exam format?",
    a: "Yes. You choose the mark weight before each answer (2, 4, 8, or 16 marks), and SmartExam AI structures the response accordingly — with the headings, bullet points, and depth that examiners expect at each level.",
  },
  {
    q: "What file types can I upload?",
    a: "PDF is the primary format. Support for .docx and .pptx is in beta. You can upload multiple files and SmartExam AI builds a unified knowledge base from all of them.",
  },
  {
    q: "How accurate are the answers?",
    a: "SmartExam AI only answers from your uploaded documents — it does not generate content from general knowledge. Every answer includes a source reference (chapter + page number) so you can verify it instantly.",
  },
  {
    q: "Can I use it for any subject?",
    a: "Yes. It has been used across Engineering, Medical, Law, Management, and Humanities. If your notes are in the PDF, SmartExam AI can answer from them.",
  },
  {
    q: "Is my uploaded content private?",
    a: "All uploaded files are encrypted in transit and at rest. Your documents are never used to train AI models. You can delete your data at any time.",
  },
  {
    q: "What happens after my free trial ends?",
    a: "You move to the free plan (limited questions per day) or upgrade for full access. No data is lost. No automatic charges — you choose when to upgrade.",
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-foreground" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Everything you need to know
          </h2>
          <p className="mt-3" style={{ color: 'hsl(var(--text-muted))' }}>
            Real questions from students, answered.
          </p>
        </div>

        <div>
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} style={{ borderBottom: '1px solid hsl(var(--border) / 0.15)' }}>
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-medium text-base transition-colors pr-4" style={{ color: isOpen ? 'hsl(var(--foreground))' : 'hsl(var(--text-secondary))' }}>
                    {faq.q}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: isOpen ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.1)',
                      border: `1px solid ${isOpen ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border) / 0.15)'}`,
                    }}
                  >
                    <Plus
                      size={14}
                      className="transition-transform duration-300"
                      style={{
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        color: isOpen ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                      }}
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm leading-relaxed pb-6 pr-12" style={{ color: 'hsl(var(--text-muted))' }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
