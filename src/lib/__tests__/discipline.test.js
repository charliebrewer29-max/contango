import { describe, it, expect } from "vitest";
import { disciplineProfile, classifyExit } from "../discipline";

function mkHistory(decisions, correctCount, total) {
  return {
    decisions,
    correctCount: correctCount ?? decisions.filter((d) => d.isCorrect).length,
    total: total ?? decisions.length,
  };
}

describe("empty / thin signal", () => {
  it("empty history returns { empty: true } and does not throw", () => {
    const p = disciplineProfile({ drillHistory: [] });
    expect(p.empty).toBe(true);
    expect(p.metrics).toEqual([]);
    expect(p.overall).toBeNull();
  });

  it("tilt is NEUTRAL with fewer than 2 post-error decisions", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { isCorrect: false, decisionTimeMs: 1000 },
      { isCorrect: true, decisionTimeMs: 1200 },
    ])] });
    expect(p.metrics.find((m) => m.label === "Tilt resistance").score).toBe(70);
  });

  it("risk sizing is NEUTRAL with fewer than 3 tap stops", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { type: "tap", stopDistancePoints: 5, isCorrect: true },
      { type: "tap", stopDistancePoints: 6, isCorrect: true },
    ])] });
    expect(p.metrics.find((m) => m.label === "Risk sizing").score).toBe(70);
  });

  it("consistency is NEUTRAL with fewer than 3 drills", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([{ isCorrect: true }], 1, 1), mkHistory([{ isCorrect: false }], 0, 1)] });
    expect(p.metrics.find((m) => m.label === "Consistency").score).toBe(70);
  });
});

describe("patience", () => {
  it("sub-1500ms average scores low", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { isCorrect: true, decisionTimeMs: 800 },
      { isCorrect: true, decisionTimeMs: 900 },
    ])] });
    expect(p.metrics.find((m) => m.label === "Patience").score).toBeLessThan(70);
  });
  it("4000-5000ms scores high", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { isCorrect: true, decisionTimeMs: 4500 },
      { isCorrect: true, decisionTimeMs: 4500 },
    ])] });
    expect(p.metrics.find((m) => m.label === "Patience").score).toBeGreaterThanOrEqual(85);
  });
  it("25000ms scores low again (paralysis)", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { isCorrect: true, decisionTimeMs: 25000 },
      { isCorrect: true, decisionTimeMs: 25000 },
    ])] });
    expect(p.metrics.find((m) => m.label === "Patience").score).toBeLessThan(70);
  });
});

describe("tilt", () => {
  it("better-after-error scores high", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { isCorrect: false, decisionTimeMs: 3000 },
      { isCorrect: true, decisionTimeMs: 3000 },
      { isCorrect: false, decisionTimeMs: 3000 },
      { isCorrect: true, decisionTimeMs: 3000 },
    ], 2, 4)] });
    expect(p.metrics.find((m) => m.label === "Tilt resistance").score).toBeGreaterThanOrEqual(85);
  });

  it("worse-after-error scores low", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { isCorrect: true, decisionTimeMs: 3000 },
      { isCorrect: false, decisionTimeMs: 3000 },
      { isCorrect: false, decisionTimeMs: 3000 },
      { isCorrect: true, decisionTimeMs: 3000 },
      { isCorrect: false, decisionTimeMs: 3000 },
      { isCorrect: false, decisionTimeMs: 3000 },
    ], 2, 6)] });
    expect(p.metrics.find((m) => m.label === "Tilt resistance").score).toBeLessThan(50);
  });

  it("worse AND much faster after an error scores lower still (revenge)", () => {
    // 4 correct at a slow pace, then a wrong, then three more wrongs at a
    // much faster pace: post-error accuracy collapses to 0 and post-error
    // speed drops well below 0.6× the overall average → the revenge penalty.
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { isCorrect: true, decisionTimeMs: 5000 },
      { isCorrect: true, decisionTimeMs: 5000 },
      { isCorrect: true, decisionTimeMs: 5000 },
      { isCorrect: true, decisionTimeMs: 5000 },
      { isCorrect: false, decisionTimeMs: 5000 },
      { isCorrect: false, decisionTimeMs: 500 },
      { isCorrect: false, decisionTimeMs: 500 },
      { isCorrect: false, decisionTimeMs: 500 },
    ], 4, 8)] });
    expect(p.metrics.find((m) => m.label === "Tilt resistance").score).toBeLessThan(15);
  });
});

describe("risk sizing", () => {
  it("consistent stop distances score high", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { type: "tap", stopDistancePoints: 10, isCorrect: true },
      { type: "tap", stopDistancePoints: 10, isCorrect: true },
      { type: "tap", stopDistancePoints: 10, isCorrect: true },
      { type: "tap", stopDistancePoints: 10, isCorrect: true },
    ], 4, 4)] });
    expect(p.metrics.find((m) => m.label === "Risk sizing").score).toBeGreaterThanOrEqual(90);
  });

  it("wildly varying stops score low", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { type: "tap", stopDistancePoints: 5, isCorrect: true },
      { type: "tap", stopDistancePoints: 6, isCorrect: true },
      { type: "tap", stopDistancePoints: 5, isCorrect: true },
      { type: "tap", stopDistancePoints: 100, isCorrect: true },
    ], 4, 4)] });
    expect(p.metrics.find((m) => m.label === "Risk sizing").score).toBeLessThanOrEqual(70);
  });
});

describe("consistency", () => {
  it("identical accuracy across drills scores high", () => {
    const p = disciplineProfile({ drillHistory: [
      mkHistory(Array(5).fill({ isCorrect: true }), 5, 5),
      mkHistory(Array(5).fill({ isCorrect: true }), 5, 5),
      mkHistory(Array(5).fill({ isCorrect: true }), 5, 5),
    ] });
    expect(p.metrics.find((m) => m.label === "Consistency").score).toBeGreaterThanOrEqual(90);
  });

  it("alternating 100% and 0% scores low", () => {
    const p = disciplineProfile({ drillHistory: [
      mkHistory(Array(5).fill({ isCorrect: true }), 5, 5),
      mkHistory(Array(5).fill({ isCorrect: false }), 0, 5),
      mkHistory(Array(5).fill({ isCorrect: true }), 5, 5),
    ] });
    expect(p.metrics.find((m) => m.label === "Consistency").score).toBeLessThan(50);
  });
});

describe("exit discipline", () => {
  it("clean-only history scores 100", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { type: "exit-tap", classification: "clean" },
      { type: "exit-tap", classification: "clean" },
    ], 0, 0)] });
    expect(p.metrics.find((m) => m.label === "Exit discipline").score).toBe(100);
  });

  it("correctly counts cut_winner and held_loser", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { type: "exit-tap", classification: "clean" },
      { type: "exit-tap", classification: "cut_winner" },
      { type: "exit-tap", classification: "held_loser" },
    ], 0, 0)] });
    const exit = p.metrics.find((m) => m.label === "Exit discipline");
    expect(exit.cutWinners).toBe(1);
    expect(exit.heldLosers).toBe(1);
    expect(exit.score).toBe(33);
  });
});

describe("classifyExit direction (the real bug)", () => {
  it("a profitable LONG exit is not held_loser", () => {
    const bars = [{ low: 96, high: 101, close: 100 }, { low: 97, high: 105, close: 104 }, { low: 99, high: 111, close: 110 }];
    const r = classifyExit({ entry: 100, stop: 95, exitClose: 110, bars, entryBarIdx: 0, exitIdx: 2, direction: 1, tickSize: 0.25 });
    expect(r.realized).toBe(10);
    expect(r.classification).not.toBe("held_loser");
  });

  it("a profitable SHORT exit is not held_loser", () => {
    const bars = [{ high: 114, low: 109, close: 110 }, { high: 113, low: 105, close: 106 }, { high: 107, low: 99, close: 100 }];
    const r = classifyExit({ entry: 110, stop: 115, exitClose: 100, bars, entryBarIdx: 0, exitIdx: 2, direction: -1, tickSize: 0.25 });
    expect(r.realized).toBe(10);
    expect(r.classification).not.toBe("held_loser");
  });

  it("a short where the stop is hit and the trade is a loser IS held_loser", () => {
    const bars = [{ high: 106, low: 99, close: 101 }, { high: 103, low: 100, close: 104 }];
    const r = classifyExit({ entry: 100, stop: 105, exitClose: 104, bars, entryBarIdx: 0, exitIdx: 1, direction: -1, tickSize: 0.25 });
    expect(r.stopHit).toBe(true);
    expect(r.realized).toBe(-4);
    expect(r.classification).toBe("held_loser");
  });

  it("a long cut_winner: profitable but price kept running after exit", () => {
    const bars = [{ low: 99, high: 101, close: 100 }, { low: 101, high: 103, close: 102 }, { low: 105, high: 111, close: 110 }];
    const r = classifyExit({ entry: 100, stop: 95, exitClose: 102, bars, entryBarIdx: 0, exitIdx: 1, direction: 1, tickSize: 0.25 });
    expect(r.classification).toBe("cut_winner");
  });
});

describe("bounds & graceful degradation", () => {
  it("every metric stays within 0-100 for adversarial inputs", () => {
    const p = disciplineProfile({ drillHistory: [mkHistory([
      { isCorrect: false, decisionTimeMs: -500, type: "tap", stopDistancePoints: -10 },
      { isCorrect: true, decisionTimeMs: 999999999, type: "exit-tap", classification: "cut_winner" },
      { decisionTimeMs: null, type: "tap", stopDistancePoints: null },
    ], 1, 3)] });
    for (const m of p.metrics) {
      expect(m.score).toBeGreaterThanOrEqual(0);
      expect(m.score).toBeLessThanOrEqual(100);
    }
  });

  it("old drill records missing decisionTimeMs / stopDistancePoints still produce a usable profile", () => {
    const p = disciplineProfile({ drillHistory: [
      mkHistory([{ isCorrect: true }, { isCorrect: false }, { isCorrect: true }], 2, 3),
      mkHistory([{ isCorrect: true }], 1, 1),
      mkHistory([{ isCorrect: false }], 0, 1),
    ] });
    expect(p.empty).toBe(false);
    expect(p.metrics.length).toBeGreaterThan(0);
  });
});