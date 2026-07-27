import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, ChevronRight, Brain, ArrowRight, BookOpen, BarChart3 } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import FeedbackFlash from "@/components/contango/FeedbackFlash";
import { CelebrationOverlay } from "@/components/contango/FeedbackFlash";
import MindsetMeter from "@/components/contango/MindsetMeter";
import { useContango } from "@/contexts/ContangoContext";
import { allUnitsFlat, DIARY_ENTRIES } from "@/lib/content";
import CandleChart from "@/components/contango/CandleChart";
import { buildLessonChart } from "@/lib/lessonCharts";

// Lesson screen — a stage-based learning engine.
// Stages interleave teaching ("teach"), reflective psychology ("emotion"),
// and assessment ("quiz"). Psychology lessons run in "focus mode" with a
// live mindset meter. Units without a `stages` array fall back to the
// legacy info → questions flow (so existing lessons keep working).
export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { recordSession, markLessonComplete, progress, update, adjustMindset, unlockDiary } = useContango();

  const entry = allUnitsFlat().find(e => e.unit.id === lessonId);
  const unit = entry?.unit;
  const branch = entry?.branch;

  const [stageIdx, setStageIdx] = useState(0);
  const [selected, setSelected] = useState(null);       // quiz selected option index
  const [emotionChoice, setEmotionChoice] = useState(null); // emotion chosen option index
  const [flash, setFlash] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [emotionXp, setEmotionXp] = useState(0);
  const [phase, setPhase] = useState("stages");          // stages | summary
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [unlockedDiaryId, setUnlockedDiaryId] = useState(null);

  // Build the stage list. Hooks must run before any conditional return.
  const stages = useMemo(() => {
    if (!unit) return [];
    if (unit.stages) return unit.stages;
    const s = [{ type: "teach", heading: unit.title, body: unit.info }];
    const chart = buildLessonChart(unit.id);
    if (chart) s.push(chart);
    for (const q of (unit.questions || [])) s.push({ type: "quiz", ...q });
    return s;
  }, [unit]);

  const isPsych = branch?.id === "risk-psych";

  if (!entry) {
    return <ScreenShell><div className="text-slate-400">Lesson not found.</div></ScreenShell>;
  }

  const stage = stages[stageIdx];
  const totalXp = correctCount * 8 + (quizTotal > 0 && correctCount === quizTotal ? 12 : 0) + emotionXp;

  function advance() {
    setSelected(null);
    setEmotionChoice(null);
    if (stageIdx + 1 < stages.length) {
      setStageIdx(stageIdx + 1);
    } else {
      finish();
    }
  }

  function answerQuiz(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === stage.correct;
    setFlash(correct ? "correct" : "wrong");
    setQuizTotal(t => t + 1);
    if (correct) setCorrectCount(c => c + 1);
    if (isPsych) adjustMindset(correct ? 4 : -6);
  }

  function chooseEmotion(idx) {
    if (emotionChoice !== null) return;
    setEmotionChoice(idx);
    const opt = stage.options[idx];
    setEmotionXp(x => x + (stage.xp ?? 2));
    if (isPsych && typeof opt.mindsetDelta === "number") adjustMindset(opt.mindsetDelta);
  }

  function finish() {
    const events = recordSession({ correct: correctCount, total: quizTotal, completedType: "lesson" });
    markLessonComplete(unit.id);
    // add emotion-engagement XP on top of the session XP
    if (emotionXp > 0) {
      update(prev => ({ ...prev, xp: (prev.xp || 0) + emotionXp, dailyXp: (prev.dailyXp || 0) + emotionXp }));
    }
    const diary = (DIARY_ENTRIES || []).find(d => d.unlockUnit === unit.id);
    if (diary && !(progress.diaryUnlocked || []).includes(diary.id)) {
      unlockDiary(diary.id);
      setUnlockedDiaryId(diary.id);
    }
    setPhase("summary");
    setShowCelebrate(true);
    setTimeout(() => setShowCelebrate(false), 2200);
    void events;
  }

  return (
    <ScreenShell showStats={false} backTo="/" title={branch.branchTitle}>
      <FeedbackFlash state={flash} />
      <CelebrationOverlay show={showCelebrate} xpGained={totalXp} onClose={() => setShowCelebrate(false)} />

      {/* Focus-mode banner for psychology lessons */}
      {isPsych && phase === "stages" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-2.5">
          <Brain className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">Focus session · psychology</span>
        </div>
      )}

      {phase === "stages" && stage && (
        <div className={isPsych ? "relative" : ""} style={{ animation: "fadeIn 0.3s ease-out" }}>
          {/* progress bar */}
          <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${(stageIdx / stages.length) * 100}%` }} />
          </div>
          <p className="mb-3 text-xs text-slate-500">Step {stageIdx + 1} of {stages.length}</p>

          {/* mindset meter for psychology lessons */}
          {isPsych && (
            <div className="mb-5">
              <MindsetMeter value={progress.mindset ?? 75} />
            </div>
          )}

          {/* ---- TEACH stage ---- */}
          {stage.type === "teach" && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Learn</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-100">{stage.heading}</h1>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-300">{stage.body}</p>
              <button
                onClick={advance}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* ---- EMOTION stage (reflective psychology) ---- */}
          {stage.type === "emotion" && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sky-400">
                <Brain className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Psychology pulse</span>
              </div>
              <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-sm leading-relaxed text-slate-200">{stage.scenario}</p>
              </div>
              <h2 className="font-display text-lg font-semibold text-slate-100">{stage.prompt}</h2>
              <div className="mt-4 space-y-3">
                {stage.options.map((opt, i) => {
                  const chosen = emotionChoice === i;
                  let cls = "border-slate-800 bg-slate-900 hover:border-slate-600";
                  if (emotionChoice !== null) {
                    cls = chosen ? "border-sky-500 bg-sky-500/10" : "border-slate-800 bg-slate-900 opacity-50";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => chooseEmotion(i)}
                      disabled={emotionChoice !== null}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${cls}`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="flex-1 text-sm text-slate-200">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Coach's note reveals after a choice */}
              {emotionChoice !== null && (
                <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sky-400">Tango's note</p>
                  <p className="text-sm leading-relaxed text-slate-200">{stage.options[emotionChoice].note}</p>
                  {typeof stage.options[emotionChoice].mindsetDelta === "number" && (
                    <p className={`mt-2 text-xs font-medium ${stage.options[emotionChoice].mindsetDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      Mindset {stage.options[emotionChoice].mindsetDelta >= 0 ? "+" : ""}{stage.options[emotionChoice].mindsetDelta}
                    </p>
                  )}
                  <button
                    onClick={advance}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 font-semibold text-white transition hover:bg-sky-400"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---- CHART stage (practice reading a real chart) ---- */}
          {stage.type === "chart" && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Read the chart</span>
              </div>
              <CandleChart
                bars={stage.bars}
                revealTo={stage.revealTo ?? stage.bars.length}
                entryPrice={selected !== null ? stage.entryPrice : null}
                stopPrice={selected !== null ? stage.stopPrice : null}
                height={220}
              />
              <p className="mt-4 font-medium text-slate-100">{stage.prompt}</p>
              <div className="mt-3 space-y-3">
                {stage.options.map((opt, i) => {
                  const isCorrect = i === stage.correct;
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
              {selected !== null && stage.note && (
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Coach's note</p>
                  <p className="text-sm leading-relaxed text-slate-300">{stage.note}</p>
                </div>
              )}
              {selected !== null && (
                <button onClick={advance} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300">
                  {stageIdx + 1 < stages.length ? "Continue" : "Finish"} <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* ---- QUIZ stage ---- */}
          {stage.type === "quiz" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-100">{stage.q}</h2>
              <div className="mt-5 space-y-3">
                {stage.options.map((opt, i) => {
                  const isCorrect = i === stage.correct;
                  const isSelected = i === selected;
                  let cls = "border-slate-800 bg-slate-900 hover:border-slate-600";
                  if (selected !== null) {
                    if (isCorrect) cls = "border-emerald-500 bg-emerald-500/10";
                    else if (isSelected) cls = "border-rose-500 bg-rose-500/10";
                    else cls = "border-slate-800 bg-slate-900 opacity-50";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => answerQuiz(i)}
                      disabled={selected !== null}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${cls}`}
                    >
                      <span className="text-sm text-slate-200">{opt}</span>
                      {selected !== null && isCorrect && <Check className="h-5 w-5 text-emerald-400" />}
                      {selected !== null && isSelected && !isCorrect && <X className="h-5 w-5 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Coach's note after answering */}
              {selected !== null && stage.notes && stage.notes[selected] && (
                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">Coach's note</p>
                  <p className="text-sm leading-relaxed text-slate-300">{stage.notes[selected]}</p>
                </div>
              )}
              {selected !== null && (
                <button
                  onClick={advance}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  {stageIdx + 1 < stages.length ? "Continue" : "Finish"} <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
              <div className="font-mono text-2xl font-bold text-emerald-400">{quizTotal > 0 ? `${correctCount}/${quizTotal}` : "—"}</div>
              <div className="text-xs text-slate-500">correct</div>
            </div>
          </div>

          {isPsych && (
            <div className="mx-auto mt-4 max-w-xs">
              <MindsetMeter value={progress.mindset ?? 75} />
            </div>
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