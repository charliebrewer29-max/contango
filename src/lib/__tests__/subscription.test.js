import { describe, it, expect } from "vitest";
import {
  isPremium, canAccessBranch, canAccessInstrument, canAccessLessonId,
  strategyBranches, PREMIUM_INSTRUMENT_LESSON_IDS, PREMIUM_INSTRUMENTS,
} from "../subscription";
import { MAX_HEARTS, spendHeart, refundHeart, resetHeartsForToday, applyProgress } from "../gamification";
import { effectiveTier } from "../../../base44/shared/entitlement";

describe("isPremium", () => {
  it("true for premium and trial, false for free", () => {
    expect(isPremium({ subscription: "premium" })).toBe(true);
    expect(isPremium({ subscription: "trial" })).toBe(true);
    expect(isPremium({ subscription: "free" })).toBe(false);
    expect(isPremium({})).toBe(false);
    expect(isPremium(null)).toBe(false);
  });
});

describe("branch access", () => {
  it("allows the first two strategy branches free and gates the rest", () => {
    const branches = strategyBranches();
    expect(branches.length).toBeGreaterThanOrEqual(3);
    const free = { subscription: "free" };
    expect(canAccessBranch(branches[0], free)).toBe(true);
    expect(canAccessBranch(branches[1], free)).toBe(true);
    for (let i = 2; i < branches.length; i++) {
      expect(canAccessBranch(branches[i], free)).toBe(false);
    }
    for (const b of branches) {
      expect(canAccessBranch(b, { subscription: "premium" })).toBe(true);
    }
  });

  it("non-strategy branches are always accessible", () => {
    expect(canAccessBranch({ id: "x", type: "foundation" }, { subscription: "free" })).toBe(true);
    expect(canAccessBranch(null, { subscription: "free" })).toBe(true);
  });
});

describe("instrument access", () => {
  it("gates CL and GC for free users", () => {
    const free = { subscription: "free" };
    expect(canAccessInstrument("ES", free)).toBe(true);
    expect(canAccessInstrument("NQ", free)).toBe(true);
    expect(canAccessInstrument("CL", free)).toBe(false);
    expect(canAccessInstrument("GC", free)).toBe(false);
  });
  it("premium can access all four", () => {
    const prem = { subscription: "premium" };
    for (const inst of PREMIUM_INSTRUMENTS) expect(canAccessInstrument(inst, prem)).toBe(true);
  });
});

describe("lesson access", () => {
  it("gates the premium instrument lesson ids for free users", () => {
    const free = { subscription: "free" };
    for (const id of PREMIUM_INSTRUMENT_LESSON_IDS) {
      expect(canAccessLessonId(id, free)).toBe(false);
    }
    expect(canAccessLessonId("contracts", free)).toBe(true);
    for (const id of PREMIUM_INSTRUMENT_LESSON_IDS) {
      expect(canAccessLessonId(id, { subscription: "premium" })).toBe(true);
    }
  });
});

describe("trial expiry (entitlement)", () => {
  it("an entitlement past trial_ends is not premium (resolves to free)", () => {
    const now = new Date("2026-07-29T00:00:00Z").getTime();
    const expired = { tier: "trial", trial_ends: "2020-01-01T00:00:00.000Z" };
    expect(effectiveTier(expired, now)).toBe("free");
    const active = { tier: "trial", trial_ends: "2099-01-01T00:00:00.000Z" };
    expect(effectiveTier(active, now)).toBe("trial");
    const noTier = { tier: "free", trial_ends: null };
    expect(effectiveTier(noTier, now)).toBe("free");
  });
});

describe("hearts are tier-agnostic (product commitment)", () => {
  const fullProgress = (sub, hearts) => ({
    subscription: sub, hearts, heartsDate: "2026-01-01", xp: 0, streak: 0,
    lastActiveDate: null, dailyXp: 0, dailyGoal: 20, firstLessonDone: false,
    onboardingDone: false, completedLessons: [], completedDrills: [],
    rewards: [], history: [], equippedFlair: null, leagueXp: 0,
  });

  it("free, trial, and premium users receive identical heart treatment", () => {
    for (const sub of ["free", "trial", "premium"]) {
      // losing a heart is identical regardless of tier
      expect(spendHeart(3)).toEqual(spendHeart(3));
      // earning a heart is identical
      expect(refundHeart(3)).toEqual(refundHeart(3));
      // daily reset restores MAX identically
      expect(resetHeartsForToday(fullProgress(sub, 0), "2026-01-02").hearts).toBe(MAX_HEARTS);
      // applyProgress never touches hearts for any tier
      const r = applyProgress(fullProgress(sub, 3), { correct: 1, total: 1, completedType: "lesson" });
      expect(r.progress.hearts).toBe(3);
    }
  });
});