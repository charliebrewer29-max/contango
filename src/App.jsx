import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { ContangoProvider } from '@/contexts/ContangoContext';
import Onboarding from '@/pages/contango/Onboarding';
import Dashboard from '@/pages/contango/Dashboard';
import Lesson from '@/pages/contango/Lesson';
import BranchDetail from '@/pages/contango/BranchDetail';
import Drill from '@/pages/contango/Drill';
import Coach from '@/pages/contango/Coach';
import Leaderboard from '@/pages/contango/Leaderboard';
import Profile from '@/pages/contango/Profile';
import Paywall from '@/pages/contango/Paywall';
import DrillCoach from '@/pages/contango/DrillCoach';
import OnboardingGuide from '@/pages/contango/OnboardingGuide';
import Practice from '@/pages/contango/Practice';
import Insights from '@/pages/contango/Insights';
import Journal from '@/pages/contango/Journal';
import Legal from '@/pages/contango/Legal';

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <ContangoProvider>
            <Routes>
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
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </ContangoProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App