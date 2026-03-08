import { Bot, Twitter, Linkedin, Github } from 'lucide-react';

const productLinks = ['Features', 'Docs', 'Pricing', 'Blog', 'Changelog'];
const companyLinks = ['About', 'Contact', 'Careers'];
const legalLinks = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];

export default function Footer() {
  return (
    <footer className="bg-footer-bg border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Bot size={16} className="text-primary" />
              </div>
              <span className="font-heading font-bold text-lg gradient-text">SmartExam AI</span>
            </a>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              AI-powered exam preparation for every student.
            </p>
            <div className="flex items-center gap-1 mt-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="p-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer" aria-label="Social link">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {[
            { title: 'Product', links: productLinks },
            { title: 'Company', links: companyLinks },
            { title: 'Legal', links: legalLinks },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-text-muted hover:text-text-primary text-sm transition-colors duration-200 block py-1 cursor-pointer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">&copy; 2026 SmartExam AI. All rights reserved.</p>
          <p className="text-xs text-text-muted">Made with AI ✦</p>
        </div>
      </div>
    </footer>
  );
}
