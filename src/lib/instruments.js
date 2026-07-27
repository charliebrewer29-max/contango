// Instrument profiles (spec 5.7) + candle data generators (spec 8.3)
// Strategy is the skill, instrument is the terrain.

export const INSTRUMENTS = {
  ES: { name: "E-mini S&P 500", basePrice: 5987.5, tickSize: 0.25, tickValue: 12.5, volMult: 1.0, noiseMult: 1.0,
        moves: "Fed policy, FOMC, CPI, employment data, earnings, broad risk sentiment",
        character: "Deepest liquidity, tightest spreads. Trends relatively orderly. The right first instrument for every strategy branch." },
  NQ: { name: "E-mini Nasdaq-100", basePrice: 21340.75, tickSize: 0.25, tickValue: 5.0, volMult: 1.8, noiseMult: 1.3,
        moves: "Same macro drivers as ES but tech-weighted — extra sensitivity to rates and big-tech earnings",
        character: "ES with the volatility turned up. Same setups appear, but they move faster and need wider stops." },
  CL: { name: "Crude Oil (WTI)", basePrice: 71.42, tickSize: 0.01, tickValue: 10.0, volMult: 1.5, noiseMult: 1.9,
        moves: "EIA Wednesday 10:30am ET, API Tuesday 4:30pm, OPEC+, geopolitical supply disruption, dollar strength",
        character: "Headline-driven, prone to violent reversals and false breakouts. Best for teaching a clean setup can fail." },
  GC: { name: "Gold", basePrice: 2385.2, tickSize: 0.1, tickValue: 10.0, volMult: 1.2, noiseMult: 0.8,
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

// Trend-following pattern: chop → clean breakout → rollover.
// Fixed decision points at bar indices 19 and 41.
export function generateTrendData(instrumentKey = "ES", seed = 7) {
  const inst = INSTRUMENTS[instrumentKey];
  const rand = mulberry32(seed);
  const bars = [];
  let price = inst.basePrice;
  const tick = inst.tickSize;
  const vol = inst.volMult;
  const noise = inst.noiseMult;

  for (let i = 0; i < 60; i++) {
    let change;
    if (i < 22) {
      // consolidation, gentle chop
      change = (rand() - 0.5) * tick * 4 * noise;
    } else if (i < 44) {
      // breakout up
      change = tick * (2 + rand() * 3) * vol;
    } else {
      // rollover / pullback
      change = -tick * (1 + rand() * 3) * vol;
    }
    const open = price;
    const close = roundToTick(open + change, tick);
    const high = roundToTick(Math.max(open, close) + rand() * tick * 2 * noise, tick);
    const low = roundToTick(Math.min(open, close) - rand() * tick * 2 * noise, tick);
    bars.push({ open, high, low, close, index: i });
    price = close;
  }
  return bars;
}

// Mean-reversion / range pattern: oscillating range.
// Decision points discovered from actual local low / high.
export function generateRangeScenario(instrumentKey = "ES", seed = 11) {
  const inst = INSTRUMENTS[instrumentKey];
  const rand = mulberry32(seed);
  const bars = [];
  let price = inst.basePrice;
  const tick = inst.tickSize;
  const vol = inst.volMult * 0.7;
  const noise = inst.noiseMult;
  let phase = 0;

  for (let i = 0; i < 60; i++) {
    // sine-like oscillation between support and resistance
    const wave = Math.sin(i / 6.5) * tick * 14 * vol;
    const jitter = (rand() - 0.5) * tick * 4 * noise;
    let change = wave / 4 + jitter;
    // mean revert toward the wave center
    const target = inst.basePrice + Math.sin(i / 6.5) * tick * 12 * vol;
    change = (target - price) * 0.3 + jitter;
    const open = price;
    const close = roundToTick(open + change, tick);
    const high = roundToTick(Math.max(open, close) + rand() * tick * 1.5 * noise, tick);
    const low = roundToTick(Math.min(open, close) - rand() * tick * 1.5 * noise, tick);
    bars.push({ open, high, low, close, index: i });
    price = close;
    void phase;
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

// Used by practice mode — infinite variation
export function generatePracticeData(pattern, instrumentKey, seed) {
  if (pattern === "consolidation-then-breakout") return generateTrendData(instrumentKey, seed);
  if (pattern === "mean-reversion-range") return generateRangeScenario(instrumentKey, seed);
  return generateTrendData(instrumentKey, seed);
}