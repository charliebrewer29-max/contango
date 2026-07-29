import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { disciplineProfile } from "@/lib/discipline";

// Discipline Profile - the flagship differentiator. Measures execution
// behavior from drill decisions, not strategy knowledge, because behavior
// is what the research says actually separates traders who last.
export default function Discipline() {
  const { progress } = useContango();
  const profile = React.useMemo(() => disciplineProfile(progress), [progress.drillHistory]);

  return (
    <ScreenShell showStats backTo="/" title="Discipline Profile">
      {/* honest framing - leads with the failure statistic, no earnings claims */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-base font-semibold text-slate-100">Execution discipline</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">
          Most day traders lose money, and the research is clear that the reason is behavior, not strategy.
          Discipline is the skill that separates the exceptions. This profile measures what your drills say about
          how you execute - not what you know.
        </p>
      </div>

      {profile.empty ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <Activity className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-400">Complete a drill to start measuring your discipline.</p>
          <Link to="/" className="mt-4 inline-flex rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950">Find a drill</Link>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center">
            <div className="text-xs uppercase tracking-wider text-slate-500">Overall discipline</div>
            <div className={`mt-1 font-mono text-4xl font-bold ${scoreColor(profile.overall)}`}>{profile.overall}</div>
            <div className="mt-1 text-xs text-slate-500">across {profile.drillCount} drills · {profile.decisionCount} decisions</div>
          </div>

          <div className="mb-6 space-y-4">
            {profile.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">{m.label}</span>
                  <span className={`font-mono text-sm font-bold ${scoreColor(m.score)}`}>{m.score}</span>
                </div>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: meterColor(m.score) }} />
                </div>
                <p className="text-xs leading-relaxed text-slate-400">{m.blurb}</p>
              </div>
            ))}
          </div>

          {profile.weakest && profile.weakest.score < 75 && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <div className="mb-1 flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Focus area</span>
              </div>
              <p className="text-sm text-slate-200">
                Your weakest dimension is <span className="font-semibold">{profile.weakest.label}</span>. {profile.weakest.blurb}
              </p>
              <Link to="/practice" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-semibold text-slate-950">
                Practice weak spots
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
            <p className="text-[11px] leading-relaxed text-slate-600">
              These scores come from your simulated drill decisions only. They are a training signal, not a prediction
              of real-money results. Simulated data, no trade signals, no income claims.
            </p>
          </div>
        </>
      )}
    </ScreenShell>
  );
}

function scoreColor(s) {
  if (s >= 80) return "text-emerald-400";
  if (s >= 60) return "text-amber-400";
  return "text-rose-400";
}
function meterColor(s) {
  if (s >= 80) return "#34d399";
  if (s >= 60) return "#fbbf24";
  return "#fb7185";
}