import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Medal, Crown, Trophy } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import LeagueTrophy from "@/components/contango/LeagueTrophy";
import { useContango } from "@/contexts/ContangoContext";
import { generateCohort, cohortXpNow, weekStartIso, needsWeeklyReset } from "@/lib/leagueCohort";

// Weekly leagues screen. A brand-new user (0 XP) sees a single "your league
// starts with your first lesson" card instead of a fake roster that parks
// them last. Once they earn any XP, a 7-opponent cohort is seeded relative to
// their entry XP; opponents then drift upward by dailyRate each day, and the
// cohort re-seeds (with leagueXp reset to 0) when a Sunday boundary is crossed.

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
  const { progress, update } = useContango();
  const xp = progress.xp || 0;

  // Seed the cohort on league entry (first time xp > 0) and re-seed when a
  // Sunday boundary has been crossed. Persisted on progress (leagueCohort +
  // leagueWeekStart) so it survives navigation; leagueXp resets to 0 each week.
  const [cohort] = useState(() => {
    if (xp <= 0) return null;
    if (progress.leagueCohort && !needsWeeklyReset(progress.leagueWeekStart, new Date())) {
      return progress.leagueCohort;
    }
    return generateCohort(xp, new Date());
  });
  useEffect(() => {
    if (xp <= 0) return;
    const now = new Date();
    if (!progress.leagueCohort || needsWeeklyReset(progress.leagueWeekStart, now)) {
      update({ leagueCohort: cohort, leagueWeekStart: weekStartIso(now), leagueXp: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tier = [...TIERS].reverse().find(t => xp >= t.threshold) || TIERS[0];

  const rankings = React.useMemo(() => {
    if (!cohort) return [];
    // Rank against time-drifted XP, not the stored roster values.
    const drifted = cohortXpNow(cohort, new Date());
    return [...drifted, { name: "You", xp, you: true }].sort((a, b) => b.xp - a.xp);
  }, [cohort, xp]);
  const yourRank = rankings.findIndex(m => m.you) + 1;

  return (
    <ScreenShell showStats title="Leagues" tab="leagues">
      {xp === 0 ? (
        <EmptyLeagueCard />
      ) : (
        <>
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
        </>
      )}

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
      <p className="mt-6 text-center text-[11px] text-slate-600">Matchmaking pairs you by activity level, not skill - everyone starts winnable.</p>
    </ScreenShell>
  );
}

function EmptyLeagueCard() {
  return (
    <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
      <Trophy className="mx-auto h-10 w-10 text-slate-500" />
      <h2 className="mt-4 text-[17px] font-semibold text-slate-100">Your league starts with your first lesson</h2>
      <p className="mx-auto mt-2 max-w-[320px] text-sm text-slate-400">Earn your first XP and you'll be matched into a Rookie League cohort. Top 3 promote every Sunday.</p>
      <Link to="/" className="mt-5 inline-flex rounded-xl bg-amber-400 px-6 py-3 font-display font-bold text-slate-950 transition hover:bg-amber-300">Start learning</Link>
    </div>
  );
}