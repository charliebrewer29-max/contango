import React from "react";
import { Flame, Heart, Zap, Star } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { MAX_HEARTS } from "@/lib/gamification";

// Stats bar: streak, hearts, XP — the persistent gamification readout.
export default function StatsBar({ compact = false }) {
  const { progress } = useContango();

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1 text-amber-400">
          <Flame className="h-4 w-4" /> {progress.streak || 0}
        </span>
        <span className="inline-flex items-center gap-1 text-rose-400">
          <Heart className="h-4 w-4 fill-rose-400/30" /> {progress.hearts}
        </span>
        <span className="inline-flex items-center gap-1 text-sky-400">
          <Zap className="h-4 w-4" /> {progress.xp}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <StatTile icon={<Flame className="h-5 w-5" />} value={progress.streak || 0} label="day streak" color="text-amber-400" bg="bg-amber-500/10" />
      <StatTile icon={<Heart className="h-5 w-5 fill-rose-400/20" />} value={`${progress.hearts}/${MAX_HEARTS}`} label="hearts" color="text-rose-400" bg="bg-rose-500/10" />
      <StatTile icon={<Star className="h-5 w-5" />} value={progress.xp} label="total XP" color="text-sky-400" bg="bg-sky-500/10" />
    </div>
  );
}

function StatTile({ icon, value, label, color, bg }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl ${bg} border border-slate-800 py-3`}>
      <div className={`${color} mb-0.5`}>{icon}</div>
      <div className="font-mono text-lg font-semibold text-slate-100">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}