import { BookOpen, GraduationCap, Globe, Award, Lightbulb, School, Cpu, Library } from 'lucide-react';

const logos = [
  { name: 'MIT OpenCourseWare', icon: BookOpen },
  { name: 'Coursera', icon: GraduationCap },
  { name: 'edX', icon: Globe },
  { name: 'Khan Academy', icon: Lightbulb },
  { name: 'IIT Bombay', icon: Award },
  { name: 'Stanford Online', icon: School },
  { name: 'NPTEL', icon: Cpu },
  { name: 'Unacademy', icon: Library },
];

const stats = [
  '10M+ Questions Answered',
  '500K+ Students',
  '4.9★ Rating',
  '95% Faster Exam Prep',
  '180+ Universities',
  '40+ Subjects',
];

export default function TrustSection() {
  const doubledLogos = [...logos, ...logos];
  const doubledStats = [...stats, ...stats];

  return (
    <section className="py-8 overflow-hidden space-y-3">
      {/* Row 1 — Partner logos */}
      <div className="ticker-mask">
        <div className="flex animate-marquee" style={{ width: 'max-content' }}>
          {doubledLogos.map((logo, i) => (
            <div key={`${logo.name}-${i}`} className="flex items-center gap-2.5 px-8 py-2">
              <logo.icon size={14} className="text-text-muted/25" />
              <span className="text-text-muted/25 font-display font-medium text-sm whitespace-nowrap tracking-wide">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — Stats ticker (reversed direction) */}
      <div className="ticker-mask">
        <div className="flex animate-marquee-reverse" style={{ width: 'max-content' }}>
          {doubledStats.map((stat, i) => (
            <div key={`${stat}-${i}`} className="flex items-center gap-6 px-6 py-2">
              <span className="text-text-muted/35 font-mono text-xs whitespace-nowrap tracking-wide">{stat}</span>
              <span className="text-text-muted/15">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
