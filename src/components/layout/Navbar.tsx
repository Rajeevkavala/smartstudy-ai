import { useState, useEffect } from 'react';
import { Bot, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  { label: 'Docs', href: '#docs' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-background/70 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/15 group-hover:border-primary/30 transition-colors duration-300">
            <Bot size={15} className="text-primary" />
          </div>
          <span className="font-heading font-bold text-sm text-foreground tracking-tight">SmartExam<span className="text-text-accent">.</span></span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 bg-muted/20 rounded-xl px-1.5 py-1 border border-border/30">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-text-muted hover:text-foreground transition-colors duration-200 text-[13px] px-3.5 py-1.5 rounded-lg hover:bg-muted/40 cursor-pointer">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href="#login" className="text-text-muted hover:text-foreground transition-colors text-[13px] cursor-pointer">Log in</a>
          <a href="#cta" className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium bg-gradient-to-r from-primary to-secondary text-foreground hover:shadow-glow-purple transition-all duration-300 cursor-pointer">
            Get Started
            <ArrowRight size={13} />
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground p-2 cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden border-t border-border/30 bg-background/98 backdrop-blur-2xl">
            <div className="px-6 py-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-text-muted hover:text-foreground transition-colors text-sm py-3 px-3 rounded-lg hover:bg-muted/20 cursor-pointer" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div className="border-t border-border/30 mt-3 pt-4 flex flex-col gap-3">
                <a href="#login" className="text-text-muted text-sm py-2 px-3 cursor-pointer" onClick={() => setMobileOpen(false)}>Log in</a>
                <a href="#cta" className="btn-primary text-sm" onClick={() => setMobileOpen(false)}>
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
