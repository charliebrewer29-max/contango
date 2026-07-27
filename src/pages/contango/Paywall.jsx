import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, X, Sparkles, BookOpen, LineChart, Waves, CalendarClock, BarChart3, Repeat } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { COACH_NAME } from "@/lib/contangoTheme";
import { TRIAL_DAYS, isPremium, trialDaysLeft } from "@/lib/subscription";

// Paywall: the full premium split (spec Section 9). Hearts stay on the graded
// path for everyone - Premium buys the unlimited Practice sandbox, not a
// discipline-removal. Long 21-day trial, trial-first default.
export default function Paywall() {
  const navigate = useNavigate();
  const { progress, startTrial, goPremium } = useContango();

  function beginTrial() { startTrial(); navigate("/"); }
  function subscribe() { goPremium(); navigate("/"); }

  const perks = [
    { icon: <Repeat className="h-4 w-4" />, text: "Unlimited Practice mode - your sim sandbox, no hearts" },
    { icon: <BookOpen className="h-4 w-4" />, text: "Every strategy branch, not just the first two" },
    { icon: <BarChart3 className="h-4 w-4" />, text: "All instruments - NQ, CL, GC (and ES)" },
    { icon: <Sparkles className="h-4 w-4" />, text: `${COACH_NAME} that remembers your history across sessions` },
    { icon: <LineChart className="h-4 w-4" />, text: "Full trade journal with win-rate analytics" },
    { icon: <Waves className="h-4 w-4" />, text: "Messy market mode - false breakouts & news spikes" },
    { icon: <CalendarClock className="h-4 w-4" />, text: "Monthly streak repair" },
    { icon: <Crown className="h-4 w-4" />, text: "No ads, ever" },
  ];

  return (
    <div className="cg-app-bg min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <button onClick={() => navigate(-1)} className="mb-4 self-start text-slate-500 hover:text-slate-300">
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/30">
            <Crown className="h-10 w-10 text-amber-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-amber-400">Contango Premium</h1>
          <p className="mt-2 text-sm text-slate-400">The full sandbox, the coach that remembers, and the journal that compounds.</p>

          {isPremium(progress) ? (
            <div className="mt-8 w-full rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <p className="font-display text-lg font-semibold text-amber-400">
                {progress.subscription === "trial" ? `${trialDaysLeft(progress)} days left in your trial` : "Premium is active"}
              </p>
              <p className="mt-1 text-xs text-slate-400">Everything below is unlocked.</p>
              <button onClick={() => navigate("/")} className="mt-4 w-full rounded-xl bg-amber-400 py-3.5 font-display font-bold text-slate-950">Back to learning</button>
            </div>
          ) : (
            <>
              <div className="mt-8 w-full space-y-3 text-left">
                {perks.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                    <span className="text-amber-400">{p.icon}</span>
                    <span className="text-sm text-slate-200">{p.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid w-full grid-cols-2 gap-3">
                <button onClick={subscribe} className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-center hover:border-slate-500">
                  <div className="font-display text-lg font-bold text-slate-100">$14.99</div>
                  <div className="text-xs text-slate-500">per month</div>
                </button>
                <button onClick={subscribe} className="relative rounded-xl border-2 border-amber-400 bg-amber-500/10 p-4 text-center">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">SAVE 56%</span>
                  <div className="font-display text-lg font-bold text-amber-400">$79.99</div>
                  <div className="text-xs text-slate-500">per year</div>
                </button>
              </div>

              <button onClick={beginTrial} className="mt-6 w-full rounded-xl bg-amber-400 py-4 font-display font-bold text-slate-950 transition hover:bg-amber-300">
                Start {TRIAL_DAYS}-day free trial
              </button>
              <button onClick={subscribe} className="mt-2 text-xs text-slate-500 underline-offset-2 hover:text-slate-300">or subscribe now</button>
              <p className="mt-3 text-[11px] text-slate-600">{TRIAL_DAYS}-day free trial · cancel anytime · simulated education only</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}