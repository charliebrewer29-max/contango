import React from "react";
import { Brain } from "lucide-react";

// MindsetMeter — the "mental state" indicator. Fluctuates with disciplined
// vs impulsive choices in psychology lessons. Visualizes burnout / tilt risk.
// value: 0-100. 75+ Calm/Green, 50-74 Focused/Amber, 25-49 Tilting/Orange,
// <25 Panic/Rose.

function labelFor(v) {
  if (v >= 75) return { label: "Calm", color: "text-emerald-400", bar: "bg-emerald-400", ring: "border-emerald-500/30" };
  if (v >= 50) return { label: "Focused", color: "text-amber-400", bar: "bg-amber-400", ring: "border-amber-500/30" };
  if (v >= 25) return { label: "Tilting", color: "text-orange-400", bar: "bg-orange-400", ring: "border-orange-500/30" };
  return { label: "Panic", color: "text-rose-400", bar: "bg-rose-400", ring: "border-rose-500/40" };
}

export default function MindsetMeter({ value = 75, compact = false }) {
  const v = Math.max(0, Math.min(100, value));
  const meta = labelFor(v);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Brain className={`h-4 w-4 ${meta.color}`} />
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
          <div className={`h-full rounded-full ${meta.bar} transition-all duration-500`} style={{ width: `${v}%` }} />
        </div>
        <span className={`text-[11px] font-medium ${meta.color}`}>{meta.label}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${meta.ring} bg-slate-950/60 p-3`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Brain className={`h-4 w-4 ${meta.color}`} /> Mindset
        </span>
        <span className={`font-mono text-sm font-bold ${meta.color}`}>{v} · {meta.label}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${meta.bar} ${meta.color} transition-all duration-700`}
          style={{ width: `${v}%`, boxShadow: "0 0 12px currentColor" }}
        />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        Disciplined choices keep you calm. Impulsive ones tilt you toward panic.
      </p>
    </div>
  );
}