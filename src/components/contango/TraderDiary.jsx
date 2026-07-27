import React from "react";
import { BookText, Lock } from "lucide-react";
import { DIARY_ENTRIES } from "@/lib/psychCurriculum";

// Trader's Diary - narrative "entries" the user unlocks by completing
// psychology lessons. Gives a tangible sense of growth beyond XP.
// Each entry is a one-line truth a real trader would write to themselves.

export default function TraderDiary({ unlocked = [] }) {
  const list = DIARY_ENTRIES || [];

  return (
    <div className="mb-6">
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <BookText className="h-4 w-4" /> Trader's Diary
      </h3>
      <div className="space-y-2">
        {list.map((entry) => {
          const isOpen = unlocked.includes(entry.id);
          return (
            <div
              key={entry.id}
              className={`rounded-xl border p-4 transition ${
                isOpen
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-slate-800 bg-slate-900/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <span className="text-amber-400">
                    <BookText className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="text-slate-600">
                    <Lock className="h-4 w-4" />
                  </span>
                )}
                <span className={`text-sm font-medium ${isOpen ? "text-slate-100" : "text-slate-500"}`}>
                  {isOpen ? entry.title : "Locked - complete the lesson to unlock"}
                </span>
              </div>
              {isOpen && (
                <p className="mt-2 pl-6 text-[13px] italic leading-relaxed text-slate-300">
                  “{entry.body}”
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}