// Curriculum content - conforms to the lesson schema in spec Section 5.3
// Foundation, Risk & Psychology, Instruments, Strategy branches, Platform Literacy.
//
// Voice: a mentor talking to a student - plain, warm, second-person. No
// encyclopedic drone. The facts stay; the tone is human.

import { generateTrendData, generateRangeScenario } from "./instruments";
import { PSYCH_UNITS, DIARY_ENTRIES } from "./psychCurriculum";
import { EXTRA_QUESTIONS, EXTRA_UNITS, EXTRA_BRANCHES } from "./extraCurriculum";
import { EXPANDED_CARDS } from "./expandedCards";

export const BRANCHES = [
  {
    id: "foundation",
    branchTitle: "Foundation",
    icon: "GraduationCap",
    unlockRequires: [],
    type: "core",
    blurb: "Market mechanics - contracts, margin, ticks, order types, sessions. It's required, and it unlocks everything else.",
    color: "amber",
    units: [
      {
        id: "contracts",
        type: "concept",
        title: "Contracts & Leverage",
        info: "A futures contract is an agreement to buy or sell a set amount of something at a future date, at a price you lock in today. As a day trader you rarely take delivery - you close the trade well before expiration. The idea that changes everything is margin: instead of putting up the full contract value, you put up a small fraction of it. That fraction is leverage, and it's why a small price move becomes a large dollar move. Leverage doesn't play favorites - it magnifies your gains and your losses by exactly the same amount.",
        stages: [
          { type: "teach", heading: "Contracts & Leverage", body: "A futures contract is an agreement to buy or sell a set amount of something at a future date, at a price you lock in today. As a day trader you rarely take delivery - you close the trade well before expiration. The idea that changes everything is margin: instead of putting up the full contract value, you put up a small fraction of it. That fraction is leverage, and it's why a small price move becomes a large dollar move. Leverage doesn't play favorites - it magnifies your gains and your losses by exactly the same amount." },
          { type: "widget", widget: "leverage", heading: "Feel the leverage", body: "You put up $500 to control a $50,000 ES contract. Drag the market move and watch your deposit. This is the one number every new trader gets wrong - until they drag it." },
          { type: "reveal", prompt: "Leverage is symmetric. If +1% doubles your $500, what does −1% do?", answer: "It wipes your $500 out. And −1.5%? You'd owe your broker $250. Leverage magnifies gains and losses by exactly the same amount." },
          { type: "quiz", q: "As a day trader, what do you do with a futures contract before expiration?", options: ["Take physical delivery", "Exit the position before expiration", "Hold it forever", "Convert it to stock"], correct: 1 },
          { type: "quiz", q: "What is margin in futures trading?", options: ["A fee paid to the broker", "The full value of the contract", "A fraction of contract value put up as collateral", "A government tax"], correct: 2 },
          { type: "quiz", q: "Why does leverage amplify both gains and losses?", options: ["Because it only applies to gains", "Because you control a large position with a small deposit", "Because the broker covers losses", "Because margin changes daily"], correct: 1 },
        ],
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
        info: "Every futures contract has a tick size - the smallest amount its price can move - and a tick value - the dollars each tick is worth. For the E-mini S&P 500 (ES), the tick size is 0.25 points and each tick is $12.50. So a 4-point move (16 ticks) is $200 per contract. Knowing your tick math turns 'the market moved 2 points' into 'that's $100 per contract' - which is the number that actually matters to your account.",
        stages: [
          { type: "teach", heading: "Tick Value & Specs", body: "Every futures contract has a tick size - the smallest amount its price can move - and a tick value - the dollars each tick is worth. For the E-mini S&P 500 (ES), the tick size is 0.25 points and each tick is $12.50. So a 4-point move (16 ticks) is $200 per contract. Knowing your tick math turns 'the market moved 2 points' into 'that's $100 per contract' - which is the number that actually matters to your account." },
          { type: "widget", widget: "tick", heading: "Drag the ticks", body: "ES ticks are worth $12.50 each; MES (the Micro) ticks are $1.25. Drag and watch price, points, and dollars move together - for both contracts at once." },
          { type: "reveal", prompt: "ES moves 2 points - that's 8 ticks. How many dollars is that per contract?", answer: "$100. 8 × $12.50 = $100 per ES contract. That's the number that matters to your account - not 'the market moved 2 points.'" },
          { type: "quiz", q: "What is the tick size of the ES contract?", options: ["1.00 point", "0.50 point", "0.25 point", "0.10 point"], correct: 2 },
          { type: "quiz", q: "How much is one ES tick worth in dollars?", options: ["$5.00", "$12.50", "$10.00", "$50.00"], correct: 1 },
          { type: "quiz", q: "If ES moves 2 points (8 ticks), how much is that per contract?", options: ["$25", "$50", "$100", "$200"], correct: 2 },
        ],
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
        info: "Every major futures contract has a Micro version at one-tenth the size. MES is one-tenth of ES, so its tick is $1.25 instead of $12.50. A 20-tick mistake costs $25 on MES instead of $250 on ES. This is the honest answer to 'how much do I need to start?' - Micros make real practice affordable, and they let you size a position precisely instead of jumping straight from 1 contract to 2.",
        stages: [
          { type: "teach", heading: "Micro Contracts", body: "Every major futures contract has a Micro version at one-tenth the size. MES is one-tenth of ES, so its tick is $1.25 instead of $12.50. A 20-tick mistake costs $25 on MES instead of $250 on ES. This is the honest answer to 'how much do I need to start?' - Micros make real practice affordable, and they let you size a position precisely instead of jumping straight from 1 contract to 2." },
          { type: "widget", widget: "micro", heading: "Same mistake, two contracts", body: "Drag 'how wrong you were' and see the same mistake priced on ES versus MES. The Micro is one-tenth the size - the same error costs a tenth as much." },
          { type: "reveal", prompt: "A 20-tick mistake costs $250 on ES. What does it cost on MES?", answer: "$25. MES is one-tenth of ES, so the same mistake costs one-tenth - $25 instead of $250. That's why Micros make real practice affordable." },
          { type: "quiz", q: "What is the tick value of MES (Micro ES)?", options: ["$12.50", "$1.25", "$5.00", "$0.50"], correct: 1 },
          { type: "quiz", q: "How many Micro contracts equal one full-size ES?", options: ["5", "10", "20", "100"], correct: 1 },
          { type: "quiz", q: "Why do Micros matter for beginners?", options: ["They have higher leverage", "They make practice affordable and allow precise sizing", "They move faster", "They have no margin requirement"], correct: 1 },
        ],
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
        info: "A market order fills right now at the best available price - fast, but you take whatever price the market gives you. A limit order only fills at your price or better - you control the price, but there's no guarantee it fills. A stop order triggers a market order once a price is hit - that's how you exit losers or enter breakouts. The DOM (depth of market) shows resting bid/ask orders and depth, which is how you tell whether a market is actually liquid right now.",
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
        info: "Futures trade almost 24 hours, but liquidity isn't constant. Regular Trading Hours (RTH) for equity index futures is the US cash session, roughly 9:30am-4:00pm ET - that's where the volume and liquidity live. Overnight (ETH) is thinner, with wider spreads. You can gauge liquidity in real time by watching spread tightness, order depth, how often trades print, and volume versus open interest.",
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
    blurb: "Position sizing, stop placement, risk/reward, and discipline. Required - it gates the strategy tree.",
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
        title: "ES - E-mini S&P 500",
        info: "$50 per index point, 0.25 tick, $12.50 per tick. ES moves on Fed policy, FOMC, CPI, jobs data, earnings, and broad risk sentiment. It has the deepest liquidity and tightest spreads of the group, and its trends are relatively orderly - which is why it's the friendliest first instrument for every strategy branch.",
        questions: [
          { q: "How much is each ES tick worth?", options: ["$5.00", "$10.00", "$12.50", "$50.00"], correct: 2 },
          { q: "Which is NOT a primary driver of ES?", options: ["FOMC decisions", "CPI data", "OPEC+ supply decisions", "Employment data"], correct: 2 },
          { q: "Why is ES the right first instrument?", options: ["It's the most volatile", "Deepest liquidity and orderly trends", "It has no tick value", "It never trends"], correct: 1 },
        ],
      },
      {
        id: "nq-profile",
        type: "concept",
        title: "NQ - E-mini Nasdaq-100",
        info: "$20 per index point, 0.25 tick, $5.00 per tick. Same macro drivers as ES but tech-weighted, so it's extra sensitive to rates and big-tech earnings. Think of NQ as ES with the volume turned up: the same setups appear, but they move faster and need wider stops. A great second instrument - it teaches you that the same pattern can demand different sizing.",
        questions: [
          { q: "NQ tick value is:", options: ["$12.50", "$5.00", "$10.00", "$1.25"], correct: 1 },
          { q: "Compared to ES, NQ is:", options: ["Slower and quieter", "Faster and needs wider stops", "Identical in behavior", "Less liquid overnight only"], correct: 1 },
          { q: "What makes NQ extra sensitive versus ES?", options: ["Its tech weighting", "Lower margin", "Smaller tick", "Gold exposure"], correct: 0 },
        ],
      },
      {
        id: "cl-profile",
        type: "concept",
        title: "CL - Crude Oil (WTI)",
        info: "1,000 barrels, $0.01 tick, $10.00 per tick. CL moves on the EIA Weekly Petroleum Status Report (Wednesdays 10:30am ET), the API release (Tuesday 4:30pm ET), OPEC+ decisions, geopolitical supply disruptions, and the dollar. Inventory draws are bullish, builds are bearish. It's headline-driven and prone to violent reversals and false breakouts - the best instrument for learning that even a clean setup can fail.",
        questions: [
          { q: "When is the EIA crude oil report released?", options: ["Monday 8am", "Wednesday 10:30am ET", "Friday close", "Any time"], correct: 1 },
          { q: "An inventory draw is typically:", options: ["Bearish", "Bullish", "Neutral", "Irrelevant"], correct: 1 },
          { q: "What is CL's defining trading character?", options: ["Quiet and trending", "Headline-driven with false breakouts", "Never moves", "Only trades overnight"], correct: 1 },
        ],
      },
      {
        id: "gc-profile",
        type: "concept",
        title: "GC - Gold",
        info: "100 troy ounces, $0.10 tick, $10.00 per tick. Gold moves on real interest rates (inverse), the dollar (inverse), safe-haven demand, and central bank buying. It can trend persistently inside a macro regime, then grind sideways for ages. That makes it a great teacher of regime recognition - knowing when NOT to apply a trend strategy.",
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
    blurb: "How to use a real charting platform (TradingView). Open from day one - it bridges your practice to a real tool.",
    color: "violet",
    units: [
      {
        id: "first-chart",
        type: "concept",
        title: "Your First Chart",
        info: "On any charting platform you start with symbol search and timeframe. Timeframe changes everything about what you're looking at: a 1-minute chart shows intraday noise - that's where day-trading setups live; a daily chart shows the bigger trend you're trading within. Picking a timeframe is really picking the question you're asking - 'what's happening right now?' versus 'what's been happening for weeks?' Contango's drills practice the exact bar-replay mechanic that real platforms call Replay.",
        questions: [
          { q: "What does timeframe selection change?", options: ["Nothing", "What you're looking at entirely", "Only the colors", "Your account balance"], correct: 1 },
          { q: "A 1-minute chart is best for seeing:", options: ["The multi-month trend", "Intraday day-trading setups", "Annual returns", "Dividends"], correct: 1 },
          { q: "You're hunting a day-trading entry but reading a daily chart. The mismatch is:", options: ["No problem, all timeframes agree", "You're asking a weeks-long question to answer a minutes-long decision", "Daily charts show more ticks", "Daily charts update faster"], correct: 1 },
          { q: "On a platform, where do you start when you open a new chart?", options: ["Symbol search and timeframe", "Placing an order", "Reading the news", "Setting a daily loss limit"], correct: 0 },
        ],
      },
      {
        id: "chart-types",
        type: "concept",
        title: "Chart Types",
        info: "Charts translate price action into pictures, and the chart type you pick changes what you can see. Candlesticks show open/high/low/close per bar and are the day trader's default - the bodies and wicks reveal who won each bar. Bar (OHLC) charts show the same data with less visual weight, which some traders prefer for cleaner multi-chart layouts. Line charts plot only closes and are for quick trend reads, not entries. Heikin-Ashi smooths candles to highlight trend direction but hides real prices - never place stops off Heikin-Ashi values. Match the chart type to the question you're asking the market.",
        questions: [
          { q: "Which chart type shows open, high, low, and close for each bar?", options: ["Candlestick", "Line", "Area", "Point-and-figure"], correct: 0 },
          { q: "Why is Heikin-Ashi risky for placing actual stop orders?", options: ["It uses averaged prices, not real highs/lows", "It's too colorful", "It can't show trends", "It only works on stocks"], correct: 0 },
          { q: "A line chart is best for:", options: ["Quick trend reads, not precise entries", "Spotting candlestick patterns", "Reading volume", "Entering trades"], correct: 0 },
          { q: "What do candlestick bodies and wicks reveal?", options: ["Who won each bar", "The news", "Your account balance", "Open interest"], correct: 0 },
        ],
      },
      {
        id: "timeframes-mtf",
        type: "concept",
        title: "Timeframes & Top-Down Analysis",
        info: "One instrument, many timeframes - and they often disagree. Top-down analysis means starting on a higher timeframe to read the dominant trend and key levels, then dropping to a lower timeframe to find your entry. A 1-minute entry long makes sense when the 15-minute and daily charts agree on direction; the same 1-minute long against a bearish daily is fighting the tide. When timeframes conflict, the higher timeframe usually wins. Picking a timeframe is really picking your holding period - know both before you click.",
        questions: [
          { q: "In top-down analysis, which timeframe do you consult first?", options: ["The highest", "The lowest", "The one you trade on", "Any"], correct: 0 },
          { q: "Your 1-min chart says buy, the daily says sell. Which usually wins?", options: ["The daily (higher timeframe)", "The 1-min", "Whichever you prefer", "Neither"], correct: 0 },
          { q: "Choosing a timeframe is really choosing your:", options: ["Holding period", "Win rate", "Tick value", "Margin requirement"], correct: 0 },
          { q: "Multiple timeframes agreeing on direction is called:", options: ["Confluence", "Divergence", "Contango", "Settlement"], correct: 0 },
        ],
      },
      {
        id: "drawing-tools",
        type: "concept",
        title: "Drawing Tools & Levels",
        info: "Drawing tools turn a blank chart into a map. Horizontal support/resistance lines mark the price levels where buyers and sellers repeatedly show up - these are the levels your strategies revolve around. Trendlines connect swing points to show slope; valid trendlines need at least three touches. Fibonacci retracements project likely pullback levels within a trend. The measuring tool computes the point/tick distance and dollar risk of a trade before you take it. The rule: draw only levels you'd act on - clutter hides the levels that matter.",
        questions: [
          { q: "A valid trendline needs at least how many touches?", options: ["1", "2", "3", "5"], correct: 2 },
          { q: "What does the measuring tool on a chart compute?", options: ["Point/tick distance and dollar risk", "Your account balance", "The news", "Margin"], correct: 0 },
          { q: "Horizontal support/resistance lines mark:", options: ["Price levels where buyers/sellers repeatedly show up", "Your P&L", "Time of day", "Volume"], correct: 0 },
          { q: "Why should you avoid drawing too many lines?", options: ["Clutter hides the levels that actually matter", "It's against the rules", "It slows the app", "It changes price"], correct: 0 },
        ],
      },
      {
        id: "indicators",
        type: "concept",
        title: "Indicators: What They Actually Do",
        info: "Indicators don't predict - they summarize price history into a single readable line or band. A moving average smooths price to show trend direction; VWAP shows the session's volume-weighted fair value; volume bars show participation per bar; RSI measures the speed and magnitude of recent moves (often read as 'overbought/oversold,' which is a trap when used alone). The discipline is minimalism: one or two indicators that answer a specific question (am I in a trend? is this level respected?) beat a screen of six. If an indicator doesn't change a decision, it's decoration.",
        questions: [
          { q: "What does a moving average primarily show?", options: ["Trend direction by smoothing price", "Future price", "Volume", "Your risk"], correct: 0 },
          { q: "RSI read as 'overbought' alone is best treated as:", options: ["A trap - it needs context", "A guaranteed reversal", "A buy signal", "Ignored always"], correct: 0 },
          { q: "How many indicators is a disciplined trader likely to use?", options: ["One or two that answer a specific question", "As many as fit", "Six or more", "None ever"], correct: 0 },
          { q: "What does VWAP represent intraday?", options: ["The session's volume-weighted fair value", "The daily high", "Margin", "Open interest"], correct: 0 },
        ],
      },
      {
        id: "watchlists-alerts",
        type: "concept",
        title: "Watchlists & Alerts",
        info: "A watchlist is your curated set of instruments - the ones you've decided are worth your attention. Keeping it short (a few instruments you know well) beats scanning fifty you don't. Alerts notify you when price or an indicator hits a level you care about, so you don't have to stare at every chart. Set alerts at the levels where your plan triggers an action: a breakout level, a stop, a news time. The point of alerts is to free your attention, not to manufacture more notifications - mute the ones that don't lead to a decision.",
        questions: [
          { q: "A good watchlist is:", options: ["Short - instruments you know well", "Long - scan everything", "Random", "All 50 futures"], correct: 0 },
          { q: "What's the right place to set a price alert?", options: ["A level where your plan triggers an action", "Any random price", "Every tick", "Only at the open"], correct: 0 },
          { q: "An alert that doesn't lead to a decision should be:", options: ["Muted or removed", "Left on forever", "Loudly repeated", "Sent to friends"], correct: 0 },
          { q: "What's the point of alerts?", options: ["To free your attention, not manufacture noise", "To force more trades", "To replace the chart", "To predict price"], correct: 0 },
        ],
      },
      {
        id: "paper-replay",
        type: "concept",
        title: "Paper Trading & Bar Replay",
        info: "Bar replay lets you scroll back through historical price action and practice reading it bar-by-bar, without real money - that's exactly what Contango's drills do, and it's how TradingView's Replay feature works too. Paper trading places simulated orders with no capital at risk, which is perfect for learning platform mechanics (order entry, stops, OCO brackets) but lulls you into ignoring the emotional cost of a loss. The honest use: learn the buttons in paper, then accept that real execution discipline only shows up with real stakes. Paper proves you can click; it doesn't prove you can trade.",
        questions: [
          { q: "What does bar replay let you practice?", options: ["Reading historical price action bar-by-bar without real money", "Live trading with real money", "Reading news", "Sizing your account"], correct: 0 },
          { q: "What does paper trading teach you well?", options: ["Platform mechanics like order entry and stops", "Emotional discipline under real risk", "Your real win rate", "Tax accounting"], correct: 0 },
          { q: "What can paper trading NOT prove?", options: ["That you'll execute with discipline when money is real", "How to place a limit order", "Where the stop goes", "What VWAP is"], correct: 0 },
          { q: "Contango's drills mirror which real-platform feature?", options: ["Bar Replay", "Order entry", "Alerts", "Watchlists"], correct: 0 },
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
      info: "Trend following rides established directional moves: you enter when a breakout confirms a new direction, then let the trade run with a trailing exit. Use it when a market shows a clear directional bias after a consolidation. It fails in choppy, range-bound markets where breakouts reverse right away - the classic false breakout. The five-part template: (1) trade it in a trending regime, not a range; (2) confirmation is a close beyond the prior swing high/low; (3) profit is open-ended, you trail the stop; (4) loss is capped at the stop below the breakout; (5) the failure mode is the false breakout - price breaks out, then reverses on you.",
      questions: [
        { q: "Where does a trend follower enter?", options: ["At the bottom", "On a confirmed breakout", "At random", "At the top"], correct: 1 },
        { q: "What's the failure mode of trend following?", options: ["The false breakout", "Overnight gaps", "Commission costs", "Slow fills"], correct: 0 },
        { q: "How is profit characterized in trend following?", options: ["Capped at a target", "Open-ended, you trail the stop", "Fixed dollar amount", "Unlimited with no stop"], correct: 1 },
        { q: "Where does the stop go structurally?", options: ["Above the entry", "Below the breakout level", "At the entry price", "There is no stop"], correct: 1 },
      ],
    },
    units: [
      {
        id: "trend-identify",
        type: "concept",
        title: "Spotting a Real Trend",
        info: "A trend isn't a few green candles - it's a structural pattern of higher highs and higher lows (uptrend) or lower highs and lower lows (downtrend). Confirm it with a sloped moving average (a 20 or 50 EMA trending up) and, if you like, ADX above 25. The honest rule: if you can't draw a clean line under the pullbacks without it crossing price repeatedly, you're not in a trend - you're in chop, and trend-following strategies will bleed there. Read the structure first; the strategy comes second.",
        questions: [
          { q: "An uptrend is defined by:", options: ["Random green candles", "Higher highs and higher lows", "A flat moving average", "Tight spreads"], correct: 1 },
          { q: "A sloped 20 or 50 EMA confirms:", options: ["Nothing", "The direction of the trend", "Your stop level", "The tick value"], correct: 1 },
          { q: "If your trendline keeps getting crossed by price, you're likely:", options: ["In a strong trend", "In chop, not a trend", "About to break out", "At the day high"], correct: 1 },
          { q: "ADX above ~25 generally signals:", options: ["A range", "A trending market", "Low volume", "A reversal"], correct: 1 },
        ],
      },
      {
        id: "trend-pullback",
        type: "concept",
        title: "Pullback Entries",
        info: "Chasing the breakout candle is the most common way new trend traders lose - you buy the worst price with the widest stop. The pullback entry fixes that: after a breakout, wait for price to retrace to the moving average, a prior swing, or a broken level that flipped, and enter when that level holds with a rejection candle. You get a better entry, a tighter stop (just beyond the pullback), and you skip the breakouts that never look back. The cost: you miss the runaway trends. The trade is worth it - better risk/reward beats catching every move.",
        questions: [
          { q: "The pullback entry waits for:", options: ["The spike", "Price to retrace to a level and hold", "The exact top", "The close only"], correct: 1 },
          { q: "Why enter on a pullback over the breakout candle?", options: ["Guaranteed profit", "Better price and tighter stop", "Higher leverage", "No stop needed"], correct: 1 },
          { q: "A rejection candle at the pullback means:", options: ["The trend is over", "The level held - potential entry", "A margin call", "A limit order"], correct: 1 },
          { q: "The cost of waiting for a pullback:", options: ["Worse risk/reward", "You miss breakouts that never retrace", "Higher fees", "Slower fills"], correct: 1 },
        ],
      },
      {
        id: "trend-breakout-entry",
        type: "concept",
        title: "Breakout Entry Mechanics",
        info: "A breakout entry is a close beyond the prior swing high (long) or swing low (short) - not a poke that snaps right back. The close is the confirmation; intrabar spikes through the level are noise. You enter on the close of the confirmation bar (or the next bar's open), the stop goes below the breakout level (long) or the most recent swing, and you size so the stop distance equals your planned dollar risk. The mistake that wrecks trend-following is 'anticipating' the breakout before the close - buying into the level before it's confirmed. Confirm first, enter second.",
        questions: [
          { q: "A valid breakout trigger is:", options: ["Any poke beyond the level", "A close beyond the prior swing high/low", "A limit order at the level", "A spike that fades"], correct: 1 },
          { q: "Where does the stop go on a breakout long?", options: ["Above the swing high", "Below the breakout level / recent swing", "At the entry", "No stop"], correct: 1 },
          { q: "Anticipating the breakout means:", options: ["Waiting for the close", "Entering before the level is confirmed", "Using a stop", "Trailing"], correct: 1 },
          { q: "Position size on a breakout should be based on:", options: ["Your confidence", "The stop distance vs your planned dollar risk", "The tick value alone", "The time of day"], correct: 1 },
        ],
      },
      {
        id: "trend-trailing-stop",
        type: "concept",
        title: "Trailing the Stop",
        info: "Trailing is what makes trend-following pay - it's how you turn a small winner into a big one without giving it all back. The mechanics: once the trend resumes with a fresh higher low (long), move the stop up under that low. Repeat as each new higher low prints. Options: a moving-average trail (stop just under the 20 EMA), a swing-low trail, or an ATR multiple trail (e.g., 2x ATR). The rule: never move the stop against the trade - only in the direction of the trend. Move to break-even only after a real follow-through, not at the first tick of green. Let the winner work.",
        questions: [
          { q: "The one rule a trailing stop must never break:", options: ["It must move every bar", "It never moves against the trade", "It must sit at break-even", "It must use ATR"], correct: 1 },
          { q: "An ATR trailing stop uses:", options: ["A fixed dollar amount", "A multiple of average true range", "The day high", "Tick value"], correct: 1 },
          { q: "You should only move a trailing stop:", options: ["Against the trade", "In the direction of the trend", "At the open", "Never"], correct: 1 },
          { q: "Moving to break-even too early (first green tick) often:", options: ["Locks in a big win", "Shakes you out before the real move", "Guarantees profit", "Is required"], correct: 1 },
        ],
      },
      {
        id: "trend-regime",
        type: "concept",
        title: "When to Trend-Follow (and When Not To)",
        info: "Trend-following is a regime strategy - it pays in trending regimes and bleeds in ranging ones. Before you deploy it, ask: is this market trending? Look at the slope of a 20/50 EMA, ADX, and the structure of highs and lows. In a flat, range-bound market, every breakout reverses - that's the whipsaw, and it's where trend-followers die by a thousand cuts. The discipline is to stand aside when the regime isn't trending, or switch to a range strategy (mean reversion). You don't have to trade every bar; you have to trade the bars that fit your strategy.",
        questions: [
          { q: "Trend-following works best in:", options: ["A ranging market", "A trending regime", "Low volume", "Overnight only"], correct: 1 },
          { q: "In a flat, range-bound market, breakouts tend to:", options: ["Run for days", "Reverse (whipsaw)", "Never happen", "Hit targets instantly"], correct: 1 },
          { q: "ADX below ~20 and a flat EMA suggest:", options: ["A strong trend", "A range - stand aside or switch strategy", "A breakout", "A gap"], correct: 1 },
          { q: "The discipline when the regime isn't trending:", options: ["Size up to compensate", "Stand aside or trade a range strategy", "Hold losers", "Chase harder"], correct: 1 },
        ],
      },
      {
        id: "trend-whipsaw",
        type: "concept",
        title: "Whipsaws & the Chop Trap",
        info: "A whipsaw is a breakout that triggers your entry and stop, then immediately reverses - the signature cost of trend-following. You can't avoid them entirely; the edge is to filter and size so a string of small losses can't sink you. Filters: require a close (not a poke), demand volume follow-through, prefer breakouts from compression (low volatility) over breakouts from already-extended moves, and skip obvious levels where stop-runs cluster. Sizing: risk a fixed, small fraction per trade so 5-6 whipsaws in a row is a drawdown, not a blown account. Whipsaws are the price of admission - budget for them.",
        questions: [
          { q: "A whipsaw is:", options: ["A slow trend", "A breakout that triggers entry and stop, then reverses", "A limit order", "An overnight gap"], correct: 1 },
          { q: "A filter that reduces whipsaws:", options: ["Entering on a poke", "Requiring a close and volume follow-through", "Widening the stop", "Trading extended moves"], correct: 1 },
          { q: "Breakouts from compression tend to be:", options: ["More likely to whipsaw", "More reliable than breakouts from extended moves", "Always fakeouts", "Unrelated to whipsaws"], correct: 1 },
          { q: "The role of position sizing vs whipsaws:", options: ["It doesn't matter", "A fixed small risk per trade keeps a string of losses survivable", "Size up after each loss", "Avoid stops"], correct: 1 },
        ],
      },
    ],
    buildDrill: (instrumentKey = "ES", difficulty = "medium") => {
      const bars = generateTrendData(instrumentKey, 7, difficulty);
      const lowBeforeBreakout = Math.min(...bars.slice(0, 22).map(b => b.low));
      return {
        bars,
        instrument: instrumentKey,
        dataProfile: "consolidation-then-breakout",
        decisionPoints: [
          { barIndex: 19, type: "mcq", prompt: "Price is just consolidating - no breakout yet. What's the right move?", options: ["Buy now - anticipate the breakout", "Wait for a confirmed close beyond the range", "Sell short the range", "Buy with maximum size"], correct: 1 },
          { barIndex: 24, type: "tap", prompt: "The breakout just closed beyond the range. Tap directly on the chart where you'd enter.", zoneStart: 22, zoneEnd: 26 },
          { barIndex: 41, type: "mcq", prompt: "We broke out and ran up, now we're pulling back. Where does the trailing stop sit?", options: ["Above the entry", "Below the recent swing low", "At the original breakout level", "No stop - let it run forever"], correct: 1 },
          { barIndex: 58, type: "exit-tap", prompt: "You're in the breakout long. Tap where you'd exit this trade." },
        ],
        entryZone: { zoneStart: 22, zoneEnd: 26 },
        stopPrice: lowBeforeBreakout,
        direction: 1, // breakout long
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
      info: "Mean reversion fades extremes back toward the middle of an established range. VWAP (volume-weighted average price) is the fair-value reference intraday futures traders actually use, and standard-deviation bands around it are the standard timing tool. Use it inside a defined range where support and resistance are being respected. It fails when the range breaks and 'overbought' keeps going - the loss comes from a range becoming a trend. The five-part template: (1) use it in a range, not a trend; (2) confirmation is a rejection at the band; (3) profit is capped at the opposite band or VWAP; (4) loss is capped at a stop beyond the band; (5) the failure mode is the range break.",
      questions: [
        { q: "What's the fair-value reference intraday futures traders use?", options: ["VWAP", "The daily high", "Open interest", "The cash close"], correct: 0 },
        { q: "Where do you enter a mean-reversion trade?", options: ["In the middle of the range", "At the band extreme on rejection", "After the range breaks", "At random"], correct: 1 },
        { q: "What's the failure mode of mean reversion?", options: ["The range break", "A slow fill", "Low volume", "A tight spread"], correct: 0 },
        { q: "Where does the stop go?", options: ["At VWAP", "Beyond the band", "At the entry", "No stop needed"], correct: 1 },
      ],
    },
    units: [
      {
        id: "mr-range-vs-trend",
        type: "concept",
        title: "Is This Actually a Range?",
        info: "Every mean-reversion loss starts the same way: fading a market that was never ranging. So the regime question comes before the setup. A real range has a ceiling and a floor that price has tested and been rejected from at least twice each, bars that overlap heavily instead of stepping in one direction, and a flat moving average rather than a sloped one. ADX below about 20 supports it. The honest test: if you can draw a horizontal line across the highs and another across the lows and price keeps respecting both, you have a range. If either line keeps getting broken and price keeps going, you have a trend wearing a range costume, and fading it is how accounts die. When you can't tell, you're in the ambiguous middle - and the correct trade there is no trade.",
        questions: [
          { q: "Before taking any mean-reversion setup, the first question is:", options: ["Where's my entry?", "Is this market actually ranging?", "How many contracts?", "What's the tick value?"], correct: 1 },
          { q: "A genuine range shows:", options: ["Bars stepping steadily in one direction", "Heavily overlapping bars between a tested ceiling and floor", "A steeply sloped moving average", "Expanding volatility"], correct: 1 },
          { q: "ADX below roughly 20 supports:", options: ["A strong trend", "A ranging, non-directional market", "An imminent breakout", "Nothing at all"], correct: 1 },
          { q: "How many rejections make a range boundary worth trading?", options: ["A single touch is enough", "At least two tested rejections at each edge", "Ten or more", "Boundaries don't need testing"], correct: 1 },
          { q: "You genuinely cannot tell whether it's a range or a trend. The correct action is:", options: ["Fade it with a wider stop", "Take a smaller position", "No trade", "Buy and hold through it"], correct: 2 },
        ],
      },
      {
        id: "mr-vwap",
        type: "concept",
        title: "VWAP as Fair Value",
        info: "VWAP is the volume-weighted average price: every trade of the session weighted by its size, so it tells you the price at which most of the day's business actually happened. That's why institutions use it as a fair-value benchmark, and why intraday futures traders treat it as a magnet - price that stretches far from VWAP tends to get pulled back toward it while the session stays balanced. Two things matter mechanically. VWAP resets each session, so it means nothing in the first few minutes when the sample is tiny. And standard-deviation bands drawn around it give you a measurable definition of 'stretched' instead of an eyeballed one. The honest limit: on a strongly trending day VWAP stops being a magnet and becomes a floor the market walks away from. Fair value is only fair while the session is balanced.",
        questions: [
          { q: "VWAP is:", options: ["The midpoint of the day's range", "Every trade weighted by its volume", "A 20-period moving average", "Yesterday's settlement"], correct: 1 },
          { q: "VWAP is least meaningful:", options: ["In the middle of the session", "In the first few minutes after the reset", "On a balanced day", "Near the close"], correct: 1 },
          { q: "Standard-deviation bands around VWAP give you:", options: ["A guaranteed reversal point", "A measurable definition of 'stretched' instead of a guess", "Your position size", "The tick value"], correct: 1 },
          { q: "On a strongly trending day, VWAP tends to act as:", options: ["A reliable magnet", "A level the market walks away from", "The exact high of the day", "A stop-loss level"], correct: 1 },
          { q: "Why do institutions care about VWAP?", options: ["It predicts direction", "It benchmarks whether their fills beat the day's average price", "It sets margin", "It determines the tick size"], correct: 1 },
        ],
      },
      {
        id: "mr-band-rejection",
        type: "concept",
        title: "Waiting for the Rejection",
        info: "A tag of the band is not a signal. Price touching the upper band tells you the market is stretched; it tells you nothing about whether it has stopped going. The confirmation you actually wait for is a rejection: a wick that pokes beyond the band and a close back inside it. That close is the market telling you the stretch was refused. Enter without it and you are guessing that a moving market will stop, which is a bet on your opinion rather than on observed behaviour. Practically: mark the band, let the bar close, and act on the close - not the poke. The cost is that you give up a few ticks of the best entries. The benefit is that you stop taking the trades where price tagged the band and simply kept going, which is where the large losses in this strategy live.",
        questions: [
          { q: "Price tags the upper band. That alone tells you:", options: ["A reversal is starting", "The market is stretched, nothing more", "The range has broken", "It's time to add size"], correct: 1 },
          { q: "The confirmation for a mean-reversion entry is:", options: ["Any touch of the band", "A wick beyond the band and a close back inside it", "Two green candles", "A volume spike"], correct: 1 },
          { q: "Acting on the poke instead of the close means you are:", options: ["Getting a better fill with no downside", "Betting your opinion that a moving market will stop", "Following the plan", "Reducing risk"], correct: 1 },
          { q: "What do you give up by waiting for the close?", options: ["Nothing at all", "A few ticks on the best entries", "The whole edge", "Your stop placement"], correct: 1 },
          { q: "Where do the largest losses in this strategy come from?", options: ["Waiting too long to enter", "Trades where price tagged the band and kept going", "Taking profit at VWAP", "Using micro contracts"], correct: 1 },
        ],
      },
      {
        id: "mr-capped-math",
        type: "concept",
        title: "Capped Profit Changes the Math",
        info: "Mean reversion is structurally the opposite of trend following. Your profit is capped, because the target is VWAP or the opposite band and there is nothing beyond it - the trade is over when price reaches fair value. Your loss is capped too, at a stop beyond the band. That symmetry has a consequence people miss: because you cannot have the occasional huge winner that pays for a string of losses, your win rate has to carry the strategy. A trend follower can win three times in ten and profit. A mean-reversion trader taking roughly one-to-one risk-to-reward cannot - they need to be right well over half the time. Concretely on ES at $12.50 a tick: a 12-tick stop risks $150 and a 12-tick target makes $150, so at a 50% win rate before costs you break even and after commissions you lose. Either the setup earns a higher win rate or the target has to reach further than the stop. There is no third option.",
        questions: [
          { q: "Profit in mean reversion is:", options: ["Open-ended, you trail the stop", "Capped at VWAP or the opposite band", "Unlimited with no stop", "Set by the tick value"], correct: 1 },
          { q: "Because profit is capped, the strategy depends on:", options: ["Occasional huge winners", "A high win rate", "Wide stops", "Overnight holds"], correct: 1 },
          { q: "On ES ($12.50/tick), a 12-tick stop and a 12-tick target means:", options: ["$150 risked to make $150", "$150 risked to make $600", "$12.50 risked to make $150", "$300 risked to make $150"], correct: 0 },
          { q: "At one-to-one risk-to-reward and a 50% win rate, after commissions you:", options: ["Profit slightly", "Break even exactly", "Lose money", "Cannot tell"], correct: 2 },
          { q: "A trend follower can profit winning 3 of 10 because:", options: ["Their stops are tighter", "Their winners are open-ended and pay for the losses", "They trade more often", "They use micros"], correct: 1 },
        ],
      },
      {
        id: "mr-range-break",
        type: "concept",
        title: "When the Range Breaks",
        info: "The failure mode is specific and worth naming precisely: the range becomes a trend while you are positioned against it. Ranges do not end politely. Volatility compresses, then expands, and the move out of a range is often the fastest move of the day - which means you are short at the top of a range that has just become the bottom of a trend. Two things make this fatal rather than merely costly. The first is that 'overbought' has no ceiling; an indicator reading extreme is not a limit, and price can stay extreme for hours. The second is averaging down, which feels rational in a range - you liked it at the band, you like it more now - and is precisely the behaviour that converts a capped loss into an uncapped one. The discipline is unglamorous: the stop beyond the band is the whole risk control, it does not move, and a range break is information, not an invitation to add.",
        questions: [
          { q: "The failure mode of mean reversion is:", options: ["A slow fill", "The range becoming a trend while you're positioned against it", "Low commissions", "A tight spread"], correct: 1 },
          { q: "Moves out of a range are often:", options: ["Slow and easy to exit", "The fastest move of the session", "Always false", "Limited to a few ticks"], correct: 1 },
          { q: "An indicator reading 'extremely overbought' means:", options: ["Price cannot go higher", "Price is stretched and can stay stretched for hours", "A reversal is guaranteed", "The range is confirmed"], correct: 1 },
          { q: "Averaging down on a losing mean-reversion trade:", options: ["Improves your average entry with no added risk", "Converts a capped loss into an uncapped one", "Is required by the strategy", "Reduces margin"], correct: 1 },
          { q: "When the range breaks against you, the correct action is:", options: ["Add at a better price", "Widen the stop and wait", "Take the stop - it's information, not an invitation", "Flip to the other side with double size"], correct: 2 },
        ],
      },
    ],
    buildDrill: (instrumentKey = "ES", difficulty = "medium") => {
      const { bars, lowIdx, highIdx } = generateRangeScenario(instrumentKey, 11, difficulty);
      return {
        bars,
        instrument: instrumentKey,
        decisionPoints: [
          { barIndex: lowIdx, type: "mcq", prompt: "Price tagged the low of the range and is bouncing. What's the move?", options: ["Sell short", "Buy the bounce toward the range mid", "Hold through the band", "Wait for the range to break"], correct: 1 },
          { barIndex: highIdx, type: "mcq", prompt: "Price tagged the top of the range. On a short fade, where does the stop go?", options: ["Above the range high", "At the mid", "Below the low", "No stop"], correct: 0 },
        ],
        entryZone: { zoneStart: lowIdx - 1, zoneEnd: lowIdx + 1 },
        stopPrice: bars[Math.max(0, lowIdx - 2)].low,
        direction: 1, // buy the bounce off the range low (long fade)
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

// === Schema migration: normalize every unit to the cards + questions schema ===
// Learn phase = cards (text / widget / reveal / emotion / takeaway), no hearts, free
// pacing. Answer phase = questions (graded, forward-only, hearts on the line). Units
// authored with the legacy `stages` or `info`+`questions` shape are converted here so
// the Lesson engine only ever speaks one schema. Source content is untouched.
const LEARN_CARD_TYPES = new Set(["text", "teach", "widget", "reveal", "emotion", "takeaway"]);
const TAKEAWAYS = {
  contracts: "Margin is leverage - a small deposit controls a large contract, and that leverage magnifies gains and losses equally.",
  ticks: "Turn 'the market moved N points' into dollars per contract - that's the number that matters to your account.",
  micros: "Micros are one-tenth the size, so the same mistake costs a tenth as much - real practice, affordable.",
  "order-types": "Market guarantees the fill, limit guarantees the price, stop triggers the exit - pick the one your decision needs.",
  sessions: "Liquidity lives in the RTH cash session; overnight is thinner with wider spreads.",
  "es-profile": "ES has the deepest liquidity and the most orderly trends - the right first instrument for any strategy.",
  "nq-profile": "NQ is ES with the volume turned up - same setups, but faster and needing wider stops.",
  "cl-profile": "CL is headline-driven and prone to false breakouts - a clean setup can still fail.",
  "gc-profile": "Gold teaches regime recognition: trend inside a macro regime, then sideways - know when not to trend-trade.",
  "first-chart": "Timeframe picks the question you're asking - intraday noise or the bigger trend - so choose it deliberately.",
  "chart-types": "Pick the chart type for the question you're asking - candles for entries, lines for quick trend reads, never stops off Heikin-Ashi.",
  "timeframes-mtf": "Read top-down: higher timeframe sets the tide, lower timeframe finds the entry, and the higher usually wins when they conflict.",
  "drawing-tools": "Draw only levels you'd act on - horizontal S/R, valid trendlines, and the measuring tool turn a chart into a map.",
  "indicators": "Indicators summarize, they don't predict - one or two that answer a real question beat a screen of six.",
  "watchlists-alerts": "Keep the watchlist short and alerts decision-linked - free your attention, don't manufacture noise.",
  "paper-replay": "Paper and replay teach the buttons and the reading; only real stakes reveal your execution discipline.",
  "trend-intro": "Trend following enters on a confirmed breakout and trails the stop; it fails in chop when breakouts reverse.",
  "mr-intro": "Mean reversion fades band extremes back to VWAP; it fails when the range breaks and 'overbought' keeps going.",
  "mr-range-vs-trend": "Check the regime before the setup - fading a trend that looks like a range is how mean-reversion accounts die.",
  "mr-vwap": "VWAP is where the day's business actually happened; it's a magnet while the session is balanced and a floor when it isn't.",
  "mr-band-rejection": "A tag of the band is stretch, not a signal - wait for the close back inside before you act.",
  "mr-capped-math": "Capped profit means the win rate has to carry the strategy; one-to-one at 50% loses after costs.",
  "mr-range-break": "The stop beyond the band is the whole risk control - a range break is information, never an invitation to add.",
  "trader-mindset": "Your edge isn't the chart - it's the consistency between what the market does and what you do about it.",
  fomo: "A move you didn't trade cost you nothing; a move you chased can cost everything - wait for your trigger.",
  "loss-aversion": "Exits are the plan's, not your feelings': target hit take profit, stop hit take the loss.",
  "revenge-tilt": "A tight chest and 'just get one back' is a stop instruction, not a trading signal.",
  overconfidence: "Size by the formula, not by confidence - a hot streak is variance, not a new edge.",
  "position-sizing": "Decide your dollar risk before the chart, then size contracts so the stop equals that risk.",
  stops: "Decide your stop before entry; if it's too far for your budget, trade fewer contracts or skip the trade.",
  "risk-reward": "Aim for 1.5-2x your risk and you can be wrong more than half the time and still profit.",
  "daily-loss-limit": "When the daily limit is hit, stop - full stop - before tilt turns a bad day into a blown account.",
  "margin-mechanics": "Keep a buffer above maintenance - in futures the broker can liquidate you at the market before you decide to.",
  settlement: "Index futures settle in cash; physical-delivery contracts get rolled well before first notice day.",
  "contango-backwardation": "Contango costs the long on the roll; backwardation pays the long - term structure shapes every carry trade.",
  "leverage-math": "Pick your dollar risk first, then size so a normal stop equals that risk - never the other way around.",
  "mnq-profile": "MNQ is one-tenth of NQ - practice the most volatile index with small, honest stakes.",
  "mcl-profile": "MCL is one-tenth of CL - practice crude's headline volatility with a tenth of the risk.",
  "ym-rty": "YM is the slow blue-chip, RTY the most volatile equity index - same strategies, different personalities.",
  "breakout-intro": "Define the opening range, enter the break with volume, stop back inside - and confirm, never anticipate.",
  "breakout-retest": "Wait for the retest where the broken level flips - better price, tighter stop, fewer fakeouts.",
  "failed-breakout": "A breakout that triggers entries and stops then reverses is a stop-run - confirm with follow-through, never anticipate.",
  "range-expansion": "Low volatility precedes high volatility - let the close confirm the compression break, then go with the energy.",
  "vwap-breakout": "A VWAP reclaim is a session regime shift - enter the reclaim or its retest, stop back below VWAP.",
  "breakout-management": "Take partials at the measured move, trail under successive lows, and never let a winner round-trip.",
  "momentum-intro": "Momentum enters moves already accelerating and rides them - enter the retest, not the spike, and trail hard.",
  "momentum-rs": "Trade the strongest instrument long in up sessions, short the weakest in down - RS shows where momentum lives.",
  "gap-and-go": "Enter the first pullback that holds the gap; if it breaks, the 'go' was a 'no.'",
  "opening-drive": "On a trend day direction is set early - enter the continuation break of the opening-drive pullback.",
  "momentum-ignition": "Enter the retest after ignition, not the climax candle - FOMO at ignition is where accounts get wrecked.",
  "momentum-exhaustion": "Exhaustion is your exit, not an entry - take profits into strength; the give-back after a climax is fast.",
  "trend-identify": "A trend is higher highs and higher lows with a sloped average - confirm the structure before you commit to 'trend.'",
  "trend-pullback": "Enter the pullback that holds, not the spike - better price, tighter stop, less chasing.",
  "trend-breakout-entry": "A breakout needs a close beyond the prior swing, not a poke - confirmation is the entry, anticipation is the trap.",
  "trend-trailing-stop": "Trail under successive higher lows and let the winner run - the trailing stop is what makes trend-following pay.",
  "trend-regime": "Trend-following pays in a trending regime and bleeds in a range - read the regime before you deploy the strategy.",
  "trend-whipsaw": "Whipsaws are the cost of trend-following - filter with confirmation and size so a string of small losses can't sink you.",
};
function normalizeUnit(unit) {
  if (unit.cards) return; // already canonical
  const cards = [];
  if (unit.stages) {
    // extract graded questions from legacy stages only when none were authored
    const extractQuizzes = !unit.questions || unit.questions.length === 0;
    if (extractQuizzes) unit.questions = [];
    for (const s of unit.stages) {
      if (s.type === "quiz") {
        if (extractQuizzes) unit.questions.push({ q: s.q, options: s.options, correct: s.correct, notes: s.notes });
      } else if (LEARN_CARD_TYPES.has(s.type)) {
        cards.push(s);
      }
    }
  } else if (unit.info) {
    cards.push({ type: "text", heading: unit.title, body: unit.info });
  }
  const tk = TAKEAWAYS[unit.id];
  if (tk) cards.push({ type: "takeaway", body: tk });
  if (cards.length) unit.cards = cards;
}
for (const b of BRANCHES) {
  if (b.units) for (const u of b.units) normalizeUnit(u);
  if (b.introLesson) normalizeUnit(b.introLesson);
}

// Inject expanded learn cards before each unit's takeaway so lessons teach
// substantially more before the graded test. Keeps the takeaway last.
function injectExpandedCards(unit) {
  const extra = EXPANDED_CARDS[unit.id];
  if (!extra || !extra.length || !unit.cards) return;
  const takeawayIdx = unit.cards.findIndex(c => c.type === "takeaway");
  if (takeawayIdx === -1) {
    unit.cards.push(...extra);
  } else {
    unit.cards.splice(takeawayIdx, 0, ...extra);
  }
}
for (const b of BRANCHES) {
  if (b.units) for (const u of b.units) injectExpandedCards(u);
  if (b.introLesson) injectExpandedCards(b.introLesson);
}

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