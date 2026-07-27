// Branch completion + milestone progress helpers.
// A branch is "complete" when every required lesson is done AND, for strategy
// branches, the chart-replay drill is done too. Pure functions over the
// progress object so they can run on a hypothetical (post-completion) state.

import { BRANCHES } from "./content";

export function isBranchComplete(branch, progress) {
  if (!branch) return false;
  const lessonIds = [];
  if (branch.introLesson) lessonIds.push(branch.introLesson.id);
  if (branch.units) for (const u of branch.units) lessonIds.push(u.id);
  const lessonsDone = lessonIds.every(id => (progress.completedLessons || []).includes(id));
  if (!lessonsDone) return false;
  if (branch.buildDrill) {
    return (progress.completedDrills || []).includes(`${branch.id}-drill`);
  }
  return true;
}

export function completedBranchIds(progress) {
  return BRANCHES.filter(b => isBranchComplete(b, progress)).map(b => b.id);
}

export function branchUnitCount(branch) {
  let n = 0;
  if (branch.introLesson) n++;
  if (branch.units) n += branch.units.length;
  if (branch.buildDrill) n++;
  return n;
}

export function branchDoneCount(branch, progress) {
  let n = 0;
  if (branch.introLesson && (progress.completedLessons || []).includes(branch.introLesson.id)) n++;
  if (branch.units) for (const u of branch.units) if ((progress.completedLessons || []).includes(u.id)) n++;
  if (branch.buildDrill && (progress.completedDrills || []).includes(`${branch.id}-drill`)) n++;
  return n;
}