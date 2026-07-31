import { describe, it, expect } from "vitest";
import {
  isPremium, isTrial, trialDaysLeft, canAccessBranch, canAccessInstrument, canAccessLessonId,
  coachCallsRemaining, canRepairStreak,
  strategyBranches, PREMIUM_INSTRUMENT_LESSON_IDS, PREMIUM_INSTRUMENTS, TRIAL_COACH_DAILY,
  MONTHLY_PRICE, ANNUAL_PRICE, MONTHLY_WEEKLY, ANNUAL_WEEKLY,
} from "../subscription";
import { MAX_HEARTS, spendHeart, refundHeart, resetHeartsForToday, applyProgress } from "../gamification";
import { effectiveTier, pickEntitlementRow } from "../../../base44/shared/entitlement";

describe("isPremium", () => {
  it("true for premium and trial tiers, false for free / null / undefined", () => {
    expect(isPremium({ tier: "premium" })).toBe(true);
    expect(isPremium({ tier: "trial" })).toBe(true);
    expect(isPremium({ tier: "free" })).toBe(false);
    expect(isPremium({})).toBe(false);
    expect(isPremium(null)).toBe(false);
    expect(isPremium(undefined)).toBe(false);
  });

  it("FAILS CLOSED: a null entitlement (still loading) is not premium", () => {
    expect(isPremium(null)).toBe(false);
  });

  it("closes the old localStorage bypass: a progress-shaped { subscription } object is NOT premium", () => {
    // The old client-side gate read progress.subscription. Editing localStorage
    // to { subscription: "premium" } used to unlock everything. The new gate reads
    // entitlement.tier, so the legacy shape grants nothing.
    expect(isPremium({ subscription: "premium" })).toBe(false);
    expect(isPremium({ subscription: "trial" })).toBe(false);
    expect(isPremium({ subscription: "premium", tier: "free" })).toBe(false);
  });
});

describe("isTrial / trialDaysLeft", () => {
  it("isTrial reads the server tier", () => {
    expect(isTrial({ tier: "trial" })).toBe(true);
    expect(isTrial({ tier: "premium" })).toBe(false);
    expect(isTrial({ tier: "free" })).toBe(false);
    expect(isTrial(null)).toBe(false);
  });
  it("trialDaysLeft reports the server's daysLeft, not a device clock", () => {
    expect(trialDaysLeft({ tier: "trial", daysLeft: 14 })).toBe(14);
    expect(trialDaysLeft({ tier: "trial", daysLeft: 0 })).toBe(0);
    expect(trialDaysLeft({ tier: "premium", daysLeft: 99 })).toBe(0);
    expect(trialDaysLeft(null)).toBe(0);
  });
});

describe("branch access", () => {
  it("allows the first two strategy branches free and gates the rest", () => {
    const branches = strategyBranches();
    expect(branches.length).toBeGreaterThanOrEqual(3);
    const free = { tier: "free" };
    expect(canAccessBranch(branches[0], free)).toBe(true);
    expect(canAccessBranch(branches[1], free)).toBe(true);
    for (let i = 2; i < branches.length; i++) {
      expect(canAccessBranch(branches[i], free)).toBe(false);
    }
    for (const b of branches) {
      expect(canAccessBranch(b, { tier: "premium" })).toBe(true);
    }
  });

  it("non-strategy branches are always accessible", () => {
    expect(canAccessBranch({ id: "x", type: "foundation" }, { tier: "free" })).toBe(true);
    expect(canAccessBranch(null, { tier: "free" })).toBe(true);
  });

  it("fails closed while the entitlement is loading", () => {
    const branches = strategyBranches();
    for (let i = 2; i < branches.length; i++) {
      expect(canAccessBranch(branches[i], null)).toBe(false);
    }
  });
});

describe("instrument access", () => {
  it("gates CL and GC for free users", () => {
    const free = { tier: "free" };
    expect(canAccessInstrument("ES", free)).toBe(true);
    expect(canAccessInstrument("NQ", free)).toBe(true);
    expect(canAccessInstrument("CL", free)).toBe(false);
    expect(canAccessInstrument("GC", free)).toBe(false);
  });
  it("premium can access all four", () => {
    const prem = { tier: "premium" };
    for (const inst of PREMIUM_INSTRUMENTS) expect(canAccessInstrument(inst, prem)).toBe(true);
  });
});

describe("lesson access", () => {
  it("gates the premium instrument lesson ids for free users", () => {
    const free = { tier: "free" };
    for (const id of PREMIUM_INSTRUMENT_LESSON_IDS) {
      expect(canAccessLessonId(id, free)).toBe(false);
    }
    expect(canAccessLessonId("contracts", free)).toBe(true);
    for (const id of PREMIUM_INSTRUMENT_LESSON_IDS) {
      expect(canAccessLessonId(id, { tier: "premium" })).toBe(true);
    }
  });
});

describe("coach calls & streak repair need both progress and entitlement", () => {
  it("coachCallsRemaining is unlimited for premium, metered for free", () => {
    const noCalls = { coachCalls: { date: "unused", count: 0 } };
    expect(coachCallsRemaining(noCalls, { tier: "premium" })).toBe(Infinity);
    // Trial is capped (mirrors TIER_LIMITS on the server). Previously Infinity,
    // which let a 21-day trial make unlimited paid model calls.
    expect(coachCallsRemaining(noCalls, { tier: "trial" })).toBe(TRIAL_COACH_DAILY);
    expect(coachCallsRemaining(noCalls, { tier: "free" })).toBe(3);
    expect(coachCallsRemaining(noCalls, null)).toBe(3);
  });
  it("canRepairStreak needs a premium entitlement AND an unused month", () => {
    expect(canRepairStreak({ streakRepairMonth: "2020-01" }, { tier: "premium" })).toBe(true);
    expect(canRepairStreak({ streakRepairMonth: "2020-01" }, { tier: "free" })).toBe(false);
    expect(canRepairStreak({ streakRepairMonth: "2020-01" }, null)).toBe(false);
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
  const fullProgress = (tier, hearts) => ({
    subscription: tier, hearts, heartsDate: "2026-01-01", xp: 0, streak: 0,
    lastActiveDate: null, dailyXp: 0, dailyGoal: 20, firstLessonDone: false,
    onboardingDone: false, completedLessons: [], completedDrills: [],
    rewards: [], history: [], equippedFlair: null, leagueXp: 0,
  });

  it("free, trial, and premium users receive identical heart treatment", () => {
    for (const tier of ["free", "trial", "premium"]) {
      // losing a heart is identical regardless of tier
      expect(spendHeart(3)).toEqual(spendHeart(3));
      // earning a heart is identical
      expect(refundHeart(3)).toEqual(refundHeart(3));
      // daily reset restores MAX identically
      expect(resetHeartsForToday(fullProgress(tier, 0), "2026-01-02").hearts).toBe(MAX_HEARTS);
      // applyProgress never touches hearts for any tier
      const r = applyProgress(fullProgress(tier, 3), { correct: 1, total: 1, completedType: "lesson" });
      expect(r.progress.hearts).toBe(3);
    }
  });
});
// Duplicate Entitlement rows are possible (no uniqueness constraint on user_id,
// and creation is read-then-write). The expensive failure is a paying customer
// being served as free because a read picked the wrong row, so selection must
// prefer the best EFFECTIVE tier rather than whatever the query returned first.
describe("pickEntitlementRow", () => {
  const FUTURE = new Date(Date.now() + 5 * 86400000).toISOString();
  const PAST = new Date(Date.now() - 5 * 86400000).toISOString();

  it("returns null for empty or invalid input", () => {
    expect(pickEntitlementRow([])).toBe(null);
    expect(pickEntitlementRow(null)).toBe(null);
    expect(pickEntitlementRow(undefined)).toBe(null);
  });

  it("prefers premium over a stale free row, in either order", () => {
    const free = { id: "a", tier: "free" };
    const paid = { id: "b", tier: "premium" };
    expect(pickEntitlementRow([free, paid]).id).toBe("b");
    expect(pickEntitlementRow([paid, free]).id).toBe("b");
  });

  it("prefers an active trial over free", () => {
    const free = { id: "a", tier: "free" };
    const trial = { id: "b", tier: "trial", trial_ends: FUTURE };
    expect(pickEntitlementRow([free, trial]).id).toBe("b");
  });

  it("does not let an EXPIRED trial outrank a genuine free row", () => {
    // Both resolve to free, so the tie breaks on age, not on stored tier.
    const expired = { id: "a", tier: "trial", trial_ends: PAST, created_date: "2026-02-01T00:00:00Z" };
    const free = { id: "b", tier: "free", created_date: "2026-01-01T00:00:00Z" };
    expect(pickEntitlementRow([expired, free]).id).toBe("b");
  });

  it("premium still wins over an active trial", () => {
    const trial = { id: "a", tier: "trial", trial_ends: FUTURE };
    const paid = { id: "b", tier: "premium" };
    expect(pickEntitlementRow([trial, paid]).id).toBe("b");
  });

  it("is stable: same-tier duplicates always resolve to the oldest row", () => {
    const rows = [
      { id: "new", tier: "free", created_date: "2026-03-01T00:00:00Z" },
      { id: "old", tier: "free", created_date: "2026-01-01T00:00:00Z" },
    ];
    expect(pickEntitlementRow(rows).id).toBe("old");
    expect(pickEntitlementRow([...rows].reverse()).id).toBe("old");
  });

  it("tolerates rows with no timestamps", () => {
    const rows = [{ id: "a", tier: "free" }, { id: "b", tier: "free" }];
    expect(pickEntitlementRow(rows)).toBeTruthy();
  });
});

// Pricing lives in subscription.js so the Paywall and the onboarding offer read
// one source. These catch a weekly figure drifting away from the billed amount,
// which would be a consumer-facing misstatement and an App Review problem.
describe("pricing", () => {
  it("weekly figures derive from the billed prices", () => {
    expect(Number(MONTHLY_WEEKLY)).toBeCloseTo(MONTHLY_PRICE * 12 / 52, 2);
    expect(Number(ANNUAL_WEEKLY)).toBeCloseTo(ANNUAL_PRICE / 52, 2);
  });

  it("are formatted to exactly two decimals", () => {
    expect(MONTHLY_WEEKLY).toMatch(/^\d+\.\d{2}$/);
    expect(ANNUAL_WEEKLY).toMatch(/^\d+\.\d{2}$/);
  });

  it("annual is genuinely cheaper per week than monthly", () => {
    expect(Number(ANNUAL_WEEKLY)).toBeLessThan(Number(MONTHLY_WEEKLY));
    expect(ANNUAL_PRICE).toBeLessThan(MONTHLY_PRICE * 12);
  });
});
