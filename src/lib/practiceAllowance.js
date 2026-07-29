// Free-tier Practice allowance. Free users get a small daily quota of
// practice drills; Premium is unlimited. Hearts are never involved here -
// practice is the sandbox, hearts live on the graded curriculum path.

import { todayStr } from "./gamification";
import { isPremium } from "./subscription";

export const FREE_PRACTICE_DAILY = 3;

// Resolved allowance for the current local day. When the date has rolled
// over (or the field is uninitialized), used reads as 0 until the caller
// persists the reset.
export function practiceStatus(progress) {
  const today = todayStr();
  const premium = isPremium(progress);
  const used = (!premium && progress.practiceResetDate === today)
    ? (progress.practiceUsedToday || 0)
    : 0;
  const left = premium ? Infinity : Math.max(0, FREE_PRACTICE_DAILY - used);
  return { premium, used, left, today, exhausted: !premium && left === 0 };
}