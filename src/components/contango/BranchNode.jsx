import React from "react";
import { Link } from "react-router-dom";
import { Crown, Lock, Check } from "lucide-react";
import { branchMasteryStatus } from "@/lib/branchMastery";
import { canAccessBranch } from "@/lib/subscription";

// One Duolingo-style skill-tree node. Shows:
//  - a circular progress ring around the icon (how far through the branch)
//  - a gold mastery ring + crown badge once the branch has been finished
//    multiple times (reps -> level 1/2/3)
//  - a crack overlay + faded colors when a finished branch has gone untouched
//    too long, nudging the learner to review before it fades
//  - a thin progress bar with done/total under the title

const BRANCH_STYLE = {
  amber:   { bg: "bg-amber-500/10",   ring: "border-amber-500/40",   glow: "shadow-amber-500/20",   stroke: "#f59e0b" },
  rose:    { bg: "bg-rose-500/10",    ring: "border-rose-500/40",    glow: "shadow-rose-500/20",    stroke: "#fb7185" },
  sky:     { bg: "bg-sky-500/10",     ring: "border-sky-500/40",      glow: "shadow-sky-500/20",     stroke: "#38bdf8" },
  emerald: { bg: "bg-emerald-500/10", ring: "border-emerald-500/40",  glow: "shadow-emerald-500/20", stroke: "#34d399" },
  violet:  { bg: "bg-violet-500/10",  ring: "border-violet-500/40",  glow: "shadow-violet-500/20",  stroke: "#a78bfa" },
};

// Gold ring shades for mastered branches (level 2 silver, level 3 gold).
const MASTERY_STROKE = { 2: "#fcd34d", 3: "#fbbf24" };

function statusText(s, branch) {
  if (s.cracked) return "Cracking - review to restore";
  if (s.finished) return `Mastered - level ${s.level}`;
  if (s.done > 0) return `${s.done} of ${s.total} done`;
  return branch.blurb;
}

function CrackOverlay({ intensity }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ opacity: 0.35 + 0.45 * intensity }}
      aria-hidden="true"
    >
      <g stroke="#94a3b8" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 0 L26 18 L19 31 L27 49 L21 71 L29 100" />
        <path d="M26 18 L36 22 M19 31 L11 35 M27 49 L39 45 M21 71 L13 75" />
        <path d="M72 0 L68 23 L76 39 L70 61 L78 100" />
        <path d="M76 39 L86 43 M70 61 L61 65" />
      </g>
    </svg>
  );
}

export default function BranchNode({ branch, icon: Icon, progress, isNext = false, dimmed = false }) {
  const foundationDone = (progress.completedLessons || []).length > 0;
  const foundationUnlocked = branch.unlockRequires.length === 0 ||
    (branch.unlockRequires.includes("foundation-complete") && foundationDone);
  const premiumLocked = branch.type === "strategy" && !canAccessBranch(branch, progress);
  const unlocked = foundationUnlocked && !premiumLocked;
  const s = branchMasteryStatus(progress, branch);

  const style = BRANCH_STYLE[branch.color] || BRANCH_STYLE.amber;
  const ringStroke = s.level >= 2 ? MASTERY_STROKE[s.level] : style.stroke;
  const barColor = s.cracked ? "#64748b" : ringStroke;

  // ring geometry
  const r = 21;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (s.pct / 100) * circ;

  // card chrome classes (all literal so Tailwind keeps them).
  // One uniform neutral border for every unlocked card; a single accent
  // (brighter border + lighter bg) marks the one branch to do next.
  let cardBg, cardRing, cardGlow;
  if (!unlocked) {
    cardBg = "bg-slate-900/40";
    cardRing = "border-slate-800";
  } else if (isNext) {
    cardBg = "bg-amber-500/5";
    cardRing = "border-amber-400/70";
    cardGlow = "shadow-amber-500/20";
  } else {
    cardBg = "bg-slate-900/60";
    cardRing = "border-slate-800";
  }

  return (
    <div className="w-full">
      <Link
        to={dimmed ? "#" : (unlocked ? `/branch/${branch.id}` : premiumLocked ? "/paywall" : "#")}
        aria-disabled={dimmed}
        className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3.5 transition ${
          dimmed ? "opacity-50 pointer-events-none" : unlocked ? "hover:scale-[1.01]" : "opacity-60"
        } ${cardBg} ${cardRing} ${!dimmed && isNext ? `animate-pulse shadow-lg ${cardGlow || ""}` : ""}`}
      >
        {s.cracked && <CrackOverlay intensity={s.crackIntensity} />}

        {/* icon + progress ring */}
        <div className="relative h-12 w-12 shrink-0">
          <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
            <circle cx="24" cy="24" r={r} fill="none" stroke="#1e293b" strokeWidth="3.5" />
            <circle
              cx="24" cy="24" r={r} fill="none" stroke={barColor} strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.6s ease-out, stroke 0.4s ease-out" }}
            />
          </svg>
          <div
            className={`absolute inset-[5px] flex items-center justify-center rounded-full ${s.cracked ? "grayscale opacity-70" : ""} ${unlocked ? "bg-slate-900/70" : "bg-slate-800"}`}
          >
            <Icon className={`h-5 w-5 ${unlocked ? "text-slate-100" : "text-slate-500"}`} />
          </div>
          {s.level >= 1 && unlocked && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow ring-2 ring-slate-950">
              <Crown className="h-3 w-3 text-slate-950" />
            </span>
          )}
        </div>

        {/* text + progress bar */}
        <div className="relative z-10 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-[15px] font-semibold tracking-tight text-slate-100">{branch.branchTitle}</span>
            {premiumLocked && <Crown className="h-3.5 w-3.5 text-amber-400" />}
            {!foundationUnlocked && <Lock className="h-3 w-3 text-slate-600" />}
          </div>
          <p
            className={`text-[13px] leading-snug ${s.cracked ? "text-amber-400/90" : "text-slate-500"}`}
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {premiumLocked ? "Premium branch - unlock with Premium" : statusText(s, branch)}
          </p>
          {unlocked && s.total > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.pct}%`, backgroundColor: barColor, transition: "width 0.6s ease-out, background-color 0.4s ease-out" }}
                />
              </div>
              <span className="cg-num font-mono text-[11px] font-semibold text-slate-300">{s.pct}%</span>
              <span className="cg-num font-mono text-[11px] text-slate-600">{s.done}/{s.total}</span>
            </div>
          )}
        </div>

        {s.finished && !s.cracked && <Check className="relative z-10 h-4 w-4 shrink-0 text-emerald-400" />}
      </Link>
    </div>
  );
}