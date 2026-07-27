import React from "react";
import { Medal, Crown } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import LeagueTrophy from "@/components/contango/LeagueTrophy";
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
  { name: "Rookie", threshold: 0,
    accent: "text-slate-400", headerBorder: "border-slate-700", headerBg: "bg-slate-800/40",
    tagline: "Learning the ropes", iconSize: 26, ink: "#94a3b8", tint: "#16202b" },
  { name: "Bronze", threshold: 300,
    accent: "text-amber-600", headerBorder: "border-amber-700/50", headerBg: "bg-amber-900/20",
    tagline: "Warming up", iconSize: 28, ink: "#d97706", tint: "#2a1a0c" },
  { name: "Silver", threshold: 1000,
    accent: "text-slate-200", headerBorder: "border-slate-400/30", headerBg: "bg-slate-700/20",
    tagline: "Hitting stride", iconSize: 30, ink: "#cbd5e1", tint: "#1c2530" },
  { name: "Gold", threshold: 2500,
    accent: "text-amber-400", headerBorder: "border-amber-400/50", headerBg: "bg-amber-500/10",
    tagline: "In the money", iconSize: 32, ink: "#f59e0b", tint: "#33260a" },
  { name: "Platinum", threshold: 5000,
    accent: "text-sky-300", headerBorder: "border-sky-300/50", headerBg: "bg-sky-400/10",
    tagline: "Elite tier", iconSize: 34, ink: "#38bdf8", tint: "#0e2a38" },
];

export default function Leaderboard() {
  const { progress } = useContango();
  const rankings = MOCK_LEAGUE.map(m => m.you ? { ...m, xp: progress.xp } : m).sort((a, b) => b.xp - a.xp);
  const yourRank = rankings.findIndex(m => m.you) + 1;
  const tier = [...TIERS].reverse().find(t => progress.xp >= t.threshold) || TIERS[0];

  return (
    <ScreenShell showStats title="Leagues" tab="leagues">
      <div className={`mb-5 rounded-2xl border p-4 ${tier.headerBorder} ${tier.headerBg}`}>
        <div className="flex items-center gap-3">
          <LeagueTrophy tier={tier} />
          <div className="min-w-0">
            <div className="font-display font-semibold text-slate-100">{tier.name} League</div>
            <div className="text-xs text-slate-400">{tier.tagline} · top 3 promote · resets Sunday</div>
          </div>
          <div className="ml-auto text-right">
            <div className={`font-mono text-lg font-bold ${tier.accent}`}>#{yourRank}</div>
            <div className="text-xs text-slate-500">your rank</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {rankings.map((m, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-xl border p-3 ${
            m.you ? `${tier.headerBorder} ${tier.headerBg}` : "border-slate-800 bg-slate-900"
          }`}>
            <div className="w-6 text-center font-mono text-sm font-bold text-slate-400">
              {i === 0 ? <Crown className={`mx-auto h-4 w-4 ${tier.accent}`} /> : i < 3 ? <Medal className={`mx-auto h-4 w-4 ${tier.accent}`} /> : i + 1}
            </div>
            <span className={`flex-1 text-sm ${m.you ? `font-semibold ${tier.accent}` : "text-slate-200"}`}>{m.name}</span>
            <span className={`font-mono text-sm ${tier.accent}`}>{m.xp} XP</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">All tiers</h3>
        <div className="space-y-2">
          {TIERS.map(t => {
            const active = t.name === tier.name;
            return (
              <div key={t.name} className={`flex items-center gap-3 rounded-xl border p-2.5 ${active ? t.headerBorder : "border-slate-800"} ${active ? t.headerBg : "bg-slate-900/50"}`}>
                <LeagueTrophy tier={t} size={26} />
                <span className={`text-sm font-medium ${active ? t.accent : "text-slate-400"}`}>{t.name}</span>
                <span className="ml-auto font-mono text-[11px] text-slate-600">{t.threshold.toLocaleString()}+ XP</span>
                {active && <span className="rounded-full bg-slate-950/60 px-2 py-0.5 text-[10px] font-semibold text-slate-300">you</span>}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-6 text-center text-[11px] text-slate-600">Matchmaking pairs you by activity level, not skill — everyone starts winnable.</p>
    </ScreenShell>
  );
}