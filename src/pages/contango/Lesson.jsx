import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Check, X, ChevronRight, ChevronLeft, Brain, BookOpen, BarChart3, Move, Eye, Heart, Target, Sparkles, Crown } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import OutOfHearts from "@/components/contango/OutOfHearts";
import FeedbackFlash from "@/components/contango/FeedbackFlash";
import { CelebrationOverlay } from "@/components/contango/FeedbackFlash";
import BranchBadgeCelebration from "@/components/contango/BranchBadgeCelebration";
import LessonWidget from "@/components/contango/LessonWidgets";
import { isBranchComplete } from "@/lib/branchProgress";
import { syncReminderSnapshot, buildSnapshot } from "@/lib/reminders";
import MindsetMeter from "@/components/contango/MindsetMeter";
import { useContango } from "@/contexts/ContangoContext";
import { allUnitsFlat, DIARY_ENTRIES } from "@/lib/content";
import { canAccessLessonId } from "@/lib/subscription";
import CandleChart from "@/components/contango/CandleChart";
import { buildLessonChart } from "@/lib/lessonCharts";

// Lesson engine - two phases.
// LEARN: teach / emotion / widget / reveal. No scoring, no hearts, free
// navigation (back + forward), tap through at your own pace. Learning is a
// safe space - the moment it costs a heart, people rush it to get to the test.
// ANSWER: quiz / chart. Graded, forward-only, hearts on the line. Only the
// proving is scored.
const LEARN_TYPES = new Set(["teach", "text", "emotion", "widget", "reveal", "takeaway"]);

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { recordSession, markLessonComplete, progress, update, adjustMindset, unlockDiary, unlockBadge, recordAnswer, reviewCard, loseHeart } = useContango();

  const entry = allUnitsFlat().find(e => e.unit.id === lessonId);
  const unit = entry?.unit;
  const branch = entry?.branch;

  // Build the full stage list (explicit stages, or legacy info → chart → quiz).
  const stages = useMemo(() => {
    if (!unit) return [];
    // Canonical schema: cards (learn) + optional chart + questions (answer).
    if (unit.cards) {
      const s = [...unit.cards];
      const chart = buildLessonChart(unit.id);
      if (chart) s.push(chart);
      for (const q of (unit.questions || [])) s.push({ type: "quiz", ...q });
      return s;
    }
    if (unit.stages) return unit.stages; // legacy fallback
    const s = [{ type: "teach", heading: unit.title, body: unit.info }];
    const chart = buildLessonChart(unit.id);
    if (chart) s.push(chart);
    for (const q of (unit.questions || [])) s.push({ type: "quiz", ...q });
    return s;
  }, [unit]);

  // Partition: learn first, prove after.
  const learnStages = useMemo(() => stages.filter(s => LEARN_TYPES.has(s.type)), [stages]);
  const answerStages = useMemo(() => stages.filter(s => s.type === "quiz" || s.type === "chart"), [stages]);

  const [phase, setPhase] = useState(() => (learnStages.length ? "learn" : "gate"));
  const [learnIdx, setLearnIdx] = useState(0);
  const [answerIdx, setAnswerIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [emotionChoice, setEmotionChoice] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [flash, setFlash] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [emotionXp, setEmotionXp] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [branchCelebrate, setBranchCelebrate] = useState(null);
  const [unlockedDiaryId, setUnlockedDiaryId] = useState(null);
  const [out, setOut] = useState(false);

  const isPsych = branch?.id === "risk-psych";

  if (!entry) {
    return <ScreenShell><div className="text-slate-400">Lesson not found.</div></ScreenShell>;
  }

  if (!canAccessLessonId(lessonId, progress)) {
  return (
    <ScreenShell showStats={false} backTo={branch ? `/branch/${branch.id}` : "/"} title={unit?.title || "Lesson"}>
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
        <Crown className="mx-auto mb-3 h-10 w-10 text-amber-400" />
        <h2 className="font-display text-xl font-bold text-slate-100">A Premium instrument</h2>
        <p className="mt-2 text-sm text-slate-400">{unit?.title} is part of Contango Premium. Free learners can learn ES and NQ; Crude, Gold, and their Micros open with Premium.</p>
        <Link to="/paywall" className="mt-5 inline-flex rounded-xl bg-amber-400 px-6 py-3 font-display font-bold text-slate-950">Start free trial</Link>
      </div>
    </ScreenShell>
  );
  }

  // Hearts gate: the graded (ANSWER) path is blocked at 0 hearts. The LEARN
  // phase stays accessible - it never costs a heart. If a wrong answer empties
  // the last heart mid-lesson, `out` flips and we show the same screen with the
  // "last heart" headline.
  if (out || (phase === "gate" && (progress.hearts ?? 5) <= 0)) {
  return (
    <ScreenShell showStats={false} backTo="/" title={branch.branchTitle}>
      <OutOfHearts variant={out ? "last" : "depleted"} />
    </ScreenShell>
  );
  }

  const learnStage = learnStages[learnIdx];
  const answerStage = answerStages[answerIdx];
  const totalXp = correctCount * 8 + (quizTotal > 0 && correctCount === quizTotal ? 12 : 0) + emotionXp;

  // ---- LEARN navigation: free roam, can go back ----
  function learnNext() {
    setRevealed(false);
    setEmotionChoice(null);
    if (learnIdx + 1 < learnStages.length) setLearnIdx(learnIdx + 1);
    else if (answerStages.length === 0) finish();
    else setPhase("gate");
  }
  function learnBack() {
    setRevealed(false);
    setEmotionChoice(null);
    if (learnIdx > 0) setLearnIdx(learnIdx - 1);
  }

  // ---- ANSWER navigation: forward only, graded ----
  function answerNext() {
    setSelected(null);
    setFlash(null); // clear so the next correct answer re-triggers the sound
    if (answerIdx + 1 < answerStages.length) setAnswerIdx(answerIdx + 1);
    else finish();
  }

  function answerQuiz(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === answerStage.correct;
    setFlash(correct ? "correct" : "wrong");
    setQuizTotal(t => t + 1);
    if (correct) setCorrectCount(c => c + 1);
    if (isPsych) adjustMindset(correct ? 4 : -6);
    recordAnswer(unit.id, correct);
    if (!correct) {
      lapseRelevantCard(answerStage);
      // A wrong graded answer costs a heart. If that empties the last one, let
      // the feedback land, then award the XP earned so far (don't zero their
      // work) and stop - the lesson is NOT marked complete.
      const depleted = loseHeart();
      if (depleted) {
        setTimeout(() => {
          const earnedXp = correctCount * 8 + emotionXp;
          update(prev => ({ ...prev, xp: (prev.xp || 0) + earnedXp, dailyXp: (prev.dailyXp || 0) + earnedXp }));
          setOut(true);
        }, 1200);
      }
    }
  }

  // A miss marks the matching Practice card due now.
  function lapseRelevantCard(stage) {
    if (stage.type === "chart") {
      if (buildLessonChart(unit.id)) reviewCard(`chart:${unit.id}`, "again");
      return;
    }
    const qi = (unit.questions || []).findIndex(q => q.q === stage.q);
    if (qi >= 0) reviewCard(`concept:${unit.id}:${qi}`, "again");
  }

  function chooseEmotion(idx) {
    if (emotionChoice !== null) return;
    setEmotionChoice(idx);
    const opt = learnStage.options[idx];
    setEmotionXp(x => x + (learnStage.xp ?? 2));
    if (isPsych && typeof opt.mindsetDelta === "number") adjustMindset(opt.mindsetDelta);
  }

  function finish() {
    const events = recordSession({ correct: correctCount, total: quizTotal, completedType: "lesson" });
    markLessonComplete(unit.id);
    if (emotionXp > 0) {
      update(prev => ({ ...prev, xp: (prev.xp || 0) + emotionXp, dailyXp: (prev.dailyXp || 0) + emotionXp }));
    }
    const diary = (DIARY_ENTRIES || []).find(d => d.unlockUnit === unit.id);
    if (diary && !(progress.diaryUnlocked || []).includes(diary.id)) {
      unlockDiary(diary.id);
      setUnlockedDiaryId(diary.id);
    }
    setPhase("summary");
    const hypoth = { ...progress, completedLessons: [...(progress.completedLessons || []), unit.id] };
    if (branch && isBranchComplete(branch, hypoth) && !(progress.badges || []).includes(branch.id)) {
      unlockBadge(branch.id);
      setBranchCelebrate({ branchId: branch.id });
    } else {
      setShowCelebrate(true);
      setTimeout(() => setShowCelebrate(false), 2200);
    }
    syncReminderSnapshot(buildSnapshot({ ...progress, completedLessons: [...(progress.completedLessons || []), unit.id], xp: (progress.xp || 0) + totalXp, dailyXp: (progress.dailyXp || 0) + totalXp }));
    void events;
  }

  return (
    <ScreenShell showStats={false} backTo="/" title={branch.branchTitle}>
      <FeedbackFlash state={flash} />
      <CelebrationOverlay show={showCelebrate} xpGained={totalXp} onClose={() => setShowCelebrate(false)} />
      {branchCelebrate && (
        <BranchBadgeCelebration
          branchId={branchCelebrate.branchId}
          branchTitle={branch.branchTitle}
          xpGained={totalXp}
          onClose={() => setBranchCelebrate(null)}
        />
      )}

      {isPsych && (phase === "learn" || phase === "answer") && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-2.5">
          <Brain className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">Focus session · psychology</span>
        </div>
      )}

      {/* ============ LEARN PHASE ============ */}
      {phase === "learn" && learnStage && (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Learn · step {learnIdx + 1} of {learnStages.length}</span>
            <span className="text-[11px] text-slate-600">no hearts · go at your pace</span>
          </div>
          <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${((learnIdx + 1) / learnStages.length) * 100}%` }} />
          </div>

          {isPsych && (
            <div className="mb-5"><MindsetMeter value={progress.mindset ?? 75} /></div>
          )}

          {/* ---- TEXT / TEACH ---- */}
          {(learnStage.type === "teach" || learnStage.type === "text") && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Learn</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-100">{learnStage.heading}</h1>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-300">{learnStage.body}</p>
            </div>
          )}

          {/* ---- EMOTION (reflective psychology) ---- */}
          {learnStage.type === "emotion" && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sky-400">
                <Brain className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Psychology pulse</span>
              </div>
              <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-sm leading-relaxed text-slate-200">{learnStage.scenario}</p>
              </div>
              <h2 className="font-display text-lg font-semibold text-slate-100">{learnStage.prompt}</h2>
              <div className="mt-4 space-y-3">
                {learnStage.options.map((opt, i) => {
                  const chosen = emotionChoice === i;
                  let cls = "border-slate-800 bg-slate-900 hover:border-slate-600";
                  if (emotionChoice !== null) {
                    cls = chosen ? "border-sky-500 bg-sky-500/10" : "border-slate-800 bg-slate-900 opacity-50";
                  }
                  return (
                    <button key={i} onClick={() => chooseEmotion(i)} disabled={emotionChoice !== null}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${cls}`}>
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="flex-1 text-sm text-slate-200">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {emotionChoice !== null && (
                <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sky-400">Tango's note</p>
                  <p className="text-sm leading-relaxed text-slate-200">{learnStage.options[emotionChoice].note}</p>
                  {typeof learnStage.options[emotionChoice].mindsetDelta === "number" && (
                    <p className={`mt-2 text-xs font-medium ${learnStage.options[emotionChoice].mindsetDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      Mindset {learnStage.options[emotionChoice].mindsetDelta >= 0 ? "+" : ""}{learnStage.options[emotionChoice].mindsetDelta}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---- WIDGET (interactive: drag the number) ---- */}
          {learnStage.type === "widget" && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <Move className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Try it</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-100">{learnStage.heading}</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{learnStage.body}</p>
              <div className="mt-5"><LessonWidget stage={learnStage} /></div>
            </div>
          )}

          {/* ---- REVEAL (tap-to-recall before you're told) ---- */}
          {learnStage.type === "reveal" && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sky-400">
                <Eye className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Think first</span>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
                <p className="text-lg font-medium leading-relaxed text-slate-100">{learnStage.prompt}</p>
                {!revealed ? (
                  <button onClick={() => setRevealed(true)}
                    className="mt-5 w-full rounded-xl border border-sky-500/40 bg-sky-500/10 py-3 font-semibold text-sky-300 transition hover:bg-sky-500/20">
                    Reveal the answer
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Answer</p>
                    <p className="text-sm leading-relaxed text-slate-200">{learnStage.answer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- TAKEAWAY (the one sentence to remember, always last) ---- */}
          {learnStage.type === "takeaway" && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5" style={{ animation: "fadeIn 0.3s ease-out" }}>
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Takeaway</span>
              </div>
              <p className="font-display text-lg font-semibold leading-snug text-amber-100">{learnStage.body}</p>
            </div>
          )}

          {/* learn-phase nav: back + forward, free pacing */}
          <div className="mt-8 flex gap-3">
            <button onClick={learnBack} disabled={learnIdx === 0}
              className="flex items-center gap-1 rounded-xl border border-slate-700 px-4 py-3.5 font-medium text-slate-300 transition enabled:hover:border-slate-500 disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" /> Back
            </button>
            <button onClick={learnNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300">
              {learnIdx + 1 < learnStages.length ? "Continue" : answerStages.length ? "Ready for the test" : "Finish"} <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============ GATE ============ */}
      {phase === "gate" && (
        <div className="text-center" style={{ animation: "fadeIn 0.4s ease-out" }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30">
            <Target className="h-8 w-8 text-rose-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Ready to prove it?</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            The next cards are graded. You can't go back, and a wrong answer costs a heart. There's no timer - take your time on each one.
          </p>
          <button onClick={() => { setSelected(null); setPhase("answer"); }}
            className="mt-7 w-full rounded-xl bg-amber-400 py-4 font-display font-bold text-slate-950 transition hover:bg-amber-300">
            Start the test
          </button>
          {learnStages.length > 0 && (
            <button onClick={() => { setLearnIdx(learnStages.length - 1); setPhase("learn"); }}
              className="mt-2 w-full text-sm text-slate-500 hover:text-slate-300">
              Review the lesson first
            </button>
          )}
        </div>
      )}

      {/* ============ ANSWER PHASE ============ */}
      {phase === "answer" && answerStage && (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Test · {answerIdx + 1} of {answerStages.length}</span>
            <span className="flex items-center gap-1 text-rose-400">
              <Heart className="h-4 w-4 fill-rose-400" /> <span className="font-mono font-semibold">{progress.hearts ?? 5}</span>
            </span>
          </div>
          <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-rose-400 transition-all duration-500"
              style={{ width: `${((answerIdx) / answerStages.length) * 100}%` }} />
          </div>

          {/* ---- CHART (graded) ---- */}
          {answerStage.type === "chart" && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Read the chart</span>
              </div>
              <CandleChart
                bars={answerStage.bars}
                revealTo={answerStage.revealTo ?? answerStage.bars.length}
                entryPrice={selected !== null ? answerStage.entryPrice : null}
                stopPrice={selected !== null ? answerStage.stopPrice : null}
                height={220}
              />
              <p className="mt-4 font-medium text-slate-100">{answerStage.prompt}</p>
              <div className="mt-3 space-y-3">
                {answerStage.options.map((opt, i) => {
                  const isCorrect = i === answerStage.correct;
                  const isSelected = i === selected;
                  let cls = "border-slate-800 bg-slate-900 hover:border-slate-600";
                  if (selected !== null) {
                    if (isCorrect) cls = "border-emerald-500 bg-emerald-500/10";
                    else if (isSelected) cls = "border-rose-500 bg-rose-500/10";
                    else cls = "border-slate-800 bg-slate-900 opacity-50";
                  }
                  return (
                    <button key={i} onClick={() => answerQuiz(i)} disabled={selected !== null}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${cls}`}>
                      <span className="text-sm text-slate-200">{opt}</span>
                      {selected !== null && isCorrect && <Check className="h-5 w-5 text-emerald-400" />}
                      {selected !== null && isSelected && !isCorrect && <X className="h-5 w-5 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && answerStage.note && (
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Coach's note</p>
                  <p className="text-sm leading-relaxed text-slate-300">{answerStage.note}</p>
                </div>
              )}
            </div>
          )}

          {/* ---- QUIZ (graded) ---- */}
          {answerStage.type === "quiz" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-100">{answerStage.q}</h2>
              <div className="mt-5 space-y-3">
                {answerStage.options.map((opt, i) => {
                  const isCorrect = i === answerStage.correct;
                  const isSelected = i === selected;
                  let cls = "border-slate-800 bg-slate-900 hover:border-slate-600";
                  if (selected !== null) {
                    if (isCorrect) cls = "border-emerald-500 bg-emerald-500/10";
                    else if (isSelected) cls = "border-rose-500 bg-rose-500/10";
                    else cls = "border-slate-800 bg-slate-900 opacity-50";
                  }
                  return (
                    <button key={i} onClick={() => answerQuiz(i)} disabled={selected !== null}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${cls}`}>
                      <span className="text-sm text-slate-200">{opt}</span>
                      {selected !== null && isCorrect && <Check className="h-5 w-5 text-emerald-400" />}
                      {selected !== null && isSelected && !isCorrect && <X className="h-5 w-5 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && answerStage.notes && answerStage.notes[selected] && (
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">Coach's note</p>
                  <p className="text-sm leading-relaxed text-slate-300">{answerStage.notes[selected]}</p>
                </div>
              )}
            </div>
          )}

          {selected !== null && (
            <button onClick={answerNext}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300">
              {answerIdx + 1 < answerStages.length ? "Next" : "Finish"} <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* ============ SUMMARY ============ */}
      {phase === "summary" && (
        <div className="text-center" style={{ animation: "fadeIn 0.5s ease-out" }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Lesson complete</h1>
          <p className="mt-2 text-sm text-slate-400">{unit.title}</p>
          <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="font-mono text-2xl font-bold text-sky-400">+{totalXp}</div>
              <div className="text-xs text-slate-500">XP earned</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="font-mono text-2xl font-bold text-emerald-400">{quizTotal > 0 ? `${correctCount}/${quizTotal}` : "-"}</div>
              <div className="text-xs text-slate-500">correct</div>
            </div>
          </div>

          {isPsych && (
            <div className="mx-auto mt-4 max-w-xs"><MindsetMeter value={progress.mindset ?? 75} /></div>
          )}

          {unlockedDiaryId && (
            <div className="mx-auto mt-5 max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-left" style={{ animation: "fadeIn 0.5s ease-out" }}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">📖 New diary entry unlocked</p>
              <p className="font-display text-sm font-semibold text-slate-100">
                {(DIARY_ENTRIES || []).find(d => d.id === unlockedDiaryId)?.title}
              </p>
              <p className="mt-1 text-[13px] italic text-slate-300">
                “{(DIARY_ENTRIES || []).find(d => d.id === unlockedDiaryId)?.body}”
              </p>
            </div>
          )}

          <div className="mt-8 space-y-2">
            <button onClick={() => navigate("/")} className="w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300">
              Back to dashboard
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </ScreenShell>
  );
}