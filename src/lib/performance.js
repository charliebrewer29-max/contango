// Per-concept performance: derives strengths and weak spots from the accuracy
// stats recorded on every graded lesson/chart answer. Pure functions over the
// progress object so they can feed Practice (adaptive ordering) and Insights.

import { allUnitsFlat } from "./content";

const UNIT_MAP = {};
const UNIT_BRANCH = {};
for (const { branch, unit } of allUnitsFlat()) {
  UNIT_MAP[unit.id] = unit;
  UNIT_BRANCH[unit.id] = branch;
}

export function unitAccuracy(progress, unitId) {
  const s = (progress?.stats || {})[unitId];
  if (!s || !s.seen) return null;
  return s.correct / s.seen;
}

// Concepts with enough attempts to judge, sorted weakest-first.
export function weakConcepts(progress, minSeen = 2) {
  const out = [];
  for (const [id, s] of Object.entries(progress?.stats || {})) {
    if (!s || !s.seen || s.seen < minSeen) continue;
    const unit = UNIT_MAP[id];
    if (!unit) continue;
    out.push({
      id,
      title: unit.title,
      color: UNIT_BRANCH[id]?.color,
      accuracy: s.correct / s.seen,
      seen: s.seen,
      correct: s.correct,
    });
  }
  return out.sort((a, b) => a.accuracy - b.accuracy);
}

export function strongConcepts(progress, minSeen = 2) {
  return weakConcepts(progress, minSeen).slice().reverse();
}