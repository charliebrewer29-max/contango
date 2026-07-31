import { describe, it, expect } from "vitest";
import { BRANCHES } from "../content";

// Drills are the most-repeated activity in the app: Practice invites unlimited
// reps. Prompts used to be hardcoded one-per-anchor, so ten reps served the same
// two questions ten times. These tests lock in the variant pools.

const drillBranches = BRANCHES.filter((b) => typeof b.buildDrill === "function");

describe("drill prompt variety", () => {
  it("every branch with a drill builds successfully", () => {
    expect(drillBranches.length).toBeGreaterThanOrEqual(4);
    for (const b of drillBranches) {
      const d = b.buildDrill("ES", "medium");
      expect(Array.isArray(d.bars)).toBe(true);
      expect(Array.isArray(d.decisionPoints)).toBe(true);
      expect(d.decisionPoints.length).toBeGreaterThan(0);
    }
  });

  it("graded prompts are never empty and always have a valid correct index", () => {
    for (const b of drillBranches) {
      for (let run = 0; run < 40; run++) {
        for (const dp of b.buildDrill("ES", "medium").decisionPoints) {
          expect(typeof dp.prompt).toBe("string");
          expect(dp.prompt.length).toBeGreaterThan(10);
          if (dp.type === "mcq") {
            expect(Array.isArray(dp.options)).toBe(true);
            expect(dp.options.length).toBeGreaterThanOrEqual(2);
            expect(dp.correct).toBeGreaterThanOrEqual(0);
            expect(dp.correct).toBeLessThan(dp.options.length);
            // A correct answer that is blank would render an unanswerable question.
            expect(String(dp.options[dp.correct]).length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("each mcq anchor yields more than one distinct prompt across runs", () => {
    for (const b of drillBranches) {
      const seen = new Map(); // barIndex -> Set of prompts
      for (let run = 0; run < 60; run++) {
        for (const dp of b.buildDrill("ES", "medium").decisionPoints) {
          if (dp.type !== "mcq") continue;
          const key = String(dp.barIndex);
          if (!seen.has(key)) seen.set(key, new Set());
          seen.get(key).add(dp.prompt);
        }
      }
      for (const [, prompts] of seen) {
        // 60 runs against a pool of 4 collapsing to 1 would mean sampling is broken.
        expect(prompts.size).toBeGreaterThan(1);
      }
    }
  });

  it("no two anchors in the same drill ask the identical question", () => {
    for (const b of drillBranches) {
      for (let run = 0; run < 40; run++) {
        const prompts = b.buildDrill("ES", "medium").decisionPoints.map((d) => d.prompt);
        expect(new Set(prompts).size).toBe(prompts.length);
      }
    }
  });
});
