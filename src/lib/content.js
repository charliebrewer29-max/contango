// Curriculum content — conforms to the lesson schema in spec Section 5.3
// Foundation, Risk & Psychology, Instruments, Strategy branches, Platform Literacy.
//
// Voice: a mentor talking to a student — plain, warm, second-person. No
// encyclopedic drone. The facts stay; the tone is human.

import { generateTrendData, generateRangeScenario } from "./instruments";
import { PSYCH_UNITS, DIARY_ENTRIES } from "./psychCurriculum";
import { EXTRA_QUESTIONS, EXTRA_UNITS, EXTRA_BRANCHES } from "./extraCurriculum";

export const BRANCHES = [
  {
    id: "foundation",
    branchTitle: "Foundation",
    icon: "GraduationCap",
    unlockRequires: [],
    type: "core",
    blurb: "Market mechanics — contracts, margin, ticks, order types, sessions. It's required, and it unlocks everything else.",
    color: "amber",
    units: [
      {
        id: "contracts",
        type: "concept",
        title: "Contracts & Leverage",
        info: "A futures contract is an agreement to buy or sell a set amount of something at a future date, at a price you lock in today. As a day trader you rarely take delivery — you close the trade well before expiration. The idea that changes everything is margin: instead of putting up the full contract value, you put up a small fraction of it. That fraction is leverage, and it's why a small price move becomes a large dollar move. Leverage doesn't play favorites — it magnifies your gains and your losses by exactly the same amount.",
        questions: [
          { q: "As a day trader, what do you do with a futures contract before expiration?", options: ["Take physical delivery", "Exit the position before expiration", "Hold it forever", "Convert it to stock"], correct: 1 },
          { q: "What is margin in futures trading?", options: ["A fee paid to the broker", "The full value of the contract", "A fraction of contract value put up as collateral", "A government tax"], correct: 2 },
          { q: "Why does leverage amplify both gains and losses?", options: ["Because it only applies to gains", "Because you control a large position with a small deposit", "Because the broker covers losses", "Because margin changes daily"], correct: 1 },
        ],
      },
      {
        id: "ticks",
        type: "concept",
        title: "Tick Value & Specs",
        info: "Every futures contract has a tick size — the smallest amount its price can move — and a tick value — the dollars each tick is worth. For the E-mini S&P 500 (ES), the tick size is 0.25 points and each tick is $12.50. So a 4-point move (16 ticks) is $200 per contract. Knowing your tick math turns 'the market moved 2 points' into 'that's $100 per contract' — which is the number that actually matters to your account.",
        questions: [
          { q: "What is the tick size of the ES contract?", options: ["1.00 point", "0.50 point", "0.25 point", "0.10 point"], correct: 2 },
          { q: "How much is one ES tick worth in dollars?", options: ["$5.00", "$12.50", "$10.00", "$50.00"], correct: 1 },
          { q: "If ES moves 2 points (8 ticks), how much is that per contract?", options: ["$25", "$50", "$100", "$200"], correct: 2 },
        ],
      },
      {
        id: "micros",
        type: "concept",
        title: "Micro Contracts",
        info: "Every major futures contract has a Micro version at one-tenth the size. MES is one-tenth of ES, so its tick is $1.25 instead of $12.50. A 20-tick mistake costs $25 on MES instead of $250 on ES. This is the honest answer to 'how much do I need to start?' — Micros make real practice affordable, and they let you size a position precisely instead of jumping straight from 1 contract to 2.",
        questions: [
          { q: "What is the tick value of MES (Micro ES)?", options: ["$12.50", "$1.25", "$5.00", "$0.50"], correct: 1 },
          { q: "How many Micro contracts equal one full-size ES?", options: ["5", "10", "20", "100"], correct: 1 },
          { q: "Why do Micros matter for beginners?", options: ["They have higher leverage", "They make practice affordable and allow precise sizing", "They move faster", "They have no margin requirement"], correct: 1 },
        ],
      },
      {
        id: "order-types",
        type: "concept",
        title: "Order Types",
        info: "A market order fills right now at the best available price — fast, but you take whatever price the market gives you. A limit order only fills at your price or better — you control the price, but there's no guarantee it fills. A stop order triggers a market order once a price is hit — that's how you exit losers or enter breakouts. The DOM (depth of market) shows resting bid/ask orders and depth, which is how you tell whether a market is actually liquid right now.",
        questions: [
          { q: "Which order guarantees a fill but not a price?", options: ["Limit", "Market", "Stop-limit", "Good-til-cancelled"], correct: 1 },
          { q: "Which order guarantees a price but not a fill?", options: ["Market", "Stop", "Limit", "Trailing stop"], correct: 2 },
          { q: "What does the DOM show you?", options: ["Historical prices only", "Resting bid/ask orders and market depth", "Your P&L", "News headlines"], correct: 1 },
        ],
      },
      {
        id: "sessions",
        type: "concept",
        title: "Sessions & Liquidity",
        info: "Futures trade almost 24 hours, but liquidity isn't constant. Regular Trading Hours (RTH) for equity index futures is the US cash session, roughly 9:30am–4:00pm ET — that's where the volume and liquidity live. Overnight (ETH) is thinner, with wider spreads. You can gauge liquidity in real time by watching spread tightness, order depth, how often trades print, and volume versus open interest.",
        questions: [
          { q: "When are US equity index futures most liquid?", options: ["Overnight ETH", "During RTH (US cash session)", "Weekends", "Market open only"], correct: 1 },
          { q: "Which is NOT a way to gauge real-time liquidity?", options: ["Bid/ask spread", "Resting order depth", "Trade frequency", "Your account balance"], correct: 3 },
          { q: "Why are overnight spreads wider?", options: ["Lower volume and thinner participation", "Higher leverage", "Exchange rules", "Daylight saving"], correct: 0 },
        ],
      },
    ],
  },
  {
    id: "risk-psych",
    branchTitle: "Risk & Psychology",
    icon: "ShieldCheck",
    unlockRequires: [],
    type: "core",
    blurb: "Position sizing, stop placement, risk/reward, and discipline. Required — it gates the strategy tree.",
    color: "rose",
    units: PSYCH_UNITS,
  },
  {
    id: "instruments",
    branchTitle: "Instruments",
    icon: "Layers",
    unlockRequires: ["foundation-complete"],
    type: "core",
    blurb: "ES, NQ, CL, GC: what each contract is, what moves it, how it behaves. Strategy is the skill; the instrument is the terrain.",
    color: "sky",
    units: [
      {
        id: "es-profile",
        type: "concept",
        title: "ES — E-mini S&P 500",
        info: "$50 per index point, 0.25 tick, $12.50 per tick. ES moves on Fed policy, FOMC, CPI, jobs data, earnings, and broad risk sentiment. It has the deepest liquidity and tightest spreads of the group, and its trends are relatively orderly — which is why it's the friendliest first instrument for every strategy branch.",
        questions: [
          { q: "How much is each ES tick worth?", options: ["$5.00", "$10.00", "$12.50", "$50.00"], correct: 2 },
          { q: "Which is NOT a primary driver of ES?", options: ["FOMC decisions", "CPI data", "OPEC+ supply decisions", "Employment data"], correct: 2 },
          { q: "Why is ES the right first instrument?", options: ["It's the most volatile", "Deepest liquidity and orderly trends", "It has no tick value", "It never trends"], correct: 1 },
        ],
      },
      {
        id: "nq-profile",
        type: "concept",
        title: "NQ — E-mini Nasdaq-100",
        info: "$20 per index point, 0.25 tick, $5.00 per tick. Same macro drivers as ES but tech-weighted, so it's extra sensitive to rates and big-tech earnings. Think of NQ as ES with the volume turned up: the same setups appear, but they move faster and need wider stops. A great second instrument — it teaches you that the same pattern can demand different sizing.",
        questions: [
          { q: "NQ tick value is:", options: ["$12.50", "$5.00", "$10.00", "$1.25"], correct: 1 },
          { q: "Compared to ES, NQ is:", options: ["Slower and quieter", "Faster and needs wider stops", "Identical in behavior", "Less liquid overnight only"], correct: 1 },
          { q: "What makes NQ extra sensitive versus ES?", options: ["Its tech weighting", "Lower margin", "Smaller tick", "Gold exposure"], correct: 0 },
        ],
      },
      {
        id: "cl-profile",
        type: "concept",
        title: "CL — Crude Oil (WTI)",
        info: "1,000 barrels, $0.01 tick, $10.00 per tick. CL moves on the EIA Weekly Petroleum Status Report (Wednesdays 10:30am ET), the API release (Tuesday 4:30pm ET), OPEC+ decisions, geopolitical supply disruptions, and the dollar. Inventory draws are bullish, builds are bearish. It's headline-driven and prone to violent reversals and false breakouts — the best instrument for learning that even a clean setup can fail.",
        questions: [
          { q: "When is the EIA crude oil report released?", options: ["Monday 8am", "Wednesday 10:30am ET", "Friday close", "Any time"], correct: 1 },
          { q: "An inventory draw is typically:", options: ["Bearish", "Bullish", "Neutral", "Irrelevant"], correct: 1 },
          { q: "What is CL's defining trading character?", options: ["Quiet and trending", "Headline-driven with false breakouts", "Never moves", "Only trades overnight"], correct: 1 },
        ],
      },
      {
        id: "gc-profile",
        type: "concept",
        title: "GC — Gold",
        info: "100 troy ounces, $0.10 tick, $10.00 per tick. Gold moves on real interest rates (inverse), the dollar (inverse), safe-haven demand, and central bank buying. It can trend persistently inside a macro regime, then grind sideways for ages. That makes it a great teacher of regime recognition — knowing when NOT to apply a trend strategy.",
        questions: [
          { q: "Gold's relationship to real interest rates is generally:", options: ["Positive", "Inverse", "Unrelated", "Volatile only"], correct: 1 },
          { q: "What does GC teach especially well?", options: ["Scalping speed", "Regime recognition", "Options pricing", "Day trading only"], correct: 1 },
          { q: "GC tick value is:", options: ["$10.00", "$12.50", "$5.00", "$1.00"], correct: 0 },
        ],
      },
    ],
  },
  {
    id: "platform-literacy",
    branchTitle: "Platform Literacy",
    icon: "MonitorPlay",
    unlockRequires: [],
    type: "optional",
    blurb: "How to use a real charting platform (TradingView). Open from day one — it bridges your practice to a real tool.",
    color: "violet",
    units: [
      {
        id: "first-chart",
        type: "concept",
        title: "Your First Chart",
        info: "On any charting platform you start with symbol search and timeframe. Timeframe changes everything about what you're looking at: a 1-minute chart shows intraday noise — that's where day-trading setups live; a daily chart shows the bigger trend you're trading within. Picking a timeframe is really picking the question you're asking — 'what's happening right now?' versus 'what's been happening for weeks?' Contango's drills practice the exact bar-replay mechanic that real platforms call Replay.",
        questions: [
          { q: "What does timeframe selection change?", options: ["Nothing", "What you're looking at entirely", "Only the colors", "Your account balance"], correct: 1 },
          { q: "A 1-minute chart is best for seeing:", options: ["The multi-month trend", "Intraday day-trading setups", "Annual returns", "Dividends"], correct: 1 },
          { q: "Contango's drills mirror which real-platform feature?", options: ["Order entry", "Bar Replay", "Alerts", "Watchlists"], correct: 1 },
        ],
      },
    ],
  },
  {
    id: "trend",
    branchTitle: "Trend Following",
    icon: "TrendingUp",
    unlockRequires: ["foundation-complete", "risk-psych-complete"],
    type: "strategy",
    blurb: "Ride established directional moves. Breakout entries, trailing exits.",
    color: "emerald",
    introLesson: {
      id: "trend-intro",
      type: "concept",
      title: "What Is Trend Following",
      info: "Trend following rides established directional moves: you enter when a breakout confirms a new direction, then let the trade run with a trailing exit. Use it when a market shows a clear directional bias after a consolidation. It fails in choppy, range-bound markets where breakouts reverse right away — the classic false breakout. The five-part template: (1) trade it in a trending regime, not a range; (2) confirmation is a close beyond the prior swing high/low; (3) profit is open-ended, you trail the stop; (4) loss is capped at the stop below the breakout; (5) the failure mode is the false breakout — price breaks out, then reverses on you.",
      questions: [
        { q: "Where does a trend follower enter?", options: ["At the bottom", "On a confirmed breakout", "At random", "At the top"], correct: 1 },
        { q: "What's the failure mode of trend following?", options: ["The false breakout", "Overnight gaps", "Commission costs", "Slow fills"], correct: 0 },
        { q: "How is profit characterized in trend following?", options: ["Capped at a target", "Open-ended, you trail the stop", "Fixed dollar amount", "Unlimited with no stop"], correct: 1 },
        { q: "Where does the stop go structurally?", options: ["Above the entry", "Below the breakout level", "At the entry price", "There is no stop"], correct: 1 },
      ],
    },
    buildDrill: (instrumentKey = "ES", messy = false) => {
      const bars = generateTrendData(instrumentKey, 7, messy);
      const lowBeforeBreakout = Math.min(...bars.slice(0, 22).map(b => b.low));
      return {
        bars,
        instrument: instrumentKey,
        decisionPoints: [
          { barIndex: 19, type: "mcq", prompt: "Price is just consolidating — no breakout yet. What's the right move?", options: ["Buy now — anticipate the breakout", "Wait for a confirmed close beyond the range", "Sell short the range", "Buy with maximum size"], correct: 1 },
          { barIndex: 41, type: "mcq", prompt: "We broke out and ran up, now we're pulling back. Where does the trailing stop sit?", options: ["Above the entry", "Below the recent swing low", "At the original breakout level", "No stop — let it run forever"], correct: 1 },
        ],
        entryZone: { zoneStart: 22, zoneEnd: 26 },
        stopPrice: lowBeforeBreakout,
      };
    },
  },
  {
    id: "mean-reversion",
    branchTitle: "Mean Reversion",
    icon: "Activity",
    unlockRequires: ["foundation-complete", "risk-psych-complete"],
    type: "strategy",
    blurb: "Fade extremes back toward the middle of an established range. VWAP mean reversion.",
    color: "amber",
    introLesson: {
      id: "mr-intro",
      type: "concept",
      title: "What Is Mean Reversion",
      info: "Mean reversion fades extremes back toward the middle of an established range. VWAP (volume-weighted average price) is the fair-value reference intraday futures traders actually use, and standard-deviation bands around it are the standard timing tool. Use it inside a defined range where support and resistance are being respected. It fails when the range breaks and 'overbought' keeps going — the loss comes from a range becoming a trend. The five-part template: (1) use it in a range, not a trend; (2) confirmation is a rejection at the band; (3) profit is capped at the opposite band or VWAP; (4) loss is capped at a stop beyond the band; (5) the failure mode is the range break.",
      questions: [
        { q: "What's the fair-value reference intraday futures traders use?", options: ["VWAP", "The daily high", "Open interest", "The cash close"], correct: 0 },
        { q: "Where do you enter a mean-reversion trade?", options: ["In the middle of the range", "At the band extreme on rejection", "After the range breaks", "At random"], correct: 1 },
        { q: "What's the failure mode of mean reversion?", options: ["The range break", "A slow fill", "Low volume", "A tight spread"], correct: 0 },
        { q: "Where does the stop go?", options: ["At VWAP", "Beyond the band", "At the entry", "No stop needed"], correct: 1 },
      ],
    },
    buildDrill: (instrumentKey = "ES", messy = false) => {
      const { bars, lowIdx, highIdx } = generateRangeScenario(instrumentKey, 11, messy);
      return {
        bars,
        instrument: instrumentKey,
        decisionPoints: [
          { barIndex: lowIdx, type: "mcq", prompt: "Price tagged the low of the range and is bouncing. What's the move?", options: ["Sell short", "Buy the bounce toward the range mid", "Hold through the band", "Wait for the range to break"], correct: 1 },
          { barIndex: highIdx, type: "mcq", prompt: "Price tagged the top of the range. On a short fade, where does the stop go?", options: ["Above the range high", "At the mid", "Below the low", "No stop"], correct: 0 },
        ],
        entryZone: { zoneStart: lowIdx - 1, zoneEnd: lowIdx + 1 },
        stopPrice: bars[Math.max(0, lowIdx - 2)].low,
      };
    },
  },
];

// Expand the curriculum at module load: extra questions per unit, new units in
// existing branches, and entirely new learning areas. Every consumer of
// BRANCHES (skill tree, practice catalog, insights, reminders) sees the
// merged content automatically.
for (const b of BRANCHES) {
  if (b.units) for (const u of b.units) {
    if (EXTRA_QUESTIONS[u.id]) u.questions = [...(u.questions || []), ...EXTRA_QUESTIONS[u.id]];
  }
  if (b.introLesson && EXTRA_QUESTIONS[b.introLesson.id]) {
    b.introLesson.questions = [...(b.introLesson.questions || []), ...EXTRA_QUESTIONS[b.introLesson.id]];
  }
}
for (const { branchId, unit } of EXTRA_UNITS) {
  const b = BRANCHES.find((x) => x.id === branchId);
  if (b && b.units) b.units.push(unit);
}
for (const eb of EXTRA_BRANCHES) BRANCHES.push(eb);

export function findBranch(id) {
  return BRANCHES.find(b => b.id === id);
}

export function allUnitsFlat() {
  const out = [];
  for (const b of BRANCHES) {
    if (b.units) for (const u of b.units) out.push({ branch: b, unit: u });
    if (b.introLesson) out.push({ branch: b, unit: b.introLesson });
  }
  return out;
}

export { DIARY_ENTRIES };