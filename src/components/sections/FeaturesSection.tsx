import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileUp, MessageSquare, ListChecks, Zap, Target, BarChart3, ArrowUpRight } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function UploadShuffler() {
  const items = [
    { label: 'DBMS_Notes.pdf', status: 'INDEXED', color: 'text-success' },
    { label: 'OS_Chapter4.pdf', status: 'PROCESSING', color: 'text-mark-16' },
    { label: 'Networks_Unit2.pdf', status: 'QUEUED', color: 'text-text-muted' },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setActive(p => (p + 1) % items.length), 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="mt-auto pt-4 space-y-1">
      {items.map((item, i) => (
        <div key={item.label} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-500 ${i === active ? 'bg-primary/[0.06] border border-primary/15' : 'border border-transparent'}`}>
          <span className="text-text-secondary truncate">📄 {item.label}</span>
          <span className={`${item.color} text-[10px] tracking-wider`}>{item.status}</span>
        </div>
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
    <div className="mt-auto pt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-mono text-accent tracking-wider">● LIVE</span>
      </div>
      <div className="bg-background/60 rounded-lg border border-accent/10 px-3 py-2.5 font-mono text-xs text-text-secondary">
        {text}<span className="typewriter-cursor" />
      </div>
    </div>
  );
}

function MarkGraph() {
  const data = [
    { label: '2M', score: 45, color: 'from-mark-2/60 to-mark-2/20' },
    { label: '4M', score: 62, color: 'from-mark-4/60 to-mark-4/20' },
    { label: '8M', score: 80, color: 'from-primary/60 to-primary/20' },
    { label: '16M', score: 96, color: 'from-mark-16/60 to-mark-16/20' },
  ];
  return (
    <div className="mt-auto pt-4 space-y-1.5">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-text-muted w-5">{d.label}</span>
          <div className="flex-1 h-1.5 bg-muted/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${d.score}%` }} viewport={{ once: true }} transition={{ duration: 1, ease, delay: i * 0.15 }} className={`h-full rounded-full bg-gradient-to-r ${d.color}`} />
          </div>
          <span className="text-[9px] font-mono text-text-muted w-7 text-right">{d.score}%</span>
        </div>
      ))}
    </div>
  );
}

function SummaryRadar() {
  const chapters = [
    { name: 'Ch1', pct: 94 }, { name: 'Ch2', pct: 78 }, { name: 'Ch3', pct: 88 }, { name: 'Ch4', pct: 65 }, { name: 'Ch5', pct: 92 },
  ];
  return (
    <div className="mt-auto pt-4 flex items-end gap-1.5">
      {chapters.map((ch) => (
        <div key={ch.name} className="flex-1 text-center">
          <motion.div initial={{ height: 0 }} whileInView={{ height: `${ch.pct * 0.5}px` }} viewport={{ once: true }} transition={{ duration: 0.8, ease }} className="w-full rounded-t bg-gradient-to-t from-primary/40 to-accent/20 mx-auto" style={{ maxWidth: '100%' }} />
          <span className="text-[8px] font-mono text-text-muted mt-1 block">{ch.name}</span>
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
    <div className="mt-auto pt-4 flex flex-wrap gap-1">
      {topics.map((t) => {
        const o = t.freq > 80 ? 1 : t.freq > 60 ? 0.6 : 0.3;
        return (
          <span key={t.name} className="text-[9px] font-mono px-2 py-0.5 rounded-md border" style={{ opacity: o, borderColor: `hsl(var(--primary) / ${o * 0.3})`, background: `hsl(var(--primary) / ${o * 0.08})`, color: `hsl(var(--foreground) / ${o})` }}>
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
    <div className="mt-auto pt-4 space-y-2">
      {topics.map((t, i) => (
        <div key={t.name}>
          <div className="flex justify-between mb-0.5">
            <span className="text-[9px] text-text-secondary">{t.name}</span>
            <span className="text-[9px] font-mono text-text-muted">{t.pct}%</span>
          </div>
          <div className="h-1 bg-muted/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${t.pct}%` }} viewport={{ once: true }} transition={{ duration: 1, ease, delay: i * 0.15 }} className="h-full rounded-full bg-gradient-to-r from-primary/50 to-accent/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

const features = [
  { icon: FileUp, title: 'Drop in any PDF', desc: 'Upload notes or textbooks. AI indexes content instantly.', interactive: UploadShuffler, span: 'lg:col-span-2 lg:row-span-1' },
  { icon: MessageSquare, title: 'Ask anything', desc: 'Get precise, contextual answers from your documents.', interactive: TypewriterDemo, span: '' },
  { icon: ListChecks, title: 'Mark-based answers', desc: 'Structured answers for 2, 4, 8, and 16-mark questions.', interactive: MarkGraph, span: '' },
  { icon: Zap, title: 'Instant summaries', desc: 'Every chapter, condensed to what matters.', interactive: SummaryRadar, span: '' },
  { icon: Target, title: 'Exam mode', desc: 'Focus on frequently asked questions only.', interactive: ExamHeatmap, span: '' },
  { icon: BarChart3, title: 'Topic insights', desc: 'Know which topics are most asked. Prioritize.', interactive: TopicBars, span: '' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
              ✦ Features
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground leading-tight max-w-md">
              Everything you need to ace your exams
            </motion.h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-text-muted text-sm max-w-xs">
            Six tools, one purpose: get you from uploaded notes to exam-ready answers faster than ever.
          </motion.p>
        </div>

        {/* Bento grid — asymmetric */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.06 }}
              className={`group relative rounded-2xl p-5 flex flex-col min-h-[220px] transition-all duration-500 cursor-default ${f.span}`}
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
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.04), transparent 40%)' }} />
              
              {/* Hover border */}
              <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/15 transition-colors duration-500 pointer-events-none" />

              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-primary/[0.06] flex items-center justify-center">
                    <f.icon size={16} className="text-text-accent" />
                  </div>
                  <ArrowUpRight size={14} className="text-text-muted/0 group-hover:text-text-muted/60 transition-all duration-300 translate-y-1 group-hover:translate-y-0" />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground mt-3">{f.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed mt-1">{f.desc}</p>
                <f.interactive />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
