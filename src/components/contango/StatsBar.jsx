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
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1 text-amber-400">
          <Flame className="h-4 w-4" /> {progress.streak || 0}
        </span>
        <span className="inline-flex items-center gap-1 text-rose-400">
          <Heart className="h-4 w-4 fill-rose-400/30" /> {progress.hearts}
        </span>
        <span className="inline-flex items-center gap-1 text-sky-400">
          <Star className="h-4 w-4" /> {progress.xp}
        </span>
      </div>
    );
  }

  const streak = progress.streak || 0;
  const stars = progress.xp || 0;
  const tiles = [];
  if (streak) tiles.push(<StatTile key="streak" icon={<Flame className="h-3.5 w-3.5" />} value={streak} label="day streak" color="text-amber-400" bg="bg-amber-500/10" />);
  tiles.push(<StatTile key="hearts" icon={<Heart className="h-3.5 w-3.5 fill-rose-400/20" />} value={`${progress.hearts}/${MAX_HEARTS}`} label="hearts" color="text-rose-400" bg="bg-rose-500/10" />);
  if (stars) tiles.push(<StatTile key="xp" icon={<Star className="h-3.5 w-3.5" />} value={stars} label="total XP" color="text-sky-400" bg="bg-sky-500/10" />);

  if (tiles.length === 3) {
    return <div className="grid grid-cols-3 gap-1.5">{tiles}</div>;
  }
  return <div className="flex justify-center gap-1.5">{tiles}</div>;
}

function StatTile({ icon, value, label, color, bg }) {
  return (
    <div
      title={label}
      className={`flex items-center justify-center gap-1.5 rounded-lg ${bg} border border-slate-800/60 px-2 py-2`}
    >
      <span className={color}>{icon}</span>
      <span className="cg-num font-mono text-sm font-semibold text-slate-100">{value}</span>
    </div>
  );
}