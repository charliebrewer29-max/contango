import React from "react";
import { Flame, Heart, Star } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { MAX_HEARTS } from "@/lib/gamification";

// Stats bar: streak, hearts, XP - the persistent gamification readout.
// Dense by design: small monospace type, tight spacing, minimal padding so
// it reads as a data surface, not a content card.
export default function StatsBar({ compact = false }) {
  const { progress } = useContango();

  if (compact) {
    return (
      <div data-tour="stats" className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1 text-amber-400">
          <Flame className="h-4 w-4" /> {progress.streak || 0}
        </span>
        <span className="inline-flex items-center gap-1 text-rose-400">
          <Heart className={`h-4 w-4 ${(progress.hearts ?? 5) <= 0 ? "fill-rose-400" : "fill-rose-400/30"}`} /> {progress.hearts}
        </span>
        <span className="inline-flex items-center gap-1 text-sky-400">
          <Star className="h-4 w-4" /> {progress.xp}
        </span>
      </div>
    );
  }

  const streak = progress.streak || 0;
  const stars = progress.xp || 0;
  const depleted = (progress.hearts ?? MAX_HEARTS) <= 0;
  const streakActive = streak > 0;
  const xpActive = stars > 0;
  const tiles = [
    <StatTile key="streak" icon={<Flame className="h-3.5 w-3.5" />} value={streak} label="day streak" color={streakActive ? "text-amber-400" : "text-slate-500"} valueColor={streakActive ? "text-slate-100" : "text-slate-500"} bg={streakActive ? "bg-amber-500/10" : "bg-slate-800/40"} />,
    <StatTile key="hearts" icon={<Heart className={`h-3.5 w-3.5 ${depleted ? "fill-rose-400" : "fill-rose-400/20"}`} />} value={`${progress.hearts}/${MAX_HEARTS}`} label="hearts" color="text-rose-400" bg={depleted ? "bg-rose-500/20" : "bg-rose-500/10"} border={depleted ? "border-rose-500/40" : "border-slate-800/60"} />,
    <StatTile key="xp" icon={<Star className="h-3.5 w-3.5" />} value={stars} label="total XP" color={xpActive ? "text-sky-400" : "text-slate-500"} valueColor={xpActive ? "text-slate-100" : "text-slate-500"} bg={xpActive ? "bg-sky-500/10" : "bg-slate-800/40"} />,
  ];

  if (tiles.length === 3) {
    return <div data-tour="stats" className="grid grid-cols-3 gap-1.5">{tiles}</div>;
  }
  return <div data-tour="stats" className="flex justify-center gap-1.5">{tiles}</div>;
}

function StatTile({ icon, value, label, color, valueColor = "text-slate-100", bg, border = "border-slate-800/60" }) {
  return (
    <div
      title={label}
      className={`flex items-center justify-center gap-1.5 rounded-lg ${bg} border ${border} px-2 py-2`}
    >
      <span className={color}>{icon}</span>
      <span className={`cg-num font-mono text-sm font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}