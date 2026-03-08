import { Sparkles, Twitter, Linkedin, Github } from 'lucide-react';

const productLinks = ['Features', 'Documentation', 'Pricing', 'Changelog'];
const companyLinks = ['About', 'Contact', 'Careers'];
const legalLinks = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];

export default function Footer() {
  return (
    <footer className="bg-footer-bg rounded-t-[2.5rem] border-t border-border/10">
      {/* Gradient rule at top */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-3 cursor-pointer">
              <Sparkles size={16} className="text-primary" />
              <span className="font-display font-semibold text-sm text-foreground">SmartExam AI</span>
            </a>
            <p className="text-text-muted text-sm leading-relaxed max-w-[220px]">
              AI-powered exam preparation for every student.
            </p>
            <div className="flex items-center gap-1 mt-5">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg text-text-muted/40 hover:text-foreground hover:bg-muted/20 transition-all duration-200 cursor-pointer"
                  aria-label="Social link"
                >
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
              <h4 className="text-[11px] font-mono text-text-muted/50 uppercase tracking-[0.15em] mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
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

        <div className="border-t border-border/10 mt-14 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-text-muted/30 font-mono">&copy; {new Date().getFullYear()} SmartExam AI. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-mono text-success/70">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
