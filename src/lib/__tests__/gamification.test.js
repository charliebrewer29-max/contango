import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  MAX_HEARTS, XP_PER_CORRECT, XP_PER_LESSON_COMPLETE, XP_PER_DRILL_COMPLETE,
  xpForSession, applyProgress, todayStr, monthStr, daysBetween,
  spendHeart, refundHeart, resetHeartsForToday,
} from "../gamification";

const base = () => ({
  xp: 0, hearts: MAX_HEARTS, streak: 0, lastActiveDate: null, dailyXp: 0,
  dailyGoal: 20, firstLessonDone: false, onboardingDone: false,
  completedLessons: [], completedDrills: [], rewards: [], history: [],
  equippedFlair: null, leagueXp: 0,
});

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("daily XP reset (the regression that shipped)", () => {
  it("same-day sessions accumulate dailyXp", () => {
    vi.setSystemTime(new Date("2026-01-01T12:00:00"));
    const p = base();
    p.lastActiveDate = "2026-01-01";
    p.dailyXp = 20;
    const { progress } = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" });
    expect(progress.dailyXp).toBe(20 + XP_PER_CORRECT + XP_PER_LESSON_COMPLETE);
  });

  it("a session on a NEW day resets dailyXp to only that session's XP", () => {
    const p = base();
    p.lastActiveDate = "2026-01-01";
    p.dailyXp = 999;
    vi.setSystemTime(new Date("2026-01-02T12:00:00"));
    const { progress } = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" });
    expect(progress.dailyXp).toBe(XP_PER_CORRECT + XP_PER_LESSON_COMPLETE);
    expect(progress.dailyXp).not.toBe(999 + XP_PER_CORRECT + XP_PER_LESSON_COMPLETE);
  });

  it("three consecutive days each earning 20 XP yield 20, 20, 20 — not 20, 40, 60", () => {
    let p = base();
    const results = [];
    for (const day of ["2026-01-01", "2026-01-02", "2026-01-03"]) {
      vi.setSystemTime(new Date(day + "T12:00:00"));
      p = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" }).progress;
      results.push(p.dailyXp);
    }
    expect(results).toEqual([20, 20, 20]);
  });
});

describe("streak", () => {
  it("first ever session sets streak to 1", () => {
    vi.setSystemTime(new Date("2026-01-01T12:00:00"));
    const { progress, events } = applyProgress(base(), { correct: 1, total: 1, completedType: "lesson" });
    expect(progress.streak).toBe(1);
    expect(events.some((e) => e.type === "streak-new-day")).toBe(true);
  });

  it("consecutive day increments streak", () => {
    const p = base(); p.streak = 3; p.lastActiveDate = "2026-01-01";
    vi.setSystemTime(new Date("2026-01-02T12:00:00"));
    expect(applyProgress(p, { correct: 1, total: 1, completedType: "lesson" }).progress.streak).toBe(4);
  });

  it("same day does not increment streak", () => {
    const p = base(); p.streak = 3; p.lastActiveDate = "2026-01-01"; p.dailyXp = 20;
    vi.setSystemTime(new Date("2026-01-01T18:00:00"));
    expect(applyProgress(p, { correct: 1, total: 1, completedType: "lesson" }).progress.streak).toBe(3);
  });

  it("a 2+ day gap resets to 1 and emits streak-broken", () => {
    const p = base(); p.streak = 5; p.lastActiveDate = "2026-01-01";
    vi.setSystemTime(new Date("2026-01-04T12:00:00"));
    const { progress, events } = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" });
    expect(progress.streak).toBe(1);
    expect(events.some((e) => e.type === "streak-broken")).toBe(true);
  });

  it("a gap after a 30+ day streak emits streak-revival-available (not broken)", () => {
    const p = base(); p.streak = 35; p.lastActiveDate = "2026-01-01";
    vi.setSystemTime(new Date("2026-02-05T12:00:00"));
    const { events } = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" });
    expect(events.some((e) => e.type === "streak-revival-available")).toBe(true);
    expect(events.some((e) => e.type === "streak-broken")).toBe(false);
  });

  it("milestones at 7, 30, 100 emit streak-milestone", () => {
    for (const [from, day] of [[6, "2026-01-02"], [29, "2026-02-01"], [99, "2026-04-10"]]) {
      const p = base(); p.streak = from; p.lastActiveDate = from === 6 ? "2026-01-01" : from === 29 ? "2026-01-31" : "2026-04-09";
      vi.setSystemTime(new Date(day + "T12:00:00"));
      const { progress, events } = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" });
      expect(events.some((e) => e.type === "streak-milestone" && e.streak === progress.streak)).toBe(true);
    }
  });
});

describe("hearts", () => {
  it("wrong answers decrement by exactly the wrong count", () => {
    let hearts = MAX_HEARTS;
    for (let i = 0; i < 3; i++) hearts = spendHeart(hearts).hearts;
    expect(hearts).toBe(MAX_HEARTS - 3);
  });

  it("hearts never go below 0", () => {
    let hearts = 1;
    for (let i = 0; i < 5; i++) hearts = spendHeart(hearts).hearts;
    expect(hearts).toBe(0);
  });

  it("reaching 0 emits depleted", () => {
    expect(spendHeart(1).depleted).toBe(true);
    expect(spendHeart(2).depleted).toBe(false);
  });

  it("practice sessions never cost hearts (applyProgress leaves hearts untouched)", () => {
    const p = base(); p.hearts = 3;
    const { progress } = applyProgress(p, { correct: 5, total: 5, completedType: "practice" });
    expect(progress.hearts).toBe(3);
  });

  it("LEARN phase never costs hearts (no session type mutates hearts)", () => {
    const p = base(); p.hearts = 4;
    const { progress } = applyProgress(p, { correct: 0, total: 0, completedType: "lesson" });
    expect(progress.hearts).toBe(4);
  });

  it("daily reset restores to MAX_HEARTS", () => {
    const reset = resetHeartsForToday({ heartsDate: "2026-01-01", hearts: 0 }, "2026-01-02");
    expect(reset.hearts).toBe(MAX_HEARTS);
    expect(reset.heartsDate).toBe("2026-01-02");
  });

  it("daily reset is a no-op when already on today's date", () => {
    const p = { heartsDate: "2026-01-02", hearts: 2 };
    expect(resetHeartsForToday(p, "2026-01-02")).toBe(p);
  });

  it("practice completion restores exactly 1, capped at MAX_HEARTS", () => {
    expect(refundHeart(2).hearts).toBe(3);
    expect(refundHeart(2).gained).toBe(true);
    expect(refundHeart(MAX_HEARTS).gained).toBe(false);
    expect(refundHeart(MAX_HEARTS).hearts).toBe(MAX_HEARTS);
  });
});

describe("xp", () => {
  it("lesson: correct*XP_PER_CORRECT, plus bonus only on a perfect score", () => {
    expect(xpForSession({ correct: 3, total: 5, completedType: "lesson" })).toBe(3 * XP_PER_CORRECT);
    expect(xpForSession({ correct: 5, total: 5, completedType: "lesson" })).toBe(5 * XP_PER_CORRECT + XP_PER_LESSON_COMPLETE);
    expect(xpForSession({ correct: 4, total: 5, completedType: "lesson" })).toBe(4 * XP_PER_CORRECT);
  });

  it("drill: correct*XP_PER_CORRECT + XP_PER_DRILL_COMPLETE", () => {
    expect(xpForSession({ correct: 2, total: 3, completedType: "drill" })).toBe(2 * XP_PER_CORRECT + XP_PER_DRILL_COMPLETE);
  });

  it("applyProgress returns xpGained matching the actual delta to xp", () => {
    const p = base(); p.xp = 100;
    const { progress, xpGained } = applyProgress(p, { correct: 1, total: 1, completedType: "drill" });
    expect(progress.xp - 100).toBe(xpGained);
  });
});

describe("streak rewards", () => {
  it("each threshold unlocks exactly once and re-running does not duplicate", () => {
    let p = base();
    for (let i = 1; i <= 7; i++) {
      vi.setSystemTime(new Date(`2026-01-${String(i).padStart(2, "0")}T12:00:00`));
      p = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" }).progress;
    }
    expect(p.streak).toBe(7);
    expect(p.rewards.filter((r) => r === "spark").length).toBe(1);
    expect(p.rewards.filter((r) => r === "ember").length).toBe(1);
    // a same-day re-run must not duplicate
    const same = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" }).progress;
    expect(same.rewards.filter((r) => r === "spark").length).toBe(1);
    expect(same.rewards.filter((r) => r === "ember").length).toBe(1);
  });

  it("first unlock auto-equips when no flair is set", () => {
    let p = base();
    for (let i = 1; i <= 3; i++) {
      vi.setSystemTime(new Date(`2026-01-${String(i).padStart(2, "0")}T12:00:00`));
      p = applyProgress(p, { correct: 1, total: 1, completedType: "lesson" }).progress;
    }
    expect(p.streak).toBe(3);
    expect(p.equippedFlair).toBe("spark");
  });
});

describe("date helpers", () => {
  it("todayStr uses local calendar, not UTC", () => {
    vi.setSystemTime(new Date("2026-01-15T23:30:00"));
    expect(todayStr()).toBe("2026-01-15");
  });

  it("monthStr uses local calendar", () => {
    vi.setSystemTime(new Date("2026-03-31T23:59:00"));
    expect(monthStr()).toBe("2026-03");
  });

  it("daysBetween across a month boundary", () => {
    expect(daysBetween("2026-01-31", "2026-02-01")).toBe(1);
    expect(daysBetween("2026-01-01", "2026-02-01")).toBe(31);
  });

  it("daysBetween across a year boundary", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });

  it("daysBetween across a DST transition", () => {
    // US 2026 spring-forward is Mar 8; civil calendar day is still +1.
    expect(daysBetween("2026-03-07", "2026-03-08")).toBe(1);
    expect(daysBetween("2026-11-07", "2026-11-08")).toBe(1);
  });
});