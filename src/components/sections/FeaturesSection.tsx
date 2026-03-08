import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileUp, MessageSquare, ListChecks, Zap, Target, BarChart3 } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function UploadShuffler() {
  const items = [
    { label: 'DBMS_Notes.pdf', status: 'INDEXED', statusColor: 'text-success bg-success/8 border-success/15' },
    { label: 'OS_Chapter4.pdf', status: 'PROCESSING', statusColor: 'text-mark-16 bg-mark-16/8 border-mark-16/15' },
    { label: 'Networks_Unit2.pdf', status: 'QUEUED', statusColor: 'text-text-muted bg-muted/10 border-border/15' },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setActive(p => (p + 1) % items.length), 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="mt-auto pt-5 space-y-1.5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          animate={{ scale: i === active ? 1.02 : 1, opacity: i === active ? 1 : 0.6 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-500"
          style={{
            background: i === active ? 'hsl(var(--primary) / 0.04)' : 'transparent',
            border: `1px solid ${i === active ? 'hsl(var(--primary) / 0.12)' : 'transparent'}`,
          }}
        >
          <span className="text-text-secondary truncate flex items-center gap-2">
            <FileUp size={10} className={i === active ? 'text-text-accent' : 'text-text-muted'} />
            {item.label}
          </span>
          <span className={`text-[9px] tracking-wider px-2 py-0.5 rounded-md border font-medium ${item.statusColor}`}>{item.status}</span>
        </motion.div>
      ))}
    </div>
  );
}

function TypewriterDemo() {
  const messages = ["What is database normalization?", "Explain the ACID properties...", "Define process scheduling..."];
  const [text, setText] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);
  const typeMessage = useCallback(() => {
    const msg = messages[msgIdx];
    let i = 0;
    setText('');
    const interval = setInterval(() => {
      setText(msg.slice(0, i + 1));
      i++;
      if (i >= msg.length) { clearInterval(interval); setTimeout(() => setMsgIdx(p => (p + 1) % messages.length), 2000); }
    }, 25);
    return () => clearInterval(interval);
  }, [msgIdx]);
  useEffect(() => { const cleanup = typeMessage(); return cleanup; }, [typeMessage]);
  return (
    <div className="mt-auto pt-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono tracking-wider flex items-center gap-1.5" style={{ color: 'hsl(var(--accent))' }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'hsl(var(--accent))' }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'hsl(var(--accent))' }} />
          </span>
          LIVE
        </span>
      </div>
      <div className="rounded-xl px-3.5 py-3 font-mono text-xs" style={{ background: 'hsl(var(--background) / 0.7)', border: '1px solid hsl(var(--accent) / 0.1)', color: 'hsl(var(--text-secondary))' }}>
        {text}<span className="typewriter-cursor" />
      </div>
    </div>
  );
}

function MarkGraph() {
  const data = [
    { label: '2M', score: 45, color: 'hsl(var(--mark-2))' },
    { label: '4M', score: 62, color: 'hsl(var(--mark-4))' },
    { label: '8M', score: 80, color: 'hsl(var(--primary))' },
    { label: '16M', score: 96, color: 'hsl(var(--mark-16))' },
  ];
  return (
    <div className="mt-auto pt-5 space-y-2">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-2.5">
          <span className="text-[9px] font-mono w-6" style={{ color: 'hsl(var(--text-muted))' }}>{d.label}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted) / 0.15)' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${d.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease, delay: i * 0.15 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${d.color}, ${d.color}80)` }}
            />
          </div>
          <span className="text-[9px] font-mono w-8 text-right" style={{ color: d.color }}>{d.score}%</span>
        </div>
      ))}
      <p className="text-[8px] font-mono pt-1" style={{ color: 'hsl(var(--text-muted))' }}>QUALITY vs MARK DEPTH</p>
    </div>
  );
}

function SummaryRadar() {
  const chapters = [
    { name: 'Ch1', pct: 94 }, { name: 'Ch2', pct: 78 }, { name: 'Ch3', pct: 88 }, { name: 'Ch4', pct: 65 }, { name: 'Ch5', pct: 92 },
  ];
  return (
    <div className="mt-auto pt-5 flex items-end gap-2">
      {chapters.map((ch) => (
        <div key={ch.name} className="flex-1 text-center">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${ch.pct * 0.55}px` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="w-full rounded-t mx-auto"
            style={{ background: `linear-gradient(to top, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.15))` }}
          />
          <span className="text-[8px] font-mono mt-1 block" style={{ color: 'hsl(var(--text-muted))' }}>{ch.name}</span>
        </div>
      ))}
    </div>
  );
}

function ExamHeatmap() {
  const topics = [
    { name: 'Normalization', freq: 95 }, { name: 'ACID', freq: 88 }, { name: 'SQL', freq: 82 },
    { name: 'Indexing', freq: 60 }, { name: 'Transactions', freq: 75 }, { name: 'ER Model', freq: 45 },
  ];
  return (
    <div className="mt-auto pt-5 flex flex-wrap gap-1.5">
      {topics.map((t) => {
        const o = t.freq > 80 ? 1 : t.freq > 60 ? 0.6 : 0.3;
        return (
          <span
            key={t.name}
            className="text-[9px] font-mono px-2.5 py-1 rounded-lg border transition-all duration-300 hover:scale-105 cursor-default"
            style={{
              opacity: o,
              borderColor: `hsl(var(--primary) / ${o * 0.25})`,
              background: `hsl(var(--primary) / ${o * 0.06})`,
              color: `hsl(var(--foreground) / ${o})`,
            }}
          >
            {t.name}
          </span>
        );
      })}
    </div>
  );
}

function TopicBars() {
  const topics = [
    { name: 'Database Design', pct: 92 }, { name: 'Query Optimization', pct: 78 }, { name: 'Normalization', pct: 71 },
  ];
  return (
    <div className="mt-auto pt-5 space-y-2.5">
      {topics.map((t, i) => (
        <div key={t.name}>
          <div className="flex justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'hsl(var(--text-secondary))' }}>{t.name}</span>
            <span className="text-[10px] font-mono" style={{ color: 'hsl(var(--text-muted))' }}>{t.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted) / 0.1)' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${t.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease, delay: i * 0.15 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.3))' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const features = [
  { icon: FileUp, title: 'Drop in any PDF', desc: 'Upload notes or textbooks. AI indexes content instantly.', interactive: UploadShuffler, span: 'md:col-span-2' },
  { icon: MessageSquare, title: 'Ask anything', desc: 'Get precise, contextual answers from your documents.', interactive: TypewriterDemo, span: '' },
  { icon: ListChecks, title: 'Mark-based answers', desc: 'Structured answers for 2, 4, 8, and 16-mark questions.', interactive: MarkGraph, span: '' },
  { icon: Zap, title: 'Instant summaries', desc: 'Every chapter, condensed to what matters.', interactive: SummaryRadar, span: '' },
  { icon: Target, title: 'Exam mode', desc: 'Focus on frequently asked questions only.', interactive: ExamHeatmap, span: '' },
  { icon: BarChart3, title: 'Topic insights', desc: 'Know which topics are most asked. Prioritize.', interactive: TopicBars, span: 'md:col-span-2' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6">
      {/* Subtle bg glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, hsl(var(--primary) / 0.02), transparent)' }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
              ✦ Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="font-display font-bold mt-4 text-foreground leading-tight max-w-lg"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
            >
              Everything you need to ace your exams
            </motion.h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-sm max-w-xs" style={{ color: 'hsl(var(--text-muted))' }}>
            Six tools, one purpose: get you from uploaded notes to exam-ready answers faster than ever.
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.06 }}
              className={`group relative rounded-2xl p-6 flex flex-col min-h-[260px] transition-all duration-500 cursor-default scan-line ${f.span}`}
              style={{
                background: 'hsl(var(--surface))',
                border: '1px solid hsl(var(--border) / 0.5)',
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
            >
              {/* Mouse-follow glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.05), transparent 40%)' }} />
              
              {/* Hover border glow */}
              <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/15 transition-all duration-500 pointer-events-none group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.04)]" />

              <div className="relative z-10 flex flex-col flex-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.06)' }}>
                  <f.icon size={17} className="text-text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground mt-4" style={{ fontSize: '1rem' }}>{f.title}</h3>
                <p className="text-xs leading-relaxed mt-1.5" style={{ color: 'hsl(var(--text-muted))' }}>{f.desc}</p>
                <f.interactive />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
