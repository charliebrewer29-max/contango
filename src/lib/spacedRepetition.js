// Spaced-repetition (SM-2) for Practice mode.
// Reviews chart patterns and concept quizzes the learner has already completed,
// resurfacing each card on an expanding schedule so mastery compounds.

import { allUnitsFlat, BRANCHES } from "./content";
import { buildLessonChart } from "./lessonCharts";

const DAY = 86400000;

// Update a card's SR state after a review grade.
// grade: 'again' (wrong) | 'good' (correct) | 'easy' (correct, boost)
export function scheduleCard(prev, grade) {
  let ease = prev?.ease ?? 2.5;
  let interval = prev?.interval ?? 0;
  let reps = prev?.reps ?? 0;
  let lapses = prev?.lapses ?? 0;

  if (grade === "again") {
    reps = 0;
    interval = 0;                 // due again this session
    lapses += 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    if (grade === "easy") ease = Math.min(3.2, ease + 0.15);
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.max(1, Math.round(interval * ease * (grade === "easy" ? 1.3 : 1)));
  }
  return { ease, interval, reps, lapses, due: Date.now() + interval * DAY, lastGrade: grade };
}

// A card is due if it has never been reviewed or its due time has passed.
export function isDue(card, now = Date.now()) {
  return !card || card.due == null || card.due <= now;
}

export function nextDueMs(cards, now = Date.now()) {
  let min = Infinity;
  for (const c of Object.values(cards || {})) {
    if (c?.due != null && c.due > now && c.due < min) min = c.due;
  }
  return min === Infinity ? null : min - now;
}

// Build the pool of reviewable cards from content the learner has already
// completed: concept quizzes + lesson chart drills + completed-branch drills.
export function buildPracticeCatalog(progress) {
  const completed = progress?.completedLessons || [];
  const completedDrills = progress?.completedDrills || [];
  const cards = [];

  for (const { branch, unit } of allUnitsFlat()) {
    if (!completed.includes(unit.id)) continue;

    if (unit.questions) {
      unit.questions.forEach((q, qi) => {
        cards.push({
          id: `concept:${unit.id}:${qi}`,
          type: "concept",
          title: unit.title,
          branchColor: branch.color,
          question: q.q,
          options: q.options,
          correct: q.correct,
        });
      });
    }

    const chart = buildLessonChart(unit.id);
    if (chart) {
      cards.push({
        id: `chart:${unit.id}`,
        type: "chart",
        title: unit.title,
        branchColor: branch.color,
        instrument: chart.instrument,
        bars: chart.bars,
        revealTo: chart.revealTo,
        entryPrice: chart.entryPrice,
        stopPrice: chart.stopPrice,
        prompt: chart.prompt,
        options: chart.options,
        correct: chart.correct,
        note: chart.note,
      });
    }
  }

  for (const b of BRANCHES) {
    if (b.buildDrill && completedDrills.includes(`${b.id}-drill`)) {
      const scenario = b.buildDrill();
      const dp = scenario.decisionPoints?.[0];
      if (dp) {
        cards.push({
          id: `drill:${b.id}`,
          type: "chart",
          title: `${b.branchTitle} pattern`,
          branchColor: b.color,
          instrument: scenario.instrument,
          bars: scenario.bars,
          revealTo: dp.barIndex + 1,
          entryPrice: dp.barIndex >= 22 ? scenario.bars[dp.barIndex].close : null,
          prompt: dp.prompt,
          options: dp.options,
          correct: dp.correct,
        });
      }
    }
  }

  return cards;
}