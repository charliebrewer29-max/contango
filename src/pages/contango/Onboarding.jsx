import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Zap, ShieldCheck, Check } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { GOAL_OPTIONS, COACH_NAME } from "@/lib/contangoTheme";
import ContangoLogo from "@/components/contango/ContangoLogo";

// Onboarding: welcome → disclaimer → goal selection ("why") → daily goal → first lesson prompt.
// Disclaimers are visible and required (spec Section 2 & 13).
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [why, setWhy] = useState("curiosity");
  const [goal, setGoal] = useState("regular");
  const [acknowledged, setAcknowledged] = useState(false);
  const [ageOk, setAgeOk] = useState(false);
  const { update } = useContango();
  const navigate = useNavigate();

  const WHY_OPTIONS = [
  { id: "curiosity", label: "Curiosity", desc: "Just learning how futures work", branch: "instruments" },
  { id: "considering", label: "Considering trading", desc: "Thinking about real capital someday", branch: "risk-psych" },
  { id: "already-trade", label: "Already trade", desc: "Filling gaps in my knowledge", branch: "trend" }];


  const WHY_NUDGE = {
    curiosity: "Got it - after the basics, we'll point you to the Instrument Tour, then start you on the discipline drills that separate the 3%.",
    considering: "Smart - after the basics, we'll prioritize Risk & Psychology and the discipline drills before you ever risk real capital.",
    "already-trade": "Nice - after the basics, we'll send you to the strategy branches, then drill the behavioral habits that keep the 3% ahead."
  };

  function finish() {
    const recommendedBranch = WHY_OPTIONS.find((o) => o.id === why)?.branch || null;
    update({ onboardingDone: true, why, dailyGoal: GOAL_OPTIONS.find((g) => g.id === goal).xp, goal, recommendedBranch, ageConfirmed: ageOk });
    navigate("/lesson/contracts");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" style={{ animation: "drift1 18s ease-in-out infinite" }} />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" style={{ animation: "drift2 22s ease-in-out infinite" }} />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-rose-500/15 blur-3xl" style={{ animation: "drift3 26s ease-in-out infinite" }} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        {step === 0 &&
        <div className="flex flex-1 flex-col items-center justify-center text-center" style={{ animation: "fadeIn 0.5s ease-out" }}>
            <ContangoLogo size="xl" showWord animated className="mb-2" />
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.18em] text-amber-400">Futures, learned.</h1>
            <p className="mt-3 text-xl font-semibold leading-snug text-slate-100">Most day traders lose money. The research says it's behavior, not strategy.</p>
            <p className="mt-6 max-w-xs text-sm text-slate-500 [font-family:'Bricolage_Grotesque',_ui-sans-serif,_system-ui,_sans-serif]">Studies of retail traders keep finding the same thing: the failures come from execution, not from picking the wrong setup. Learn the patterns, then drill the discipline. All simulated, all educational, no real money.</p>
            <button onClick={() => setStep(1)} className="mt-10 w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300">
              Get Started
            </button>
          </div>
        }

        {step === 1 &&
        <div className="flex flex-1 flex-col justify-center">
            <div className="mb-6 flex items-center gap-2 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-display text-sm font-semibold uppercase tracking-wider">Before we start</span>
            </div>
            <h2 className="font-display text-2xl font-bold">This is education, not advice</h2>
            <p className="mt-3 text-sm text-slate-400">Most people who try day trading lose money. We're not here to sell you a shortcut - we're here to train the discipline most traders never build.</p>
            <ul className="mt-6 space-y-3 leading-snug text-sm text-slate-300">
              <li className="flex gap-3"><span className="text-amber-400">●</span><span>All market data here is <span className="font-semibold text-slate-100">simulated</span>. None of it reflects live prices.</span></li>
              <li className="flex gap-3"><span className="text-amber-400">●</span> Contango never touches real money. No broker, no orders, no balances.</li>
              <li className="flex gap-3"><span className="text-amber-400">●</span> Nothing here is a trade signal or "buy/sell this now" recommendation.</li>
              <li className="flex gap-3"><span className="text-amber-400">●</span> This is for learning how markets and strategies work, and drilling the discipline to trade them, before risking real capital.</li>
            </ul>
            <label className="mt-8 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 cursor-pointer">
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="peer absolute inset-0 m-0 cursor-pointer appearance-none" />
                <span className="pointer-events-none absolute inset-0 rounded-[5px] border border-slate-600 bg-slate-800 transition-colors peer-checked:border-amber-400 peer-checked:bg-amber-400" />
                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-slate-950 opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
              </span>
              <span className="text-sm text-slate-300">I understand this is a simulated educational tool and not financial advice.</span>
            </label>
            <label className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 cursor-pointer">
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <input type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} className="peer absolute inset-0 m-0 cursor-pointer appearance-none" />
                <span className="pointer-events-none absolute inset-0 rounded-[5px] border border-slate-600 bg-slate-800 transition-colors peer-checked:border-amber-400 peer-checked:bg-amber-400" />
                <Check className="pointer-events-none absolute h-3.5 w-3.5 text-slate-950 opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
              </span>
              <span className="text-sm text-slate-300">I am 17 or older.</span>
            </label>
            <button
            disabled={!(acknowledged && ageOk)}
            onClick={() => setStep(2)}
            className="mt-6 w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-amber-400">
            
              Continue
            </button>
          </div>
        }

        {step === 2 &&
        <div className="flex flex-1 flex-col justify-center">
            <h2 className="font-display text-2xl font-bold">Why are you learning?</h2>
            <p className="mt-2 text-sm text-slate-400">We'll tailor your path - and flag the discipline traps that tend to trip people like you.</p>
            <div className="mt-6 space-y-3">
              {WHY_OPTIONS.map((o) =>
            <button
              key={o.id}
              onClick={() => setWhy(o.id)}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
              why === o.id ? "border-amber-400 bg-amber-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`
              }>
              
                  <div>
                    <div className="font-medium text-slate-100">{o.label}</div>
                    <div className="text-xs text-slate-500">{o.desc}</div>
                  </div>
                  {why === o.id && <ChevronRight className="h-5 w-5 text-amber-400" />}
                </button>
            )}
            </div>
            {why &&
          <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
                {WHY_NUDGE[why]}
              </p>
          }
            <button onClick={() => setStep(3)} className="mt-6 w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300">
              Continue
            </button>
          </div>
        }

        {step === 3 &&
        <div className="flex flex-1 flex-col justify-center">
            <h2 className="font-display text-2xl font-bold">Set a daily goal</h2>
            <p className="mt-2 text-sm text-slate-400">Discipline is built in small, daily reps - not sporadic marathons. Pick something achievable; you can change it anytime in settings.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((g) =>
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`rounded-xl border p-4 text-center transition ${
              goal === g.id ? "border-amber-400 bg-amber-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`
              }>
              
                  <Zap className="mx-auto mb-1 h-5 w-5 text-sky-400" />
                  <div className="font-display font-semibold text-slate-100">{g.label}</div>
                  <div className="text-xs text-slate-500">{g.sub}</div>
                </button>
            )}
            </div>
            <button onClick={finish} className="mt-6 w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300">
              Start your first lesson
            </button>
          </div>
        }
      </div>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} } @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,40px) scale(1.15)} } @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(1.1)} } @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-50px) scale(1.2)} }`}</style>
    </div>);

}