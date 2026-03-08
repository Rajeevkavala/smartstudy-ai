import { Sparkles } from 'lucide-react';

export default function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="section-badge">
      <Sparkles size={12} />
      {children}
    </span>
  );
}
