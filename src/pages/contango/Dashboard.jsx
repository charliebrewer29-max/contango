import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Play, Flame, Trophy, User, ChevronRight, Target, Compass } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import SkillTree from "@/components/contango/SkillTree";
import { useContango } from "@/contexts/ContangoContext";
import { BRANCHES } from "@/lib/content";

// Home / Dashboard: stats bar, skill tree, daily goal ring, one obvious Continue button.
export default function Dashboard() {
  const { progress } = useContango();

  if (!progress.onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  // find next lesson to continue
  const nextLesson = findNextLesson(progress);
  const dailyPct = Math.min(100, Math.round(((progress.dailyXp || 0) / Math.max(1, progress.dailyGoal)) * 100));

  return (
    <ScreenShell showStats tab="learn">
      {/* Daily goal ring + continue */}
      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-5">
          <GoalRing pct={dailyPct} />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-slate-500">Daily goal</p>
            <p className="font-mono text-2xl font-bold text-slate-100">{progress.dailyXp || 0}<span className="text-sm text-slate-500"> / {progress.dailyGoal} XP</span></p>
            <p className="mt-1 text-xs text-slate-400">{dailyPct >= 100 ? "Goal complete — nice work!" : `${progress.dailyGoal - (progress.dailyXp || 0)} XP to go`}</p>
          </div>
        </div>
        {nextLesson && (
          <Link
            to={nextLesson.path}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-4 font-display font-bold text-slate-950 transition hover:bg-amber-300"
          >
            <Play className="h-5 w-5 fill-slate-950" />
            Continue: {nextLesson.title}
          </Link>
        )}
      </section>

      {!progress.firstLessonDone && (
        <Link to="/guide" className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 transition hover:bg-amber-500/10">
          <Compass className="h-6 w-6 shrink-0 text-amber-400" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-100">New here? Chat with a guide</div>
            <div className="text-xs text-slate-400">Get oriented and find your best starting point.</div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </Link>
      )}

      {/* Quick actions */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <QuickLink to="/leaderboard" icon={<Trophy className="h-5 w-5" />} label="Leagues" color="text-amber-400" />
        <QuickLink to="/coach" icon={<Flame className="h-5 w-5" />} label="AI Coach" color="text-sky-400" />
        <QuickLink to="/profile" icon={<User className="h-5 w-5" />} label="Profile" color="text-slate-300" />
      </div>

      {/* Skill tree */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Your learning path</h2>
          <Target className="h-4 w-4 text-slate-600" />
        </div>
        <SkillTree />
      </section>

      {/* Footer disclaimer */}
      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-600">
        Simulated educational content only. No real money, no live trading, no trade signals.<br />
        Contango is not affiliated with TradingView.
      </p>
    </ScreenShell>
  );
}

function GoalRing({ pct }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 70 70" className="h-full w-full -rotate-90">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="35" cy="35" r={r} fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-amber-400">{pct}%</div>
    </div>
  );
}

function QuickLink({ to, icon, label, color }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 py-3 transition hover:border-slate-700">
      <span className={color}>{icon}</span>
      <span className="text-xs text-slate-400">{label}</span>
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
  // then any incomplete branch intro
  for (const b of BRANCHES) {
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