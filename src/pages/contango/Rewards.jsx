import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import StreakRewards from "@/components/contango/StreakRewards";
import TraderDiary from "@/components/contango/TraderDiary";
import { canRepairStreak } from "@/lib/subscription";

// Rewards - streak milestones (equippable flair) and the trader's diary.
// Reached from the Profile screen.
export default function Rewards() {
  const { progress, repairStreak } = useContango();

  return (
    <ScreenShell showStats backTo="/" title="Rewards">
      <Link to="/profile" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-200">
        <ChevronLeft className="h-4 w-4" /> Profile
      </Link>

      {canRepairStreak(progress) && (
        <button onClick={repairStreak} className="mb-4 w-full rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-400 hover:bg-amber-500/10">
          Repair streak (monthly Premium perk)
        </button>
      )}

      <StreakRewards />

      <TraderDiary unlocked={progress.diaryUnlocked || []} />
    </ScreenShell>
  );
}