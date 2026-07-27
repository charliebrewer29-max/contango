import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Heart, Sparkles, TrendingUp, X } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { COACH_NAME } from "@/lib/contangoTheme";

// Paywall: shown at friction points (hearts depleted, locked branch, day 3).
export default function Paywall() {
  const navigate = useNavigate();
  const { update } = useContango();

  function goPremium() {
    update({ subscription: "premium", hearts: 999 });
    navigate("/");
  }

  const perks = [
    { icon: <Heart className="h-4 w-4" />, text: "Unlimited hearts — never wait or watch ads" },
    { icon: <TrendingUp className="h-4 w-4" />, text: "All 12 strategy branches, not just the first" },
    { icon: <Sparkles className="h-4 w-4" />, text: `Unlimited ${COACH_NAME} AI coach calls` },
    { icon: <Crown className="h-4 w-4" />, text: "Monthly streak repair + extra streak freezes" },
    { icon: <Check className="h-4 w-4" />, text: "No ads, ever" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <button onClick={() => navigate(-1)} className="mb-4 self-start text-slate-500 hover:text-slate-300">
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/30">
            <Crown className="h-10 w-10 text-amber-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-amber-400">Contango Premium</h1>
          <p className="mt-2 text-sm text-slate-400">Go all-in on your trading education.</p>

          <div className="mt-8 w-full space-y-3 text-left">
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                <span className="text-amber-400">{p.icon}</span>
                <span className="text-sm text-slate-200">{p.text}</span>
              </div>
            ))}
          </div>

          {/* pricing */}
          <div className="mt-8 grid w-full grid-cols-2 gap-3">
            <button onClick={goPremium} className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-center hover:border-slate-500">
              <div className="font-display text-lg font-bold text-slate-100">$14.99</div>
              <div className="text-xs text-slate-500">per month</div>
            </button>
            <button onClick={goPremium} className="relative rounded-xl border-2 border-amber-400 bg-amber-500/10 p-4 text-center">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">SAVE 44%</span>
              <div className="font-display text-lg font-bold text-amber-400">$79.99</div>
              <div className="text-xs text-slate-500">per year</div>
            </button>
          </div>

          <button onClick={goPremium} className="mt-6 w-full rounded-xl bg-amber-400 py-4 font-display font-bold text-slate-950 transition hover:bg-amber-300">
            Start free trial
          </button>
          <p className="mt-3 text-[11px] text-slate-600">7-day free trial · cancel anytime · simulated education only</p>
        </div>
      </div>
    </div>
  );
}