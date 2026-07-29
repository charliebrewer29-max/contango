import { describe, it, expect } from "vitest";
import {
  INSTRUMENTS, MICROS, generateTrendData, lastVerified,
} from "../instruments";

describe("contract specs (exact tickSize / tickValue)", () => {
  it("ES 0.25 / 12.50", () => {
    expect(INSTRUMENTS.ES.tickSize).toBe(0.25);
    expect(INSTRUMENTS.ES.tickValue).toBe(12.5);
  });
  it("NQ 0.25 / 5.00", () => {
    expect(INSTRUMENTS.NQ.tickSize).toBe(0.25);
    expect(INSTRUMENTS.NQ.tickValue).toBe(5);
  });
  it("CL 0.01 / 10.00", () => {
    expect(INSTRUMENTS.CL.tickSize).toBe(0.01);
    expect(INSTRUMENTS.CL.tickValue).toBe(10);
  });
  it("GC 0.10 / 10.00", () => {
    expect(INSTRUMENTS.GC.tickSize).toBe(0.1);
    expect(INSTRUMENTS.GC.tickValue).toBe(10);
  });
});

describe("micros", () => {
  it("every micro is exactly 1/10 of its parent tick value", () => {
    for (const m of Object.values(MICROS)) {
      const parent = INSTRUMENTS[m.parent];
      expect(m.tickValue).toBeCloseTo(parent.tickValue / 10, 10);
    }
  });
});

const EPS = 1e-6;
function isMultipleOf(value, tick) {
  return Math.abs(value - Math.round(value / tick) * tick) < EPS;
}

describe("candle validity", () => {
  for (const key of Object.keys(INSTRUMENTS)) {
    it(`${key}: high>=max(open,close), low<=min, high>=low, OHLC multiples of tickSize`, () => {
      const bars = generateTrendData(key, 7, "medium");
      expect(bars.length).toBe(60);
      const tick = INSTRUMENTS[key].tickSize;
      for (const b of bars) {
        expect(b.high).toBeGreaterThanOrEqual(Math.max(b.open, b.close) - EPS);
        expect(b.low).toBeLessThanOrEqual(Math.min(b.open, b.close) + EPS);
        expect(b.high).toBeGreaterThanOrEqual(b.low - EPS);
        expect(isMultipleOf(b.open, tick)).toBe(true);
        expect(isMultipleOf(b.high, tick)).toBe(true);
        expect(isMultipleOf(b.low, tick)).toBe(true);
        expect(isMultipleOf(b.close, tick)).toBe(true);
      }
    });
  }
});

describe("determinism", () => {
  it("same seed produces identical bars", () => {
    expect(generateTrendData("ES", 42, "medium")).toEqual(generateTrendData("ES", 42, "medium"));
  });
  it("different seeds produce different bars", () => {
    expect(generateTrendData("ES", 1, "medium")).not.toEqual(generateTrendData("ES", 2, "medium"));
  });
});

describe("typical bar range in ticks", () => {
  const bands = { ES: [2, 30], NQ: [5, 80], CL: [3, 60], GC: [5, 70] };
  for (const key of Object.keys(INSTRUMENTS)) {
    it(`${key}: avg range falls in the expected band at current base prices`, () => {
      const bars = generateTrendData(key, 7, "medium");
      const tick = INSTRUMENTS[key].tickSize;
      const avgTicks = bars.reduce((a, b) => a + (b.high - b.low) / tick, 0) / bars.length;
      const [lo, hi] = bands[key];
      expect(avgTicks).toBeGreaterThanOrEqual(lo);
      expect(avgTicks).toBeLessThanOrEqual(hi);
    });
  }
});

describe("difficulty volatility", () => {
  function avgRangeTicks(difficulty, seed) {
    const bars = generateTrendData("ES", seed, difficulty);
    const tick = INSTRUMENTS.ES.tickSize;
    return bars.reduce((a, b) => a + (b.high - b.low) / tick, 0) / bars.length;
  }
  it("messy produces higher realized volatility than easy", () => {
    const messy = [1, 2, 3, 4, 5].reduce((s, sd) => s + avgRangeTicks("messy", sd), 0) / 5;
    const easy = [1, 2, 3, 4, 5].reduce((s, sd) => s + avgRangeTicks("easy", sd), 0) / 5;
    expect(messy).toBeGreaterThan(easy);
  });
});

describe("metadata", () => {
  it("lastVerified is a real YYYY-MM-DD date string", () => {
    expect(lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});