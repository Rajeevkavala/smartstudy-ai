import { Sparkles, Twitter, Linkedin, Github } from 'lucide-react';

const productLinks = ['Features', 'Documentation', 'Pricing', 'Changelog'];
const companyLinks = ['About', 'Contact', 'Careers'];
const legalLinks = ['Privacy Policy', 'Terms of Service'];

export default function Footer() {
  return (
    <footer className="border-t border-border/10 bg-background">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-3 cursor-pointer">
              <Sparkles size={14} className="text-primary" />
              <span className="font-display font-semibold text-sm text-foreground">SmartExam AI</span>
            </a>
            <p className="text-text-muted text-xs leading-relaxed max-w-[200px]">
              AI-powered exam preparation for every student.
            </p>
            <div className="flex items-center gap-0.5 mt-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg text-text-muted/30 hover:text-foreground hover:bg-muted/15 transition-all duration-200 cursor-pointer" aria-label="Social link">
                  <Icon size={14} />
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
              <h4 className="text-[10px] font-mono text-text-muted/40 uppercase tracking-[0.15em] mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-text-muted hover:text-foreground text-xs transition-colors duration-200 cursor-pointer">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/8 mt-12 pt-5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[10px] text-text-muted/25 font-mono">&copy; {new Date().getFullYear()} SmartExam AI</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-success" />
            <span className="text-[10px] font-mono text-success/50">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
