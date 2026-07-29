import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Crown } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { isPremium } from "@/lib/subscription";

// Trade Journal: aggregates every drill decision the learner has logged.
// Free sees the last session; Premium sees the full history + win-rate
// analytics by strategy, instrument, and decision type. The history is the
// product - it compounds in value the longer someone subscribes.

function decisionType(prompt = "") {
  const p = prompt.toLowerCase();
  if (/(stop|exit|trailing|take profit|take profits)/.test(p)) return "Exit / stop";
  if (/(enter|right move|buy|sell|wait|short|what's the move|disciplined|size)/.test(p)) return "Entry";
  return "Management";
}

function tally(history, keyFn) {
  const m = {};
  for (const d of history) {
    for (const dec of d.decisions || []) {
      const k = keyFn(d, dec);
      if (!k) continue;
      if (!m[k]) m[k] = { correct: 0, total: 0 };
      m[k].total++;
      if (dec.isCorrect) m[k].correct++;
    }
  }
  return m;
}

export default function Journal() {
  const { progress, entitlement } = useContango();
  const history = progress.drillHistory || [];
  const premium = isPremium(entitlement);
  const visible = premium ? history : history.slice(-1);

  const totalDecisions = visible.reduce((n, d) => n + (d.total || 0), 0);
  const correctDecisions = visible.reduce((n, d) => n + (d.correctCount || 0), 0);
  const winRate = totalDecisions ? Math.round((correctDecisions / totalDecisions) * 100) : 0;

  const byStrategy = premium ? tally(history, (d) => d.branchTitle) : {};
  const byInstrument = premium ? tally(history, (d) => d.instrument) : {};
  const byType = premium ? tally(history, (d, dec) => decisionType(dec.prompt)) : {};

  return (
    <ScreenShell backTo="/" title="Trade Journal" showStats>
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <BookOpen className="h-7 w-7 text-emerald-400" />
        <div>
          <div className="font-display font-semibold text-slate-100">Trade Journal</div>
          <div className="text-xs text-slate-500">Every drill decision, aggregated. The longer you keep at it, the more this is worth.</div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-300">Complete a drill and your decisions will show up here.</p>
          <Link to="/" className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950">Find a drill</Link>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-3 gap-3">
            <Tile value={visible.length} label="Drills" accent="text-amber-400" />
            <Tile value={`${winRate}%`} label="Win rate" accent="text-emerald-400" />
            <Tile value={`${correctDecisions}/${totalDecisions}`} label="Decisions" accent="text-sky-400" />
          </div>

          {premium ? (
            <>
              <Breakdown title="By strategy" data={byStrategy} />
              <Breakdown title="By instrument" data={byInstrument} />
              <Breakdown title="By decision type" data={byType} />

              <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">History</h3>
              <div className="space-y-3">
                {[...history].reverse().map((d, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-100">{d.branchTitle}</div>
                      <div className="font-mono text-xs text-slate-400">{d.instrument} · {d.correctCount}/{d.total}</div>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">{new Date(d.date).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-center">
              <Crown className="mx-auto mb-2 h-8 w-8 text-amber-400" />
              <p className="text-sm text-slate-300">
                You're seeing your last session. Premium unlocks the full history plus win-rate analytics by strategy, instrument, and decision type - and it gets more valuable the longer you subscribe.
              </p>
              <Link to="/paywall" className="mt-4 inline-flex rounded-xl bg-amber-400 px-6 py-3 font-display font-bold text-slate-950">Start free trial</Link>
            </div>
          )}
        </>
      )}
    </ScreenShell>
  );
}

function Tile({ value, label, accent }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
      <div className={`font-mono text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Breakdown({ title, data }) {
  const entries = Object.entries(data);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1].total - a[1].total);
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="space-y-2">
        {entries.map(([k, v]) => {
          const rate = v.total ? Math.round((v.correct / v.total) * 100) : 0;
          return (
            <div key={k} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200">{k}</span>
                <span className="font-mono text-slate-400">{v.correct}/{v.total} · {rate}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full ${rate >= 66 ? "bg-emerald-500" : rate >= 40 ? "bg-amber-400" : "bg-rose-500"}`} style={{ width: `${rate}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}