// Branch mastery + staleness, Duolingo-style. Pure functions over the
// progress object so they run on the live state.
//
// - reps: how many times a branch has been "finished" (strategy branches
//   accrue a rep per drill run via logDrill; core branches get one rep the
//   first time all their lessons are done).
// - staleness: days since the branch was last touched; finished branches
//   that go untouched too long "crack" and ask to be reviewed.

import { BRANCHES } from "./content";
import { isBranchComplete, branchDoneCount, branchUnitCount } from "./branchProgress";

const DAY = 86400000;

// A finished branch starts to crack after this many days untouched, and is
// fully cracked by CRACK_FULL_DAYS.
export const CRACK_DAYS = 7;
export const CRACK_FULL_DAYS = 21;

// Map a lesson/unit id back to the branch it belongs to.
export function branchForLessonId(lessonId) {
  for (const b of BRANCHES) {
    if (b.introLesson && b.introLesson.id === lessonId) return b;
    if (b.units) for (const u of b.units) if (u.id === lessonId) return b;
  }
  return null;
}

export function branchReps(progress, branchId) {
  return (progress?.branchReps || {})[branchId] || 0;
}

// Mastery levels by completion reps:
// 0 = not finished, 1 = bronze, 2 = silver, 3 = gold.
export function masteryLevel(progress, branchId) {
  const reps = branchReps(progress, branchId);
  if (reps >= 4) return 3;
  if (reps >= 2) return 2;
  if (reps >= 1) return 1;
  return 0;
}

export function lastTouched(progress, branchId) {
  return (progress?.branchLastTouched || {})[branchId] || null;
}

export function daysSinceTouched(progress, branchId) {
  const t = lastTouched(progress, branchId);
  if (!t) return null;
  return (Date.now() - new Date(t).getTime()) / DAY;
}

// One structured snapshot the skill-tree node renders from.
export function branchMasteryStatus(progress, branch) {
  const reps = branchReps(progress, branch.id);
  const level = masteryLevel(progress, branch.id);
  const done = branchDoneCount(branch, progress);
  const total = branchUnitCount(branch);
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const days = daysSinceTouched(progress, branch.id);
  const touched = lastTouched(progress, branch.id) != null;
  const finished = isBranchComplete(branch, progress);
  let cracked = false;
  let crackIntensity = 0;
  if (finished && days != null && days >= CRACK_DAYS) {
    cracked = true;
    crackIntensity = Math.min(1, (days - CRACK_DAYS) / Math.max(1, CRACK_FULL_DAYS - CRACK_DAYS));
  }
  return { reps, level, done, total, pct, days, touched, finished, cracked, crackIntensity };
}