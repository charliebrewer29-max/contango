import React from "react";
import { Check, X } from "lucide-react";
import CandleChart from "@/components/contango/CandleChart";
import { INSTRUMENTS } from "@/lib/instruments";
import { scheduleCard } from "@/lib/spacedRepetition";

// One review card: chart (optional) + prompt + shuffled MCQ options.
// Presentational: reports the selected option up; parent computes the grade.
export default function PracticeReview({ card, selected, onSelect, onGrade, srCard }) {
  const answered = selected !== null;
  const isCorrect = answered && selected === card._correct;
  const inst = INSTRUMENTS[card.instrument] || null;
  const wrong = answered && !isCorrect;
  const fmtInterval = (grade) => {
    const n = scheduleCard(srCard, grade).interval;
    return n <= 0 ? "soon" : `${n}d`;
  };

  return (
    <div className="space-y-4" style={{ animation: "fadeIn 0.3s ease-out" }}>
      {card.type === "chart" && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono font-semibold text-slate-300">{card.instrument}</span>
            {inst && <span>{inst.name}</span>}
          </div>
          <CandleChart
            bars={card.bars}
            revealTo={card.revealTo ?? card.bars.length}
            entryPrice={card.entryPrice}
            stopPrice={card.stopPrice}
            height={220}
          />
        </div>
      )}

      <div>
        {card.type === "concept" && (
          <span className="mb-1 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Concept recall
          </span>
        )}
        <p className="font-display text-base font-semibold text-slate-100">
          {card.type === "concept" ? card.question : card.prompt}
        </p>
      </div>

      <div className="space-y-2">
        {card._options.map((opt, i) => {
          const isAns = i === selected;
          const isRight = i === card._correct;
          let cls = "border-slate-700 bg-slate-900 hover:border-slate-500";
          if (answered) {
            if (isRight) cls = "border-emerald-500 bg-emerald-500/10";
            else if (isAns) cls = "border-rose-500 bg-rose-500/10";
            else cls = "border-slate-800 bg-slate-900 opacity-50";
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => onSelect(i)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition ${cls}`}
            >
              <span className="text-slate-200">{opt}</span>
              {answered && isRight && <Check className="h-4 w-4 text-emerald-400" />}
              {answered && isAns && !isRight && <X className="h-4 w-4 text-rose-400" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm" style={{ animation: "fadeIn 0.25s ease-out" }}>
          <div className={`mb-1 font-display font-semibold ${isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
            {isCorrect ? "Correct" : "Not quite"}
          </div>
          {card.note && <p className="text-slate-300">{card.note}</p>}
          {!card.note && !isCorrect && (
            <p className="text-slate-400">The right answer is highlighted above.</p>
          )}
        </div>
      )}

      {answered && (
        <div className={wrong ? "grid grid-cols-1 gap-2" : "grid grid-cols-3 gap-2"}>
          <GradeBtn label="Again" hint={fmtInterval("again")} tone="rose" onClick={() => onGrade("again")} />
          {!wrong && <GradeBtn label="Good" hint={fmtInterval("good")} tone="emerald" onClick={() => onGrade("good")} />}
          {!wrong && <GradeBtn label="Easy" hint={fmtInterval("easy")} tone="sky" onClick={() => onGrade("easy")} />}
        </div>
      )}

      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

function GradeBtn({ label, hint, tone, onClick }) {
  const tones = {
    rose: "border-rose-500/50 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
    emerald: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
    sky: "border-sky-500/50 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20",
  };
  return (
    <button onClick={onClick} className={`flex flex-col items-center rounded-xl border py-3 font-display font-bold transition ${tones[tone]}`}>
      <span className="text-sm">{label}</span>
      <span className="font-mono text-[11px] opacity-70">{hint}</span>
    </button>
  );
}