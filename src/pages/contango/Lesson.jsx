import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, ChevronRight, BookOpen } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import FeedbackFlash from "@/components/contango/FeedbackFlash";
import { CelebrationOverlay } from "@/components/contango/FeedbackFlash";
import { useContango } from "@/contexts/ContangoContext";
import { allUnitsFlat, findBranch } from "@/lib/content";

// Lesson screen: info card → question sequence → summary.
// Instant feedback on each answer (green flash / red shake), correct answer highlighted.
export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { recordSession, markLessonComplete } = useContango();

  const entry = allUnitsFlat().find(e => e.unit.id === lessonId);
  const [phase, setPhase] = useState("info"); // info | questions | summary
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [flash, setFlash] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);

  if (!entry) {
    return <ScreenShell><div className="text-slate-400">Lesson not found.</div></ScreenShell>;
  }
  const { branch, unit } = entry;
  const questions = unit.questions || [];

  function answerQuestion(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[qIdx].correct;
    setFlash(correct ? "correct" : "wrong");
    if (correct) setCorrectCount(c => c + 1);
    setTimeout(() => {
      setFlash(null);
      if (qIdx + 1 < questions.length) {
        setQIdx(qIdx + 1);
        setSelected(null);
      } else {
        finishLesson(correct ? correctCount + 1 : correctCount);
      }
    }, 900);
  }

  function finishLesson(finalCorrect) {
    const events = recordSession({ correct: finalCorrect, total: questions.length, completedType: "lesson" });
    markLessonComplete(unit.id);
    const xpEvent = events.find(e => e.type === "xp");
    const milestone = events.find(e => e.type === "streak-milestone");
    setPhase("summary");
    setShowCelebrate(true);
    setTimeout(() => setShowCelebrate(false), 2200);
    void milestone;
  }

  return (
    <ScreenShell showStats={false} backTo="/" title={branch.branchTitle}>
      <FeedbackFlash state={flash} />
      <CelebrationOverlay show={showCelebrate} xpGained={(correctCount * 8) + (correctCount === questions.length ? 12 : 0)} onClose={() => setShowCelebrate(false)} />

      {phase === "info" && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <div className="mb-1 flex items-center gap-2 text-amber-400">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Lesson</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-100">{unit.title}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">{unit.info}</p>
          <button
            onClick={() => { setPhase("questions"); setSelected(null); }}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Start questions <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {phase === "questions" && (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          {/* progress bar */}
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${((qIdx) / questions.length) * 100}%` }} />
          </div>
          <p className="mb-2 text-xs text-slate-500">Question {qIdx + 1} of {questions.length}</p>
          <h2 className="font-display text-xl font-semibold text-slate-100">{questions[qIdx].q}</h2>
          <div className="mt-5 space-y-3">
            {questions[qIdx].options.map((opt, i) => {
              const isCorrect = i === questions[qIdx].correct;
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
                  onClick={() => answerQuestion(i)}
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
              <div className="font-mono text-2xl font-bold text-sky-400">+{correctCount * 8 + (correctCount === questions.length ? 12 : 0)}</div>
              <div className="text-xs text-slate-500">XP earned</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="font-mono text-2xl font-bold text-emerald-400">{correctCount}/{questions.length}</div>
              <div className="text-xs text-slate-500">correct</div>
            </div>
          </div>
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