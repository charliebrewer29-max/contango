import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Play, Flame, Trophy, User, Compass, Repeat, BarChart3, BookOpen } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import SkillTree from "@/components/contango/SkillTree";
import DisciplineHero from "@/components/contango/DisciplineHero";
import AdBanner from "@/components/contango/AdBanner";
import { useContango } from "@/contexts/ContangoContext";
import { BRANCHES } from "@/lib/content";
import { buildPracticeCatalog, isDue } from "@/lib/spacedRepetition";
import { isPremium, canAccessBranch } from "@/lib/subscription";

// Home / Dashboard. Visual hierarchy:
//  - 30px bold screen title (discipline hero) sets the page.
//  - Dense data surface: stats bar (top) + daily goal ring. Small mono, tight.
//  - Spacious content cards: large type, generous padding, muted borders so
//    they recede behind the one dominant primary action.
//  - One dominant primary: "Pick up where you left off". Everything else is
//    secondary.
//  - Vertical rhythm: 32px between sections (space-y-8), 8px from a section
//    heading to its content (mt-2).
export default function Dashboard() {
  const { progress } = useContango();
  const practiceDue = React.useMemo(
    () => buildPracticeCatalog(progress).filter((c) => isDue((progress.srCards || {})[c.id])).length,
    [progress.completedLessons, progress.completedDrills, progress.srCards]
  );

  if (!progress.onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  const nextLesson = findNextLesson(progress);
  const dailyPct = Math.min(100, Math.round(((progress.dailyXp || 0) / Math.max(1, progress.dailyGoal)) * 100));

  return (
    <ScreenShell showStats tab="learn">
      <div className="space-y-8">
        <DisciplineHero />

        {/* Daily goal - dense chart surface + the single dominant primary action */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
          <div className="flex items-center gap-3">
            <GoalRing pct={dailyPct} />
            <div className="min-w-0 flex-1">
              <p className="t-eyebrow text-[11px] text-slate-500">Today's goal</p>
              <p className="cg-num font-mono text-base font-bold tracking-tight text-slate-100">
                {progress.dailyXp || 0}<span className="text-xs font-medium text-slate-500"> / {progress.dailyGoal} XP</span>
              </p>
              <p className="text-[13px] leading-snug text-slate-400">
                {dailyPct >= 100 ? "Goal done - nice work today!" : `${progress.dailyGoal - (progress.dailyXp || 0)} XP to go`}
              </p>
            </div>
          </div>
          {nextLesson && (
            <Link
              to={nextLesson.path}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-4 font-display text-[17px] font-bold tracking-tight text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
            >
              <Play className="h-5 w-5 fill-slate-950" />
              Pick up where you left off
            </Link>
          )}
        </section>

        {/* Spacious content cards below - large type, generous whitespace,
            muted borders so they recede behind the primary action. */}

        {!progress.firstLessonDone && (
          <Link to="/guide" className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:bg-slate-900">
            <Compass className="h-6 w-6 shrink-0 text-amber-400" />
            <div className="flex-1">
              <div className="text-[17px] font-semibold tracking-tight text-slate-100">New here? Let's find your starting point</div>
              <div className="mt-1 text-[15px] leading-relaxed text-slate-400">Chat with a guide and get oriented in a few minutes.</div>
            </div>
          </Link>
        )}

        <Link to={isPremium(progress) ? "/practice" : "/paywall"} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:bg-slate-900">
          <Repeat className="h-6 w-6 shrink-0 text-sky-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold tracking-tight text-slate-100">Spaced Practice</span>
              {!isPremium(progress) && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400">Premium</span>}
            </div>
            <div className="mt-1 text-[15px] leading-relaxed text-slate-400">
              {isPremium(progress)
                ? (practiceDue > 0 ? `${practiceDue} card${practiceDue === 1 ? "" : "s"} ready to review` : "All caught up - review ahead whenever you like")
                : "Unlimited sim sandbox, no hearts. Part of Premium."}
            </div>
          </div>
        </Link>

        <Link to="/journal" className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:bg-slate-900">
          <BookOpen className="h-6 w-6 shrink-0 text-emerald-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold tracking-tight text-slate-100">Trade Journal</span>
              {!isPremium(progress) && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400">Premium</span>}
            </div>
            <div className="mt-1 text-[15px] leading-relaxed text-slate-400">
              {isPremium(progress) ? "Your full decision history with win-rate analytics" : "Free shows your last session - full history with Premium"}
            </div>
          </div>
        </Link>

        {/* Quick actions - icons identify each destination */}
        <div className="grid grid-cols-4 gap-2">
          <QuickLink to="/leaderboard" icon={<Trophy className="h-5 w-5" />} label="Leagues" color="text-amber-400" />
          <QuickLink to="/coach" icon={<Flame className="h-5 w-5" />} label="Coach" color="text-sky-400" />
          <QuickLink to="/profile" icon={<User className="h-5 w-5" />} label="Profile" color="text-slate-300" />
          <QuickLink to="/insights" icon={<BarChart3 className="h-5 w-5" />} label="Insights" color="text-emerald-400" />
        </div>

        {/* Skill tree - section heading sits 8px above its content */}
        <section>
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-400">The skills the disciplined 3% use</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">Strategy branches are the vehicle - you drill each one until the behavior is automatic.</p>
          <div className="mt-6">
            <SkillTree />
          </div>
        </section>

        <AdBanner />

        {/* Footer disclaimer */}
        <p className="text-center text-[11px] leading-[1.7] text-slate-600">
          Everything here is simulated and educational - no real money, no live trading, no trade signals.<br />
          Contango isn't affiliated with TradingView.
        </p>
      </div>
    </ScreenShell>
  );
}

function GoalRing({ pct }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 70 70" className="h-full w-full -rotate-90">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="35" cy="35" r={r} fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="cg-num absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-amber-400">{pct}%</div>
    </div>
  );
}

function QuickLink({ to, icon, label, color }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 py-3 transition hover:border-slate-700">
      <span className={color}>{icon}</span>
      <span className="text-[11px] font-medium tracking-wide text-slate-400">{label}</span>
    </Link>
  );
}

function findNextLesson(progress) {
  // first incomplete foundation lesson
  const foundation = BRANCHES.find(b => b.id === "foundation");
  if (foundation && foundation.units) {
    for (const u of foundation.units) {
      if (!progress.completedLessons.includes(u.id)) {
        return { path: `/lesson/${u.id}`, title: u.title };
      }
    }
  }
  // then any incomplete branch intro (skip premium-locked strategy branches)
  for (const b of BRANCHES) {
    if (b.type === "strategy" && !canAccessBranch(b, progress)) continue;
    if (b.introLesson && !progress.completedLessons.includes(b.introLesson.id)) {
      return { path: `/branch/${b.id}`, title: b.branchTitle };
    }
    if (b.units) {
      for (const u of b.units) {
        if (!progress.completedLessons.includes(u.id)) {
          return { path: `/lesson/${u.id}`, title: u.title };
        }
      }
    }
  }
  return null;
}