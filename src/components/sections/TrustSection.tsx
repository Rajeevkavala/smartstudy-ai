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
  const quadrupled = [...logos, ...logos, ...logos, ...logos];
  
  return (
    <section className="py-14 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[11px] text-text-muted/60 uppercase tracking-[0.25em] font-mono text-center">
          Trusted by students at leading institutions
        </motion.p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
        
        <div className="flex animate-marquee" style={{ width: 'max-content' }}>
          {quadrupled.map((logo, i) => (
            <div key={`${logo.name}-${i}`} className="flex items-center gap-3 px-10 py-4 group cursor-default">
              <logo.icon size={18} className="text-text-muted/20 group-hover:text-text-accent/40 transition-colors duration-500" />
              <span className="text-text-muted/20 group-hover:text-text-muted/50 font-heading font-semibold text-sm whitespace-nowrap transition-colors duration-500">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
