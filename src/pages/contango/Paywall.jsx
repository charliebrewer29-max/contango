import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Crown, X, Sparkles, BookOpen, LineChart, Waves, CalendarClock, BarChart3, Repeat, Check, Loader2 } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { COACH_NAME } from "@/lib/contangoTheme";
import { TRIAL_DAYS, isPremium, trialDaysLeft, restorePurchases } from "@/lib/subscription";

// Paywall: the full premium split (spec Section 9). Hearts stay on the graded
// path for everyone - Premium buys the unlimited Practice sandbox, not a
// discipline-removal. Long 21-day trial, trial-first default. The trial starts
// server-side (startTrial backend function); subscriptions are billed by Apple
// in the iOS app (App Store IAP) — this screen never grants Premium itself.
export default function Paywall() {
  const navigate = useNavigate();
  const { entitlement, startTrial } = useContango();
  const [plan, setPlan] = useState(null); // "monthly" | "yearly" — selection only
  const [starting, setStarting] = useState(false);

  // The trial is created on the server (once per account); only after it
  // resolves do we navigate away, so a failed/already-used trial stays here.
  async function beginTrial() {
    setStarting(true);
    try {
      await startTrial();
      navigate("/");
    } catch (_e) {
      // trial failed (e.g. already used) - stay on the paywall
    } finally {
      setStarting(false);
    }
  }

  const perks = [
    { icon: <Repeat className="h-4 w-4" />, text: "Unlimited Practice mode - drill any setup as many times as you want" },
    { icon: <BookOpen className="h-4 w-4" />, text: "Every strategy branch, not just the first two" },
    { icon: <BarChart3 className="h-4 w-4" />, text: "Crude & Gold instruments - CL, GC, their Micros, and YM/RTY" },
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

          {isPremium(entitlement) ? (
            <div className="mt-8 w-full rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <p className="font-display text-lg font-semibold text-amber-400">
                {entitlement?.tier === "trial" ? `${trialDaysLeft(entitlement)} days left in your trial` : "Premium is active"}
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

              {/* Plan selection only — no purchase happens here. Purchases are
                  billed by Apple in the iOS app (App Store IAP). */}
              <div className="mt-8 grid w-full grid-cols-2 gap-3">
                <button
                  onClick={() => setPlan("monthly")}
                  aria-pressed={plan === "monthly"}
                  className={`relative rounded-xl border p-4 text-center transition ${
                    plan === "monthly" ? "border-amber-400 bg-amber-500/10" : "border-slate-700 bg-slate-900 hover:border-slate-500"
                  }`}
                >
                  {plan === "monthly" && <Check className="absolute right-2 top-2 h-4 w-4 text-amber-400" />}
                  <div className="font-display text-lg font-bold text-slate-100">$14.99</div>
                  <div className="text-xs text-slate-500">per month</div>
                </button>
                <button
                  onClick={() => setPlan("yearly")}
                  aria-pressed={plan === "yearly"}
                  className={`relative rounded-xl border-2 p-4 text-center transition ${
                    plan === "yearly" ? "border-amber-400 bg-amber-500/10" : "border-slate-700 bg-slate-900 hover:border-slate-500"
                  }`}
                >
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">SAVE 56%</span>
                  {plan === "yearly" && <Check className="absolute right-2 top-2 h-4 w-4 text-amber-400" />}
                  <div className="font-display text-lg font-bold text-amber-400">$79.99</div>
                  <div className="text-xs text-slate-500">per year</div>
                </button>
              </div>

              <button onClick={beginTrial} disabled={starting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-4 font-display font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60">
                {starting ? <><Loader2 className="h-5 w-5 animate-spin" /> Starting…</> : `Start ${TRIAL_DAYS}-day free trial`}
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">Subscriptions are billed by Apple — complete your purchase in the iOS app.</p>
              <div className="mt-3 flex items-center justify-center gap-4 text-[12px] text-slate-600">
                <button onClick={restorePurchases} className="hover:text-slate-300">Restore Purchases</button>
                <Link to="/legal#terms" className="hover:text-slate-300">Terms of Use</Link>
                <Link to="/legal#privacy" className="hover:text-slate-300">Privacy Policy</Link>
              </div>
              <p className="mx-auto mt-3 max-w-[340px] text-center text-[11px] leading-[1.5] text-slate-600">Contango Premium is an auto-renewing subscription. $14.99 per month or $79.99 per year after a 21-day free trial. Payment is charged to your Apple ID at confirmation of purchase. Your subscription renews automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel anytime in your Apple ID settings. Simulated education only, not financial advice.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}