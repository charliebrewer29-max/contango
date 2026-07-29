import React, { useState } from "react";
import { X } from "lucide-react";

// Report sheet for a Tango response. Rendered in the app's existing card style.
const REASONS = [
  { id: "inaccurate", label: "Inaccurate or misleading" },
  { id: "trading-advice", label: "Gave specific trading advice" },
  { id: "offensive", label: "Offensive or inappropriate" },
  { id: "other", label: "Something else" },
];

export default function ReportSheet({ onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="cg-surface relative z-10 m-3 w-full max-w-md rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-[17px] font-semibold text-white">Report this response</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-400">Tell us what went wrong. We review reports to improve the coach.</p>

        <div className="mt-4 space-y-2">
          {REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setReason(r.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                reason === r.id
                  ? "border-amber-400 bg-amber-400/10 text-slate-100"
                  : "border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600"
              }`}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${reason === r.id ? "border-amber-400" : "border-slate-600"}`}>
                {reason === r.id && <span className="h-2 w-2 rounded-full bg-amber-400" />}
              </span>
              {r.label}
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add detail (optional)"
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
        />

        <div className="mt-4 flex items-center justify-end gap-4">
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-200">Cancel</button>
          <button
            onClick={() => reason && onSubmit({ reason, note })}
            disabled={!reason || submitting}
            className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-40"
          >
            Submit report
          </button>
        </div>
      </div>
    </div>
  );
}