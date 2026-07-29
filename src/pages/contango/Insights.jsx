import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Flame, Zap, Brain, TrendingUp, Target, ShieldCheck, BookOpen, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  AreaChart, Area,
} from "recharts";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { lastNDays, branchMastery, conceptMastery } from "@/lib/insights";
import { weakConcepts } from "@/lib/performance";
import { disciplineProfile } from "@/lib/discipline";
import { isPremium } from "@/lib/subscription";

const COLOR_HEX = {
  amber: "#fbbf24",
  rose: "#fb7185",
  sky: "#38bdf8",
  violet: "#a78bfa",
  emerald: "#34d399",
};

const AXIS_TICK = { fill: "#64748b", fontSize: 11 };

export default function Insights() {
  const { progress, entitlement } = useContango();
  const series = React.useMemo(() => lastNDays(14, progress.history), [progress.history]);
  const branches = React.useMemo(
    () => branchMastery(progress),
    [progress.srCards, progress.completedLessons, progress.completedDrills]
  );
  const concepts = React.useMemo(
    () => conceptMastery(progress),
    [progress.srCards, progress.completedLessons]
  );
  const discipline = React.useMemo(() => disciplineProfile(progress), [progress.drillHistory]);

  const totalXp = progress.xp || 0;
  const streak = progress.streak || 0;
  const activeDays = (progress.history || []).length;
  const avgMastery = branches.length
    ? Math.round(branches.reduce((s, b) => s + b.mastery, 0) / branches.length)
    : 0;

  // Chart domains: hide Y-axis labels when the data is all zero so we never
  // render a stack of "0"s; otherwise pin to the real data max as integers.
  const maxDailyXp = Math.max(0, ...series.map((d) => d.dailyXp));
  const maxXp = Math.max(0, ...series.map((d) => d.xp));

  const drillsCompleted = (progress.completedDrills || []).length;

  if (drillsCompleted === 0) {
    return (
      <ScreenShell showStats backTo="/" title="Insights">
        {/* trade journal - still useful even with no drill data */}
        <Link to="/journal" className="mb-6 block">
          <div className="cg-surface flex items-center gap-4 rounded-2xl p-5 transition hover:border-slate-600">
            <BookOpen className="h-8 w-8 text-emerald-400" />
            <div className="flex-1">
              <h2 className="font-display text-sm font-semibold text-slate-200">Trade Journal</h2>
              <p className="text-xs text-slate-500">{isPremium(entitlement) ? "Your full decision history with win-rate analytics" : "Your last session - full history with Premium"}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </div>
        </Link>

        <section className="cg-surface rounded-2xl p-5 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-slate-500" />
          <h2 className="mt-3 text-[17px] font-semibold text-slate-100">Your insights unlock after your first drill</h2>
          <p className="mx-auto mt-2 max-w-[320px] text-sm text-slate-400">Once you start making decisions, this page fills in with your XP curve, mastery by branch, and the patterns behind your wins and misses.</p>
          <Link to="/" className="mt-5 inline-flex rounded-xl bg-amber-400 px-6 py-3 font-display font-bold text-slate-950 transition hover:bg-amber-300">Find a drill</Link>
        </section>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell showStats backTo="/" title="Insights">
      {/* summary tiles */}
      <div className="mb-6 grid grid-cols-4 gap-2.5">
        <Summary icon={<Flame className="h-4 w-4" />} value={streak} label="streak" color="text-amber-400" />
        <Summary icon={<Zap className="h-4 w-4" />} value={totalXp} label="total XP" color="text-sky-400" />
        <Summary icon={<TrendingUp className="h-4 w-4" />} value={activeDays} label="active days" color="text-emerald-400" />
        <Summary icon={<Brain className="h-4 w-4" />} value={`${avgMastery}%`} label="mastery" color="text-violet-400" />
      </div>

      {/* discipline profile */}
      <Link to="/discipline" className="mb-6 block">
        <div className="cg-surface flex items-center gap-4 rounded-2xl p-5 transition hover:border-slate-600">
          <ShieldCheck className="h-8 w-8 text-amber-400" />
          <div className="flex-1">
            <h2 className="font-display text-sm font-semibold text-slate-200">Discipline Profile</h2>
            <p className="text-xs text-slate-500">Execution discipline - the skill that separates traders who last.</p>
          </div>
          <div className="text-right">
            {discipline.empty ? (
              <div className="text-xs font-medium text-slate-500">Not enough data yet</div>
            ) : (
              <>
                <div className={`font-mono text-2xl font-bold ${dColor(discipline.overall)}`}>{discipline.overall}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-600">overall</div>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* trade journal */}
      <Link to="/journal" className="mb-6 block">
        <div className="cg-surface flex items-center gap-4 rounded-2xl p-5 transition hover:border-slate-600">
          <BookOpen className="h-8 w-8 text-emerald-400" />
          <div className="flex-1">
            <h2 className="font-display text-sm font-semibold text-slate-200">Trade Journal</h2>
            <p className="text-xs text-slate-500">{isPremium(entitlement) ? "Your full decision history with win-rate analytics" : "Your last session - full history with Premium"}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </div>
      </Link>

      {/* streak strip */}
      <ChartCard title="Daily streak" icon={<Flame className="h-4 w-4 text-amber-400" />} sub={`${streak}-day`}>
        <div className="flex items-end justify-between gap-1">
          {series.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`h-14 w-full rounded-lg ${d.active ? "bg-amber-400" : "bg-slate-800/60"}`}
                title={`${d.date}: ${d.active ? d.dailyXp + " XP" : "no activity"}`}
              />
              <span className="text-[9px] text-slate-600">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {streak > 0
            ? `You're on a ${streak}-day roll - keep the chain alive.`
            : "Complete a lesson or drill to start a streak."}
        </p>
      </ChartCard>

      {/* daily XP */}
      <ChartCard title="Daily XP gains" icon={<Zap className="h-4 w-4 text-sky-400" />} sub="last 14 days">
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
              <YAxis
                tick={maxDailyXp > 0 ? AXIS_TICK : false}
                axisLine={false}
                tickLine={false}
                width={36}
                domain={maxDailyXp > 0 ? [0, maxDailyXp] : [0, 1]}
                allowDecimals={false}
                tickCount={4}
              />
              <Tooltip content={<XpTip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
              <Bar dataKey="dailyXp" radius={[3, 3, 0, 0]} maxBarSize={26}>
                {series.map((d, i) => (
                  <Cell key={i} fill={d.dailyXp > 0 ? "#38bdf8" : "rgba(148,163,184,0.12)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* cumulative XP */}
      <ChartCard title="Total XP growth" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} sub={`${totalXp} XP`}>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
              <YAxis
                tick={maxXp > 0 ? AXIS_TICK : false}
                axisLine={false}
                tickLine={false}
                width={36}
                domain={maxXp > 0 ? [0, maxXp] : [0, 1]}
                allowDecimals={false}
                tickCount={4}
              />
              <Tooltip content={<XpCumTip />} cursor={{ stroke: "#334155" }} />
              <Area type="monotone" dataKey="xp" stroke="#34d399" strokeWidth={2} fill="url(#xpFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* branch mastery */}
      <ChartCard title="Mastery by branch" icon={<Brain className="h-4 w-4 text-violet-400" />}>
        {branches.length === 0 ? (
          <Empty text="Finish a lesson and review it in Practice to build mastery." />
        ) : (
          <div className="space-y-3">
            {branches.map((b) => (
              <div key={b.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{b.title}</span>
                  <span className="text-slate-500">{b.completion}% complete</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/60">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.completion}%`, backgroundColor: COLOR_HEX[b.color] || "#34d399" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>

      {/* per-concept mastery */}
      <ChartCard title="Concept mastery" icon={<BarChart3 className="h-4 w-4 text-emerald-400" />}>
        {concepts.length === 0 ? (
          <Empty text="No concepts in review yet." />
        ) : (
          <div className="space-y-2.5">
            {concepts.map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-300">{c.title}</span>
                  <span className="text-slate-500">{c.mastery}%{c.practiced ? "" : " · introduced"}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/60">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.mastery}%`, backgroundColor: COLOR_HEX[c.color] || "#34d399" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>

      <ChartCard title="Strengths & weak spots" icon={<Target className="h-4 w-4 text-rose-400" />}>
        {(() => {
          // Need >= 3 attempts on a concept before its score means anything,
          // and at least 3 scored concepts before the section is worth showing.
          const rated = weakConcepts(progress, 3);
          if (rated.length < 3)
            return <Empty text="Complete a few more drills to see your strengths and weak spots." />;
          // Threshold split so a concept can never appear in both lists.
          const strong = rated
            .filter((w) => w.accuracy >= 0.7)
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 3);
          const weak = rated
            .filter((w) => w.accuracy < 0.7)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 3);
          return (
            <div className="space-y-4">
              {weak.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-rose-400">Needs work</p>
                  <div className="space-y-2">
                    {weak.map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{w.title}</span>
                        <span className="font-mono text-rose-400">{Math.round(w.accuracy * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {strong.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-emerald-400">Your strengths</p>
                  <div className="space-y-2">
                    {strong.map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{w.title}</span>
                        <span className="font-mono text-emerald-400">{Math.round(w.accuracy * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </ChartCard>
    </ScreenShell>
  );
}

function dColor(s) {
  if (s >= 80) return "text-emerald-400";
  if (s >= 60) return "text-amber-400";
  return "text-rose-400";
}

function Summary({ icon, value, label, color }) {
  return (
    <div className="cg-soft flex flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/60 py-3.5">
      <span className={color}>{icon}</span>
      <span className="cg-num mt-1 font-mono text-base font-bold text-slate-100">{value}</span>
      <span className="text-[9px] uppercase tracking-wide text-slate-500">{label}</span>
    </div>
  );
}

function ChartCard({ title, icon, sub, children }) {
  return (
    <section className="cg-surface mb-6 rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="text-slate-300">{icon}</span>
        <h2 className="font-display text-sm font-semibold tracking-tight text-slate-200">{title}</h2>
        {sub && <span className="ml-auto text-xs text-slate-500">{sub}</span>}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return <p className="py-6 text-center text-sm text-slate-500">{text}</p>;
}

function XpTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#0a0e16] px-3 py-2 text-xs">
      <div className="text-slate-400">{d.date}</div>
      <div className="font-mono font-semibold text-sky-400">{d.dailyXp} XP</div>
    </div>
  );
}

function XpCumTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#0a0e16] px-3 py-2 text-xs">
      <div className="text-slate-400">{d.date}</div>
      <div className="font-mono font-semibold text-emerald-400">{d.xp} XP total</div>
    </div>
  );
}