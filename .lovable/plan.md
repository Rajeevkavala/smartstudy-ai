

# SmartExam AI — Landing Page Plan

## Overview
Build a complete, dark futuristic AI SaaS landing page for SmartExam AI — an AI-powered exam prep platform. Design inspired by GitHub Copilot, Linear, and Vercel aesthetics.

**Stack adaptation:** React + Vite + Tailwind + Framer Motion (adapted from the Next.js spec to fit the existing project).

---

## Design System
- **Dark theme** with deep navy background (#0A0F1E), glassmorphism cards, purple/indigo/blue glow effects
- **Fonts:** Space Grotesk (headings), DM Sans (body), JetBrains Mono (code) via Google Fonts CSS import
- **Colors:** Purple primary (#7C3AED), indigo secondary (#6366F1), blue accent (#3B82F6)
- **Effects:** Gradient text, glass cards with blur, ambient glow shadows, floating animations

## Sections to Build (in order)

### 1. Navbar
- Sticky glassmorphism header with logo, nav links (Features, How it Works, Pricing, Docs, Login), and "Try for Free" CTA
- Mobile hamburger menu with slide-down drawer
- Opacity transition on scroll

### 2. Hero Section
- Full-viewport with animated badge, gradient headline ("AI-powered exam preparation from your PDFs"), subtext, dual CTA buttons
- Interactive demo mockup: split PDF viewer (left) + AI chat interface (right) in a glass card
- Floating animated icons (BrainCircuit, FileText, Sparkles, Zap)
- Social proof line with avatars and star rating

### 3. Trust Section
- "Trusted by students and educators worldwide" with 6 grayscale logo placeholders (MIT, Coursera, edX, etc.)

### 4. Features Section (6-card grid)
- Upload Study Material, Ask Questions, Mark-based Answers, Instant Summaries, Smart Exam Mode, Topic Insights
- Glass cards with icons, staggered scroll animations

### 5. Product Demo Section
- Large glass card with PDF viewer panel + AI chat interface
- Typing indicator animation, mark-length selector pills, formatted AI answer

### 6. How It Works (4-step flow)
- Upload → Ask → Choose Length → Get Answers
- Connected by gradient line on desktop, numbered step cards

### 7. Smart Features (4 detailed cards, 2-column grid)
- Multi-PDF Knowledge Base, AI Concept Explanation, Exam Answer Formatting, Semantic Search

### 8. Dashboard Preview
- Sidebar navigation + main content area mockup showing the study hub interface

### 9. Stats Section
- Animated counters: 10M+ Questions, 500K+ Students, 95% Faster Prep

### 10. Final CTA Section
- Gradient glow background, headline, dual buttons, floating sparkle elements

### 11. Footer
- Brand column with social icons, Product/Company/Legal link columns, copyright bar

## New Dependencies
- `framer-motion` for scroll animations, hover effects, and floating elements

## File Structure
- `src/components/layout/Navbar.tsx`, `Footer.tsx`
- `src/components/sections/` — one file per section (Hero, Trust, Features, Demo, HowItWorks, SmartFeatures, Dashboard, Stats, CTA)
- `src/components/ui/GlassCard.tsx`, `GradientText.tsx`, `SectionBadge.tsx`, `AnimatedCounter.tsx`
- `src/lib/animations.ts` — shared Framer Motion variants
- Updated `tailwind.config.ts` with custom colors, fonts, animations, shadows
- Updated `src/index.css` with glass card utilities and global dark styles
- Updated `src/pages/Index.tsx` to assemble all sections

