import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Lock, Check, Play, Crown } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { findBranch } from "@/lib/content";
import { canAccessBranch } from "@/lib/subscription";
import { isBranchComplete, branchDoneCount, branchUnitCount } from "@/lib/branchProgress";
import BranchBadge, { badgeForBranch } from "@/components/contango/BranchBadge";

// Branch detail: lists the intro lesson + concept units + drill.
export default function BranchDetail() {
  const { branchId } = useParams();
  const { progress } = useContango();
  const branch = findBranch(branchId);

  if (!branch) {
    return <ScreenShell><div className="text-slate-400">Branch not found.</div></ScreenShell>;
  }

  const foundationDone = progress.completedLessons.length > 0;
  const foundationUnlocked = branch.unlockRequires.length === 0 ||
    (branch.unlockRequires.includes("foundation-complete") && foundationDone);
  const premiumLocked = branch.type === "strategy" && !canAccessBranch(branch, progress);

  if (premiumLocked) {
    return (
      <ScreenShell showStats backTo="/" title={branch.branchTitle}>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
          <Crown className="mx-auto mb-3 h-10 w-10 text-amber-400" />
          <h2 className="font-display text-xl font-bold text-slate-100">A Premium branch</h2>
          <p className="mt-2 text-sm text-slate-400">{branch.blurb}</p>
          <p className="mt-1 text-xs text-slate-500">Free learners get the first two strategy branches. Unlock every branch — plus the journal, the coach's memory, and messy-market drills — with Premium.</p>
          <Link to="/paywall" className="mt-5 inline-flex rounded-xl bg-amber-400 px-6 py-3 font-display font-bold text-slate-950">Start free trial</Link>
        </div>
      </ScreenShell>
    );
  }

  const unlocked = foundationUnlocked;

  // Build ordered unit list: intro lesson, then concept units, then drill (for strategy branches)
  const items = [];
  if (branch.introLesson) items.push({ ...branch.introLesson, kind: "lesson" });
  if (branch.units) {
    for (const u of branch.units) items.push({ ...u, kind: "lesson" });
  }
  if (branch.buildDrill) {
    items.push({ id: `${branch.id}-drill`, title: `${branch.branchTitle} Drill`, kind: "drill" });
  }

  return (
    <ScreenShell showStats backTo="/" title={branch.branchTitle}>
      <div className="mb-6">
        <p className="text-sm text-slate-400">{branch.blurb}</p>
        {!unlocked && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-400">
            <Lock className="h-4 w-4" /> Complete Foundation first to unlock this branch.
          </p>
        )}
      </div>

      {(() => {
        const badge = badgeForBranch(branch.id);
        const complete = isBranchComplete(branch, progress);
        const doneCount = branchDoneCount(branch, progress);
        const totalCount = branchUnitCount(branch);
        if (!badge) return null;
        return (
          <div className={`mb-6 flex items-center gap-4 rounded-2xl border p-4 ${complete ? "border-amber-500/30 bg-amber-500/5" : "border-slate-800 bg-slate-900"}`}>
            <BranchBadge badge={badge} size={56} locked={!complete} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-100">{complete ? `${badge.title} badge earned` : badge.title}</div>
              <div className="text-xs text-slate-500">
                {complete ? badge.subtitle : `${doneCount}/${totalCount} complete · finish all to earn this badge`}
              </div>
              {!complete && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${(doneCount / Math.max(1, totalCount)) * 100}%` }} />
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <div className="relative space-y-3">
        {items.map((item, i) => {
          const done = item.kind === "drill"
            ? progress.completedDrills.includes(item.id)
            : progress.completedLessons.includes(item.id);
          return (
            <Link
              key={item.id}
              to={unlocked ? (item.kind === "drill" ? `/drill/${branch.id}` : `/lesson/${item.id}`) : "#"}
              className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                unlocked ? "border-slate-800 bg-slate-900 hover:border-slate-600" : "border-slate-800 bg-slate-900/40 opacity-50"
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-mono font-bold ${
                done ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
              }`}>
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {item.kind === "drill" && <Play className="h-3 w-3 text-sky-400" />}
                  <span className="font-medium text-slate-100">{item.title}</span>
                </div>
                <span className="text-xs text-slate-500">{item.kind === "drill" ? "Chart replay drill" : "Concept lesson"}</span>
              </div>
              {unlocked && <ChevronRight className="h-5 w-5 text-slate-600" />}
            </Link>
          );
        })}
      </div>
    </ScreenShell>
  );
}