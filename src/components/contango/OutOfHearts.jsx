import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { getServerOffset } from "@/lib/serverClock";

// OutOfHearts - the daily-loss-limit gate. Shown when hearts hit 0, either at
// the start of a graded path (variant "depleted") or mid-lesson when a wrong
// answer takes the last heart (variant "last"). The only recovery path shown
// is practice - never a paywall, never a buy-hearts option, never a Premium
// upsell. Hearts are never sold.
export default function OutOfHearts({ variant = "depleted" }) {
  const offset = getServerOffset();
  const now = new Date(Date.now() + (offset || 0));
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const ms = Math.max(0, nextMidnight - now);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const headline = variant === "last" ? "That's your last heart" : "You've hit your daily loss limit";

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-slate-900 p-8 text-center" style={{ animation: "fadeIn 0.4s ease-out" }}>
      <Heart className="mx-auto mb-4 h-10 w-10 text-rose-400" />
      <h1 className="font-display text-xl font-semibold text-slate-100">{headline}</h1>
      <p className="mx-auto mt-3 max-w-[340px] text-sm leading-relaxed text-slate-400">
        Five wrong calls. In a real account that's the day, and the disciplined move is to stop trading live and go back to sim. Hearts reset at midnight.
      </p>
      <div className="mt-4 font-mono text-xs text-slate-500">Resets in {h}h {m}m</div>
      <Link
        to="/practice"
        className="mt-6 flex w-full items-center justify-center rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300"
      >
        Practice in the sandbox
      </Link>
      <p className="mt-2 text-xs text-slate-500">Each practice drill earns a heart back.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-slate-400 transition hover:text-slate-200">
        Back to dashboard
      </Link>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}