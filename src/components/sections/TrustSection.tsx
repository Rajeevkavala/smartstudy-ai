import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Globe, Award, Lightbulb, School } from 'lucide-react';

const logos = [
  { name: 'MIT OpenCourseware', icon: BookOpen },
  { name: 'Coursera', icon: GraduationCap },
  { name: 'edX', icon: Globe },
  { name: 'Khan Academy', icon: Lightbulb },
  { name: 'IIT Bombay', icon: Award },
  { name: 'Stanford Online', icon: School },
];

export default function TrustSection() {
  const doubled = [...logos, ...logos];
  
  return (
    <section className="py-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <p className="text-[11px] text-text-muted uppercase tracking-[0.2em] font-mono text-center">
          Trusted by students at top institutions
        </p>
      </div>

      {/* Infinite marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div className="flex animate-marquee" style={{ width: 'max-content' }}>
          {doubled.map((logo, i) => (
            <div key={`${logo.name}-${i}`} className="flex items-center gap-2.5 px-8 py-3">
              <logo.icon size={16} className="text-text-muted/30" />
              <span className="text-text-muted/30 font-heading font-medium text-sm whitespace-nowrap">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
