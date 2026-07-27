import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, ShieldCheck, Layers, MonitorPlay, TrendingUp, Activity,
  Circle, Lock, Check, Zap, Target, DollarSign, BookOpen, Crown,
} from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { BRANCHES } from "@/lib/content";
import { canAccessBranch } from "@/lib/subscription";

const ICONS = { GraduationCap, ShieldCheck, Layers, MonitorPlay, TrendingUp, Activity, Circle, Zap, Target, DollarSign, BookOpen };

// Skill tree: branching path of branches/units, Duolingo-style.
// The "next available" node pulses to draw the eye.
const COLOR_MAP = {
  amber: { ring: "border-amber-500/40", glow: "shadow-amber-500/20", text: "text-amber-400", bg: "bg-amber-500/10" },
  rose: { ring: "border-rose-500/40", glow: "shadow-rose-500/20", text: "text-rose-400", bg: "bg-rose-500/10" },
  sky: { ring: "border-sky-500/40", glow: "shadow-sky-500/20", text: "text-sky-400", bg: "bg-sky-500/10" },
  emerald: { ring: "border-emerald-500/40", glow: "shadow-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  violet: { ring: "border-violet-500/40", glow: "shadow-violet-500/20", text: "text-violet-400", bg: "bg-violet-500/10" },
};

export default function SkillTree() {
  const { progress } = useContango();
  const foundationDone = progress.completedLessons.length > 0;

  return (
    <div className="flex flex-col items-center gap-2.5 py-5">
      {BRANCHES.map((branch, idx) => {
        const foundationUnlocked = branch.unlockRequires.length === 0 ||
          (branch.unlockRequires.includes("foundation-complete") && foundationDone);
        const premiumLocked = branch.type === "strategy" && !canAccessBranch(branch, progress);
        const unlocked = foundationUnlocked && !premiumLocked;
        const Icon = ICONS[branch.icon] || Circle;
        const c = COLOR_MAP[branch.color] || COLOR_MAP.amber;
        const isNext = unlocked && !isBranchDone(branch, progress);

        const offset = [0, 24, -24, 16, -16, 0][idx % 6];

        return (
          <div key={branch.id} className="w-full" style={{ transform: `translateX(${offset}px)` }}>
            <Link
              to={unlocked ? `/branch/${branch.id}` : premiumLocked ? "/paywall" : "#"}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${
                unlocked ? `${c.bg} ${c.ring} hover:scale-[1.01]` : "border-slate-800 bg-slate-900/40 opacity-60"
              } ${isNext ? "animate-pulse shadow-lg " + c.glow : ""}`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${unlocked ? c.bg + " " + c.ring : "bg-slate-800"} ${c.text}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display text-[15px] font-semibold tracking-tight text-slate-100">{branch.branchTitle}</span>
                  {premiumLocked && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                  {!foundationUnlocked && <Lock className="h-3 w-3 text-slate-600" />}
                </div>
                <p className="truncate text-[13px] leading-snug text-slate-500">
                  {premiumLocked ? "Premium branch — unlock with Premium" : branch.blurb}
                </p>
              </div>
              {isBranchDone(branch, progress) && <Check className="h-4 w-4 text-emerald-400" />}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

function isBranchDone(branch, progress) {
  const units = branch.units || (branch.introLesson ? [branch.introLesson] : []);
  if (units.length === 0) return false;
  return units.every(u => progress.completedLessons.includes(u.id));
}