import { Sparkles, Twitter, Linkedin, Github } from 'lucide-react';

const productLinks = ['Features', 'Documentation', 'Pricing', 'Changelog'];
const companyLinks = ['About', 'Contact', 'Careers'];
const legalLinks = ['Privacy Policy', 'Terms of Service'];

export default function Footer() {
  return (
    <footer style={{ background: 'hsl(var(--footer-bg))', borderTop: '1px solid hsl(var(--border) / 0.08)' }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4 cursor-pointer">
              <Sparkles size={14} style={{ color: 'hsl(var(--primary))' }} />
              <span className="font-display font-semibold text-sm text-foreground">SmartExam AI</span>
            </a>
            <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: 'hsl(var(--text-muted))' }}>
              AI-powered exam preparation for every student.
            </p>
            <div className="flex items-center gap-1 mt-5">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg transition-all duration-200 cursor-pointer" style={{ color: 'hsl(var(--text-muted) / 0.3)' }} aria-label="Social link">
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
              <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] mb-4" style={{ color: 'hsl(var(--text-muted) / 0.4)' }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs transition-colors duration-200 cursor-pointer hover:text-foreground" style={{ color: 'hsl(var(--text-muted))' }}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 flex flex-col md:flex-row justify-between items-center gap-3" style={{ borderTop: '1px solid hsl(var(--border) / 0.06)' }}>
          <p className="text-[10px] font-mono" style={{ color: 'hsl(var(--text-muted) / 0.25)' }}>&copy; {new Date().getFullYear()} SmartExam AI. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'hsl(var(--success))' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'hsl(var(--success))' }} />
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'hsl(var(--success) / 0.5)' }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
