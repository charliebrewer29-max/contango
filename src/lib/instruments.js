// Instrument profiles (spec 5.7) + candle data generators (spec 8.3)
// Strategy is the skill, instrument is the terrain.

export const INSTRUMENTS = {
  ES: { name: "E-mini S&P 500", basePrice: 5987.5, tickSize: 0.25, tickValue: 12.5, volMult: 1.0, noiseMult: 1.0, barVol: 0.0006,
        moves: "Fed policy, FOMC, CPI, employment data, earnings, broad risk sentiment",
        character: "Deepest liquidity, tightest spreads. Trends relatively orderly. The right first instrument for every strategy branch." },
  NQ: { name: "E-mini Nasdaq-100", basePrice: 21340.75, tickSize: 0.25, tickValue: 5.0, volMult: 1.8, noiseMult: 1.3, barVol: 0.0010,
        moves: "Same macro drivers as ES but tech-weighted - extra sensitivity to rates and big-tech earnings",
        character: "ES with the volatility turned up. Same setups appear, but they move faster and need wider stops." },
  CL: { name: "Crude Oil (WTI)", basePrice: 71.42, tickSize: 0.01, tickValue: 10.0, volMult: 1.5, noiseMult: 1.9, barVol: 0.0020,
        moves: "EIA Wednesday 10:30am ET, API Tuesday 4:30pm, OPEC+, geopolitical supply disruption, dollar strength",
        character: "Headline-driven, prone to violent reversals and false breakouts. Best for teaching a clean setup can fail." },
  GC: { name: "Gold", basePrice: 2385.2, tickSize: 0.1, tickValue: 10.0, volMult: 1.2, noiseMult: 0.8, barVol: 0.0008,
        moves: "Real interest rates (inverse), dollar strength (inverse), safe-haven demand, central bank buying",
        character: "Can trend persistently in a macro regime, then grind sideways. Good for regime recognition." },
};

export const MICROS = {
  MES: { parent: "ES", tickValue: 1.25, name: "Micro E-mini S&P 500" },
  MNQ: { parent: "NQ", tickValue: 0.5, name: "Micro E-mini Nasdaq-100" },
  MCL: { parent: "CL", tickValue: 1.0, name: "Micro Crude Oil" },
  MGC: { parent: "GC", tickValue: 1.0, name: "Micro Gold" },
};

// Simple seeded RNG so generated charts are reproducible per scenario seed
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundToTick(price, tickSize) {
  return Math.round(price / tickSize) * tickSize;
}

// Standard-normal sample via Box–Muller (real bar returns are ~normal with fat tails).
function gaussian(rand) {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Build one OHLC candle from a drift (mu) and stochastic volatility (sigma),
// both in PRICE units. The close is a normal return; wicks scale with sigma and
// sit longer on the side opposite the close (real rejection behavior), so trend
// bars show small wicks and big bodies while chop bars show balanced wicks.
function makeCandle(open, mu, sigma, tick, rand) {
  const ret = mu + sigma * gaussian(rand);             // per-bar return (price units)
  const close = roundToTick(open + ret, tick);
  const wickMean = sigma * 0.5;                         // typical wick ≈ half a bar's vol
  const bull = close >= open;
  const upperWick = Math.abs(gaussian(rand)) * wickMean * (bull ? 0.6 : 1.25);
  const lowerWick = Math.abs(gaussian(rand)) * wickMean * (bull ? 1.25 : 0.6);
  const high = roundToTick(Math.max(open, close) + Math.max(tick, upperWick), tick);
  const low = roundToTick(Math.min(open, close) - Math.max(tick, lowerWick), tick);
  return { open, high, low, close };
}

// Trend-following pattern modeled as a stochastic-volatility process:
// a mean-reverting (Ornstein–Uhlenbeck) drift rides a GARCH(1,1) volatility with
// clustering and a spike at the breakout, so trends accelerate and pull back
// like real markets. Chop → breakout up → rollover.
// Fixed decision points at bar indices 19 and 41.
export function generateTrendData(instrumentKey = "ES", seed = 7, difficulty = "medium") {
  const level = difficulty === true ? "messy" : difficulty === false ? "medium" : difficulty;
  const cfg = { easy: { vol: 0.7, spike: 0.03, gap: 0.04 }, medium: { vol: 1.0, spike: 0.05, gap: 0.08 }, messy: { vol: 1.4, spike: 0.16, gap: 0.16 } }[level] || { vol: 1.0, spike: 0.05, gap: 0.08 };
  const inst = INSTRUMENTS[instrumentKey];
  const rand = mulberry32(seed);
  const tick = inst.tickSize;
  const baseVol = inst.barVol * cfg.vol;  // difficulty scales noise
  const omega = baseVol * baseVol * 0.08;        // GARCH long-run floor
  const alpha = 0.10;                            // shock feedback
  const beta = 0.88;                             // vol persistence (clustering)
  let sigma2 = baseVol * baseVol;
  let mu = 0;
  let price = inst.basePrice;
  const bars = [];

  for (let i = 0; i < 60; i++) {
    // regime target drift: flat → up-trend → rollover
    const muTarget = i < 22 ? 0 : i < 44 ? baseVol * 0.55 : -baseVol * 0.45;
    // drift mean-reverts toward the regime target (OU), so trends accelerate & pull back
    mu = muTarget + (mu - muTarget) * 0.82 + gaussian(rand) * baseVol * 0.12;

    // volatility: clustering via GARCH + occasional spike; ignition at the breakout
    let shock = 1;
    if (i === 22) shock = 2.2;
    else if (rand() < cfg.spike) shock = 1.6 + rand() * 0.9;
    const sigma = Math.sqrt(sigma2) * shock;

    // small overnight-style gap now and then
    let open = price;
    if (i > 0 && rand() < cfg.gap) open = roundToTick(open * (1 + gaussian(rand) * baseVol * 0.4), tick);

    const c = makeCandle(open, mu * open, sigma * open, tick, rand);
    bars.push({ ...c, index: i });

    // update GARCH variance from this bar's realized return
    const rFrac = (c.close - open) / open;
    sigma2 = omega + alpha * (rFrac - mu) * (rFrac - mu) + beta * sigma2;
    price = c.close;
  }
  return bars;
}

// Mean-reversion / range pattern: a quieter stochastic-volatility process whose
// drift mean-reverts toward a slowly oscillating fair value, producing a range
// that respects support/resistance with organic pullbacks.
// Decision points (local low / high) are discovered from the generated data.
export function generateRangeScenario(instrumentKey = "ES", seed = 11, difficulty = "medium") {
  const level = difficulty === true ? "messy" : difficulty === false ? "medium" : difficulty;
  const cfg = { easy: { vol: 0.7, spike: 0.03, gap: 0.03 }, medium: { vol: 1.0, spike: 0.05, gap: 0.05 }, messy: { vol: 1.5, spike: 0.14, gap: 0.12 } }[level] || { vol: 1.0, spike: 0.05, gap: 0.05 };
  const inst = INSTRUMENTS[instrumentKey];
  const rand = mulberry32(seed);
  const tick = inst.tickSize;
  const baseVol = inst.barVol * 0.7 * cfg.vol;   // difficulty scales range noise
  const omega = baseVol * baseVol * 0.06;
  const alpha = 0.08;
  const beta = 0.90;
  let sigma2 = baseVol * baseVol;
  let mu = 0;
  let price = inst.basePrice;
  const mid = inst.basePrice;
  const range = inst.basePrice * baseVol * 14;   // range half-width
  const bars = [];

  for (let i = 0; i < 60; i++) {
    // fair value oscillates slowly; drift is pulled back toward it (OU)
    const target = mid + Math.sin(i / 6.5) * range;
    const muTarget = ((target - price) / price) * 0.06;
    mu = muTarget + (mu - muTarget) * 0.7 + gaussian(rand) * baseVol * 0.1;

    const shock = rand() < cfg.spike ? 1.5 + rand() * 0.8 : 1;
    const sigma = Math.sqrt(sigma2) * shock;

    let open = price;
    if (i > 0 && rand() < cfg.gap) open = roundToTick(open * (1 + gaussian(rand) * baseVol * 0.3), tick);

    const c = makeCandle(open, mu * open, sigma * open, tick, rand);
    bars.push({ ...c, index: i });
    const rFrac = (c.close - open) / open;
    sigma2 = omega + alpha * (rFrac - mu) * (rFrac - mu) + beta * sigma2;
    price = c.close;
  }

  // discover local low and high indices in the middle portion
  let lowIdx = 10, highIdx = 30;
  let lowVal = Infinity, highVal = -Infinity;
  for (let i = 6; i < 54; i++) {
    if (bars[i].low < lowVal) { lowVal = bars[i].low; lowIdx = i; }
    if (bars[i].high > highVal) { highVal = bars[i].high; highIdx = i; }
  }
  return { bars, lowIdx, highIdx };
}

// Used by practice mode - infinite variation
export function generatePracticeData(pattern, instrumentKey, seed) {
  if (pattern === "consolidation-then-breakout") return generateTrendData(instrumentKey, seed);
  if (pattern === "mean-reversion-range") return generateRangeScenario(instrumentKey, seed);
  return generateTrendData(instrumentKey, seed);
}