import { describe, it, expect } from "vitest";
// The guardrail regex live in the backend (base44/functions/aiCoachFeedback/
// guardrail.ts) so the deployed function and the test share one source. The
// test itself lives under src/ because the backend runtime validator forbids
// `vitest` imports anywhere under base44/functions/.
import {
  guardrailFail, selfTest, BLOCKED_FIXTURES, ALLOWED_FIXTURES,
} from "../../../base44/functions/aiCoachFeedback/guardrail";

describe("selfTest", () => {
  it("passes with the canonical fixtures", () => {
    const r = selfTest();
    expect(r.passed).toBe(true);
    expect(r.failures).toEqual([]);
  });
});

describe("must BLOCK (directive / trading-advice language)", () => {
  const blocked = [
    "You should buy here.",
    "I'd go long at this level.",
    "Buy the retest.",
    "Place a stop at 5990 in your account.",
    "Right now the real market is offering a clean breakout.",
    "Here's my recommendation: short it.",
  ];
  for (const text of blocked) {
    it(`blocks: "${text}"`, () => {
      expect(guardrailFail(text)).toBeGreaterThanOrEqual(0);
    });
  }
  it("every BLOCKED_FIXTURE is blocked", () => {
    for (const s of BLOCKED_FIXTURES) expect(guardrailFail(s)).toBeGreaterThanOrEqual(0);
  });
});

describe("must ALLOW (descriptive / educational language)", () => {
  for (const text of ALLOWED_FIXTURES) {
    it(`allows: "${text}"`, () => {
      expect(guardrailFail(text)).toBe(-1);
    });
  }
});