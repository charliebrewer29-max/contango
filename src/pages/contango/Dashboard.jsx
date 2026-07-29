import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Play } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import SkillTree from "@/components/contango/SkillTree";
import DisciplineHero from "@/components/contango/DisciplineHero";
import AdBanner from "@/components/contango/AdBanner";
import { useContango } from "@/contexts/ContangoContext";
import { BRANCHES } from "@/lib/content";
import { canAccessBranch, canAccessLessonId } from "@/lib/subscription";

// Home / Dashboard. One dominant primary action - "Pick up where you left
// off" - sits in the goal card and is the largest, brightest thing on the
// screen. Everything else recedes. New users also see a dismissible discipline
// banner (the same explanation lives permanently on the Discipline screen).
export default function Dashboard() {
  const { progress, entitlement } = useContango();

  if (!progress.onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  const nextLesson = findNextLesson(progress, entitlement);
  const dailyPct = Math.min(100, Math.round(((progress.dailyXp || 0) / Math.max(1, progress.dailyGoal)) * 100));

  return (
    <ScreenShell showStats tab="learn">
      <div className="space-y-8">
        <DisciplineHero />

        {/* Daily goal + the single dominant primary action */}
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 py-5 font-display text-[19px] font-bold tracking-tight text-slate-950 shadow-xl shadow-amber-500/30 transition hover:bg-amber-300"
            >
              <Play className="h-6 w-6 fill-slate-950" />
              Pick up where you left off
            </Link>
          )}
        </section>

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

function findNextLesson(progress, entitlement) {
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
    if (b.type === "strategy" && !canAccessBranch(b, entitlement)) continue;
    if (b.introLesson && !progress.completedLessons.includes(b.introLesson.id)) {
      return { path: `/branch/${b.id}`, title: b.branchTitle };
    }
    if (b.units) {
      for (const u of b.units) {
        if (!canAccessLessonId(u.id, entitlement)) continue;
        if (!progress.completedLessons.includes(u.id)) {
          return { path: `/lesson/${u.id}`, title: u.title };
        }
      }
    }
  }
  return null;
}