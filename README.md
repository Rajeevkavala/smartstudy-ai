# 🚀 NoteAura / SmartExam AI

> A production-grade AI-powered study platform and exam preparation workflow.

SmartExam AI (also known as NoteAura) is a comprehensive React + TypeScript application designed to transform how students prepare for exams. It provides robust features including secure authentication, intelligent document processing, dynamic studying experiences, and comprehensive dashboard analytics backed by Supabase and Groq.

## 🛠 Tech Stack

- **Frontend Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend/Platform**: [Supabase](https://supabase.com/) (Auth, Database, Storage, Edge Functions)
- **AI Integrations**: [Groq API](https://groq.com/) (Llama 3.3 70B Versatile for streaming chat, queries, and summaries)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query/latest)

## 🌟 Core Features

- **Document Management**: Seamlessly upload and manage study materials (PDFs up to 50MB).
- **AI-Powered Chat**: Engage in context-aware conversations based on document contents with detailed responses and customized exam marks (2M/4M/8M/16M).
- **Exam Simulation**: Practice under realistic conditions (Practice, Timed, or Mock Exams).
- **Automated Summarization**: Generate quick recaps, detailed chapter overviews, or rapid flashcard lists.
- **Detailed Analytics**: Track learning progress via the dashboard.

*(Upcoming features: AI Weakness Radar, Predictive Score Engine, Cross-Document Knowledge Graph, Study Scheduler, Real-Time Exam Battles)*

## 🚦 Local Development Setup

Follow these steps to set up the project locally:

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment variables:**
   Duplicate `.env.example` to `.env` and fill in your Supabase variables.
   ```dotenv
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```

4. **Build for production:**
   ```sh
   npm run build
   ```

5. **Preview the production build:**
   ```sh
   npm run preview
   ```

## 🧪 Testing

Run the Vitest test suite to ensure stability:
```sh
npm run test
```

For continuous testing during development:
```sh
npm run test:watch
```

## 🗺 Roadmap

Check out the `UPGRADE_ROADMAP.md` completely outlining our pathway from a college project to an enterprise-grade SaaS platform.

```
smartstudy-ai
├─ .copilot
│  ├─ COPILOT_DEVELOPMENT_GUIDE.md
│  └─ instructions.md
├─ components.json
├─ docs
│  ├─ phases
│  │  ├─ phase-01-core-infrastructure.md
│  │  ├─ phase-02-authentication.md
│  │  ├─ phase-03-minio-storage.md
│  │  ├─ phase-04-database-migration.md
│  │  ├─ phase-05-rag-pipeline.md
│  │  ├─ phase-06-groq-integration.md
│  │  ├─ phase-07-api-endpoints.md
│  │  ├─ phase-08-websockets.md
│  │  ├─ phase-09-frontend-refactor.md
│  │  ├─ phase-10-stripe-payments.md
│  │  └─ phase-11-devops-deployment.md
│  └─ README.md
├─ eslint.config.js
├─ index.html
├─ MIGRATION_PYTHON_BACKEND.md
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ favicon.ico
│  ├─ placeholder.svg
│  └─ robots.txt
├─ README.md
├─ src
│  ├─ App.css
│  ├─ App.tsx
│  ├─ components
│  │  ├─ ErrorBoundary.tsx
│  │  ├─ NavLink.tsx
│  │  ├─ sections
│  │  │  ├─ CTASection.tsx
│  │  │  ├─ DemoSection.tsx
│  │  │  ├─ FAQSection.tsx
│  │  │  ├─ FeaturesSection.tsx
│  │  │  ├─ HeroSection.tsx
│  │  │  ├─ HowItWorksSection.tsx
│  │  │  ├─ SmartFeaturesSection.tsx
│  │  │  ├─ StatsSection.tsx
│  │  │  ├─ TestimonialsSection.tsx
│  │  │  └─ TrustSection.tsx
│  │  └─ ui
│  │     ├─ accordion.tsx
│  │     ├─ alert-dialog.tsx
│  │     ├─ alert.tsx
│  │     ├─ AnimatedCounter.tsx
│  │     ├─ aspect-ratio.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ breadcrumb.tsx
│  │     ├─ button.tsx
│  │     ├─ calendar.tsx
│  │     ├─ card.tsx
│  │     ├─ carousel.tsx
│  │     ├─ chart.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ collapsible.tsx
│  │     ├─ command.tsx
│  │     ├─ context-menu.tsx
│  │     ├─ dialog.tsx
│  │     ├─ drawer.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ form.tsx
│  │     ├─ GlassCard.tsx
│  │     ├─ GradientText.tsx
│  │     ├─ hover-card.tsx
│  │     ├─ input-otp.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ menubar.tsx
│  │     ├─ navigation-menu.tsx
│  │     ├─ pagination.tsx
│  │     ├─ popover.tsx
│  │     ├─ progress.tsx
│  │     ├─ radio-group.tsx
│  │     ├─ resizable.tsx
│  │     ├─ scroll-area.tsx
│  │     ├─ SectionBadge.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ sheet.tsx
│  │     ├─ sidebar.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ slider.tsx
│  │     ├─ sonner.tsx
│  │     ├─ switch.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea.tsx
│  │     ├─ toast.tsx
│  │     ├─ toaster.tsx
│  │     ├─ toggle-group.tsx
│  │     ├─ toggle.tsx
│  │     ├─ tooltip.tsx
│  │     └─ use-toast.ts
│  ├─ contexts
│  │  └─ AuthContext.tsx
│  ├─ hooks
│  │  ├─ use-mobile.tsx
│  │  ├─ use-toast.ts
│  │  ├─ useBattles.ts
│  │  ├─ useFlashcards.ts
│  │  ├─ useGamification.ts
│  │  ├─ useStudyPlan.ts
│  │  ├─ useSubscription.ts
│  │  ├─ useUsage.ts
│  │  └─ useWeakness.ts
│  ├─ index.css
│  ├─ integrations
│  │  └─ supabase
│  │     ├─ client.ts
│  │     └─ types.ts
│  ├─ lib
│  │  ├─ animations.ts
│  │  ├─ env.ts
│  │  ├─ pdf.ts
│  │  ├─ posthog.ts
│  │  ├─ sentry.ts
│  │  └─ utils.ts
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ Auth.tsx
│  │  ├─ Battles.tsx
│  │  ├─ Dashboard.tsx
│  │  ├─ ExamMode.tsx
│  │  ├─ FeynmanMode.tsx
│  │  ├─ Flashcards.tsx
│  │  ├─ ForgotPassword.tsx
│  │  ├─ Index.tsx
│  │  ├─ KnowledgeGraph.tsx
│  │  ├─ Leaderboard.tsx
│  │  ├─ NotFound.tsx
│  │  ├─ Pricing.tsx
│  │  ├─ PYQAnalyzer.tsx
│  │  ├─ ResetPassword.tsx
│  │  ├─ Settings.tsx
│  │  ├─ Study.tsx
│  │  ├─ StudyPlanner.tsx
│  │  ├─ Upload.tsx
│  │  └─ WeaknessRadar.tsx
│  ├─ store
│  │  └─ useAppStore.ts
│  ├─ test
│  │  ├─ example.test.ts
│  │  └─ setup.ts
│  └─ vite-env.d.ts
├─ supabase
│  ├─ .temp
│  │  ├─ cli-latest
│  │  ├─ gotrue-version
│  │  ├─ pooler-url
│  │  ├─ postgres-version
│  │  ├─ project-ref
│  │  ├─ rest-version
│  │  ├─ storage-migration
│  │  └─ storage-version
│  ├─ config.toml
│  ├─ functions
│  │  ├─ analyze-pyq
│  │  │  └─ index.ts
│  │  ├─ analyze-weakness
│  │  │  └─ index.ts
│  │  ├─ chat
│  │  │  └─ index.ts
│  │  ├─ check-usage
│  │  │  └─ index.ts
│  │  ├─ evaluate-answer
│  │  │  └─ index.ts
│  │  ├─ extract-concepts
│  │  │  └─ index.ts
│  │  ├─ extract-text
│  │  │  └─ index.ts
│  │  ├─ feynman-session
│  │  │  └─ index.ts
│  │  ├─ generate-flashcards
│  │  │  └─ index.ts
│  │  ├─ generate-questions
│  │  │  └─ index.ts
│  │  ├─ generate-study-plan
│  │  │  └─ index.ts
│  │  ├─ generate-summary
│  │  │  └─ index.ts
│  │  ├─ matchmaking
│  │  │  └─ index.ts
│  │  ├─ predict-score
│  │  │  └─ index.ts
│  │  ├─ stripe-webhook
│  │  │  └─ index.ts
│  │  └─ _shared
│  │     └─ ai.ts
│  └─ migrations
│     ├─ 20260308110032_99b5b6fe-f28e-4c2b-b3e2-b49589a9f97a.sql
│     ├─ 20260308110054_307f9fdb-d16e-4ea6-8aad-73a90d500f5e.sql
│     ├─ 20260308110124_68a22007-a223-4458-b6cd-b296629c5f66.sql
│     └─ 20260308120000_production_upgrade.sql
├─ tailwind.config.ts
├─ test-edge-functions.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ vitest.config.ts

```