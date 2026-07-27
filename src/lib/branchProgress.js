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

// Next incomplete lesson across the curriculum (foundation first, then any
// branch intro / unit). Used by the dashboard's Continue button and by the
// reminder snapshot so emails can name the next step.
export function findNextLesson(progress) {
  const foundation = BRANCHES.find(b => b.id === "foundation");
  if (foundation && foundation.units) {
    for (const u of foundation.units) {
      if (!(progress.completedLessons || []).includes(u.id)) return { id: u.id, title: u.title };
    }
  }
  // Honor the onboarding "why" choice: after Foundation, surface the
  // recommended branch next instead of strict curriculum order.
  const recId = progress.recommendedBranch;
  const rec = recId && BRANCHES.find(b => b.id === recId);
  if (rec) {
    if (rec.introLesson && !(progress.completedLessons || []).includes(rec.introLesson.id)) {
      return { id: rec.introLesson.id, title: rec.branchTitle };
    }
    if (rec.units) {
      for (const u of rec.units) {
        if (!(progress.completedLessons || []).includes(u.id)) return { id: u.id, title: u.title };
      }
    }
  }
  for (const b of BRANCHES) {
    if (b.introLesson && !(progress.completedLessons || []).includes(b.introLesson.id)) {
      return { id: b.introLesson.id, title: b.branchTitle };
    }
    if (b.units) {
      for (const u of b.units) {
        if (!(progress.completedLessons || []).includes(u.id)) return { id: u.id, title: u.title };
      }
    }
  }
  return null;
}