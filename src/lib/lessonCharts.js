// Lesson chart-practice generator.
// Returns a `chart` stage object embedded into the lesson flow so every
// concept lesson includes a real candlestick chart to read - not just text.
// Each scenario tests the SPECIFIC concept the lesson teaches.
//
// Notes are written like a mentor's quick debrief - warm, plain, specific.

import { generateTrendData, generateRangeScenario } from "./instruments";

const T = generateTrendData;
const R = generateRangeScenario;

export function buildLessonChart(unitId) {
  switch (unitId) {
    case "contracts": {
      const bars = T("ES", 3);
      const pts = Math.max(1, Math.round(Math.abs(bars[44].close - bars[22].close)));
      return {
        type: "chart", instrument: "ES", bars, revealTo: bars.length,
        prompt: `This breakout moved about ${pts} points. On one ES contract, that's roughly:`,
        options: [`$${pts * 12}`, `$${pts * 50}`, `$${pts * 5}`, `$${pts * 2}`], correct: 1,
        entryPrice: bars[22].close,
        note: `Here's the math: ES pays $50 per index point. So ${pts} points × $50 = $${pts * 50} on one contract - yet you only put up a fraction of that as margin. That's leverage. The same thing that makes your winners bigger makes your losers bigger too. Worth remembering.`,
      };
    }
    case "ticks": {
      const bars = T("ES", 5);
      const pts = Math.max(1, Math.round(Math.abs(bars[30].close - bars[22].close)));
      const ticks = pts * 4;
      return {
        type: "chart", instrument: "ES", bars, revealTo: bars.length,
        prompt: `This move covers about ${pts} points (${ticks} ticks). How much is it worth per ES contract?`,
        options: [`$${pts * 10}`, `$${pts * 50}`, `$${pts * 5}`, `$${ticks}`], correct: 1,
        note: `Each ES tick is $12.50. ${ticks} ticks × $12.50 = $${ticks * 12}... which is the same as ${pts} points × $50 = $${pts * 50}. Tick math turns "the market moved" into the only number that actually matters to your account: dollars at risk.`,
      };
    }
    case "micros": {
      const bars = T("ES", 9);
      const pts = Math.max(1, Math.round(Math.abs(bars[40].close - bars[22].close)));
      return {
        type: "chart", instrument: "MES", bars, revealTo: bars.length,
        prompt: `Same ${pts}-point move, but on a Micro (MES) contract it's worth:`,
        options: [`$${pts * 50}`, `$${pts * 5}`, `$${pts * 1}`, `$${pts * 500}`], correct: 1,
        note: `MES is one-tenth of ES - $5 per point instead of $50. ${pts} points × $5 = $${pts * 5}. Micros let you practice the exact same market move for a tenth of the cost. Real practice, affordable risk.`,
      };
    }
    case "order-types": {
      const bars = T("ES", 4);
      const entry = bars[24].close;
      const stop = Math.min(...bars.slice(18, 24).map(b => b.low)) - 0.5;
      return {
        type: "chart", instrument: "ES", bars, revealTo: 40,
        prompt: "You're long from the breakout. Price drops to your stop line. What order just triggered?",
        options: ["A limit buy", "A market sell (your stop)", "A limit sell at a better price", "Nothing - stops don't fill"], correct: 1,
        entryPrice: entry, stopPrice: stop,
        note: "The moment price hits your stop, it becomes a market order - you're out fast, but at whatever price the market gives you, not a price you picked. That's the trade-off versus a stop-limit, which holds out for your price but might not fill at all.",
      };
    }
    case "sessions": {
      const bars = T("ES", 6);
      return {
        type: "chart", instrument: "ES", bars, revealTo: bars.length,
        prompt: "Overnight (ETH) sessions are thinner than the cash session. Which is true of overnight trading?",
        options: ["Tighter spreads and more volume", "Wider spreads and lower liquidity", "No trading is allowed", "Identical to RTH"], correct: 1,
        note: "Overnight, fewer people are trading, so spreads widen and the order book thins out. Real liquidity crowds into RTH (9:30am–4:00pm ET). You can feel it live: tight spreads, deep books, frequent prints. That's liquidity you can trust.",
      };
    }
    case "es-profile": {
      const bars = T("ES", 8);
      return {
        type: "chart", instrument: "ES", bars, revealTo: bars.length,
        prompt: "ES broke out of consolidation. What confirms this is a real trend, not noise?",
        options: ["A body close beyond the prior swing high", "A single wick that poked higher", "A lower high right after", "A gap down the next bar"], correct: 0,
        entryPrice: bars[22].close,
        note: "Confirmation means a body close beyond the range - not just a wick that poked through. Once ES confirms, its trends tend to run orderly, and its liquidity is the deepest around. That's why it's the friendliest place to learn any strategy.",
      };
    }
    case "nq-profile": {
      const bars = T("NQ", 12);
      return {
        type: "chart", instrument: "NQ", bars, revealTo: bars.length,
        prompt: "Same breakout shape as ES, but NQ. The move is bigger and faster. What does NQ demand versus ES?",
        options: ["Tighter stops than ES", "Wider stops than ES", "No stops at all", "Identical stop placement"], correct: 1,
        entryPrice: bars[22].close,
        note: "NQ swings harder than ES on the same setup, so a stop that felt right on ES gets tagged on noise here. Same pattern, different sizing. Give it more room - or you'll be right about direction and still lose.",
      };
    }
    case "cl-profile": {
      const bars = T("CL", 15);
      return {
        type: "chart", instrument: "CL", bars, revealTo: bars.length,
        prompt: "CL broke out... then reversed hard. What is this pattern?",
        options: ["A clean trend", "A false breakout", "A tight range", "An overnight gap"], correct: 1,
        entryPrice: bars[24].close,
        note: "CL is headline-driven and famous for false breakouts. The lesson isn't that your setup was bad - it's that a clean setup CAN fail here. So size smaller, and always know your risk before you click.",
      };
    }
    case "gc-profile": {
      const { bars } = R("GC", 5);
      return {
        type: "chart", instrument: "GC", bars, revealTo: bars.length,
        prompt: "GC is grinding sideways in a range. Which strategy fits this market?",
        options: ["Trend following", "Mean reversion", "Breakout buying", "None - never trade it"], correct: 1,
        note: "In a range, trend-following and breakout-buying bleed you slowly with false breakouts. Mean reversion - fading the band back toward the middle - fits. Regime recognition is half the battle: knowing which strategy NOT to use.",
      };
    }
    case "first-chart": {
      const bars = T("ES", 20);
      return {
        type: "chart", instrument: "ES", bars, revealTo: bars.length,
        prompt: "Contango's bar-by-bar drills practice the exact mechanic that real platforms call:",
        options: ["Bar Replay", "Order entry", "Price alerts", "Watchlists"], correct: 0,
        note: "TradingView and most platforms have a Replay feature that reveals bars one at a time - which is exactly what you've been doing here. So you're already practicing the core skill of a real platform. Nice.",
      };
    }
    case "trend-intro": {
      const bars = T("ES", 21);
      return {
        type: "chart", instrument: "ES", bars, revealTo: bars.length,
        prompt: "Looking at this completed trend, where should a trend follower have entered?",
        options: ["Before the breakout, guessing the direction", "On a confirmed close beyond the consolidation high", "At the very top, after the run", "In the middle of the chop"], correct: 1,
        entryPrice: bars[23].close,
        note: "You enter on confirmation - a close beyond the range - not on a hunch. Waiting costs you a slightly worse entry price; the payoff is you skip most false breakouts. That's a trade worth making.",
      };
    }
    case "mr-intro": {
      const { bars, lowIdx } = R("ES", 7);
      return {
        type: "chart", instrument: "ES", bars, revealTo: bars.length,
        prompt: "Price tagged the bottom of the range and rejected. Where does a mean-reversion trader enter?",
        options: ["At the range mid", "Buy the rejection, targeting the mid/VWAP", "Short the breakdown below the range", "Wait for the range to break first"], correct: 1,
        entryPrice: bars[lowIdx].close,
        stopPrice: bars[lowIdx].low - 0.5,
        note: "Fade the extreme on rejection, aiming back at the middle. Put your stop just beyond the band - if the range breaks, you're out. The thing that kills mean reversion IS the range breaking. Plan for it.",
      };
    }
    default:
      return null;
  }
}