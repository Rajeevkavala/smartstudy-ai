import { useState, useEffect } from 'react';
import { Bot, Menu, X, ArrowRight } from 'lucide-react';
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
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-background/80 backdrop-blur-2xl border-b border-border/50' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <a href="#" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
            <Bot size={14} className="text-primary" />
          </div>
          <span className="font-heading font-semibold text-sm text-foreground">SmartExam AI</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-text-muted hover:text-foreground transition-colors duration-200 text-sm px-3 py-1.5 rounded-lg hover:bg-muted/30 cursor-pointer">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="#login" className="text-text-muted hover:text-foreground transition-colors text-sm cursor-pointer">Log in</a>
          <a href="#cta" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer">
            Get Started
            <ArrowRight size={14} />
          </a>
        </div>

        <button className="md:hidden text-foreground p-2 cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="px-6 py-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-text-muted hover:text-foreground transition-colors text-sm py-2.5 cursor-pointer" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div className="border-t border-border/50 mt-3 pt-3 flex flex-col gap-2">
                <a href="#login" className="text-text-muted text-sm py-2 cursor-pointer" onClick={() => setMobileOpen(false)}>Log in</a>
                <a href="#cta" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-foreground text-background cursor-pointer" onClick={() => setMobileOpen(false)}>
                  Get Started <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
