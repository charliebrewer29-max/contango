import React, { useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronRight, Check, X, Play, Pause, MessageCircle, Bot } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import CandleChart from "@/components/contango/CandleChart";
import FeedbackFlash, { CelebrationOverlay } from "@/components/contango/FeedbackFlash";
import BranchBadgeCelebration from "@/components/contango/BranchBadgeCelebration";
import { isBranchComplete } from "@/lib/branchProgress";
import { useContango } from "@/contexts/ContangoContext";
import { findBranch } from "@/lib/content";
import { INSTRUMENTS } from "@/lib/instruments";

// Drill screen: live bar replay with decision points.
// Bars reveal progressively; mcq decision points pause replay and ask a question.
export default function Drill() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { recordSession, markDrillComplete, setLastDrillReview, progress, unlockBadge } = useContango();
  const branch = findBranch(branchId);

  const scenario = useMemo(() => branch?.buildDrill ? branch.buildDrill() : null, [branch]);
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
  const playRef = useRef(null);
  const decisionsRef = useRef([]);

  if (!scenario) {
    return <ScreenShell><div className="text-slate-400">Drill not found.</div></ScreenShell>;
  }

  const { bars, decisionPoints, instrument, stopPrice: scenarioStop } = scenario;
  const inst = INSTRUMENTS[instrument] || INSTRUMENTS.ES;
  const currentDP = decisionPoints[dpIdx];

  // auto-reveal animation
  function startReveal() {
    if (playRef.current) return;
    playRef.current = setInterval(() => {
      setRevealTo(prev => {
        const next = prev + 1;
        // stop when we reach the next decision point bar or end
        if (currentDP && next > currentDP.barIndex) {
          clearInterval(playRef.current);
          playRef.current = null;
          setPhase("decision");
          return currentDP.barIndex + 1;
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
    setDecisionLog(log => [...log, { barIndex: currentDP.barIndex, selected: idx, correct }]);
    decisionsRef.current.push({ barIndex: currentDP.barIndex, selected: idx, correct });

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

  function finishDrill(finalCorrect) {
    const events = recordSession({ correct: finalCorrect, total: decisionPoints.length, completedType: "drill" });
    markDrillComplete(`${branch.id}-drill`);
    setLastDrillReview({
      branchId: branch.id,
      branchTitle: branch.branchTitle,
      instrument,
      decisions: decisionPoints.map((dp, i) => ({
        barIndex: dp.barIndex,
        prompt: dp.prompt,
        options: dp.options,
        correct: dp.correct,
        selected: decisionsRef.current[i]?.selected ?? null,
        isCorrect: decisionsRef.current[i]?.correct ?? null,
      })),
      correctCount: finalCorrect,
      total: decisionPoints.length,
    });
    setPhase("done");
    const hypoth = { ...progress, completedDrills: [...(progress.completedDrills || []), `${branch.id}-drill`] };
    if (isBranchComplete(branch, hypoth) && !(progress.badges || []).includes(branch.id)) {
      unlockBadge(branch.id);
      setBranchCelebrate({ branchId: branch.id });
    } else {
      setShowCelebrate(true);
      setTimeout(() => setShowCelebrate(false), 2200);
    }
    void events;
  }

  function skipToDecision() {
    if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
    setRevealTo(currentDP.barIndex + 1);
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

      <CandleChart
        bars={bars}
        revealTo={revealTo}
        entryPrice={entryPrice}
        stopPrice={stopPrice}
        exitPrice={exitPrice}
        height={260}
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
      {phase === "decision" && currentDP && (
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
              <div className="font-mono text-2xl font-bold text-emerald-400">{correctCount}/{decisionPoints.length}</div>
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
            </div>
          )}
          <div className="mt-6 space-y-2">
            <Link to="/drill-coach" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-semibold text-white transition hover:bg-emerald-400">
              <Bot className="h-5 w-5" /> Review my mistakes
            </Link>
            <Link to={`/coach?branch=${branch.id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3.5 font-semibold text-slate-200 transition hover:bg-slate-700">
              <MessageCircle className="h-5 w-5" /> Reflect with AI coach
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