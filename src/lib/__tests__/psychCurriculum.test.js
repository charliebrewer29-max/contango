import { describe, it, expect } from "vitest";
import { PSYCH_UNITS } from "../psychCurriculum";

// Risk & Psychology is the Discipline Engine's own subject matter and was the
// thinnest branch in the curriculum. These guard the depth pass: a quiz with a
// wrong `correct` index renders an unanswerable question, and a `notes` array
// that has drifted out of alignment attributes the wrong coaching to an answer.

const quizzes = PSYCH_UNITS.flatMap((u) =>
  (u.stages || []).filter((s) => s.type === "quiz").map((s) => ({ unit: u.id, ...s })),
);
const teaching = PSYCH_UNITS.filter((u) => !u.id.startsWith("diary-"));

describe("risk-psych depth", () => {
  it("every teaching unit has at least 5 quiz stages", () => {
    for (const u of teaching) {
      const n = (u.stages || []).filter((s) => s.type === "quiz").length;
      expect({ unit: u.id, n }).toEqual({ unit: u.id, n: expect.any(Number) });
      expect(n).toBeGreaterThanOrEqual(5);
    }
  });

  it("diary units stay reflective with no graded questions", () => {
    for (const u of PSYCH_UNITS.filter((x) => x.id.startsWith("diary-"))) {
      expect((u.stages || []).filter((s) => s.type === "quiz").length).toBe(0);
    }
  });
});

describe("quiz integrity", () => {
  it("every quiz has a question, options, and a valid correct index", () => {
    expect(quizzes.length).toBeGreaterThanOrEqual(45);
    for (const q of quizzes) {
      expect(typeof q.q, q.unit).toBe("string");
      expect(q.q.length).toBeGreaterThan(10);
      expect(Array.isArray(q.options), q.unit).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correct, `${q.unit}: ${q.q}`).toBeGreaterThanOrEqual(0);
      expect(q.correct, `${q.unit}: ${q.q}`).toBeLessThan(q.options.length);
      expect(String(q.options[q.correct]).length).toBeGreaterThan(0);
    }
  });

  it("notes, where present, align one-to-one with options", () => {
    for (const q of quizzes) {
      if (!q.notes) continue;
      expect(q.notes.length, `${q.unit}: ${q.q}`).toBe(q.options.length);
      for (const n of q.notes) expect(String(n).length).toBeGreaterThan(0);
    }
  });

  it("no duplicate question text across the whole branch", () => {
    const seen = new Set();
    for (const q of quizzes) {
      expect(seen.has(q.q), `duplicate: ${q.q}`).toBe(false);
      seen.add(q.q);
    }
  });

  it("options within a single quiz are distinct", () => {
    for (const q of quizzes) {
      expect(new Set(q.options).size, `${q.unit}: ${q.q}`).toBe(q.options.length);
    }
  });
});
