import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { ContangoProvider } from '@/contexts/ContangoContext';
import AppLoadingGate from '@/components/contango/AppLoadingGate';
import { lazy, Suspense } from "react";
import Onboarding from "@/pages/contango/Onboarding";
import Dashboard from "@/pages/contango/Dashboard";
import Lesson from "@/pages/contango/Lesson";
import Drill from "@/pages/contango/Drill";
import Coach from "@/pages/contango/Coach";
import DrillCoach from "@/pages/contango/DrillCoach";
import Profile from "@/pages/contango/Profile";
const BranchDetail = lazy(() => import("@/pages/contango/BranchDetail"));
const Leaderboard = lazy(() => import("@/pages/contango/Leaderboard"));
const Paywall = lazy(() => import("@/pages/contango/Paywall"));
const OnboardingGuide = lazy(() => import("@/pages/contango/OnboardingGuide"));
const Practice = lazy(() => import("@/pages/contango/Practice"));
const Insights = lazy(() => import("@/pages/contango/Insights"));
const Journal = lazy(() => import("@/pages/contango/Journal"));
const Legal = lazy(() => import("@/pages/contango/Legal"));
const Discipline = lazy(() => import("@/pages/contango/Discipline"));
const Rewards = lazy(() => import("@/pages/contango/Rewards"));
const SettingsPage = lazy(() => import("@/pages/contango/Settings"));

// Route area with subtle slide transitions keyed by path. AnimatePresence
// mode="wait" lets the outgoing page exit before the next one slides in.
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Suspense fallback={<div className="cg-app-bg min-h-screen" />}>
        <Routes location={location}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/lesson/:lessonId" element={<Lesson />} />
          <Route path="/branch/:branchId" element={<BranchDetail />} />
          <Route path="/drill/:branchId" element={<Drill />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/paywall" element={<Paywall />} />
          <Route path="/drill-coach" element={<DrillCoach />} />
          <Route path="/guide" element={<OnboardingGuide />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/discipline" element={<Discipline />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <ContangoProvider>
            <AppLoadingGate>
              <AnimatedRoutes />
            </AppLoadingGate>
          </ContangoProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App