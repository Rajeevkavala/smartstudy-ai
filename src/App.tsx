import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { withSentryReactRouterV6Routing } from "@sentry/react";

const SentryRoutes = withSentryReactRouterV6Routing(Routes);
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Eagerly loaded routes
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loaded routes
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Upload = lazy(() => import("./pages/Upload"));
const Study = lazy(() => import("./pages/Study"));
const ExamMode = lazy(() => import("./pages/ExamMode"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Settings = lazy(() => import("./pages/Settings"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const KnowledgeGraph = lazy(() => import("./pages/KnowledgeGraph"));
const WeaknessRadar = lazy(() => import("./pages/WeaknessRadar"));
const Battles = lazy(() => import("./pages/Battles"));
const PYQAnalyzer = lazy(() => import("./pages/PYQAnalyzer"));
const FeynmanMode = lazy(() => import("./pages/FeynmanMode"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <SentryRoutes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/pricing" element={<Pricing />} />

                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />
                  <Route path="/upload" element={
                    <ProtectedRoute><Upload /></ProtectedRoute>
                  } />
                  <Route path="/study/:documentId" element={
                    <ProtectedRoute><Study /></ProtectedRoute>
                  } />
                  <Route path="/exam-mode" element={
                    <ProtectedRoute><ExamMode /></ProtectedRoute>
                  } />
                  <Route path="/exam-mode/:documentId" element={
                    <ProtectedRoute><ExamMode /></ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute><Settings /></ProtectedRoute>
                  } />
                  <Route path="/study-planner" element={
                    <ProtectedRoute><StudyPlanner /></ProtectedRoute>
                  } />
                  <Route path="/flashcards" element={
                    <ProtectedRoute><Flashcards /></ProtectedRoute>
                  } />
                  <Route path="/flashcards/:documentId" element={
                    <ProtectedRoute><Flashcards /></ProtectedRoute>
                  } />
                  <Route path="/knowledge-graph" element={
                    <ProtectedRoute><KnowledgeGraph /></ProtectedRoute>
                  } />
                  <Route path="/knowledge-graph/:documentId" element={
                    <ProtectedRoute><KnowledgeGraph /></ProtectedRoute>
                  } />
                  <Route path="/weakness-radar" element={
                    <ProtectedRoute><WeaknessRadar /></ProtectedRoute>
                  } />
                  <Route path="/weakness-radar/:documentId" element={
                    <ProtectedRoute><WeaknessRadar /></ProtectedRoute>
                  } />
                  <Route path="/battles" element={
                    <ProtectedRoute><Battles /></ProtectedRoute>
                  } />
                  <Route path="/pyq-analyzer" element={
                    <ProtectedRoute><PYQAnalyzer /></ProtectedRoute>
                  } />
                  <Route path="/pyq-analyzer/:documentId" element={
                    <ProtectedRoute><PYQAnalyzer /></ProtectedRoute>
                  } />
                  <Route path="/feynman/:documentId" element={
                    <ProtectedRoute><FeynmanMode /></ProtectedRoute>
                  } />
                  <Route path="/leaderboard" element={
                    <ProtectedRoute><Leaderboard /></ProtectedRoute>
                  } />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </SentryRoutes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
