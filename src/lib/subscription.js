// Premium / free tier model (spec Section 9).
// Pure functions over the SERVER ENTITLEMENT object { tier, trial_ends, daysLeft }
// so every screen asks the server — never the client-stored progress.subscription.
// A null/undefined entitlement returns false everywhere, so gates FAIL CLOSED
// while the first server resolve is in flight (see ContangoContext).

import { BRANCHES } from "./content";
import { todayStr, monthStr } from "./gamification";

// Pricing. Single source of truth: the Paywall and the onboarding offer both
// read these, and the weekly figures are derived so they can never disagree
// with the billed amounts.
export const MONTHLY_PRICE = 14.99;
export const ANNUAL_PRICE = 79.99;
const WEEKS_PER_YEAR = 52;
export const MONTHLY_WEEKLY = (MONTHLY_PRICE * 12 / WEEKS_PER_YEAR).toFixed(2);
export const ANNUAL_WEEKLY = (ANNUAL_PRICE / WEEKS_PER_YEAR).toFixed(2);

export const TRIAL_DAYS = 21;          // long trial: 17-32d window converts ~70% better
export const FREE_COACH_DAILY = 3;     // free coach calls per day, session-only
// Trial is capped too, mirroring TIER_LIMITS in base44/functions/aiCoachFeedback.
// The server is authoritative; this exists so the UI does not promise unlimited
// calls and then hit a wall. Keep the two in sync.
export const TRIAL_COACH_DAILY = 30;
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

export function canAccessLessonId(lessonId, entitlement) {
  if (!lessonId) return true;
  if (isPremium(entitlement)) return true;
  return !PREMIUM_INSTRUMENT_LESSON_IDS.has(lessonId);
}

// The server is the only source of truth. tier "premium" or "trial" grants
// access; anything else (including null/undefined while loading) does not.
export function isPremium(entitlement) {
  return entitlement?.tier === "premium" || entitlement?.tier === "trial";
}

export function isTrial(entitlement) {
  return entitlement?.tier === "trial";
}

// Trial days left come from the server (daysLeft), never computed from a
// device clock. 0 for non-trial entitlements.
export function trialDaysLeft(entitlement) {
  if (!isTrial(entitlement)) return 0;
  return entitlement?.daysLeft ?? 0;
}

export function strategyBranches() {
  return BRANCHES.filter((b) => b.type === "strategy");
}

export function freeStrategyBranches() {
  return strategyBranches().slice(0, FREE_STRATEGY_COUNT);
}

export function canAccessBranch(branch, entitlement) {
  if (!branch) return true;
  if (branch.type !== "strategy") return true;
  if (isPremium(entitlement)) return true;
  return freeStrategyBranches().some((b) => b.id === branch.id);
}

export function canAccessInstrument(inst, entitlement) {
  if (isPremium(entitlement)) return PREMIUM_INSTRUMENTS.includes(inst);
  return FREE_INSTRUMENTS.includes(inst);
}

export const canAccessPractice = isPremium;
export const canMessyMode = isPremium;
export const canFullJournal = isPremium;

// The daily coach-call counter lives on progress (a client usage meter, not
// an access decision). The tier comes from the entitlement.
export function coachCallsToday(progress) {
  const c = progress?.coachCalls;
  if (!c) return 0;
  const today = todayStr();
  return c.date === today ? c.count : 0;
}

export function coachCallsRemaining(progress, entitlement) {
  if (entitlement?.tier === "premium") return Infinity;
  const cap = entitlement?.tier === "trial" ? TRIAL_COACH_DAILY : FREE_COACH_DAILY;
  return Math.max(0, cap - coachCallsToday(progress));
}

// Streak repair is a monthly Premium perk. The streakRepairMonth counter lives
// on progress; the tier comes from the entitlement.
export function canRepairStreak(progress, entitlement) {
  if (!isPremium(entitlement)) return false;
  const month = monthStr();
  return progress?.streakRepairMonth !== month;
}

// Restore prior App Store / IAP purchases. The native in-app-purchase bridge
// isn't wired in the web build, so this is a no-op here; the App Store-required
// restore link calls it so the flow is present and ready to connect.
export async function restorePurchases() {
  return null;
}