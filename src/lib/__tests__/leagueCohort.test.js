import { describe, it, expect } from "vitest";
import {
  generateCohort,
  currentXp,
  cohortXpNow,
  weekStartIso,
  needsWeeklyReset,
  MIN_LEAGUE_XP,
} from "../leagueCohort";

const NOW = new Date("2026-07-29T12:00:00Z"); // Wednesday

function daysFromNow(days) {
  return new Date(NOW.getTime() + days * 86_400_000);
}

// Parse a "YYYY-MM-DD" week stamp as a local date so getDay() reflects the
// user's timezone (parsing it directly is treated as UTC and can shift the day).
function localFromIso(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

describe("generateCohort shape", () => {
  it("produces well-formed opponents with unique names", () => {
    const cohort = generateCohort(500, NOW);
    expect(cohort).toHaveLength(7);
    const names = cohort.map((o) => o.name);
    expect(new Set(names).size).toBe(names.length);
    for (const o of cohort) {
      expect(typeof o.name).toBe("string");
      expect(o.name.length).toBeGreaterThan(0);
      expect(Number.isFinite(o.xp)).toBe(true);
      expect(o.dailyRate).toBeGreaterThan(0);
      const created = new Date(o.createdAt);
      expect(isNaN(created.getTime())).toBe(false);
    }
  });
});

describe("drift", () => {
  it("increases currentXp across days and cohortXpNow changes over time", () => {
    const cohort = generateCohort(500, NOW);
    const opp = cohort[0];
    const d0 = currentXp(opp, daysFromNow(0));
    const d3 = currentXp(opp, daysFromNow(3));
    const d7 = currentXp(opp, daysFromNow(7));
    expect(d7).toBeGreaterThan(d3);
    expect(d3).toBeGreaterThan(d0);
    const atCreation = cohortXpNow(cohort, NOW);
    const later = cohortXpNow(cohort, daysFromNow(5));
    expect(JSON.stringify(later)).not.toBe(JSON.stringify(atCreation));
  });
});

describe("no backwards drift", () => {
  it("currentXp before createdAt equals currentXp at createdAt", () => {
    const cohort = generateCohort(500, NOW);
    const opp = cohort[0];
    const before = currentXp(opp, daysFromNow(-3));
    const at = currentXp(opp, NOW);
    expect(before).toBe(at);
  });
});

describe("floor", () => {
  it("floors every opponent at MIN_LEAGUE_XP for low seeds", () => {
    expect(MIN_LEAGUE_XP).toBe(20);
    for (const seed of [0, 1, 10, 40, 100]) {
      const cohort = generateCohort(seed, NOW);
      const now = cohortXpNow(cohort, daysFromNow(10));
      for (const o of now) {
        expect(o.xp).toBeGreaterThanOrEqual(MIN_LEAGUE_XP);
      }
    }
  });
});

describe("legacy cohorts", () => {
  it("handles missing dailyRate/createdAt without drift and floors zero XP", () => {
    const legacy = [{ name: "a", xp: 400 }, { name: "b", xp: 0 }];
    expect(() => cohortXpNow(legacy, NOW)).not.toThrow();
    const now = cohortXpNow(legacy, NOW);
    const later = cohortXpNow(legacy, daysFromNow(30));
    expect(now[0].xp).toBe(400);
    expect(later[0].xp).toBe(400);
    expect(now[1].xp).toBe(MIN_LEAGUE_XP);
    expect(later[1].xp).toBe(MIN_LEAGUE_XP);
    expect(cohortXpNow(null, NOW)).toEqual([]);
    expect(cohortXpNow(undefined, NOW)).toEqual([]);
  });
});

describe("Sunday cycle", () => {
  it("weekStartIso lands on Sunday and groups a week", () => {
    const dates = [
      new Date("2026-07-25T12:00:00Z"), // Saturday
      new Date("2026-07-26T12:00:00Z"), // Sunday
      new Date("2026-07-29T12:00:00Z"), // Wednesday
      new Date("2026-08-01T12:00:00Z"), // Saturday
      new Date("2026-08-02T12:00:00Z"), // Sunday (next week)
    ];
    const stamps = dates.map((d) => weekStartIso(d));
    for (const s of stamps) {
      expect(localFromIso(s).getDay()).toBe(0); // Sunday
    }
    // Days within one week share a start; the eighth day differs.
    const midWeek = [
      new Date("2026-07-26T12:00:00Z"),
      new Date("2026-07-27T12:00:00Z"),
      new Date("2026-07-28T12:00:00Z"),
      new Date("2026-07-29T12:00:00Z"),
      new Date("2026-07-30T12:00:00Z"),
      new Date("2026-07-31T12:00:00Z"),
      new Date("2026-08-01T12:00:00Z"),
    ];
    const weekStamps = midWeek.map((d) => weekStartIso(d));
    expect(new Set(weekStamps).size).toBe(1);
    const eighth = weekStartIso(new Date("2026-08-02T12:00:00Z"));
    expect(eighth).not.toBe(weekStamps[0]);
  });

  it("needsWeeklyReset flags missing or stale stamps", () => {
    const current = weekStartIso(NOW);
    expect(needsWeeklyReset(null, NOW)).toBe(true);
    expect(needsWeeklyReset(undefined, NOW)).toBe(true);
    expect(needsWeeklyReset("2026-01-04", NOW)).toBe(true);
    expect(needsWeeklyReset(current, NOW)).toBe(false);
  });
});