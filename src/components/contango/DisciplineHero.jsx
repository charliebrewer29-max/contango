import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { disciplineProfile } from "@/lib/discipline";

// Dashboard hero: discipline is front-and-center. Strategy branches are the
// vehicle; the thing that actually separates traders is execution behavior.
// Empty state leads with the honest failure statistic, no earnings claims.
export default function DisciplineHero() {
  const { progress } = useContango();
  const profile = React.useMemo(() => disciplineProfile(progress), [progress.drillHistory]);

  return (
    <section className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-amber-400" />
        <h2 className="font-display text-base font-semibold text-slate-100">Discipline, not strategy, is the edge</h2>
      </div>

      {profile.empty ? (
        <>
          <p className="text-sm leading-relaxed text-slate-400">
            Most day traders lose money, and the research is clear that the reason is behavior, not knowledge.
            Your discipline profile appears after your first drill.
          </p>
          <Link to="/discipline" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-400">
            Why discipline? <ChevronRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Overall discipline</div>
              <div className="cg-num font-mono text-3xl font-bold text-amber-400">{profile.overall}</div>
              <div className="text-[11px] text-slate-500">across {profile.drillCount} drills</div>
            </div>
            {profile.weakest && (
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-slate-500">Focus area</div>
                <div className="text-sm font-medium text-slate-200">{profile.weakest.label}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{profile.weakest.blurb}</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/practice" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">
              Train your weak spot
            </Link>
            <Link to="/discipline" className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600">
              Full profile
            </Link>
          </div>
        </>
      )}
    </section>
  );
}