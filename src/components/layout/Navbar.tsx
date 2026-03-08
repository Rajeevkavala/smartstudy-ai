import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-3xl">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between px-5 py-2 rounded-full transition-all duration-500"
        style={{
          background: scrolled ? 'hsl(var(--background) / 0.85)' : 'hsl(var(--background) / 0.4)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          border: scrolled ? '1px solid hsl(var(--primary) / 0.12)' : '1px solid hsl(var(--foreground) / 0.06)',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px hsl(var(--primary) / 0.05)' : 'none',
        }}
      >
        <a href="#" className="flex items-center gap-2 cursor-pointer">
          <Sparkles size={15} style={{ color: 'hsl(var(--primary))' }} />
          <span className="font-display font-semibold text-sm text-foreground">SmartExam AI</span>
        </a>

        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm px-3 py-1.5 rounded-lg group cursor-pointer transition-colors duration-200"
              style={{ color: 'hsl(var(--text-muted))' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--foreground))')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--text-muted))')}
            >
              {link.label}
              <span className="absolute bottom-0.5 left-3 right-3 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: 'hsl(var(--primary))' }} />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm cursor-pointer transition-colors"
                style={{ color: 'hsl(var(--text-muted))' }}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 hover:translate-y-[-1px]"
                style={{
                  background: 'hsl(var(--muted) / 0.3)',
                  color: 'hsl(var(--foreground))',
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm cursor-pointer transition-colors" style={{ color: 'hsl(var(--text-muted))' }}>Log in</Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-primary-foreground transition-all duration-300 cursor-pointer hover:translate-y-[-1px]"
                style={{
                  background: 'hsl(var(--primary))',
                  boxShadow: '0 2px 12px hsl(var(--primary) / 0.3)',
                }}
              >
                Try Free
                <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-foreground p-1.5 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 rounded-2xl p-5"
            style={{
              background: 'hsl(var(--background) / 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid hsl(var(--border) / 0.3)',
            }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm py-2.5 px-3 rounded-lg cursor-pointer transition-colors"
                  style={{ color: 'hsl(var(--text-muted))' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid hsl(var(--border) / 0.3)' }}>
                {user ? (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm py-2.5 px-3 rounded-lg cursor-pointer transition-colors" style={{ color: 'hsl(var(--text-muted))' }} onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard size={14} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="w-full text-left text-sm py-2.5 px-3 rounded-lg cursor-pointer transition-colors"
                      style={{ color: 'hsl(var(--text-muted))' }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="btn-primary justify-center text-sm py-3 w-full" onClick={() => setMobileOpen(false)}>
                    Try for Free <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
