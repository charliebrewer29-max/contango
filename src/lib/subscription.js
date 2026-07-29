// Premium / free tier model (spec Section 9).
// Pure functions over the progress object so any screen can ask "can this user
// do X?" without touching state. Trial users get every premium lever.

import { BRANCHES } from "./content";
import { todayStr, monthStr } from "./gamification";

export const TRIAL_DAYS = 21;          // long trial: 17-32d window converts ~70% better
export const FREE_COACH_DAILY = 3;     // free coach calls per day, session-only
export const FREE_STRATEGY_COUNT = 2;  // free learners get the first two strategy branches
export const FREE_INSTRUMENTS = ["ES", "NQ"];
export const PREMIUM_INSTRUMENTS = ["ES", "NQ", "CL", "GC"];

// Instrument-profile lessons locked to Premium. Free learners get ES + NQ
// (and the Micro Nasdaq, MNQ); Crude, Gold, and their micros/relatives open
// with Premium. Kept separate from the drill instrument list so YM/RTY-style
// lessons can be gated without exposing them in the drill generator.
export const PREMIUM_INSTRUMENT_LESSON_IDS = new Set([
  "cl-profile",
  "gc-profile",
  "mcl-profile",
  "ym-rty",
]);

export function canAccessLessonId(lessonId, p) {
  if (!lessonId) return true;
  if (isPremium(p)) return true;
  return !PREMIUM_INSTRUMENT_LESSON_IDS.has(lessonId);
}

export function isPremium(p) {
  return p?.subscription === "premium" || p?.subscription === "trial";
}

export function isTrial(p) {
  return p?.subscription === "trial";
}

export function trialDaysLeft(p) {
  if (!isTrial(p) || !p?.trialStart) return 0;
  const ms = Date.now() - new Date(p.trialStart).getTime();
  return Math.max(0, TRIAL_DAYS - Math.floor(ms / 86400000));
}

export function strategyBranches() {
  return BRANCHES.filter((b) => b.type === "strategy");
}

export function freeStrategyBranches() {
  return strategyBranches().slice(0, FREE_STRATEGY_COUNT);
}

export function canAccessBranch(branch, p) {
  if (!branch) return true;
  if (branch.type !== "strategy") return true;
  if (isPremium(p)) return true;
  return freeStrategyBranches().some((b) => b.id === branch.id);
}

export function canAccessInstrument(inst, p) {
  if (isPremium(p)) return PREMIUM_INSTRUMENTS.includes(inst);
  return FREE_INSTRUMENTS.includes(inst);
}

export const canAccessPractice = isPremium;
export const canMessyMode = isPremium;
export const canFullJournal = isPremium;

export function coachCallsToday(p) {
  const c = p?.coachCalls;
  if (!c) return 0;
  const today = todayStr();
  return c.date === today ? c.count : 0;
}

export function coachCallsRemaining(p) {
  if (isPremium(p)) return Infinity;
  return Math.max(0, FREE_COACH_DAILY - coachCallsToday(p));
}

// Streak repair is a monthly Premium perk.
export function canRepairStreak(p) {
  if (!isPremium(p)) return false;
  const month = monthStr();
  return p?.streakRepairMonth !== month;
}

// Restore prior App Store / IAP purchases. The native in-app-purchase bridge
// isn't wired in the web build, so this is a no-op here; the App Store-required
// restore link calls it so the flow is present and ready to connect.
export async function restorePurchases() {
  return null;
}