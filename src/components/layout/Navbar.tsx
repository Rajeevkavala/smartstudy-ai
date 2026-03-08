import { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-4xl">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center justify-between px-5 py-2.5 rounded-full transition-all duration-500 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-2xl border border-primary/15 shadow-glow-purple'
            : 'bg-background/40 backdrop-blur-xl border border-border/30'
        }`}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 cursor-pointer">
          <Sparkles size={16} className="text-primary" />
          <span className="font-display font-semibold text-sm text-foreground">SmartExam AI</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-text-muted hover:text-foreground transition-colors duration-200 text-sm px-3 py-1.5 rounded-lg group cursor-pointer"
            >
              {link.label}
              <span className="absolute bottom-0.5 left-3 right-3 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#login" className="text-text-muted hover:text-foreground transition-colors text-sm cursor-pointer">Log in</a>
          <a href="#cta" className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:shadow-glow-purple transition-all duration-300 cursor-pointer">
            Try for Free
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-1.5 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </motion.div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 rounded-2xl border border-border/30 bg-background/95 backdrop-blur-2xl p-5"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-muted hover:text-foreground transition-colors text-sm py-2.5 px-3 rounded-lg hover:bg-muted/20 cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-border/30 mt-3 pt-3 flex flex-col gap-2">
                <a href="#login" className="text-text-muted text-sm py-2 px-3 cursor-pointer" onClick={() => setMobileOpen(false)}>Log in</a>
                <a href="#cta" className="btn-primary justify-center text-sm py-3" onClick={() => setMobileOpen(false)}>
                  Try for Free <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
