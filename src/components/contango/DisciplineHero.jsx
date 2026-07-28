import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { disciplineProfile } from "@/lib/discipline";

// Dismissible intro banner for new users. Shows the discipline framing once,
// with an X to dismiss permanently. The same explanation lives permanently on
// the Discipline screen, so dismissing loses nothing. It only appears before
// the first drill; once the user has a discipline profile it steps aside. The
// banner is deliberately subdued so the goal card's primary CTA stays the
// dominant element on the screen.
export default function DisciplineHero() {
  const { progress, update } = useContango();
  const profile = React.useMemo(() => disciplineProfile(progress), [progress.drillHistory]);

  if (progress.disciplineBannerDismissed || !profile.empty) return null;

  return (
    <section className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <button
        onClick={() => update({ disciplineBannerDismissed: true })}
        aria-label="Dismiss"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 pr-8">
        <ShieldCheck className="h-5 w-5 shrink-0 text-amber-400" />
        <h2 className="font-display text-[17px] font-semibold leading-tight tracking-tight text-slate-200">
          Discipline, not strategy, is the edge
        </h2>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
        Most day traders lose money, and the research is clear that the reason is behavior, not knowledge. Your discipline profile appears after your first drill.
      </p>
      <Link to="/discipline" className="mt-2 inline-flex text-[15px] font-semibold text-amber-400">
        Why discipline?
      </Link>
    </section>
  );
}