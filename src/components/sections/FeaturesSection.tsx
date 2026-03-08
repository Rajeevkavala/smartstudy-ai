import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileUp, MessageSquare, ListChecks, Zap, Target, BarChart3 } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Interactive micro-UIs for each card
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
    <div className="mt-4 space-y-1.5">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all duration-500 ${
            i === active ? 'bg-primary/10 border border-primary/20' : 'bg-muted/10 border border-transparent'
          }`}
        >
          <span className="text-text-secondary truncate">📄 {item.label}</span>
          <span className={`${item.color} text-[10px] tracking-wider`}>{item.status}</span>
        </div>
      ))}
    </div>
  );
}

function TypewriterDemo() {
  const messages = [
    "What is database normalization?",
    "Explain the ACID properties...",
    "Define process scheduling...",
    "What are TCP/IP layers?",
  ];
  const [text, setText] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);

  const typeMessage = useCallback(() => {
    const msg = messages[msgIdx];
    let i = 0;
    setText('');
    const interval = setInterval(() => {
      setText(msg.slice(0, i + 1));
      i++;
      if (i >= msg.length) {
        clearInterval(interval);
        setTimeout(() => setMsgIdx(p => (p + 1) % messages.length), 2000);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [msgIdx]);

  useEffect(() => {
    const cleanup = typeMessage();
    return cleanup;
  }, [typeMessage]);

  return (
    <div className="mt-4 relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-accent">● LIVE</span>
      </div>
      <div className="bg-background rounded-xl border border-accent/15 px-3 py-3 font-mono text-xs text-text-secondary min-h-[36px]">
        {text}<span className="typewriter-cursor" />
      </div>
    </div>
  );
}

function MarkGraph() {
  const data = [
    { label: '2M', score: 45 },
    { label: '4M', score: 62 },
    { label: '8M', score: 80 },
    { label: '16M', score: 96 },
  ];
  return (
    <div className="mt-4 space-y-2">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-muted w-6">{d.label}</span>
          <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${d.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease, delay: i * 0.15 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
          <span className="text-[10px] font-mono text-text-muted w-8 text-right">{d.score}%</span>
        </div>
      ))}
      <p className="text-[10px] font-mono text-text-muted/50 uppercase tracking-wider mt-2">Answer quality vs mark depth</p>
    </div>
  );
}

function SummaryRadar() {
  const chapters = [
    { name: 'Ch 1', pct: 94 },
    { name: 'Ch 2', pct: 78 },
    { name: 'Ch 3', pct: 88 },
    { name: 'Ch 4', pct: 65 },
    { name: 'Ch 5', pct: 92 },
  ];
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="grid grid-cols-5 gap-1 flex-1">
        {chapters.map((ch) => (
          <div key={ch.name} className="text-center">
            <div className="relative h-12 flex items-end justify-center">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${ch.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease }}
                className="w-full rounded-t bg-gradient-to-t from-primary/60 to-accent/40"
              />
            </div>
            <span className="text-[9px] font-mono text-text-muted mt-1 block">{ch.name}</span>
          </div>
        ))}
      </div>
      <div className="text-center">
        <span className="text-xl font-display font-bold text-foreground">5</span>
        <span className="text-[10px] font-mono text-text-muted block">Chapters</span>
      </div>
    </div>
  );
}

function ExamHeatmap() {
  const topics = [
    { name: 'Normalization', freq: 95 },
    { name: 'ACID', freq: 88 },
    { name: 'SQL Joins', freq: 82 },
    { name: 'Indexing', freq: 60 },
    { name: 'Transactions', freq: 75 },
    { name: 'ER Model', freq: 45 },
  ];
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {topics.map((t) => {
        const opacity = t.freq > 80 ? '1' : t.freq > 60 ? '0.6' : '0.3';
        return (
          <span
            key={t.name}
            className="text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-default"
            style={{
              opacity,
              borderColor: `rgba(124, 58, 237, ${Number(opacity) * 0.4})`,
              background: `rgba(124, 58, 237, ${Number(opacity) * 0.1})`,
              color: `rgba(240, 238, 248, ${Number(opacity)})`,
            }}
            title={`${t.freq}% exam frequency`}
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
    { name: 'Database Design', pct: 92 },
    { name: 'Query Optimization', pct: 78 },
    { name: 'Normalization', pct: 71 },
    { name: 'Transaction Mgmt', pct: 58 },
  ];
  return (
    <div className="mt-4 space-y-2">
      {topics.map((t, i) => (
        <div key={t.name} className="space-y-0.5">
          <div className="flex justify-between">
            <span className="text-[10px] text-text-secondary">{t.name}</span>
            <span className="text-[10px] font-mono text-text-muted">{t.pct}%</span>
          </div>
          <div className="h-1.5 bg-muted/15 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${t.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease, delay: i * 0.15 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const features = [
  {
    icon: FileUp,
    title: 'Upload Study Material',
    desc: 'Upload PDFs, notes, or textbooks. Our AI processes and indexes your content instantly.',
    interactive: UploadShuffler,
  },
  {
    icon: MessageSquare,
    title: 'Ask Questions',
    desc: 'Ask questions directly from your documents. Get precise, contextual answers.',
    interactive: TypewriterDemo,
  },
  {
    icon: ListChecks,
    title: 'Mark-based Answers',
    desc: 'Generate structured answers for 2, 4, 8, and 16-mark exam questions.',
    interactive: MarkGraph,
  },
  {
    icon: Zap,
    title: 'Instant Summaries',
    desc: 'Get chapter and topic summaries. Focus on what matters for your exam.',
    interactive: SummaryRadar,
  },
  {
    icon: Target,
    title: 'Smart Exam Mode',
    desc: 'Focus only on frequently asked and examinable questions. Maximize your study ROI.',
    interactive: ExamHeatmap,
  },
  {
    icon: BarChart3,
    title: 'Topic Insights',
    desc: 'Know which topics are most asked. Prioritize your sessions strategically.',
    interactive: TopicBars,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-xl">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">
            ✦ Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground leading-tight"
          >
            Accelerate your exam preparation
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="text-text-muted text-base mt-3"
          >
            Everything you need to ace your exams with AI-powered intelligence
          </motion.p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              className="bento-card group"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center">
                  <f.icon size={16} className="text-text-accent" />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground">{f.title}</h3>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              <f.interactive />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
