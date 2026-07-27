import React, { useEffect } from "react";
import { Check, X, Flame, PartyPopper } from "lucide-react";

// Instant, unambiguous feedback: green flash on correct, red shake on wrong.
export default function FeedbackFlash({ state }) {
  // state: 'correct' | 'wrong' | null
  useEffect(() => {
    if (!state) return;
  }, [state]);

  if (!state) return null;
  const correct = state === "correct" || state === "milestone";
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center ${
        correct ? "bg-emerald-500/10" : "bg-rose-500/10"
      }`}
      style={{ animation: correct ? "flashGreen 0.6s ease-out forwards" : "flashRed 0.6s ease-out forwards" }}
    >
      <div
        className="flex flex-col items-center"
        style={{ animation: correct ? "popIn 0.4s ease-out" : "shakeX 0.5s ease-out" }}
      >
        {correct ? <Check className="h-20 w-20 text-emerald-400 drop-shadow-lg" /> : <X className="h-20 w-20 text-rose-400 drop-shadow-lg" />}
      </div>
      <style>{`
        @keyframes flashGreen { 0%{opacity:0} 15%{opacity:1} 100%{opacity:0} }
        @keyframes flashRed { 0%{opacity:0} 15%{opacity:1} 100%{opacity:0} }
        @keyframes popIn { 0%{transform:scale(0.3);opacity:0} 50%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:0} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(4px)} }
      `}</style>
    </div>
  );
}

export function CelebrationOverlay({ show, xpGained, streak, onClose }) {
  useEffect(() => {
    if (!show) return;
    // fire confetti via canvas-confetti if available
    import("canvas-confetti").then((mod) => {
      const confetti = mod.default;
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#fbbf24", "#34d399", "#38bdf8", "#fb7185"] });
    }).catch(() => {});
  }, [show]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 flex flex-col items-center rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center" style={{ animation: "popIn 0.5s ease-out" }}>
        <PartyPopper className="mb-3 h-12 w-12 text-amber-400" />
        {xpGained > 0 && (
          <div className="mb-1 font-mono text-3xl font-bold text-sky-400" style={{ animation: "countUp 0.8s ease-out" }}>+{xpGained} XP</div>
        )}
        {streak && (
          <div className="mt-2 flex items-center gap-2 text-amber-400">
            <Flame className="h-6 w-6" />
            <span className="font-mono text-xl font-bold">{streak} day streak!</span>
          </div>
        )}
        <p className="mt-4 text-sm text-slate-400">Tap to continue</p>
      </div>
      <style>{`@keyframes countUp { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}