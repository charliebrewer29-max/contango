import React, { useEffect } from "react";
import { useContango } from "@/contexts/ContangoContext";
import BranchBadge, { badgeForBranch } from "./BranchBadge";

// Substantial celebration shown when a whole curriculum branch is finished
// and its badge unlocks. Multi-burst confetti, a glowing pulse ring behind an
// overshoot-in badge reveal, the branch name, and a Collect button.
// Respects reduced-motion (skips confetti).
export default function BranchBadgeCelebration({ branchId, branchTitle, xpGained, onClose }) {
  const { progress } = useContango();
  const badge = badgeForBranch(branchId);

  useEffect(() => {
    if (!badge || progress.reducedMotion) return;
    import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      const colors = [badge.ink, "#fbbf24", "#34d399", "#38bdf8", "#fb7185"];
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors });
      setTimeout(() => confetti({ particleCount: 70, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors }), 220);
      setTimeout(() => confetti({ particleCount: 70, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors }), 420);
      setTimeout(() => confetti({ particleCount: 60, spread: 110, startVelocity: 42, origin: { y: 0.35 }, colors, scalar: 1.15 }), 680);
    }).catch(() => {});
  }, [branchId]);

  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex flex-col items-center text-center" style={{ animation: "badgeCardIn 0.45s cubic-bezier(.2,.9,.3,1.2)" }}>
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 rounded-full"
          style={{ background: `radial-gradient(circle, ${badge.ink}45 0%, transparent 65%)`, transform: "translate(-50%, -24px)", animation: "badgeGlow 1.8s ease-in-out infinite" }}
        />
        <div className="relative" style={{ animation: "badgePop 0.7s cubic-bezier(.2,.9,.3,1.4) both" }}>
          <BranchBadge badge={badge} size={132} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Branch complete</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-100">{branchTitle}</h1>
        <p className="mt-1 text-sm text-slate-300">
          <span className="font-semibold" style={{ color: badge.ink }}>{badge.title}</span> badge unlocked
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{badge.subtitle}</p>
        {xpGained > 0 && (
          <div className="mt-4 font-mono text-2xl font-bold text-sky-400" style={{ animation: "countUp 0.6s ease-out" }}>+{xpGained} XP</div>
        )}
        <button
          onClick={onClose}
          className="mt-6 rounded-xl bg-amber-400 px-8 py-3 font-display font-semibold text-slate-950 transition hover:bg-amber-300"
        >
          Collect
        </button>
      </div>
      <style>{`
        @keyframes badgeCardIn { from{opacity:0;transform:translateY(12px) scale(.96)} to{opacity:1;transform:none} }
        @keyframes badgePop { 0%{transform:scale(.2) rotate(-12deg);opacity:0} 55%{transform:scale(1.18) rotate(3deg);opacity:1} 75%{transform:scale(.94)} 100%{transform:scale(1) rotate(0)} }
        @keyframes badgeGlow { 0%,100%{opacity:.5;transform:translate(-50%,-24px) scale(.9)} 50%{opacity:1;transform:translate(-50%,-24px) scale(1.12)} }
        @keyframes countUp { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}