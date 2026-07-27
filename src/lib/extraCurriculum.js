// Curriculum expansion — extra questions for existing units, brand-new units
// inside existing branches, and entirely new learning areas (branches).
// Merged into BRANCHES by content.js at module load, so every consumer
// (skill tree, practice catalog, insights, reminders) sees it automatically.
//
// Voice: mentor, plain, second-person — same as the rest of the curriculum.

import { generateTrendData } from "./instruments";

// Extra questions appended to existing units / intro lessons (keyed by id).
export const EXTRA_QUESTIONS = {
  contracts: [
    { q: "You put up $5,000 margin to control a $100,000 contract. What's your leverage?", options: ["5:1", "20:1", "100:1", "1:5"], correct: 1 },
    { q: "At 20:1 leverage, a 1% adverse move costs you roughly:", options: ["1% of margin", "5% of margin", "20% of margin", "0% of margin"], correct: 2 },
    { q: "'Notional value' refers to:", options: ["Your margin deposit", "The full contract value you control", "The tick size", "Your realized P&L"], correct: 1 },
    { q: "Why can leverage wipe out a futures account faster than spot trading?", options: ["Lower fees", "A small adverse move can exceed your margin", "Brokers charge interest", "It only affects gains"], correct: 1 },
    { q: "Day traders avoid delivery mainly by:", options: ["Holding to expiration", "Closing the position before expiration", "Using only limit orders", "Trading micros exclusively"], correct: 1 },
  ],
  ticks: [
    { q: "ES is $50/point. A 3.25-point move per contract is:", options: ["$75", "$162.50", "$40", "$325"], correct: 1 },
    { q: "NQ is $20/point, tick $5. A 5-point move per contract is:", options: ["$25", "$100", "$50", "$10"], correct: 1 },
    { q: "Tick size exists mainly to:", options: ["Generate broker fees", "Set a minimum price increment and orderly matching", "Limit leverage", "Determine margin"], correct: 1 },
    { q: "A 4-point stop on ES risks, per contract:", options: ["$50", "$200", "$100", "$12.50"], correct: 1 },
    { q: "On MES, a 4-point stop risks about:", options: ["$20", "$200", "$50", "$5"], correct: 0 },
  ],
  micros: [
    { q: "MCL (Micro Crude) tick is $1.00. A 20-tick stop risks:", options: ["$20", "$200", "$2", "$10"], correct: 0 },
    { q: "One MNQ (Micro Nasdaq) equals:", options: ["1/2 NQ", "1/5 NQ", "1/10 NQ", "1/100 NQ"], correct: 2 },
    { q: "Micro contracts are best for:", options: ["Maximizing leverage", "Sizing precisely and risking less per trade", "Avoiding tick value", "Hedging large portfolios"], correct: 1 },
    { q: "If you can risk $30/trade, a 3-tick ES stop ($37.50) is over budget. On MES it's:", options: ["$3.75", "$37.50", "$30", "$12.50"], correct: 0 },
    { q: "A key psychological benefit of Micros for new traders is:", options: ["Bigger P&L swings", "Lower pressure per trade", "No need for stops", "Faster fills"], correct: 1 },
  ],
  "order-types": [
    { q: "After triggering, a plain stop becomes a:", options: ["Limit order", "Market order", "Cancel-only order", "It stays a stop"], correct: 1 },
    { q: "A stop-limit that triggers but never fills means:", options: ["You're flat — risk gone", "You're still in the trade — risk unmanaged", "A fee is charged", "Nothing — it cancels instantly"], correct: 1 },
    { q: "Market-order slippage is worst when:", options: ["Liquidity is high", "The market is thin or moving fast", "You use a limit", "RTH opens"], correct: 1 },
    { q: "To guarantee you exit a losing trade, use a:", options: ["Limit at your target", "Market stop (stop order)", "Good-til-cancelled limit", "Bracket with no stop"], correct: 1 },
    { q: "A limit buy placed below the current price is:", options: ["A stop order", "A resting order waiting to fill", "A market order", "An immediate fill"], correct: 1 },
  ],
  sessions: [
    { q: "The thinnest, widest-spread condition is typically:", options: ["RTH open", "Sunday-evening ETH open", "Friday RTH close", "Wednesday 10:30am ET"], correct: 1 },
    { q: "Spreads tighten most during:", options: ["ETH overnight", "The RTH cash session", "Sunday open", "Market holidays"], correct: 1 },
    { q: "Equity-index volume peaks around:", options: ["The midday lull", "RTH open and close", "Overnight", "Pre-market ETH"], correct: 1 },
    { q: "Why avoid holding through CPI / FOMC releases?", options: ["Spreads widen and volatility spikes unpredictably", "Commissions rise", "Ticks get smaller", "It's not allowed"], correct: 0 },
    { q: "The lunch lull (roughly 12–1pm ET) usually brings:", options: ["Higher volatility", "Lower volume and choppy action", "Market closure", "Better fills"], correct: 1 },
  ],
  "es-profile": [
    { q: "ES is $50/point. A 10-point move per contract is:", options: ["$50", "$100", "$500", "$5"], correct: 2 },
    { q: "ES is most heavily driven by:", options: ["OPEC decisions", "US large-cap equity risk sentiment", "Gold supply", "Weather"], correct: 1 },
    { q: "ES's most liquid session is:", options: ["ETH", "RTH (9:30–16:00 ET)", "Sunday open", "The Asian session"], correct: 1 },
    { q: "During FOMC, ES typically:", options: ["Stays flat", "Shows elevated volatility and wider spreads", "Closes", "Suspends ticks"], correct: 1 },
    { q: "A reason ES suits beginners:", options: ["Highest volatility", "Deep liquidity and relatively orderly moves", "No margin required", "It never gaps"], correct: 1 },
  ],
  "nq-profile": [
    { q: "NQ tracks the:", options: ["S&P 500", "Nasdaq-100", "Dow 30", "Russell 2000"], correct: 1 },
    { q: "NQ is $20/point. A 25-point move per contract is:", options: ["$500", "$250", "$100", "$50"], correct: 0 },
    { q: "Versus ES, NQ tends to move:", options: ["Slower", "More volatile and faster", "Identically", "Less"], correct: 1 },
    { q: "NQ is extra sensitive to:", options: ["Agricultural reports", "Big-tech earnings and rate expectations", "Oil inventories", "Gold prices"], correct: 1 },
    { q: "Moving from ES to NQ, a beginner should:", options: ["Keep the same stop distances", "Widen stops and size down", "Increase leverage", "Ignore volatility"], correct: 1 },
  ],
  "cl-profile": [
    { q: "CL is 1,000 barrels, tick $0.01 = $10. A $0.50 move per contract is:", options: ["$500", "$50", "$5", "$1,000"], correct: 0 },
    { q: "CL is most active around:", options: ["Sunday open", "The EIA report (Wed 10:30am ET)", "RTH equity open only", "The Asian session"], correct: 1 },
    { q: "An inventory build usually pressures price:", options: ["Up", "Down", "Sideways", "Not at all"], correct: 1 },
    { q: "CL false breakouts are common because:", options: ["It has no liquidity", "Headline-driven flows reverse fast", "It never trends", "Ticks are tiny"], correct: 1 },
    { q: "Trading through the EIA release is risky because:", options: ["Spreads and volatility spike violently", "The market closes", "Commissions double", "Ticks change"], correct: 0 },
  ],
  "gc-profile": [
    { q: "GC is 100 oz, tick $0.10 = $10. A $5.00 move per contract is:", options: ["$500", "$50", "$5,000", "$100"], correct: 0 },
    { q: "Gold generally rises when real interest rates:", options: ["Rise", "Fall", "Stay flat", "Peak"], correct: 1 },
    { q: "GC tends to:", options: ["Only trend", "Trend within regimes, then grind sideways", "Never move", "Move only overnight"], correct: 1 },
    { q: "A weaker dollar usually:", options: ["Lowers gold", "Lifts gold", "Has no effect", "Closes gold"], correct: 1 },
    { q: "GC teaches regime recognition because:", options: ["It's always trending", "It switches between trending and sideways regimes", "It has no drivers", "It's illiquid"], correct: 1 },
  ],
  "trend-intro": [
    { q: "A trend follower's edge comes from:", options: ["Predicting tops", "Catching part of big moves and cutting losers", "Holding losers", "Avoiding stops"], correct: 1 },
    { q: "'Let profits run' means:", options: ["Take profit fast", "Trail a stop rather than fixing a target", "Add to losers", "Never exit"], correct: 1 },
    { q: "Trend following expects:", options: ["High win rate, small gains", "Low win rate, large winners outweighing many small losers", "100% wins", "No stops"], correct: 1 },
    { q: "The first sign a breakout is failing:", options: ["Volume dries up, then price reverses through the level", "Price accelerates", "The trend strengthens", "RTH opens"], correct: 0 },
    { q: "Trend following works best when:", options: ["The market is ranging", "A clear directional regime exists", "Volatility is zero", "Overnight only"], correct: 1 },
  ],
  "mr-intro": [
    { q: "VWAP is the:", options: ["Volume-weighted average price", "Moving average of closes", "Daily high", "Open interest"], correct: 0 },
    { q: "Mean reversion targets:", options: ["The opposite band or VWAP", "A trailing stop", "A breakout level", "The daily low"], correct: 0 },
    { q: "A standard-deviation band acts as:", options: ["A guaranteed stop", "A timing reference for extremes", "A breakout signal", "A margin level"], correct: 1 },
    { q: "Mean reversion fails when:", options: ["The range holds", "The range breaks and price trends", "VWAP is flat", "Volume rises"], correct: 1 },
    { q: "Don't use mean reversion when:", options: ["Price respects the range", "A fresh breakout is underway", "Bands are wide", "VWAP is respected"], correct: 1 },
  ],
};

// New units appended into existing branches (branchId + unit).
export const EXTRA_UNITS = [
  {
    branchId: "foundation",
    unit: {
      id: "margin-mechanics",
      type: "concept",
      title: "Margin Mechanics",
      info: "Initial margin is what you deposit to open a trade. Maintenance margin is the minimum you must keep to hold it. If your balance falls below maintenance, the broker issues a margin call — and in futures they don't always wait for your call; they can liquidate your position automatically, at the market. The takeaway: leverage means the exchange can close you out before you decide to. Keep a buffer above maintenance, and never sit right on the edge.",
      questions: [
        { q: "What's the difference between initial and maintenance margin?", options: ["Initial opens the trade; maintenance is the floor to keep it", "They're the same thing", "Maintenance is higher", "Initial is a fee"], correct: 0 },
        { q: "If your balance drops below maintenance, the broker can:", options: ["Wait for your phone call", "Liquidate your position automatically at the market", "Waive the margin", "Increase your leverage"], correct: 1 },
        { q: "A sensible habit with leveraged positions is to:", options: ["Hold right at maintenance", "Keep a buffer well above maintenance", "Ignore the balance", "Add more contracts"], correct: 1 },
        { q: "You avoid margin calls by:", options: ["Trading without stops", "Sizing so a normal adverse move doesn't approach maintenance", "Using maximum leverage", "Trading only overnight"], correct: 1 },
      ],
    },
  },
  {
    branchId: "foundation",
    unit: {
      id: "settlement",
      type: "concept",
      title: "Settlement & Expiration",
      info: "Most equity-index futures (ES, NQ) settle in cash at expiration — no shares change hands. Physical-delivery contracts (CL, GC) can involve delivery of the actual commodity, which is why day traders roll out of the front month well before first notice day. Index futures run on a quarterly cycle (Mar/Jun/Sep/Dec); to keep trading, you roll to the next active month instead of holding into delivery.",
      questions: [
        { q: "ES and NQ settle via:", options: ["Physical delivery of shares", "Cash settlement", "Gold", "No settlement"], correct: 1 },
        { q: "Why do day traders roll out of CL before first notice day?", options: ["Lower fees", "To avoid physical delivery of crude oil", "To increase leverage", "No reason"], correct: 1 },
        { q: "Index futures typically expire on a:", options: ["Daily cycle", "Quarterly cycle (Mar/Jun/Sep/Dec)", "Weekly cycle", "Decade cycle"], correct: 1 },
        { q: "Rolling a contract means:", options: ["Closing the current month and opening the next active month", "Holding to expiration forever", "Doubling size", "Switching instruments entirely"], correct: 0 },
      ],
    },
  },
  {
    branchId: "foundation",
    unit: {
      id: "contango-backwardation",
      type: "concept",
      title: "Contango & Backwardation",
      info: "The futures curve links nearby and distant contracts. Contango is when distant prices are higher than near prices — the norm for storable commodities with carry costs. Backwardation is the opposite: near above distant, signaling scarcity or strong demand now. Rolling a long in contango costs you (negative roll yield); in backwardation, rolling pays you (positive roll yield). This term structure is what the app is named for — and it shapes every carry trade.",
      questions: [
        { q: "Contango means:", options: ["Near prices > distant prices", "Distant prices > near prices", "Prices are flat", "No curve exists"], correct: 1 },
        { q: "Backwardation usually signals:", options: ["Abundant supply", "Scarcity or strong near-term demand", "A bear market", "A flat curve"], correct: 1 },
        { q: "Rolling a long in contango generally gives:", options: ["Positive roll yield", "Negative roll yield", "No effect", "Guaranteed profit"], correct: 1 },
        { q: "Which costs often explain a contango curve?", options: ["Storage, insurance, financing (carry)", "Taxes", "Commissions", "Tick size"], correct: 0 },
        { q: "The app is named Contango because:", options: ["It's a stock symbol", "Term structure shapes carry and each instrument's behavior", "It means 'winning'", "It's a broker name"], correct: 1 },
      ],
    },
  },
  {
    branchId: "foundation",
    unit: {
      id: "leverage-math",
      type: "concept",
      title: "Leverage Math in Practice",
      info: "Leverage math is just ratios — but it's the ratio that ends accounts. Notional = contract size × price; leverage = notional ÷ margin. A 2% adverse move at 20:1 leverage eats 40% of your margin. The safe habit: pick your dollar risk first, then size contracts so a normal stop equals that risk — never the other way around.",
      questions: [
        { q: "Notional value is:", options: ["Your margin", "Contract size × price", "Tick value", "Your P&L"], correct: 1 },
        { q: "At 10:1 leverage, a 1% adverse move costs:", options: ["1% of margin", "10% of margin", "0.1% of margin", "100% of margin"], correct: 1 },
        { q: "The safe way to size is to:", options: ["Use maximum contracts", "Pick dollar risk first, then set size so the stop equals that risk", "Match the crowd", "Avoid stops"], correct: 1 },
        { q: "A 3-point ES stop risks $150/contract but you can risk $75. You'd use:", options: ["2 ES contracts", "1 ES contract (over budget)", "MES — ~5 contracts to match $75", "No stop"], correct: 2 },
      ],
    },
  },
  {
    branchId: "instruments",
    unit: {
      id: "mnq-profile",
      type: "concept",
      title: "MNQ — Micro Nasdaq-100",
      info: "MNQ is the Micro Nasdaq-100: one-tenth of NQ. Tick 0.25 = $0.50, point value $2. A 20-point NQ move that's $400 on NQ is $40 on MNQ. It lets you practice NQ's speed without the heat — perfect for learning the most volatile index with small, honest stakes.",
      questions: [
        { q: "MNQ tick value is:", options: ["$5.00", "$0.50", "$2.00", "$12.50"], correct: 1 },
        { q: "MNQ is what fraction of NQ?", options: ["1/2", "1/5", "1/10", "1/100"], correct: 2 },
        { q: "A 20-point NQ move on one MNQ is:", options: ["$400", "$40", "$200", "$4"], correct: 1 },
      ],
    },
  },
  {
    branchId: "instruments",
    unit: {
      id: "mcl-profile",
      type: "concept",
      title: "MCL — Micro Crude",
      info: "MCL is Micro Crude, one-tenth of CL. Tick $0.01 = $1.00 (vs $10 on CL). Crude's violent headline moves cost a tenth as much, so you can practice reacting to EIA and OPEC headlines with small, controlled risk.",
      questions: [
        { q: "MCL tick value is:", options: ["$10.00", "$1.00", "$0.10", "$5.00"], correct: 1 },
        { q: "A $0.40 crude move on one MCL is:", options: ["$400", "$40", "$4", "$4,000"], correct: 1 },
        { q: "MCL is best for:", options: ["Maximum leverage", "Practicing crude's volatility with small risk", "Avoiding tick value", "Day trading only"], correct: 1 },
      ],
    },
  },
  {
    branchId: "instruments",
    unit: {
      id: "ym-rty",
      type: "concept",
      title: "YM & RTY — Dow & Russell",
      info: "YM (E-mini Dow, $5/point, tick 1 = $5) is the slowest, bluest-chip index. RTY (E-mini Russell 2000, $50/point, tick 0.10 = $5) tracks small-caps and is the most volatile of the equity-index group. Together they broaden your toolkit beyond ES/NQ — same strategies, different personality.",
      questions: [
        { q: "YM point value is:", options: ["$50", "$5", "$20", "$2"], correct: 1 },
        { q: "RTY (Russell 2000) tends to be:", options: ["The slowest index", "The most volatile equity-index contract", "Identical to ES", "Never trending"], correct: 1 },
        { q: "RTY tick (0.10) is worth:", options: ["$50", "$5", "$0.50", "$10"], correct: 1 },
      ],
    },
  },
];

// Brand-new branches (whole new learning areas).
export const EXTRA_BRANCHES = [
  {
    id: "breakout",
    branchTitle: "Opening Range Breakout",
    icon: "Zap",
    unlockRequires: ["foundation-complete", "risk-psych-complete"],
    type: "strategy",
    blurb: "Trade the first real move of the session: define the opening range, then enter the break with volume.",
    color: "amber",
    introLesson: {
      id: "breakout-intro",
      type: "concept",
      title: "What Is Opening Range Breakout",
      info: "The opening range breakout (ORB) trades the first move out of the day's initial balance. Define the range over the first 15–30 minutes; a close beyond the high (or low) with volume is the trigger; target a measured move or trail the stop; place the stop back inside the range. It fails when price breaks out, pulls in entries, then reverses — the classic stop-run. It works best early in RTH when volume is highest.",
      questions: [
        { q: "The opening range is typically defined over:", options: ["The full session", "The first 15–30 minutes", "Overnight only", "The last hour"], correct: 1 },
        { q: "A valid ORB trigger is:", options: ["Any tick beyond the range", "A close beyond the range high/low with volume", "A limit order", "The lunch lull"], correct: 1 },
        { q: "On an ORB long, the stop goes:", options: ["Above the range high", "Back inside the opening range", "At VWAP", "Nowhere"], correct: 1 },
        { q: "ORB's failure mode is the:", options: ["Stop-run / fakeout reversal", "Slow grind", "Lunch lull", "Overnight gap"], correct: 0 },
        { q: "ORB works best when:", options: ["Liquidity is lowest", "Early RTH volume is highest", "Overnight", "The market is closed"], correct: 1 },
      ],
    },
    buildDrill: () => {
      const bars = generateTrendData("ES");
      const rangeBars = bars.slice(0, 16);
      const rangeHigh = Math.max(...rangeBars.map((b) => b.high));
      const rangeLow = Math.min(...rangeBars.map((b) => b.low));
      return {
        bars,
        instrument: "ES",
        decisionPoints: [
          { barIndex: 15, type: "mcq", prompt: "The opening range is set — no breakout yet. What's the right move?", options: ["Buy the middle of the range", "Wait for a close beyond the range high or low", "Short straight into the range high", "Size up immediately"], correct: 1 },
          { barIndex: 30, type: "mcq", prompt: "We broke above the opening range. Where does the stop sit?", options: ["Above the range high", "Below the opening range low", "At the entry price", "No stop"], correct: 1 },
        ],
        entryZone: { zoneStart: 17, zoneEnd: 21 },
        stopPrice: rangeLow,
      };
    },
  },
];