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
    q: "How accurate are the answers? Will it hallucinate?",
    a: "SmartExam AI only answers from your uploaded documents — it does not generate content from general knowledge. Every answer includes a source reference (chapter + page number) so you can verify it instantly.",
  },
  {
    q: "Can I use it for any subject?",
    a: "Yes. It has been used across Engineering (CS, ECE, Mech), Medical (MBBS, NEET), Law, Management, and Humanities. If your notes are in the PDF, SmartExam AI can answer from them.",
  },
  {
    q: "Is my uploaded content private and secure?",
    a: "All uploaded files are encrypted in transit and at rest. Your documents are never used to train AI models. You can delete your data at any time from your account.",
  },
  {
    q: "What happens after my free trial ends?",
    a: "You move to the free plan (limited questions per day) or upgrade to continue full access. No data is lost. No automatic charges — you choose when to upgrade.",
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to know
          </h2>
          <p className="text-text-muted mt-3">
            Real questions from students, answered.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-0">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="border-b border-border/15">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className={`font-display font-medium text-base transition-colors ${isOpen ? 'text-foreground' : 'text-text-secondary group-hover:text-foreground'}`}>
                    {faq.q}
                  </span>
                  <Plus
                    size={18}
                    className={`text-text-muted shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-45 text-primary' : ''}`}
                  />
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
                      <p className="text-text-muted text-sm leading-relaxed pb-5 pr-8">
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
