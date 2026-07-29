// Free-tier Practice allowance. Free users get a small daily quota of
// practice drills; Premium is unlimited. Hearts are never involved here -
// practice is the sandbox, hearts live on the graded curriculum path.

import { serverToday } from "./gamification";
import { isPremium } from "./subscription";

export const FREE_PRACTICE_DAILY = 3;

// Resolved allowance for the current server-anchored local day. The reset
// grant itself is handled centrally in ContangoContext (and only when the
// server offset is known, fail closed); this reader just reports used/left
// against the day the reset wrote into practiceResetDate.
export function practiceStatus(progress, offset) {
  const today = serverToday(offset);
  const premium = isPremium(progress);
  const used = (!premium && progress.practiceResetDate === today)
    ? (progress.practiceUsedToday || 0)
    : 0;
  const left = premium ? Infinity : Math.max(0, FREE_PRACTICE_DAILY - used);
  return { premium, used, left, today, exhausted: !premium && left === 0 };
}