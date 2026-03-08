import { Bot, Twitter, Linkedin, Github } from 'lucide-react';

const productLinks = ['Features', 'Documentation', 'Pricing', 'Changelog'];
const companyLinks = ['About', 'Contact', 'Careers'];
const legalLinks = ['Privacy', 'Terms', 'Cookies'];

export default function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-3 cursor-pointer">
              <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center border border-primary/15">
                <Bot size={12} className="text-primary" />
              </div>
              <span className="font-heading font-semibold text-sm text-foreground">SmartExam AI</span>
            </a>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              AI-powered exam preparation for every student.
            </p>
            <div className="flex items-center gap-0.5 mt-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="p-2 text-text-muted/50 hover:text-text-muted transition-colors cursor-pointer" aria-label="Social link">
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
              <h4 className="text-xs font-mono text-text-muted/60 uppercase tracking-[0.15em] mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-text-muted hover:text-foreground text-sm transition-colors duration-200 cursor-pointer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/15 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-text-muted/40 font-mono">&copy; 2026 SmartExam AI</p>
          <p className="text-[11px] text-text-muted/40 font-mono">Built with AI ✦</p>
        </div>
      </div>
    </footer>
  );
}
