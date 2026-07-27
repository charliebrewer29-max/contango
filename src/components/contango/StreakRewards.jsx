import React from "react";
import { Lock, Check } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { STREAK_REWARDS } from "@/lib/streakRewards";

// StreakRewards - grid of long-term streak milestones. Unlocked tiers can be
// equipped as cosmetic flair (ring + title) on the profile identity card.
export default function StreakRewards() {
  const { progress, update } = useContango();
  const unlocked = progress.rewards || [];
  const equipped = progress.equippedFlair;
  const streak = progress.streak || 0;

  function equip(id) {
    update({ equippedFlair: equipped === id ? null : id });
  }

  return (
    <div className="mb-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Streak Rewards</h3>
      <p className="mb-3 text-xs text-slate-600">Hit a long-term streak milestone to unlock cosmetic flair for your profile.</p>
      <div className="grid grid-cols-2 gap-3">
        {STREAK_REWARDS.map((r) => {
          const isUnlocked = unlocked.includes(r.id);
          const isEquipped = equipped === r.id;
          return (
            <button
              key={r.id}
              onClick={() => isUnlocked && equip(r.id)}
              disabled={!isUnlocked}
              className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                isEquipped
                  ? "border-amber-400 bg-amber-500/10"
                  : isUnlocked
                  ? "border-slate-700 bg-slate-900 hover:border-slate-500"
                  : "border-slate-800 bg-slate-900/50 opacity-60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 ${
                  isUnlocked ? r.ringClass : "ring-2 ring-slate-700"
                }`}
              >
                {isUnlocked ? (
                  <span className="text-lg leading-none">{r.glyph}</span>
                ) : (
                  <Lock className="h-4 w-4 text-slate-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-100">{r.name}</div>
                <div className="truncate text-[11px] text-slate-500">
                  {isUnlocked ? r.title : `${r.streak}-day streak`}
                </div>
              </div>
              {isEquipped && <Check className="absolute right-2 top-2 h-4 w-4 text-amber-400" />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
        <span className="font-mono font-bold text-amber-400">{streak}</span> day streak · tap an unlocked reward to equip it
      </div>
    </div>
  );
}