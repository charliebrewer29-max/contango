import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { disciplineProfile } from "@/lib/discipline";

// Dashboard hero: discipline is front-and-center. Strategy branches are the
// vehicle; the thing that actually separates traders is execution behavior.
// This is the screen title block - it sets the hierarchy. Its own CTAs recede
// (outline, not filled) so the single primary "continue" action on the dashboard
// is the only thing that shouts. Empty state leads with the honest failure stat.
export default function DisciplineHero() {
  const { progress } = useContango();
  const profile = React.useMemo(() => disciplineProfile(progress), [progress.drillHistory]);

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 shrink-0 text-amber-400" />
        <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight text-slate-100">
          Discipline, not strategy, is the edge
        </h1>
      </div>

      {profile.empty ? (
        <>
          <p className="text-[15px] leading-relaxed text-slate-400">
            Most day traders lose money, and the research is clear that the reason is behavior, not knowledge.
            Your discipline profile appears after your first drill.
          </p>
          <Link to="/discipline" className="mt-2 inline-flex text-[15px] font-semibold text-amber-400">
            Why discipline?
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-end gap-4">
            <div>
              <div className="t-eyebrow text-[11px] text-slate-500">Overall discipline</div>
              <div className="cg-num font-mono text-2xl font-bold text-amber-400">{profile.overall}</div>
              <div className="text-[11px] text-slate-500">across {profile.drillCount} drills</div>
            </div>
            {profile.weakest && (
              <div className="flex-1">
                <div className="t-eyebrow text-[11px] text-slate-500">Focus area</div>
                <div className="text-[15px] font-medium text-slate-200">{profile.weakest.label}</div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-slate-400">{profile.weakest.blurb}</p>
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              to="/practice"
              className="flex flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-[15px] font-semibold text-slate-200 transition hover:border-slate-600"
            >
              Train your weak spot
            </Link>
            <Link
              to="/discipline"
              className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-[15px] font-medium text-slate-400 transition hover:border-slate-700"
            >
              Full profile
            </Link>
          </div>
        </>
      )}
    </section>
  );
}