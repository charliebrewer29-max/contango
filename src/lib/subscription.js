// Premium / free tier model (spec Section 9).
// Pure functions over the progress object so any screen can ask "can this user
// do X?" without touching state. Trial users get every premium lever.

import { BRANCHES } from "./content";

export const TRIAL_DAYS = 21;          // long trial: 17–32d window converts ~70% better
export const FREE_COACH_DAILY = 3;     // free coach calls per day, session-only
export const FREE_STRATEGY_COUNT = 2;  // free learners get the first two strategy branches
export const FREE_INSTRUMENTS = ["ES"];
export const PREMIUM_INSTRUMENTS = ["ES", "NQ", "CL", "GC"];

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
  const today = new Date().toISOString().slice(0, 10);
  return c.date === today ? c.count : 0;
}

export function coachCallsRemaining(p) {
  if (isPremium(p)) return Infinity;
  return Math.max(0, FREE_COACH_DAILY - coachCallsToday(p));
}

// Streak repair is a monthly Premium perk.
export function canRepairStreak(p) {
  if (!isPremium(p)) return false;
  const month = new Date().toISOString().slice(0, 7);
  return p?.streakRepairMonth !== month;
}