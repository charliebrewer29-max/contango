// Gamification engine — XP / streak / hearts (spec Section 6)

import { STREAK_REWARDS } from "./streakRewards";

export const MAX_HEARTS = 5;
export const XP_PER_CORRECT = 8;
export const XP_PER_LESSON_COMPLETE = 12;
export const XP_PER_DRILL_COMPLETE = 15;
export const XP_PER_COACH_REFLECTION = 5;
export const XP_PER_PRACTICE_REVIEW = 5;

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db - da) / 86400000);
}

// Apply progress after a lesson/drill session.
// Returns updated progress + events for the UI (celebration, streak, hearts lost).
export function applyProgress(progress, { correct, total, completedType }) {
  const next = { ...progress };
  const events = [];
  let xpGained = 0;
  let heartsLost = 0;

  if (completedType === "lesson") {
    const wrong = total - correct;
    heartsLost = wrong;
    xpGained = correct * XP_PER_CORRECT;
    if (correct === total) xpGained += XP_PER_LESSON_COMPLETE;
  } else if (completedType === "drill") {
    const wrong = total - correct;
    heartsLost = wrong;
    xpGained = correct * XP_PER_CORRECT + XP_PER_DRILL_COMPLETE;
  } else if (completedType === "practice") {
    // spaced-repetition reviews: earn XP per correct, no hearts lost (review is safe)
    xpGained = correct * XP_PER_PRACTICE_REVIEW;
  }

  next.xp = (next.xp || 0) + xpGained;
  next.hearts = Math.max(0, (next.hearts || MAX_HEARTS) - heartsLost);

  // streak: only credit on completion of a real lesson/drill
  if (completedType) {
    const today = todayStr();
    const last = next.lastActiveDate;
    if (last !== today) {
      const gap = last ? daysBetween(last, today) : 0;
      if (gap === 1) {
        next.streak = (next.streak || 0) + 1;
      } else if (gap > 1) {
        // streak broke
        if ((next.streak || 0) >= 30) {
          events.push({ type: "streak-revival-available", lostStreak: next.streak });
        } else {
          events.push({ type: "streak-broken", lostStreak: next.streak });
        }
        next.streak = 1;
        events.push({ type: "streak-new-day" });
      } else {
        // first ever or same-day gap
        if (!next.streak) {
          next.streak = 1;
          events.push({ type: "streak-new-day" });
        }
      }
      next.lastActiveDate = today;
    }

    // daily goal progress
    next.dailyXp = next.lastActiveDate === today ? (next.dailyXp || 0) + xpGained : xpGained;

    // rolling daily history for Insights charts (one entry per day, last 30 days)
    const hist = Array.isArray(next.history) ? [...next.history] : [];
    const snap = { date: today, xp: next.xp, dailyXp: next.dailyXp, streak: next.streak };
    const hi = hist.findIndex(h => h.date === today);
    if (hi >= 0) hist[hi] = snap; else hist.push(snap);
    if (hist.length > 30) hist.splice(0, hist.length - 30);
    next.history = hist;

    // milestone celebration
    if ([7, 30, 100].includes(next.streak)) {
      events.push({ type: "streak-milestone", streak: next.streak });
    }

    // streak milestone rewards — unlock cosmetic flair; auto-equip the first
    // one earned so the profile reflects progress immediately.
    const newlyUnlocked = [];
    for (const r of STREAK_REWARDS) {
      if (next.streak >= r.streak && !(next.rewards || []).includes(r.id)) {
        next.rewards = [...(next.rewards || []), r.id];
        newlyUnlocked.push(r);
        events.push({ type: "streak-reward", reward: r });
      }
    }
    if (newlyUnlocked.length && !next.equippedFlair) {
      next.equippedFlair = newlyUnlocked[newlyUnlocked.length - 1].id;
    }
    if (next.streak === 1 && !next.firstLessonDone) {
      events.push({ type: "first-lesson" });
      next.firstLessonDone = true;
    }
  }

  events.push({ type: "xp", amount: xpGained });
  if (heartsLost > 0) events.push({ type: "hearts-lost", amount: heartsLost });
  if (next.hearts === 0) events.push({ type: "hearts-depleted" });

  return { progress: next, events, xpGained, heartsLost };
}

export function tickValueFor(instrumentKey) {
  // re-exported for convenience
  return null;
}