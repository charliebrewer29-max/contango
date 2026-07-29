// Guardrail patterns for the AI coach. Pure (no SDK) so the regex can be unit
// tested without deploying. Imported by entry.ts. Every pattern requires
// DIRECTIVE framing (an imperative or a second-person/advisory construction),
// not the mere presence of a trading verb — descriptive language is allowed,
// bare imperatives and personalized recommendations are blocked.

export const FORBIDDEN: RegExp[] = [
  // Advisory / personalized framing near an action verb.
  // "You should buy here", "I'd go long at this level", "Here's my recommendation: short it"
  /\b(you should|you'?d better|you need to|you must|you ought to|you have to|you'?d|i recommend|i suggest( you)?|i advise( you)?|i'?d|i would|my recommendation is|here'?s my recommendation|let'?s|why not)\b[^.!?\n]{0,80}\b(buy|sell|go long|go short|long|short|enter|exit|trade|position|place|put|scale)\b/i,
  // Sentence-initial bare imperative: a trading verb commanding an object.
  // The object indicator distinguishes a command ("Buy the retest") from a
  // descriptive subject ("Sellers defended", "Sell pressure faded").
  /(^|[.!?\n]\s+)(buy|sell|short)\s+(the|a|an|this|that|these|those|your|my|his|her|its|it|them|now|here|into|in|out|at|on|some|more|short)\b/i,
  // Sentence-initial action phrases that are inherently directive.
  // "Go long at this level", "Enter a long position", "Place a stop at 5990"
  /(^|[.!?\n]\s+)(go long|go short|enter (a |the )?(long|short|position)|open (a |the )?(long|short|position)|place (a |the )?(trade|order|stop|limit|position)|scale (in|out))\b/i,
  // Real-market / live-price framing (correctly scoped - keep).
  /\b(real market|live market|live price|current price of|today'?s market|right now in the market)\b/i,
  // Personalized investment advice (correctly scoped - keep).
  /\b(personalized investment advice|tailored (investment|trading) advice)\b/i,
];

// Returns the index of the first matching pattern, or -1 if clean.
export function guardrailFail(text: string): number {
  for (let i = 0; i < FORBIDDEN.length; i++) {
    if (FORBIDDEN[i].test(text || "")) return i;
  }
  return -1;
}

export const BLOCKED_FIXTURES = [
  "You should buy here.",
  "I'd go long at this level.",
  "Buy the retest.",
  "Place a stop at 5990 in your account.",
  "Right now the real market is offering a clean breakout.",
  "Here's my recommendation: short it.",
];

export const ALLOWED_FIXTURES = [
  "When you buy a futures contract, you're taking on the full notional.",
  "That's a classic sell signal in this pattern.",
  "Traders often sell into that kind of exhaustion move.",
  "A breakout entry means buying the break of the range high.",
  "In this simulated drill, the disciplined exit was the retest.",
  "Sellers defended that level three times.",
  "Buyers stepped in, so sell pressure faded.",
];

// --- selfTest (not in the hot path; exported so the regex can be verified
// without deploying). Returns { passed, failures }. ---
export function selfTest() {
  const failures: { kind: string; text: string }[] = [];
  for (const s of BLOCKED_FIXTURES) {
    if (guardrailFail(s) < 0) failures.push({ kind: "should-block", text: s });
  }
  for (const s of ALLOWED_FIXTURES) {
    if (guardrailFail(s) >= 0) failures.push({ kind: "should-allow", text: s });
  }
  return { passed: failures.length === 0, failures };
}