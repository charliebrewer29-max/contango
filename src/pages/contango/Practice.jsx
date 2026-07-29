import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Repeat, Clock, Sparkles, Check, CalendarClock, Target, Crown } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import PracticeReview from "@/components/contango/practice/PracticeReview";
import { useContango } from "@/contexts/ContangoContext";
import { buildPracticeCatalog, isDue, nextDueMs } from "@/lib/spacedRepetition";
import { weakConcepts } from "@/lib/performance";
import { restorePurchases } from "@/lib/subscription";
import { practiceStatus, FREE_PRACTICE_DAILY } from "@/lib/practiceAllowance";
import { serverToday } from "@/lib/gamification";
import { getServerOffset } from "@/lib/serverClock";
import { toast } from "@/components/ui/use-toast";

const SESSION_SIZE = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(card) {
  const order = card.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...card, _options: order.map((i) => card.options[i]), _correct: order.indexOf(card.correct) };
}

function fmtDue(ms) {
  if (ms == null) return "later";
  const h = Math.round(ms / 3600000);
  if (h < 1) return "soon";
  if (h < 24) return `in ${h}h`;
  return `in ${Math.round(h / 24)}d`;
}

export default function Practice() {
  const { progress, entitlement, reviewCard, recordSession, update, earnHeart } = useContango();
  const srCards = progress.srCards || {};
  const catalog = useMemo(
    () => buildPracticeCatalog(progress),
    [progress.completedLessons, progress.completedDrills]
  );
  const dueCards = useMemo(() => catalog.filter((c) => isDue(srCards[c.id])), [catalog, srCards]);

  const { premium, left, exhausted } = practiceStatus(progress, getServerOffset(), entitlement);

  // The daily reset of the free practice counter is handled centrally in
  // ContangoContext (server-anchored, fail-closed), not here.

  const [phase, setPhase] = useState("home");
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  function startSession(mode = "due") {
    if (!premium && left <= 0) return;
    let pool;
    if (mode === "weak") {
      const weakIds = weakConcepts(progress).slice(0, 6).map((w) => w.id);
      pool = weakIds.length
        ? catalog.filter((c) =>
            weakIds.includes(c.id.startsWith("drill:") ? c.id : c.id.split(":")[1])
          )
        : [];
      if (!pool.length) pool = dueCards.length ? dueCards : catalog;
    } else {
      pool = mode === "all" ? catalog : dueCards;
    }
    if (!pool.length) return;
    const accOf = (card) => {
      const key = card.id.startsWith("drill:") ? card.id : card.id.split(":")[1];
      const s = (progress.stats || {})[key];
      return s && s.seen ? s.correct / s.seen : null;
    };
    // adaptive order: most-lapsed first, then weakest accuracy, then shortest interval
    const prioritized = [...pool].sort((a, b) => {
      const la = srCards[a.id]?.lapses || 0, lb = srCards[b.id]?.lapses || 0;
      if (la !== lb) return lb - la;
      const aa = accOf(a), ab = accOf(b);
      if (aa != null && ab != null && aa !== ab) return aa - ab;
      const ia = srCards[a.id]?.interval ?? 0, ib = srCards[b.id]?.interval ?? 0;
      return ia - ib;
    });
    const prepared = prioritized.slice(0, SESSION_SIZE).map(shuffleOptions);
    setQueue(prepared);
    setIdx(0);
    setSelected(null);
    setStats({ correct: 0, total: 0 });
    setPhase("review");
  }

  function handleGrade(grade) {
    const card = queue[idx];
    const correct = grade !== "again";
    reviewCard(card.id, grade);
    const nextStats = { correct: stats.correct + (correct ? 1 : 0), total: stats.total + 1 };
    setStats(nextStats);
    setSelected(null);
    if (idx + 1 >= queue.length) {
      recordSession({ correct: nextStats.correct, total: nextStats.total, completedType: "practice" });
      // Practice drills never cost hearts - only the free daily allowance.
      if (!premium) {
        const today = serverToday(getServerOffset());
        update((prev) => ({
          ...prev,
          practiceResetDate: today,
          practiceUsedToday:
            (prev.practiceResetDate === today ? (prev.practiceUsedToday || 0) : 0) + 1,
        }));
      }
      // Finishing a practice drill earns a heart back (if not already full).
      // Applies identically to free, trial, and premium - hearts are never sold.
      const gained = earnHeart();
      if (gained) toast({ title: "+1 heart. Back in the game." });
      setPhase("done");
    } else {
      setIdx(idx + 1);
    }
  }

  // ---------- HOME ----------
  if (phase === "home") {
    return (
      <ScreenShell backTo="/" title="Spaced Practice" showStats>
        {!premium && <PracticeStatusBar left={left} />}

        {exhausted ? (
          <PracticeUpsell />
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
              <Repeat className="h-7 w-7 text-sky-400" />
              <div>
                <div className="font-display font-semibold text-slate-100">Spaced Practice</div>
                <div className="text-xs text-slate-500">Resurfaces what you've learned on an expanding schedule - before you forget it.</div>
              </div>
            </div>

            {catalog.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-300">Complete a lesson first - practice pulls from concepts and charts you've already learned.</p>
                <Link to="/" className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950">Go to lessons</Link>
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <Stat icon={<Clock className="h-4 w-4" />} label="Due now" value={dueCards.length} accent="text-sky-400" />
                  <Stat icon={<Check className="h-4 w-4" />} label="Learned" value={catalog.length} accent="text-emerald-400" />
                </div>

                <button
                  onClick={() => startSession("due")}
                  disabled={!dueCards.length}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-4 font-display font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-amber-400"
                >
                  {dueCards.length ? `Review ${Math.min(dueCards.length, SESSION_SIZE)} due cards` : "Nothing due right now"}
                </button>
                <button
                  onClick={() => startSession("all")}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 font-semibold text-slate-200 transition hover:border-slate-500"
                >
                  Practice ahead ({catalog.length} learned)
                </button>

                {(() => {
                  const weak = weakConcepts(progress).slice(0, 3);
                  if (!weak.length) return null;
                  return (
                    <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-rose-400">
                        <Target className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Focus areas · what to work on</span>
                      </div>
                      <ul className="space-y-1.5">
                        {weak.map((w) => (
                          <li key={w.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-300">{w.title}</span>
                            <span className="font-mono text-rose-400">{Math.round(w.accuracy * 100)}% · {w.correct}/{w.seen}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => startSession("weak")}
                        className="mt-3 w-full rounded-xl bg-amber-400 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
                      >
                        Drill your weak spots
                      </button>
                    </div>
                  );
                })()}

                {dueCards.length === 0 && (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                    <Check className="h-4 w-4" /> All caught up - next review {fmtDue(nextDueMs(srCards))}.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </ScreenShell>
    );
  }

  // ---------- REVIEW ----------
  if (phase === "review") {
    const card = queue[idx];
    return (
      <ScreenShell backTo="/" title="Spaced Practice" showStats={false}>
        <div className="mb-3 flex items-center gap-2">
          {queue.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < idx ? "bg-emerald-500" : i === idx ? "bg-amber-400" : "bg-slate-800"}`} />
          ))}
        </div>
        <div className="mb-2 text-xs text-slate-500">{card.title}</div>
        <PracticeReview card={card} selected={selected} onSelect={setSelected} onGrade={handleGrade} srCard={srCards[card.id]} />
      </ScreenShell>
    );
  }

  // ---------- DONE ----------
  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
  return (
    <ScreenShell backTo="/" title="Spaced Practice" showStats={false}>
      <div className="py-8 text-center" style={{ animation: "fadeIn 0.5s ease-out" }}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <Check className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-100">Session complete</h2>
        <div className="mx-auto mt-6 grid max-w-xs grid-cols-3 gap-3">
          <DoneStat value={`${stats.correct}/${stats.total}`} label="correct" accent="text-emerald-400" />
          <DoneStat value={`${pct}%`} label="accuracy" accent="text-sky-400" />
          <DoneStat value={`+${stats.correct * 5}`} label="XP" accent="text-amber-400" />
        </div>
        <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
          <CalendarClock className="h-4 w-4 text-slate-500" />
          {dueCards.length ? `${dueCards.length} cards still due` : `All caught up - next review ${fmtDue(nextDueMs(srCards))}`}
        </div>
        <div className="mx-auto mt-6 max-w-xs space-y-2">
          {!exhausted && (
            <button
              onClick={() => startSession("due")}
              disabled={!dueCards.length}
              className="w-full rounded-xl bg-amber-400 py-3.5 font-display font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-30"
            >
              Review more due cards
            </button>
          )}
          <button onClick={() => setPhase("home")} className="w-full rounded-xl bg-slate-800 py-3.5 font-semibold text-slate-200 transition hover:bg-slate-700">
            Back to practice home
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ScreenShell>
  );
}

function PracticeStatusBar({ left }) {
  const remaining = Math.max(0, left);
  const color = remaining > 0 ? "text-amber-400" : "text-slate-500";
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5">
      <span className="text-[13px] text-slate-400">Free practice</span>
      <span className={`text-[13px] font-medium ${color}`}>{remaining} of {FREE_PRACTICE_DAILY} left today</span>
    </div>
  );
}

function PracticeUpsell() {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
      <Crown className="mx-auto mb-3 h-10 w-10 text-amber-400" />
      <h2 className="font-display text-xl font-bold text-slate-100">That's your 3 for today</h2>
      <p className="mt-2 text-sm text-slate-400">Practice resets tomorrow. Premium makes it unlimited, so you can drill the same setup until it's automatic.</p>
      <p className="mt-2 text-xs text-slate-500">Hearts still apply on the graded curriculum path for everyone - that's the daily-loss-limit discipline you're learning.</p>
      <Link to="/paywall" className="mt-5 inline-flex rounded-xl bg-amber-400 px-6 py-3 font-display font-bold text-slate-950">Start free trial</Link>
      <div className="mt-4 flex items-center justify-center gap-4 text-[12px] text-slate-500">
        <button onClick={restorePurchases} className="hover:text-slate-300">Restore Purchases</button>
        <Link to="/legal#terms" className="hover:text-slate-300">Terms of Use</Link>
        <Link to="/legal#privacy" className="hover:text-slate-300">Privacy Policy</Link>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">{icon}{label}</div>
      <div className={`mt-1 font-mono text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function DoneStat({ value, label, accent }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
      <div className={`font-mono text-xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}