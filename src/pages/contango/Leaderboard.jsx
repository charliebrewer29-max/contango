import React from "react";
import { Trophy, Medal, Crown, Award, Gem } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";

// Mock leagues screen — weekly cohorts ranked by XP, matchmaking feel.
const MOCK_LEAGUE = [
  { name: "MarginCallMike", xp: 1840, you: false },
  { name: "FadingFiona", xp: 1620, you: false },
  { name: "You", xp: 0, you: true },
  { name: "BreakoutBob", xp: 980, you: false },
  { name: "VWAPVera", xp: 760, you: false },
  { name: "TickSizeTom", xp: 540, you: false },
  { name: "RTHRita", xp: 420, you: false },
  { name: "ContangoCarl", xp: 280, you: false },
];

const TIERS = [
  { name: "Rookie", color: "text-slate-400", icon: Award, threshold: 0 },
  { name: "Bronze", color: "text-amber-700", icon: Medal, threshold: 300 },
  { name: "Silver", color: "text-slate-300", icon: Trophy, threshold: 1000 },
  { name: "Gold", color: "text-amber-400", icon: Crown, threshold: 2500 },
  { name: "Platinum", color: "text-sky-300", icon: Gem, threshold: 5000 },
];

export default function Leaderboard() {
  const { progress } = useContango();
  const rankings = MOCK_LEAGUE.map(m => m.you ? { ...m, xp: progress.xp } : m).sort((a, b) => b.xp - a.xp);
  const yourRank = rankings.findIndex(m => m.you) + 1;
  const tier = [...TIERS].reverse().find(t => progress.xp >= t.threshold) || TIERS[0];
  const LeagueIcon = tier.icon;

  return (
    <ScreenShell showStats title="Leagues" tab="leagues">
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <LeagueIcon className={`h-8 w-8 ${tier.color}`} />
        <div>
          <div className="font-display font-semibold text-slate-100">{tier.name} League</div>
          <div className="text-xs text-slate-500">Top 3 promote · bottom 3 demote · resets Sunday</div>
        </div>
        <div className="ml-auto text-right">
          <div className={`font-mono text-lg font-bold ${tier.color}`}>#{yourRank}</div>
          <div className="text-xs text-slate-500">your rank</div>
        </div>
      </div>

      <div className="space-y-2">
        {rankings.map((m, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-xl border p-3 ${
            m.you ? "border-amber-500/40 bg-amber-500/10" : "border-slate-800 bg-slate-900"
          }`}>
            <div className="w-6 text-center font-mono text-sm font-bold text-slate-400">
              {i === 0 ? <Crown className="mx-auto h-4 w-4 text-amber-400" /> : i < 3 ? <Medal className="mx-auto h-4 w-4 text-slate-400" /> : i + 1}
            </div>
            <span className={`flex-1 text-sm ${m.you ? "font-semibold text-amber-400" : "text-slate-200"}`}>{m.name}</span>
            <span className="font-mono text-sm text-sky-400">{m.xp} XP</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tiers</h3>
        <div className="flex gap-2">
          {TIERS.map(t => (
            <span key={t.name} className={`rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs ${t.color}`}>{t.name}</span>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-[11px] text-slate-600">Matchmaking pairs you by activity level, not skill — everyone starts winnable.</p>
    </ScreenShell>
  );
}