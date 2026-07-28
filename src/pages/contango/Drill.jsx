import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, Check, X, Play, MessageCircle, Bot, Crown, ShieldCheck } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import CandleChart from "@/components/contango/CandleChart";
import FeedbackFlash, { CelebrationOverlay } from "@/components/contango/FeedbackFlash";
import BranchBadgeCelebration from "@/components/contango/BranchBadgeCelebration";
import { isBranchComplete } from "@/lib/branchProgress";
import { syncReminderSnapshot, buildSnapshot } from "@/lib/reminders";
import { useContango } from "@/contexts/ContangoContext";
import { findBranch } from "@/lib/content";
import { INSTRUMENTS } from "@/lib/instruments";
import { canAccessBranch, isPremium, PREMIUM_INSTRUMENTS } from "@/lib/subscription";

// Drill screen: live bar replay with decision points.
// Bars reveal progressively; mcq decision points pause replay and ask a question.
export default function Drill() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { recordSession, markDrillComplete, setLastDrillReview, progress, unlockBadge, recordAnswer, reviewCard, logDrill } = useContango();
  const branch = findBranch(branchId);

  const [instrument, setInstrument] = useState(() => (branch?.id === "momentum" ? "NQ" : "ES"));
  const [difficulty, setDifficulty] = useState("medium");
  const scenario = useMemo(() => branch?.buildDrill ? branch.buildDrill(instrument, difficulty) : null, [branch, instrument, difficulty]);
  const [revealTo, setRevealTo] = useState(scenario ? Math.min(scenario.bars.length, scenario.decisionPoints[0]?.barIndex + 1 || 15) : 0);
  const [dpIdx, setDpIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [flash, setFlash] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState("replay"); // replay | decision | done
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [branchCelebrate, setBranchCelebrate] = useState(null);
  const [entryPrice, setEntryPrice] = useState(null);
  const [stopPrice, setStopPrice] = useState(null);
  const [exitPrice, setExitPrice] = useState(null);
  const [decisionLog, setDecisionLog] = useState([]);
  const [entryBarIdx, setEntryBarIdx] = useState(null);
  const [lastExit, setLastExit] = useState(null);
  const playRef = useRef(null);
  const decisionsRef = useRef([]);
  const dpShownAt = useRef(null);

  // Bars to reveal when a decision point is active. For tap points, reveal
  // through the end of the tap zone so the whole entry zone is visible.
  function revealTarget(dp, n) {
    if (!dp) return n || 15;
    if (dp.type === "exit-tap") return n; // reveal the full outcome so the user can pick an exit
    if (dp.type === "tap" && dp.zoneEnd != null) return Math.min(n, Math.max(dp.barIndex, dp.zoneEnd) + 1);
    return Math.min(n, dp.barIndex + 1);
  }

  // restart the drill when the instrument or messy mode changes
  useEffect(() => {
    if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
    if (!scenario) return;
    setRevealTo(revealTarget(scenario.decisionPoints[0], scenario.bars.length));
    setDpIdx(0); setSelected(null); setPhase("replay");
    setEntryPrice(null); setStopPrice(null); setExitPrice(null);
    setDecisionLog([]); setFlash(null); setEntryBarIdx(null); setLastExit(null);
    decisionsRef.current = [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrument, difficulty]);

  // Stamp when each decision point becomes active so we can measure decision
  // time as a discipline signal (patience + post-error tilt detection).
  useEffect(() => {
    if (phase === "decision") dpShownAt.current = Date.now();
  }, [phase, dpIdx]);

  if (!scenario) {
    return <ScreenShell><div className="text-slate-400">Drill not found.</div></ScreenShell>;
  }

  if (!canAccessBranch(branch, progress)) {
    return (
      <ScreenShell showStats={false} backTo="/" title={`${branch.branchTitle} Drill`}>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
          <Crown className="mx-auto mb-3 h-10 w-10 text-amber-400" />
          <h2 className="font-display text-xl font-bold text-slate-100">A Premium branch</h2>
          <p className="mt-2 text-sm text-slate-400">This strategy branch is part of Premium. Free learners get the first two.</p>
          <Link to="/paywall" className="mt-5 inline-flex rounded-xl bg-amber-400 px-6 py-3 font-display font-bold text-slate-950">Start free trial</Link>
        </div>
      </ScreenShell>
    );
  }

  const { bars, decisionPoints, stopPrice: scenarioStop } = scenario;
  const inst = INSTRUMENTS[instrument] || INSTRUMENTS.ES;
  const gradedCount = decisionPoints.filter(dp => dp.type !== "exit-tap").length;
  const currentDP = decisionPoints[dpIdx];

  // auto-reveal animation
  function startReveal() {
    if (playRef.current) return;
    playRef.current = setInterval(() => {
      setRevealTo(prev => {
        const next = prev + 1;
        const target = revealTarget(currentDP, bars.length);
        // stop when we reach the next decision point (or its tap zone) or end
        if (currentDP && next >= target) {
          clearInterval(playRef.current);
          playRef.current = null;
          setPhase("decision");
          return target;
        }
        if (next >= bars.length) {
          clearInterval(playRef.current);
          playRef.current = null;
          finishDrill();
          return bars.length;
        }
        return next;
      });
    }, 280);
  }

  function answerDP(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === currentDP.correct;
    setFlash(correct ? "correct" : "wrong");
    if (correct) setCorrectCount(c => c + 1);
    const decisionTimeMs = dpShownAt.current ? Date.now() - dpShownAt.current : null;
    setDecisionLog(log => [...log, { barIndex: currentDP.barIndex, selected: idx, correct, decisionTimeMs }]);
    decisionsRef.current.push({ barIndex: currentDP.barIndex, selected: idx, correct, decisionTimeMs });

    // every decision shapes mastery; a miss makes this drill surface sooner in Practice
    const conceptKey = `drill:${branch.id}`;
    recordAnswer(conceptKey, correct);
    if (!correct) reviewCard(conceptKey, "again");

    setTimeout(() => {
      setFlash(null);
      // after the first decision point, draw entry + stop lines
      if (dpIdx === 0) {
        const entryBar = bars[currentDP.barIndex];
        setEntryPrice(entryBar.close);
        setStopPrice(scenarioStop);
      }
      // after last decision point, draw exit and finish
      if (dpIdx + 1 >= decisionPoints.length) {
        setExitPrice(bars[bars.length - 1].close);
        finishDrill(correct ? correctCount + 1 : correctCount);
      } else {
        setDpIdx(dpIdx + 1);
        setSelected(null);
        setPhase("replay");
        // continue revealing
        setTimeout(startReveal, 300);
      }
    }, 1000);
  }

  // tap decision point: user taps a bar on the chart; scored against a zone.
  // Draws a real entry line at the tapped bar's close and a stop line below the
  // lowest low in the lookback window before the tap - so the chart teaches stop
  // placement, not only entry timing.
  function answerTap(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const inZone = idx >= currentDP.zoneStart && idx <= currentDP.zoneEnd;
    setFlash(inZone ? "correct" : "wrong");
    if (inZone) setCorrectCount(c => c + 1);
    const decisionTimeMs = dpShownAt.current ? Date.now() - dpShownAt.current : null;
    const entryBar = bars[idx];
    setEntryPrice(entryBar.close);
    const lookStart = Math.max(0, idx - 10);
    const computedStop = Math.min(...bars.slice(lookStart, idx).map(b => b.low));
    setStopPrice(computedStop);
    setEntryBarIdx(idx);
    const stopDistancePoints = Math.abs(entryBar.close - computedStop);
    setDecisionLog(log => [...log, { barIndex: idx, selected: idx, correct: inZone, type: "tap", decisionTimeMs, stopDistancePoints }]);
    decisionsRef.current.push({ barIndex: idx, selected: idx, correct: inZone, type: "tap", decisionTimeMs, stopDistancePoints });
    const conceptKey = `drill:${branch.id}`;
    recordAnswer(conceptKey, inZone);
    if (!inZone) reviewCard(conceptKey, "again");
    setTimeout(() => {
      setFlash(null);
      if (dpIdx + 1 >= decisionPoints.length) {
        setExitPrice(bars[bars.length - 1].close);
        finishDrill(inZone ? correctCount + 1 : correctCount);
      } else {
        setDpIdx(dpIdx + 1);
        setSelected(null);
        setPhase("replay");
        setTimeout(startReveal, 300);
      }
    }, 1200);
  }

  // exit-tap decision: the user picks where to exit. Not graded right/wrong -
  // it's behavioral. We compute realized P&L and whether they cut a winner
  // early (price kept running after the exit) or held a loser (the stop was
  // hit but they rode it lower). Logged for the Discipline Engine.
  function answerExitTap(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const entry = entryPrice;
    const stop = stopPrice;
    const exitClose = bars[idx].close;
    const dir = 1; // breakout long
    const realized = (exitClose - entry) * dir;
    const start = (entryBarIdx != null ? entryBarIdx : 0) + 1;
    let stopHit = false;
    for (let i = start; i <= idx; i++) {
      if (stop != null && bars[i].low <= stop) stopHit = true;
    }
    let bestAfter = -Infinity;
    for (let i = idx + 1; i < bars.length; i++) if (bars[i].close > bestAfter) bestAfter = bars[i].close;
    const continued = bestAfter > -Infinity ? (bestAfter - exitClose) * dir : 0;
    let classification = "clean";
    if (stopHit && realized < 0) classification = "held_loser";
    else if (realized > 0 && continued >= Math.max(realized, inst.tickSize * 4)) classification = "cut_winner";
    const decisionTimeMs = dpShownAt.current ? Date.now() - dpShownAt.current : null;
    const rec = { barIndex: idx, selected: idx, type: "exit-tap", decisionTimeMs, realized, classification, stopHit, continued, entryPrice: entry, stopPrice: stop, exitClose };
    setDecisionLog(log => [...log, rec]);
    decisionsRef.current.push(rec);
    setLastExit({ classification, realized, exitClose });
    setExitPrice(exitClose);
    setTimeout(() => {
      setFlash(null);
      if (dpIdx + 1 >= decisionPoints.length) {
        finishDrill(correctCount);
      } else {
        setDpIdx(dpIdx + 1);
        setSelected(null);
        setPhase("replay");
        setTimeout(startReveal, 300);
      }
    }, 1200);
  }

  function finishDrill(finalCorrect) {
    const events = recordSession({ correct: finalCorrect, total: gradedCount, completedType: "drill" });
    markDrillComplete(`${branch.id}-drill`);
    const review = {
      branchId: branch.id,
      branchTitle: branch.branchTitle,
      instrument,
      decisions: decisionPoints.map((dp, i) => ({
        barIndex: dp.barIndex,
        type: dp.type || "mcq",
        prompt: dp.prompt,
        options: dp.options,
        correct: dp.correct,
        selected: decisionsRef.current[i]?.selected ?? null,
        isCorrect: decisionsRef.current[i]?.correct ?? null,
        decisionTimeMs: decisionsRef.current[i]?.decisionTimeMs ?? null,
        stopDistancePoints: decisionsRef.current[i]?.stopDistancePoints ?? null,
        realized: decisionsRef.current[i]?.realized ?? null,
        classification: decisionsRef.current[i]?.classification ?? null,
      })),
      correctCount: finalCorrect,
      total: gradedCount,
    };
    setLastDrillReview(review);
    logDrill(review);
    setPhase("done");
    const hypoth = { ...progress, completedDrills: [...(progress.completedDrills || []), `${branch.id}-drill`] };
    if (isBranchComplete(branch, hypoth) && !(progress.badges || []).includes(branch.id)) {
      unlockBadge(branch.id);
      setBranchCelebrate({ branchId: branch.id });
    } else {
      setShowCelebrate(true);
      setTimeout(() => setShowCelebrate(false), 2200);
    }
    const xpGain = (typeof finalCorrect === "number" ? finalCorrect : correctCount) * 8 + 15;
    syncReminderSnapshot(buildSnapshot({ ...progress, completedDrills: [...(progress.completedDrills || []), `${branch.id}-drill`], xp: (progress.xp || 0) + xpGain, dailyXp: (progress.dailyXp || 0) + xpGain }));
    void events;
  }

  function skipToDecision() {
    if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
    setRevealTo(revealTarget(currentDP, bars.length));
    setPhase("decision");
  }

  return (
    <ScreenShell showStats={false} backTo={`/branch/${branch.id}`} title={`${branch.branchTitle} Drill`}>
      <FeedbackFlash state={flash} />
      <CelebrationOverlay show={showCelebrate} xpGained={correctCount * 8 + 15} onClose={() => setShowCelebrate(false)} />
      {branchCelebrate && (
        <BranchBadgeCelebration
          branchId={branchCelebrate.branchId}
          branchTitle={branch.branchTitle}
          xpGained={correctCount * 8 + 15}
          onClose={() => setBranchCelebrate(null)}
        />
      )}

      {/* instrument + risk readout */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="font-mono text-sm font-semibold text-slate-200">{instrument}</span>
          <span className="ml-2 text-xs text-slate-500">{inst.name}</span>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>tick: <span className="font-mono text-slate-300">${inst.tickValue.toFixed(2)}</span></div>
          <div>micro: <span className="font-mono text-slate-400">${(inst.tickValue / 10).toFixed(2)}</span></div>
        </div>
      </div>

      {/* difficulty selector - available to everyone */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Difficulty</span>
        <div className="flex gap-1.5">
          {[
            { id: "easy", label: "Easy" },
            { id: "medium", label: "Medium" },
            { id: "messy", label: "Messy" },
          ].map((d) => (
            <button key={d.id} onClick={() => setDifficulty(d.id)}
              className={`rounded-lg border px-2.5 py-1 text-xs ${difficulty === d.id ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-slate-700 bg-slate-900 text-slate-400"}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* instrument selector - premium only */}
      {isPremium(progress) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {PREMIUM_INSTRUMENTS.map((ik) => (
              <button key={ik} onClick={() => setInstrument(ik)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-mono ${instrument === ik ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-slate-700 bg-slate-900 text-slate-400"}`}>
                {ik}
              </button>
            ))}
          </div>
        </div>
      )}

      <CandleChart
        bars={bars}
        revealTo={revealTo}
        entryPrice={entryPrice}
        stopPrice={stopPrice}
        exitPrice={exitPrice}
        height={260}
        tapMode={
          phase === "decision" && (currentDP?.type === "tap" || currentDP?.type === "exit-tap") && selected === null
            ? (currentDP.type === "exit-tap"
                ? { zoneStart: (entryBarIdx != null ? entryBarIdx : currentDP.barIndex) + 1, zoneEnd: bars.length - 1 }
                : { zoneStart: currentDP.zoneStart, zoneEnd: currentDP.zoneEnd })
            : null
        }
        onTapZone={phase === "decision" && currentDP?.type === "exit-tap" ? answerExitTap : answerTap}
        selectedBar={phase === "decision" && (currentDP?.type === "tap" || currentDP?.type === "exit-tap") ? selected : null}
      />

      {/* replay controls / progress */}
      {phase === "replay" && (
        <div className="mt-4 flex items-center gap-3">
          <button onClick={startReveal} className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">
            <Play className="h-4 w-4" /> Play replay
          </button>
          <button onClick={skipToDecision} className="rounded-lg px-3 py-2 text-xs text-slate-500 hover:text-slate-300">
            Skip ahead
          </button>
          <div className="flex-1 text-right text-xs text-slate-500 font-mono">
            {revealTo}/{bars.length} bars
          </div>
        </div>
      )}

      {/* decision point MCQ */}
      {phase === "decision" && currentDP?.type === "mcq" && (
        <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="mb-1 flex items-center gap-2 text-sky-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Decision point {dpIdx + 1}</span>
          </div>
          <p className="font-medium text-slate-100">{currentDP.prompt}</p>
          <div className="mt-3 space-y-2">
            {currentDP.options.map((opt, i) => {
              const isCorrect = i === currentDP.correct;
              const isSelected = i === selected;
              let cls = "border-slate-700 bg-slate-900 hover:border-slate-500";
              if (selected !== null) {
                if (isCorrect) cls = "border-emerald-500 bg-emerald-500/10";
                else if (isSelected) cls = "border-rose-500 bg-rose-500/10";
                else cls = "border-slate-800 bg-slate-900 opacity-50";
              }
              return (
                <button key={i} onClick={() => answerDP(i)} disabled={selected !== null}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition ${cls}`}>
                  <span className="text-slate-200">{opt}</span>
                  {selected !== null && isCorrect && <Check className="h-4 w-4 text-emerald-400" />}
                  {selected !== null && isSelected && !isCorrect && <X className="h-4 w-4 text-rose-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* tap decision point: tap directly on the chart where you'd enter */}
      {phase === "decision" && currentDP && currentDP.type === "tap" && (
        <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="mb-1 flex items-center gap-2 text-sky-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Decision point {dpIdx + 1} · tap to enter</span>
          </div>
          <p className="font-medium text-slate-100">{currentDP.prompt}</p>
          {selected === null ? (
            <p className="mt-2 text-xs text-slate-500">Tap directly on the chart where you'd enter. We'll draw your entry and stop from the bar you pick.</p>
          ) : (
            <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm">
              {selected >= currentDP.zoneStart && selected <= currentDP.zoneEnd ? (
                <span className="text-emerald-400">In the entry zone - your entry and stop are drawn on the chart.</span>
              ) : (
                <span className="text-rose-400">Outside the zone - the entry was bars {currentDP.zoneStart}-{currentDP.zoneEnd}.</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* exit-tap decision point: pick where to exit; behavioral, not graded */}
      {phase === "decision" && currentDP?.type === "exit-tap" && (
        <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="mb-1 flex items-center gap-2 text-violet-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Decision point {dpIdx + 1} · tap to exit</span>
          </div>
          <p className="font-medium text-slate-100">{currentDP.prompt}</p>
          {selected === null ? (
            <p className="mt-2 text-xs text-slate-500">You're in the trade. Tap where you'd take your exit. We'll measure whether you cut a winner early or held a loser.</p>
          ) : lastExit ? (
            <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm">
              {lastExit.classification === "cut_winner" && <span className="text-amber-400">You cut this winner early - price kept running after your exit.</span>}
              {lastExit.classification === "held_loser" && <span className="text-rose-400">You held this loser past your stop.</span>}
              {lastExit.classification === "clean" && <span className="text-emerald-400">Clean exit - you took the move and got out.</span>}
            </div>
          ) : null}
        </div>
      )}

      {/* done summary */}
      {phase === "done" && (
        <div className="mt-6 text-center" style={{ animation: "fadeIn 0.5s ease-out" }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-100">Drill complete</h2>
          <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="font-mono text-2xl font-bold text-sky-400">+{correctCount * 8 + 15}</div>
              <div className="text-xs text-slate-500">XP</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="font-mono text-2xl font-bold text-emerald-400">{correctCount}/{gradedCount}</div>
              <div className="text-xs text-slate-500">correct</div>
            </div>
          </div>
          {/* risk readout on the trade */}
          {entryPrice != null && stopPrice != null && (
            <div className="mx-auto mt-4 max-w-xs rounded-xl border border-slate-800 bg-slate-900 p-4 text-left text-xs">
              <div className="mb-2 font-semibold text-slate-300">Trade risk (simulated)</div>
              <Row label="Entry" value={`${entryPrice.toFixed(2)}`} />
              <Row label="Stop" value={`${stopPrice.toFixed(2)}`} />
              <Row label="Risk (ticks)" value={`${Math.abs(entryPrice - stopPrice).toFixed(2)} pts`} />
              <Row label="Full contract" value={`$${(Math.abs(entryPrice - stopPrice) / inst.tickSize * inst.tickValue).toFixed(2)}`} accent="text-rose-400" />
              <Row label="Micro contract" value={`$${(Math.abs(entryPrice - stopPrice) / inst.tickSize * inst.tickValue / 10).toFixed(2)}`} accent="text-amber-400" />
              {exitPrice != null && (
                <>
                  <Row label="Exit" value={`${exitPrice.toFixed(2)}`} />
                  <Row label="P&L / contract" value={`${(exitPrice - entryPrice >= 0 ? "+" : "")}${((exitPrice - entryPrice) / inst.tickSize * inst.tickValue).toFixed(2)}`} accent={exitPrice - entryPrice >= 0 ? "text-emerald-400" : "text-rose-400"} />
                </>
              )}
            </div>
          )}
          <div className="mt-6 space-y-2">
            <Link to="/drill-coach" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-semibold text-white transition hover:bg-emerald-400">
              <Bot className="h-5 w-5" /> Review my mistakes
            </Link>
            <Link to={`/coach?branch=${branch.id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3.5 font-semibold text-slate-200 transition hover:bg-slate-700">
              <MessageCircle className="h-5 w-5" /> Reflect with AI coach
            </Link>
            <Link to="/discipline" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3.5 font-semibold text-slate-200 transition hover:bg-slate-700">
              <ShieldCheck className="h-5 w-5" /> Discipline Profile
            </Link>
            <button onClick={() => navigate("/")} className="w-full rounded-xl bg-slate-800 py-3.5 font-semibold text-slate-200 transition hover:bg-slate-700">
              Back to dashboard
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ScreenShell>
  );
}

function Row({ label, value, accent = "text-slate-200" }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono ${accent}`}>{value}</span>
    </div>
  );
}