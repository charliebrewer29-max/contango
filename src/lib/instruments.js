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

// Build one realistic OHLC candle: variable body size (doji → momentum),
// mixed direction with counter-moves, occasional long rejection wicks.
function makeCandle(open, bias, bodyVol, wickVol, tick, rand) {
  const goUp = rand() < 0.5 + bias * 0.45;
  const dir = goUp ? 1 : -1;
  const sizeRoll = rand();
  let bodyMult;
  if (sizeRoll < 0.12) bodyMult = 0.1 + rand() * 0.3;     // indecision / doji
  else if (sizeRoll > 0.9) bodyMult = 1.4 + rand() * 1.3; // momentum bar
  else bodyMult = 0.45 + rand() * 0.85;                   // normal
  const change = dir * bodyMult * bodyVol * tick * (0.8 + rand() * 1.5);
  const close = roundToTick(open + change, tick);
  const wick = () => (rand() < 0.18 ? 1.6 + rand() * 2.2 : 0.15 + rand() * 1.1) * wickVol * tick;
  const high = roundToTick(Math.max(open, close) + wick(), tick);
  const low = roundToTick(Math.min(open, close) - wick(), tick);
  return { open, high, low, close };
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
    let bias, bodyVol, wickVol;
    if (i < 22) {
      // consolidation: flat chop, small bodies, longer relative wicks
      bias = 0.08 * Math.sin(i / 3);
      bodyVol = vol * 1.3;
      wickVol = noise * 2.4;
    } else if (i < 44) {
      // breakout up: mostly green with pullbacks, momentum bars
      bias = 0.72;
      bodyVol = vol * 3.2;
      wickVol = noise * 1.3;
    } else {
      // rollover / pullback: mostly red with bounces
      bias = -0.62;
      bodyVol = vol * 2.6;
      wickVol = noise * 1.6;
    }
    let open = price;
    if (i > 0 && rand() < 0.06) open = roundToTick(open + (rand() - 0.3) * tick * 6 * vol, tick); // occasional gap
    const c = makeCandle(open, bias, bodyVol, wickVol, tick, rand);
    bars.push({ ...c, index: i });
    price = c.close;
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
  const vol = inst.volMult * 0.6;
  const noise = inst.noiseMult;
  const range = tick * 15 * vol;
  const mid = inst.basePrice;

  for (let i = 0; i < 60; i++) {
    const target = mid + Math.sin(i / 6.5) * range;
    const bias = ((target - price) / range) * 0.85;
    let open = price;
    if (i > 0 && rand() < 0.05) open = roundToTick(open + (rand() - 0.5) * tick * 4, tick);
    const c = makeCandle(open, bias, vol * 1.7, noise * 1.9, tick, rand);
    bars.push({ ...c, index: i });
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

// Used by practice mode — infinite variation
export function generatePracticeData(pattern, instrumentKey, seed) {
  if (pattern === "consolidation-then-breakout") return generateTrendData(instrumentKey, seed);
  if (pattern === "mean-reversion-range") return generateRangeScenario(instrumentKey, seed);
  return generateTrendData(instrumentKey, seed);
}