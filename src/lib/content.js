// Curriculum content — conforms to the lesson schema in spec Section 5.3
// Foundation, Risk & Psychology, Instruments, Strategy branches, Platform Literacy.

import { generateTrendData, generateRangeScenario } from "./instruments";

export const BRANCHES = [
  {
    id: "foundation",
    branchTitle: "Foundation",
    icon: "GraduationCap",
    unlockRequires: [],
    type: "core",
    blurb: "Market mechanics: contracts, margin, ticks, order types, sessions. Required — unlocks everything.",
    color: "amber",
    units: [
      {
        id: "contracts",
        type: "concept",
        title: "Contracts & Leverage",
        info: "A futures contract is an agreement to buy or sell a set amount of an asset at a future date, at a price agreed today. You never take delivery as a day trader — you exit before expiration. The key idea is margin: you don't put up the full contract value, you put up a fraction. That fraction is leverage, and leverage is why a small price move becomes a large dollar move. Leverage amplifies both gains and losses equally.",
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
        info: "Every futures contract has a tick size — the minimum price increment it can move — and a tick value — the dollar amount each tick is worth. For the E-mini S&P 500 (ES), the tick size is 0.25 index points and each tick is worth $12.50. So a 4-point move (16 ticks) equals $200 per contract. Knowing tick math turns 'the market moved 2 points' into 'that's $100 per contract,' which is the number that actually matters to your account.",
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
        info: "Every major futures contract has a Micro version at one-tenth the size. MES is one-tenth of ES, so its tick value is $1.25 instead of $12.50. A 20-tick mistake costs $25 on MES instead of $250 on ES. This is the honest answer to 'how much money do I need to start' — Micros make real practice affordable, and they let you size a position precisely instead of jumping from 1 contract to 2.",
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
        info: "Market orders fill immediately at the best available price — fast but you accept whatever price the market gives you. Limit orders only fill at your specified price or better — control over price, but no guarantee of a fill. Stop orders trigger a market order once a price is hit — used to exit losers or enter breakouts. Reading the DOM (depth of market) shows you resting bid/ask orders and market depth, which is how you gauge whether a market is liquid right now.",
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
        info: "Futures trade nearly 24 hours, but liquidity is not constant. Regular Trading Hours (RTH) for equity index futures is the US cash session, roughly 9:30am–4:00pm ET — that's where volume and liquidity concentrate. Overnight (ETH) trades thinner with wider spreads. You gauge real-time liquidity by watching bid/ask spread tightness, resting order depth, trade frequency, and volume versus open interest.",
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
    blurb: "Position sizing, stop placement, risk/reward, discipline. Required — gates the strategy tree.",
    color: "rose",
    units: [
      {
        id: "position-sizing",
        type: "concept",
        title: "Position Sizing",
        info: "Position sizing is a formula, not a feeling: Stop distance in ticks × tick value × number of contracts = dollars at risk. Decide that dollar number BEFORE looking at the chart. This is where Micros earn their place — they're the lever that makes the formula work on a small account, letting you size to your risk budget instead of rounding up to a full contract.",
        questions: [
          { q: "What's the position sizing formula?", options: ["Ticks × contracts", "Stop ticks × tick value × contracts", "Account size × leverage", "Price × volume"], correct: 1 },
          { q: "When should you decide your dollar risk?", options: ["After entering", "Before looking at the chart", "When the trade is profitable", "Never"], correct: 1 },
          { q: "Why do Micros matter for sizing?", options: ["They're cheaper to trade", "They let you size precisely to a risk budget", "They have no risk", "They increase leverage"], correct: 1 },
        ],
      },
      {
        id: "stops",
        type: "concept",
        title: "Stop-Loss Discipline",
        info: "Every trade needs a stop, decided before entry. In a leveraged product, an unmanaged loser outruns your reaction time — the market can move more ticks in seconds than your gut is willing to accept in dollars. The stop is the price where your thesis is wrong, full stop. If that stop is too far for your risk budget, you trade fewer contracts or you don't take the trade.",
        questions: [
          { q: "When is a stop-loss decided?", options: ["After the trade goes against you", "Before entry", "At end of day", "When margin call hits"], correct: 1 },
          { q: "Why can't you rely on reaction time to exit losers?", options: ["Leverage moves faster than you can react", "Brokers won't let you exit", "It's illegal", "Stops cost money"], correct: 0 },
          { q: "If the structural stop is too far for your budget, what do you do?", options: ["Move the stop closer", "Trade fewer contracts or skip the trade", "Add leverage", "Hope"], correct: 1 },
        ],
      },
      {
        id: "risk-reward",
        type: "concept",
        title: "Risk-to-Reward",
        info: "Target roughly 1.5–2x the amount you risk. With a 2:1 reward-to-risk, you can be wrong more than half the time and still be profitable — a system doesn't need a high win rate to work. The drill: given an entry and a stop, where does the target have to be to justify the trade?",
        questions: [
          { q: "What's a healthy minimum reward-to-risk target?", options: ["0.5:1", "1:1", "1.5–2:1", "10:1"], correct: 2 },
          { q: "With 2:1 R:R, what win rate keeps you profitable?", options: ["Over 90%", "Roughly above one-third", "Exactly 50%", "100%"], correct: 1 },
          { q: "Given a 4-tick stop, where should a 2:1 target sit?", options: ["2 ticks away", "4 ticks away", "8 ticks away", "16 ticks away"], correct: 2 },
        ],
      },
      {
        id: "daily-loss-limit",
        type: "concept",
        title: "Daily Loss Limit",
        info: "A hard dollar or trade-count stop for the session. It prevents one bad day from becoming a bad week. This pairs naturally with the app's hearts mechanic — same idea in game form. When the limit is hit, you stop. Full stop. Revenge trading to 'make it back' is how small losses become account-ending ones.",
        questions: [
          { q: "What is a daily loss limit?", options: ["A suggested guideline", "A hard dollar or trade-count stop for the session", "A tax on losses", "A broker feature"], correct: 1 },
          { q: "What should you do when the daily limit is hit?", options: ["Trade smaller to recover", "Stop for the day", "Switch instruments", "Increase leverage"], correct: 1 },
          { q: "What does 'revenge trading' describe?", options: ["Trading with a plan", "Trying to make back losses emotionally", "Hedging", "Copying another trader"], correct: 1 },
        ],
      },
    ],
  },
  {
    id: "instruments",
    branchTitle: "Instruments",
    icon: "Layers",
    unlockRequires: ["foundation-complete"],
    type: "core",
    blurb: "ES, NQ, CL, GC: what each contract is, what moves it, how it behaves. Strategy is the skill; instrument is the terrain.",
    color: "sky",
    units: [
      {
        id: "es-profile",
        type: "concept",
        title: "ES — E-mini S&P 500",
        info: "$50 per index point, 0.25 tick, $12.50 per tick. Moved by Fed policy, FOMC, CPI, employment data, earnings, broad risk sentiment. Deepest liquidity and tightest spreads of the group. Trends are relatively orderly. The right first instrument for every strategy branch.",
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
        info: "$20 per index point, 0.25 tick, $5.00 per tick. Same macro drivers as ES but tech-weighted — extra sensitivity to interest rates and big-tech earnings. ES with the volatility turned up: same setups appear but move faster and need wider stops. A good second instrument because it teaches that the same pattern demands different sizing.",
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
        info: "1,000 barrels, $0.01 tick, $10.00 per tick. Moved by the EIA Weekly Petroleum Status Report (Wednesdays 10:30am ET), the API release (Tuesday 4:30pm ET), OPEC+ decisions, geopolitical supply disruption, dollar strength. Inventory draws are bullish, builds are bearish. Headline-driven and prone to violent reversals and false breakouts — the best instrument for teaching a clean setup can fail.",
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
        info: "100 troy ounces, $0.10 tick, $10.00 per tick. Moved by real interest rates (inverse), dollar strength (inverse), safe-haven demand, central bank buying. Can trend persistently in a macro regime, then grind sideways for long stretches. Good for teaching regime recognition — knowing when NOT to apply a trend strategy.",
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
    blurb: "How to use a real charting platform (TradingView). Unlocked from day one — bridges simulated practice to a real tool.",
    color: "violet",
    units: [
      {
        id: "first-chart",
        type: "concept",
        title: "Your First Chart",
        info: "In any charting platform you start with symbol search and timeframe selection. Timeframe changes everything about what you're looking at: a 1-minute chart shows intraday noise and is where day-trading setups live; a daily chart shows the bigger trend you're trading within. Picking the right timeframe is picking the right question — 'what is the market doing right now' versus 'what has it been doing for weeks.' Contango's drills practice the exact bar-replay mechanic that real platforms offer as a Replay feature.",
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
      info: "Trend following rides established directional moves: you enter when a breakout confirms a new direction, then let the trade run with a trailing exit. When to use it: a market showing a clear directional bias after a consolidation. When it fails: in a choppy, range-bound market where breakouts immediately reverse — the classic false breakout. The five-part template: (1) use it in a trending regime, not a range; (2) confirmation is a close beyond the prior swing high/low; (3) profit is open-ended, you trail the stop; (4) loss is capped at the stop below the breakout level; (5) failure mode is the false breakout, where price breaks out then immediately reverses.",
      questions: [
        { q: "Where does a trend follower enter?", options: ["At the bottom", "On a confirmed breakout", "At random", "At the top"], correct: 1 },
        { q: "What's the failure mode of trend following?", options: ["The false breakout", "Overnight gaps", "Commission costs", "Slow fills"], correct: 0 },
        { q: "How is profit characterized in trend following?", options: ["Capped at a target", "Open-ended, you trail the stop", "Fixed dollar amount", "Unlimited with no stop"], correct: 1 },
        { q: "Where does the stop go structurally?", options: ["Above the entry", "Below the breakout level", "At the entry price", "There is no stop"], correct: 1 },
      ],
    },
    buildDrill: () => {
      const bars = generateTrendData("ES");
      const lowBeforeBreakout = Math.min(...bars.slice(0, 22).map(b => b.low));
      return {
        bars,
        instrument: "ES",
        decisionPoints: [
          { barIndex: 19, type: "mcq", prompt: "Price is consolidating with no breakout yet. What's the right move?", options: ["Buy now — anticipate the breakout", "Wait for a confirmed close beyond the range", "Sell short the range", "Buy with maximum size"], correct: 1 },
          { barIndex: 41, type: "mcq", prompt: "We've broken out and run up, now pulling back. Where does the trailing stop sit?", options: ["Above the entry", "Below the recent swing low", "At the original breakout level", "No stop — let it run forever"], correct: 1 },
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
      info: "Mean reversion fades extremes back toward the middle of an established range. VWAP (volume-weighted average price) is the fair-value reference intraday futures traders actually use, and standard-deviation bands around it are the standard entry timing tool. When to use it: in a defined range where support and resistance are being respected. When it fails: when the range breaks and 'overbought' keeps going — the loss comes from a range becoming a trend. The five-part template: (1) use it in a range, not a trend; (2) confirmation is a rejection at the band; (3) profit is capped at the opposite band or VWAP; (4) loss is capped at a stop beyond the band; (5) failure mode is the range break.",
      questions: [
        { q: "What's the fair-value reference intraday futures traders use?", options: ["VWAP", "The daily high", "Open interest", "The cash close"], correct: 0 },
        { q: "Where do you enter a mean-reversion trade?", options: ["In the middle of the range", "At the band extreme on rejection", "After the range breaks", "At random"], correct: 1 },
        { q: "What's the failure mode of mean reversion?", options: ["The range break", "A slow fill", "Low volume", "A tight spread"], correct: 0 },
        { q: "Where does the stop go?", options: ["At VWAP", "Beyond the band", "At the entry", "No stop needed"], correct: 1 },
      ],
    },
    buildDrill: () => {
      const { bars, lowIdx, highIdx } = generateRangeScenario("ES");
      return {
        bars,
        instrument: "ES",
        decisionPoints: [
          { barIndex: lowIdx, type: "mcq", prompt: "Price has touched the low of the range and is bouncing. What's the move?", options: ["Sell short", "Buy the bounce toward the range mid", "Hold through the band", "Wait for the range to break"], correct: 1 },
          { barIndex: highIdx, type: "mcq", prompt: "Price tagged the top of the range. Where does the stop go on a short fade?", options: ["Above the range high", "At the mid", "Below the low", "No stop"], correct: 0 },
        ],
        entryZone: { zoneStart: lowIdx - 1, zoneEnd: lowIdx + 1 },
        stopPrice: bars[Math.max(0, lowIdx - 2)].low,
      };
    },
  },
];

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