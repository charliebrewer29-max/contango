// Gamification engine - XP / streak / hearts (spec Section 6)

import { STREAK_REWARDS } from "./streakRewards";

export const MAX_HEARTS = 5;
export const XP_PER_CORRECT = 8;
export const XP_PER_LESSON_COMPLETE = 12;
export const XP_PER_DRILL_COMPLETE = 15;
export const XP_PER_COACH_REFLECTION = 5;
export const XP_PER_PRACTICE_REVIEW = 5;

// Local-calendar date string (YYYY-MM-DD). Using the device's own calendar
// day keeps streaks, daily XP/goal, and the practice allowance all resetting
// at local midnight - not at 6-7pm for users west of UTC.
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Server-anchored local date (YYYY-MM-DD). Applies the stored server/client
// offset before computing the calendar day, but still formats the result in
// the device's own timezone - so the user's local day is preserved, just no
// longer tied to a spoofable device clock. Used for the hearts reset and the
// practice allowance reset. offset null/0 falls back to the client date, but
// the reset *grant* is gated on a known offset (fail closed) by the caller.
export function serverToday(offset) {
  const d = new Date(Date.now() + (offset || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Local-calendar month string (YYYY-MM) for monthly perks (streak repair),
// so the monthly limit also rolls over on the user's local month boundary.
export function monthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

  if (completedType === "lesson") {
    xpGained = correct * XP_PER_CORRECT;
    if (correct === total) xpGained += XP_PER_LESSON_COMPLETE;
  } else if (completedType === "drill") {
    xpGained = correct * XP_PER_CORRECT + XP_PER_DRILL_COMPLETE;
  } else if (completedType === "practice") {
    // spaced-repetition reviews: earn XP per correct, no hearts (review is safe)
    xpGained = correct * XP_PER_PRACTICE_REVIEW;
  }

  next.xp = (next.xp || 0) + xpGained;
  // Hearts are NOT managed here. They are spent per wrong graded answer
  // (see loseHeart in ContangoContext) and reset to MAX at the user's local
  // midnight (server-anchored). Managing them per-answer lets a session be
  // cut off mid-lesson when hearts run out, instead of only at completion.

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

    // streak milestone rewards - unlock cosmetic flair; auto-equip the first
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

  return { progress: next, events, xpGained };
}

export function tickValueFor(instrumentKey) {
  // re-exported for convenience
  return null;
}