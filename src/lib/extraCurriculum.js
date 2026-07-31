// Drill prompts are the most-repeated content in the app: Practice invites
// unlimited reps and the bars are regenerated every run, but the QUESTIONS were
// hardcoded one-per-anchor. Ten reps meant the same two prompts ten times, which
// is what makes the app feel repetitive even though the lesson library is large.
//
// Each anchor now draws from a pool of equivalent-difficulty variants that probe
// the same decision from different angles, sampled per run.
export function pickVariant(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// --- breakout ---------------------------------------------------------------
export const BREAKOUT_PRE = [
  { prompt: "The opening range is set - no breakout yet. What's the right move?", options: ["Buy now and anticipate", "Wait for a confirmed close beyond the range", "Short the range low", "Double normal size"], correct: 1 },
  { prompt: "The opening range is established. What exactly are you waiting for?", options: ["Any touch of the range high", "A close beyond the range, not a poke", "Three green bars", "The session to end"], correct: 1 },
  { prompt: "Entering before the opening range has finished forming means:", options: ["You get the best price", "You have no range to break yet", "Your stop is tighter", "Nothing, it's identical"], correct: 1 },
  { prompt: "Price pokes above the range then closes back inside. That is:", options: ["A confirmed breakout", "A failed breakout, not a signal", "A reason to add", "Irrelevant"], correct: 1 },
];
export const BREAKOUT_STOP = [
  { prompt: "We broke above the opening range. Where does the stop sit?", options: ["Back inside the range", "At the day's high", "No stop needed", "Ten points away"], correct: 0 },
  { prompt: "You're long an opening-range breakout. Where is the thesis invalidated?", options: ["On any red bar", "On a close back inside the range", "At VWAP", "At the session close"], correct: 1 },
  { prompt: "A stop placed exactly at the breakout level will often:", options: ["Never be touched", "Get hit by the normal retest", "Guarantee the trade works", "Reduce the position size"], correct: 1 },
  { prompt: "Price closes back inside the opening range. Your thesis is:", options: ["Still valid, just early", "Invalidated - take the stop", "Stronger than before", "Confirmed"], correct: 1 },
];

// --- momentum ---------------------------------------------------------------
export const MOMENTUM_CHASE = [
  { prompt: "Price is accelerating out of the gate but you missed the exact bottom. What's the move?", options: ["Chase at market immediately", "Wait for a pullback or pass on the trade", "Short it, it's overextended", "Add size to catch up"], correct: 1 },
  { prompt: "You missed the initial thrust. Chasing here mainly risks:", options: ["A slightly worse fill", "Entering right as the move exhausts", "Higher commissions", "Nothing measurable"], correct: 1 },
  { prompt: "Momentum is strong but you have no entry trigger. The disciplined action is:", options: ["Enter anyway, the trend is your friend", "Wait for a defined trigger or pass", "Enter with double size", "Short the strength"], correct: 1 },
  { prompt: "Buying strength without first identifying a stop level means:", options: ["Tighter risk", "Undefined risk", "Better expectancy", "A guaranteed winner"], correct: 1 },
];
export const MOMENTUM_CLIMAX = [
  { prompt: "After a long run, a climax volume spike prints and price is far from VWAP. What now?", options: ["Add to the position", "Take profit into strength", "Move the stop further away", "Ignore it"], correct: 1 },
  { prompt: "Climax volume far from VWAP most often signals:", options: ["Continuation", "Exhaustion", "A data error", "Low liquidity"], correct: 1 },
  { prompt: "You're long into a climax spike. Adding size here means:", options: ["Pressing a proven edge", "Buying from the people taking profit", "Reducing risk", "Locking in gains"], correct: 1 },
  { prompt: "Price is stretched far from VWAP on climax volume. The mean-reversion risk is:", options: ["Zero while the trend holds", "Elevated - the snapback can be fast", "Only relevant overnight", "Removed by a wider stop"], correct: 1 },
];

// Curriculum expansion - extra questions for existing units, brand-new units
// inside existing branches, and entirely new learning areas (branches).
// Merged into BRANCHES by content.js at module load, so every consumer
// (skill tree, practice catalog, insights, reminders) sees it automatically.
//
// Voice: mentor, plain, second-person - same as the rest of the curriculum.

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
    { q: "A stop-limit that triggers but never fills means:", options: ["You're flat - risk gone", "You're still in the trade - risk unmanaged", "A fee is charged", "Nothing - it cancels instantly"], correct: 1 },
    { q: "Market-order slippage is worst when:", options: ["Liquidity is high", "The market is thin or moving fast", "You use a limit", "RTH opens"], correct: 1 },
    { q: "To guarantee you exit a losing trade, use a:", options: ["Limit at your target", "Market stop (stop order)", "Good-til-cancelled limit", "Bracket with no stop"], correct: 1 },
    { q: "A limit buy placed below the current price is:", options: ["A stop order", "A resting order waiting to fill", "A market order", "An immediate fill"], correct: 1 },
  ],
  sessions: [
    { q: "The thinnest, widest-spread condition is typically:", options: ["RTH open", "Sunday-evening ETH open", "Friday RTH close", "Wednesday 10:30am ET"], correct: 1 },
    { q: "Spreads tighten most during:", options: ["ETH overnight", "The RTH cash session", "Sunday open", "Market holidays"], correct: 1 },
    { q: "Equity-index volume peaks around:", options: ["The midday lull", "RTH open and close", "Overnight", "Pre-market ETH"], correct: 1 },
    { q: "Why avoid holding through CPI / FOMC releases?", options: ["Spreads widen and volatility spikes unpredictably", "Commissions rise", "Ticks get smaller", "It's not allowed"], correct: 0 },
    { q: "The lunch lull (roughly 12-1pm ET) usually brings:", options: ["Higher volatility", "Lower volume and choppy action", "Market closure", "Better fills"], correct: 1 },
  ],
  "es-profile": [
    { q: "ES is $50/point. A 10-point move per contract is:", options: ["$50", "$100", "$500", "$5"], correct: 2 },
    { q: "ES is most heavily driven by:", options: ["OPEC decisions", "US large-cap equity risk sentiment", "Gold supply", "Weather"], correct: 1 },
    { q: "ES's most liquid session is:", options: ["ETH", "RTH (9:30-16:00 ET)", "Sunday open", "The Asian session"], correct: 1 },
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
      info: "Initial margin is what you deposit to open a trade. Maintenance margin is the minimum you must keep to hold it. If your balance falls below maintenance, the broker issues a margin call - and in futures they don't always wait for your call; they can liquidate your position automatically, at the market. The takeaway: leverage means the exchange can close you out before you decide to. Keep a buffer above maintenance, and never sit right on the edge.",
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
      info: "Most equity-index futures (ES, NQ) settle in cash at expiration - no shares change hands. Physical-delivery contracts (CL, GC) can involve delivery of the actual commodity, which is why day traders roll out of the front month well before first notice day. Index futures run on a quarterly cycle (Mar/Jun/Sep/Dec); to keep trading, you roll to the next active month instead of holding into delivery.",
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
      info: "The futures curve links nearby and distant contracts. Contango is when distant prices are higher than near prices - the norm for storable commodities with carry costs. Backwardation is the opposite: near above distant, signaling scarcity or strong demand now. Rolling a long in contango costs you (negative roll yield); in backwardation, rolling pays you (positive roll yield). This term structure is what the app is named for - and it shapes every carry trade.",
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
      info: "Leverage math is just ratios - but it's the ratio that ends accounts. Notional = contract size × price; leverage = notional ÷ margin. A 2% adverse move at 20:1 leverage eats 40% of your margin. The safe habit: pick your dollar risk first, then size contracts so a normal stop equals that risk - never the other way around.",
      questions: [
        { q: "Notional value is:", options: ["Your margin", "Contract size × price", "Tick value", "Your P&L"], correct: 1 },
        { q: "At 10:1 leverage, a 1% adverse move costs:", options: ["1% of margin", "10% of margin", "0.1% of margin", "100% of margin"], correct: 1 },
        { q: "The safe way to size is to:", options: ["Use maximum contracts", "Pick dollar risk first, then set size so the stop equals that risk", "Match the crowd", "Avoid stops"], correct: 1 },
        { q: "A 3-point ES stop risks $150/contract but you can risk $75. You'd use:", options: ["2 ES contracts", "1 ES contract (over budget)", "MES - ~5 contracts to match $75", "No stop"], correct: 2 },
      ],
    },
  },
  {
    branchId: "instruments",
    unit: {
      id: "mnq-profile",
      type: "concept",
      title: "MNQ - Micro Nasdaq-100",
      info: "MNQ is the Micro Nasdaq-100: one-tenth of NQ. Tick 0.25 = $0.50, point value $2. A 20-point NQ move that's $400 on NQ is $40 on MNQ. It lets you practice NQ's speed without the heat - perfect for learning the most volatile index with small, honest stakes.",
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
      title: "MCL - Micro Crude",
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
      title: "YM & RTY - Dow & Russell",
      info: "YM (E-mini Dow, $5/point, tick 1 = $5) is the slowest, bluest-chip index. RTY (E-mini Russell 2000, $50/point, tick 0.10 = $5) tracks small-caps and is the most volatile of the equity-index group. Together they broaden your toolkit beyond ES/NQ - same strategies, different personality.",
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
      info: "The opening range breakout (ORB) trades the first move out of the day's initial balance. Define the range over the first 15-30 minutes; a close beyond the high (or low) with volume is the trigger; target a measured move or trail the stop; place the stop back inside the range. It fails when price breaks out, pulls in entries, then reverses - the classic stop-run. It works best early in RTH when volume is highest.",
      questions: [
        { q: "The opening range is typically defined over:", options: ["The full session", "The first 15-30 minutes", "Overnight only", "The last hour"], correct: 1 },
        { q: "A valid ORB trigger is:", options: ["Any tick beyond the range", "A close beyond the range high/low with volume", "A limit order", "The lunch lull"], correct: 1 },
        { q: "On an ORB long, the stop goes:", options: ["Above the range high", "Back inside the opening range", "At VWAP", "Nowhere"], correct: 1 },
        { q: "ORB's failure mode is the:", options: ["Stop-run / fakeout reversal", "Slow grind", "Lunch lull", "Overnight gap"], correct: 0 },
        { q: "ORB works best when:", options: ["Liquidity is lowest", "Early RTH volume is highest", "Overnight", "The market is closed"], correct: 1 },
      ],
    },
    units: [
      {
        id: "breakout-retest",
        type: "concept",
        title: "Breakout & Retest",
        info: "A breakout often doesn't run cleanly - price breaks the level, then pulls back to retest it from the other side. The retest is where many traders prefer to enter: instead of buying the breakout candle (often the worst price), you wait for price to come back, confirm the level flipped from resistance to support (or vice versa), and enter there with a tighter stop just beyond the level. The trade-off: you miss breakouts that never look back. The win: you skip most fakeouts and get a better risk/reward.",
        questions: [
          { q: "Where does a retest entry happen?", options: ["On the breakout candle itself", "After price returns to the broken level and confirms the flip", "At the midpoint of the range", "After the move is fully extended"], correct: 1 },
          { q: "The main advantage of a retest entry?", options: ["Guaranteed fill", "Better price, tighter stop, filters most fakeouts", "Higher leverage", "No stop needed"], correct: 1 },
          { q: "The cost of waiting for a retest?", options: ["Worse risk/reward", "You miss breakouts that never pull back", "Higher commissions", "Slower fills"], correct: 1 },
          { q: "'Resistance flipped to support' means:", options: ["The level no longer matters", "Old resistance now acts as support on the retest", "The trend reversed", "VWAP moved"], correct: 1 },
        ],
      },
      {
        id: "failed-breakout",
        type: "concept",
        title: "Failed Breakouts & Stop-Runs",
        info: "The failed breakout is one of the highest-probability setups in futures: price breaks an obvious level, triggers breakout entries and stops, then reverses sharply back through it - a 'stop-run.' The trap works because liquidity pools sit just beyond obvious levels. Signs it's failing: the breakout candle has no follow-through, volume dries up immediately, and price stalls at the level instead of extending. The fade entry is the reversal back through the level, stop beyond the spike extreme. This is the breakout trader's mirror image - and why you confirm, never anticipate.",
        questions: [
          { q: "A stop-run is:", options: ["A slow trend", "A breakout that triggers entries/stops then reverses back through the level", "A limit order", "An overnight gap"], correct: 1 },
          { q: "Which is a sign a breakout is failing?", options: ["Strong follow-through candles", "No follow-through, volume dries up, price stalls at the level", "Tight spreads", "RTH opens"], correct: 1 },
          { q: "The fade entry for a failed breakout is:", options: ["Before the breakout", "On the reversal back through the level", "At the measured-move target", "At VWAP only"], correct: 1 },
          { q: "Why do fakeouts cluster at obvious levels?", options: ["Low liquidity there", "Liquidity pools sit just beyond them, attracting stop runs", "Ticks are larger", "The exchange widens spreads"], correct: 1 },
        ],
      },
      {
        id: "range-expansion",
        type: "concept",
        title: "Range Expansion (NR7 / Inside Bar)",
        info: "Range expansion trades the idea that low volatility begets high volatility: after a tight compression (an NR7 - the narrowest range of the last 7 bars - or a series of inside bars), the market tends to break out with energy. You mark the compression range, wait for a close beyond it, and enter with the stop on the opposite side. The edge is the energy release; the risk is entering early before the real break. Patience - let the close confirm, then go with the energy, not into the chop before it.",
        questions: [
          { q: "NR7 refers to:", options: ["The 7th bar of the day", "The narrowest range of the last 7 bars", "A 7-point move", "A 7-contract position"], correct: 1 },
          { q: "The core idea behind range expansion?", options: ["High volatility begets low volatility", "Low volatility precedes high volatility", "Ranges never break", "Volume always falls first"], correct: 1 },
          { q: "The entry trigger is:", options: ["Any tick inside the range", "A close beyond the compression range", "A limit at the midpoint", "The first inside bar"], correct: 1 },
          { q: "The main mistake in range expansion?", options: ["Using a stop", "Entering before the break confirms", "Trading the breakout direction", "Marking the compression range"], correct: 1 },
        ],
      },
      {
        id: "vwap-breakout",
        type: "concept",
        title: "VWAP Reclaim & Breakout",
        info: "VWAP is the day's fair-value anchor. A useful intraday breakout setup is the VWAP reclaim: price has been below VWAP (control by sellers), then breaks back above it with volume - that's a regime shift from sell-the-rip to buy-the-dip for the session. The entry is the reclaim candle or its retest of VWAP from above; the stop is back below VWAP. It works because algos and intraday participants anchor to VWAP, so the reclaim triggers coordinated flows. A reclaim that immediately fails back below VWAP is a trap - exit fast.",
        questions: [
          { q: "A VWAP reclaim means:", options: ["Price breaks below VWAP", "Price breaks back above VWAP after trading below it", "VWAP flattens", "The session closes"], correct: 1 },
          { q: "Why does the reclaim matter?", options: ["It's a session regime shift from sellers to buyers", "It lowers commissions", "It widens spreads", "It cancels stops"], correct: 0 },
          { q: "On a VWAP reclaim long, the stop goes:", options: ["Above VWAP", "Back below VWAP", "At the day high", "There is no stop"], correct: 1 },
          { q: "Flows cluster at VWAP because:", options: ["It's random", "Participants and algos anchor to it", "The exchange sets it", "It only exists overnight"], correct: 1 },
        ],
      },
      {
        id: "breakout-management",
        type: "concept",
        title: "Managing the Breakout Trade",
        info: "Managing a breakout is about not giving back the move. The mechanics: take partial profit at the first measured-move target (often the size of the range projected from the breakout), then trail the stop on the remainder - commonly under each successive higher low (long) or above each lower high (short). Move to break-even only after a real follow-through candle, not the moment you're slightly green. The cardinal sin is letting a winning breakout round-trip into a loss - a trailing stop prevents that. Plan the scale-out before you enter, not after.",
        questions: [
          { q: "A measured-move target is often:", options: ["A fixed dollar amount", "The range size projected from the breakout", "The day's high", "VWAP"], correct: 1 },
          { q: "When should you move to break-even?", options: ["The moment you're slightly green", "Only after a real follow-through candle", "Never", "At the first tick"], correct: 1 },
          { q: "Trailing under successive higher lows (long) lets you:", options: ["Add size", "Let profits run while protecting gains", "Avoid stops", "Trade without a plan"], correct: 1 },
          { q: "The cardinal sin in breakout management is:", options: ["Taking partials", "Letting a winner round-trip into a loss", "Using a trailing stop", "Scaling out into strength"], correct: 1 },
        ],
      },
    ],
    buildDrill: (instrumentKey = "ES", difficulty = "medium") => {
      const bars = generateTrendData(instrumentKey, 7, difficulty);
      const rangeBars = bars.slice(0, 16);
      const rangeHigh = Math.max(...rangeBars.map((b) => b.high));
      const rangeLow = Math.min(...rangeBars.map((b) => b.low));
      return {
        bars,
        instrument: instrumentKey,
        decisionPoints: [
          { barIndex: 15, type: "mcq", ...pickVariant(BREAKOUT_PRE) },
          { barIndex: 30, type: "mcq", ...pickVariant(BREAKOUT_STOP) },
        ],
        entryZone: { zoneStart: 17, zoneEnd: 21 },
        stopPrice: rangeLow,
        direction: 1, // opening-range breakout long
      };
    },
  },
  {
    id: "momentum",
    branchTitle: "Momentum Trading",
    icon: "Target",
    unlockRequires: ["foundation-complete", "risk-psych-complete"],
    type: "strategy",
    blurb: "Buy strength, sell weakness. Relative strength, gap-and-go, opening drives, and ignition - and knowing when momentum is exhausted.",
    color: "violet",
    introLesson: {
      id: "momentum-intro",
      type: "concept",
      title: "What Is Momentum Trading",
      info: "Momentum trading buys strength and sells weakness: you enter moves that are already accelerating rather than catching turns. The edge is that momentum tends to persist short-term - winners run, losers get out. The discipline is not chasing late, sizing for volatility, and trailing hard. Momentum fails at exhaustion - the climax bar, the volume spike, the parabolic extension - which is where you take profits, not add. It's the opposite mindset from mean reversion: there you fade extremes; here you ride them. The five-part template: (1) trade it when a directional impulse is underway; (2) confirmation is a pullback that holds, not the spike itself; (3) profit is open-ended, you trail; (4) loss is capped tight under the ignition pullback; (5) the failure mode is chasing the climax then riding the reversal.",
      questions: [
        { q: "Momentum trading enters:", options: ["Turning points", "Moves that are already accelerating", "Only the daily lows", "Sideways ranges"], correct: 1 },
        { q: "The short-term edge of momentum is:", options: ["Mean reversion", "Momentum tends to persist", "Zero volatility", "Guaranteed fills"], correct: 1 },
        { q: "Momentum fails at:", options: ["The first pullback", "Exhaustion / climax", "RTH open", "VWAP"], correct: 1 },
        { q: "Versus mean reversion, momentum traders:", options: ["Fade extremes", "Ride extremes", "Avoid trends", "Never use stops"], correct: 1 },
        { q: "A key discipline in momentum trading is:", options: ["Chasing late", "Not chasing late and sizing for volatility", "Adding to losers", "Holding through reversal"], correct: 1 },
      ],
    },
    units: [
      {
        id: "momentum-rs",
        type: "concept",
        title: "Relative Strength (RS)",
        info: "Relative strength compares an instrument to a benchmark or the broad market. If NQ is up 2% while ES is up 0.3%, NQ is showing RS - money is flowing into it preferentially. The practical use: in an up session, trade the strongest instrument long (it leads and holds); in a down session, short the weakest. RS tells you where the momentum actually is, so you're not fighting the laggard. Update RS through the session, not just at the open - leadership rotates.",
        questions: [
          { q: "Relative strength measures:", options: ["An instrument's volatility", "An instrument's performance vs a benchmark", "Tick value", "Margin"], correct: 1 },
          { q: "In an up session you'd rather be:", options: ["Short the strongest", "Long the strongest instrument", "Flat", "Long the laggard"], correct: 1 },
          { q: "RS helps you avoid:", options: ["The strongest names", "Trading the laggard", "Using stops", "RTH"], correct: 1 },
          { q: "RS should be:", options: ["Set once at the open", "Re-evaluated through the session", "Ignored", "Used only overnight"], correct: 1 },
        ],
      },
      {
        id: "gap-and-go",
        type: "concept",
        title: "Gap & Go",
        info: "A gap-and-go is a stock or index that gaps at the open and keeps going in the gap direction, with little pullback. The setup: a catalyst-driven gap, strong pre-market volume, and the first 5-15 min candle holding the gap (no fill). You enter on the first pullback that holds above the opening range low (for a long gap up), targeting the gap-fill level only if it fails, otherwise trailing. The trap is the gap-and-reverse - the gap fills and keeps going. Confirmation: the first pullback must hold, not break. If it breaks, the 'go' was a 'no.'",
        questions: [
          { q: "A gap-and-go describes:", options: ["A gap that fills immediately", "A gap that continues in the gap direction", "A flat open", "An overnight gap that closes"], correct: 1 },
          { q: "Entry is typically on:", options: ["The gap open tick", "The first pullback that holds the gap", "The gap-fill target", "The close"], correct: 1 },
          { q: "The trap to avoid is:", options: ["The gap-and-reverse", "Holding the gap", "Using a stop", "Trading pre-market volume"], correct: 0 },
          { q: "Confirmation it's 'go' not 'reverse':", options: ["The first pullback breaks", "The first pullback holds above the gap", "Volume dries up", "VWAP flattens"], correct: 1 },
        ],
      },
      {
        id: "opening-drive",
        type: "concept",
        title: "Opening Drive Continuation",
        info: "The opening drive is the first sustained leg of the RTH session - on a trend day the direction is often set in the first 30-60 minutes. You look for a strong open, a clean pullback that holds above the opening range, and continuation. The entry is the continuation break of the opening-drive pullback high (long). It fails on rotation days where the open gets faded and the first leg reverses - which is why you don't hold through a clean break of the opening range low. Context matters: opening drives work when there's a catalyst or a clear regime, not in directionless chop.",
        questions: [
          { q: "The opening drive is:", options: ["The lunch lull", "The first sustained leg of the session", "The overnight session", "The close auction"], correct: 1 },
          { q: "On a trend day, direction is often set:", options: ["In the last hour", "In the first 30-60 minutes", "Overnight only", "At the close"], correct: 1 },
          { q: "The continuation entry is:", options: ["A break of the opening-drive pullback high", "The exact open tick", "A limit at the low", "After the close"], correct: 0 },
          { q: "It fails on:", options: ["Trend days", "Rotation days where the open gets faded", "High-volume opens", "Catalyst-driven days"], correct: 1 },
        ],
      },
      {
        id: "momentum-ignition",
        type: "concept",
        title: "Momentum Ignition",
        info: "Momentum ignition is the moment an orderly move turns into an acceleration - often tied to a catalyst (headline, data, break of a key level). The disciplined way to trade it: enter on the first pullback after ignition, not the climax candle itself. Chasing the ignition candle means buying the top of a spike. Use a tight stop under the ignition pullback and size down - these moves are fast and give back hard. Ignition is where FOMO kills accounts; the rule is 'enter the retest, not the spike.'",
        questions: [
          { q: "Momentum ignition is:", options: ["A range break", "An orderly move turning into acceleration", "A margin call", "The close"], correct: 1 },
          { q: "The disciplined entry is:", options: ["The climax candle", "The first pullback after ignition", "The exact top", "After the reversal"], correct: 1 },
          { q: "Chasing the ignition candle usually means:", options: ["A great fill", "Buying the top of a spike", "A tight stop", "Lower risk"], correct: 1 },
          { q: "Why size down on ignition trades?", options: ["To increase leverage", "Fast moves give back hard", "To avoid stops", "Ignition never works"], correct: 1 },
        ],
      },
      {
        id: "momentum-exhaustion",
        type: "concept",
        title: "Momentum Exhaustion",
        info: "Exhaustion is the end of a momentum run - and your exit signal, not an entry. Signs: a climax volume bar, a parabolic or widening-range spike, price extending far from VWAP and from moving averages, and momentum divergence (price makes a new high but the next push is weaker). The move often reverses hard after exhaustion. Taking profits into strength (scaling out as it accelerates) beats waiting for the reversal - once exhaustion prints, the give-back is fast. Never add to an exhausted move; the reversal you're betting against is the one that wrecks the day.",
        questions: [
          { q: "Exhaustion is:", options: ["An entry signal", "The end of a momentum run - an exit signal", "A type of stop", "A range pattern"], correct: 1 },
          { q: "A classic exhaustion sign is:", options: ["A tight spread", "Climax volume / parabolic spike / divergence", "Low volume", "A flat VWAP"], correct: 1 },
          { q: "The right action at exhaustion is:", options: ["Add more", "Take profits into strength", "Hold and hope", "Flip short at the top"], correct: 1 },
          { q: "Adding to an exhausted move is:", options: ["Safe", "A mistake - reversals are fast", "Required", "How you trail"], correct: 1 },
        ],
      },
    ],
    buildDrill: (instrumentKey = "NQ", difficulty = "medium") => {
      const bars = generateTrendData(instrumentKey, 7, difficulty);
      const accelLow = Math.min(...bars.slice(0, 18).map((b) => b.low));
      return {
        bars,
        instrument: instrumentKey,
        decisionPoints: [
          { barIndex: 14, type: "mcq", ...pickVariant(MOMENTUM_CHASE) },
          { barIndex: 38, type: "mcq", ...pickVariant(MOMENTUM_CLIMAX) },
        ],
        entryZone: { zoneStart: 18, zoneEnd: 24 },
        stopPrice: accelLow,
        direction: 1, // momentum long (enter the retest of an up move)
      };
    },
  },
];