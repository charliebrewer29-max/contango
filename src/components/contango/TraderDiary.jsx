import React from "react";
import { BookText, Lock } from "lucide-react";
import { DIARY_ENTRIES } from "@/lib/psychCurriculum";

// Trader's Diary - narrative "entries" the user unlocks by completing
// psychology lessons. Only unlocked entries render as rows; locked entries
// collapse into a single summary line with a count, so an empty diary
// never looks like five duplicated "Locked" rows.
export default function TraderDiary({ unlocked = [] }) {
  const list = DIARY_ENTRIES || [];
  const opened = list.filter((e) => unlocked.includes(e.id));

  return (
    <div className="mb-6">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <BookText className="h-4 w-4" /> Trader's Diary
      </h3>
      <div className="space-y-2">
        {opened.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2">
              <BookText className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-100">{entry.title}</span>
            </div>
            <p className="mt-2 pl-6 text-[13px] italic leading-relaxed text-slate-300">
              “{entry.body}”
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-500">Complete lessons to unlock diary entries</span>
          </div>
          <div className="mt-1 pl-6 font-mono text-xs text-slate-600">{opened.length} of {list.length} unlocked</div>
        </div>
      </div>
    </div>
  );
}