import { Bot, Twitter, Linkedin, Github } from 'lucide-react';

const productLinks = ['Features', 'Documentation', 'Pricing', 'Blog', 'Changelog'];
const companyLinks = ['About', 'Contact', 'Careers'];
const legalLinks = ['Privacy', 'Terms', 'Cookies'];

export default function Footer() {
  return (
    <footer className="border-t border-border/10 bg-[hsl(var(--footer-bg))]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-4 cursor-pointer group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center border border-primary/15 group-hover:border-primary/25 transition-colors duration-300">
                <Bot size={13} className="text-primary" />
              </div>
              <span className="font-heading font-bold text-sm text-foreground">SmartExam<span className="text-text-accent">.</span></span>
            </a>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              AI-powered exam preparation that helps students study smarter, not harder.
            </p>
            <div className="flex items-center gap-1 mt-5">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="p-2.5 rounded-lg text-text-muted/40 hover:text-text-muted hover:bg-muted/15 transition-all duration-300 cursor-pointer" aria-label="Social link">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Product', links: productLinks },
            { title: 'Company', links: companyLinks },
            { title: 'Legal', links: legalLinks },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-mono text-text-muted/50 uppercase tracking-[0.2em] mb-5">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-text-muted hover:text-foreground text-sm transition-colors duration-300 cursor-pointer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/8 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-text-muted/30 font-mono">&copy; 2026 SmartExam AI. All rights reserved.</p>
          <p className="text-[11px] text-text-muted/30 font-mono">Built with AI ✦</p>
        </div>
      </div>
    </footer>
  );
}
