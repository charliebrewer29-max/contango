import React from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

// The AI data-sharing consent gate (spec 13.1). Shown the first time a user
// taps into the AI coach - not at signup, not buried in ToS. Declining does
// not break the app; it just disables the AI coach.
export default function AiConsentGate({ flow, onAllow, onDecline, busy }) {
  const scope = flow === "history"
    ? "your drill answers, your score, your reflection text, your recent drill history, and your past coach notes"
    : "your drill answers, your score, and anything you typed in the reflection box";
  return (
    <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6" style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div className="mb-3 flex items-center gap-2 text-sky-400">
        <ShieldCheck className="h-5 w-5" />
        <span className="font-display text-sm font-semibold uppercase tracking-wider">Send this to the AI coach?</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-200">
        To generate feedback, Contango sends {scope} to Anthropic, the company that makes the Claude AI model.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        We don't send your name, email, or account details. You can turn this off anytime in Settings.
      </p>
      <div className="mt-5 flex gap-3">
        <button onClick={onAllow} disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-display font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Allow AI feedback"}
        </button>
        <button onClick={onDecline} disabled={busy}
          className="rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-300 transition hover:border-slate-500 disabled:opacity-50">
          Not now
        </button>
      </div>
    </div>
  );
}