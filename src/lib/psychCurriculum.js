// Psychology curriculum — rich interleaved stages (teach → emotion → quiz)
// for the Risk & Psychology branch. Each unit replaces the old info+questions
// shape with a `stages` array the Lesson engine walks sequentially.
//
// Stage types:
//   teach:   { type:"teach", heading, body }
//   emotion: { type:"emotion", scenario, prompt, xp, options:[{label,emoji,note,mindsetDelta}] }
//   quiz:    { type:"quiz", q, options:[], correct, notes:[...] }   (notes optional, parallel to options)
//
// Emotion stages are reflective (no right/wrong, no hearts lost). Engaging
// grants a small XP bonus and nudges the mindset meter per `mindsetDelta`.
// Quiz stages keep instant feedback + optional per-answer coach's notes.

export const PSYCH_UNITS = [
  {
    id: "trader-mindset",
    type: "concept",
    title: "The Mind of a Trader",
    stages: [
      {
        type: "teach",
        heading: "Trading is a performance sport",
        body: "Your edge isn't the chart — it's the gap between what the market does and what you do about it. The best traders aren't the smartest; they're the most consistent. Psychology isn't a side topic to mechanics. With leverage, every flaw in your decision-making is amplified, so psychology IS the topic. Mechanics tell you what to do; discipline decides whether you actually do it.",
      },
      {
        type: "emotion",
        scenario: "You open the app. ES is already up 15 points from the open and you have no position.",
        prompt: "What's the loudest voice in your head right now?",
        xp: 2,
        options: [
          { label: "I missed it — get in before it runs more", emoji: "😰", mindsetDelta: -8, note: "That's FOMO talking. The move already happened; entering now means a wide stop and thin reward — the worst risk on the chart." },
          { label: "I'll wait for my setup; missing a move costs nothing", emoji: "🧘", mindsetDelta: 8, note: "Disciplined. A move you didn't trade cost you zero. A bad entry you chased can cost you everything." },
          { label: "It has to come back — I'll short it", emoji: "😤", mindsetDelta: -4, note: "That's ego, not analysis. 'It has to' is how traders fight a trend and get run over." },
          { label: "One chart tells me nothing — show me a setup", emoji: "😐", mindsetDelta: 3, note: "Calm detachment is a trader's superpower. You're reading the market, not your feelings about it." },
        ],
      },
      {
        type: "quiz",
        q: "What actually creates a trader's edge?",
        options: ["A better chart than everyone else", "Consistency between what the market does and what you do", "High leverage", "Trading faster"],
        correct: 1,
        notes: ["Charts are commoditized — everyone sees the same data.", "Exactly. The edge lives in your disciplined response, not the data itself.", "Leverage amplifies results; it doesn't create an edge.", "Speed without a plan just loses faster."],
      },
      {
        type: "quiz",
        q: "Why does psychology matter MORE in futures than in investing?",
        options: ["Futures have no psychology", "Leverage amplifies every decision flaw", "Investing is illegal", "Futures trade slower"],
        correct: 1,
        notes: ["They absolutely do.", "Right. Leverage turns a small emotional mistake into a large dollar one — instantly.", "No.", "They trade faster, which makes it worse, not better."],
      },
    ],
  },

  {
    id: "fomo",
    type: "concept",
    title: "FOMO & Chasing",
    stages: [
      {
        type: "teach",
        heading: "The most expensive feeling in trading",
        body: "FOMO — fear of missing out — is the urge to enter a move that's already extended because you can't stand watching it run without you. Its cost is geometric: you enter late, so your stop sits far away and your target is close. That's the worst risk-to-reward anywhere on the chart. The antidote is a written entry trigger. If the trigger already printed, the trade is over — not beginning. You don't 'catch' a finished move; you wait for the next one.",
      },
      {
        type: "emotion",
        scenario: "A market you watched all morning explodes upward on huge volume — up 8 points in 90 seconds. You have no plan for this.",
        prompt: "What do you do?",
        xp: 2,
        options: [
          { label: "Buy now, market order, before it goes higher", emoji: "🔥", mindsetDelta: -10, note: "Classic FOMO. You're buying the exhaustion of a move, where risk is widest and reward is thinnest." },
          { label: "Wait for a pullback to a defined level", emoji: "⏳", mindsetDelta: 8, note: "Patient. You'll get a clean entry with a tight stop — or no trade at all, which is also fine." },
          { label: "Buy half now 'just in case'", emoji: "🤞", mindsetDelta: -4, note: "'Just in case' isn't a plan — it's fear with a hedge. Half a bad trade is still a bad trade." },
          { label: "Close the app and come back to your process", emoji: "📵", mindsetDelta: 2, note: "Acceptable. Removing the stimulus breaks the FOMO loop. But a defined setup beats avoidance." },
        ],
      },
      {
        type: "quiz",
        q: "Why is chasing an extended move the worst risk/reward on the chart?",
        options: ["Because it's illegal", "Your stop is far and your target is close", "Because volume is always fake", "Because spreads are zero"],
        correct: 1,
        notes: ["It's not illegal — just expensive.", "Exactly. Late entry = wide stop, thin target. That's the definition of bad R:R.", "Volume can be real; that's not the issue.", "Irrelevant to the math."],
      },
      {
        type: "quiz",
        q: "What's the practical antidote to FOMO?",
        options: ["Bigger position size", "A written entry trigger you wait for", "Trade faster", "Trade without stops"],
        correct: 1,
        notes: ["Bigger size on a bad entry just loses more.", "Right. A defined trigger turns 'I should do something' into 'the trade isn't there yet.'", "Speed isn't discipline.", "No stops is how accounts end."],
      },
    ],
  },

  {
    id: "loss-aversion",
    type: "concept",
    title: "Loss Aversion & The Disposition Effect",
    stages: [
      {
        type: "teach",
        heading: "Why you cut winners and hold losers",
        body: "Loss aversion: a loss feels roughly twice as painful as an equal gain feels good. Its trading fingerprint is the disposition effect — you sell winners too early (to lock in the good feeling) and hold losers too long (to avoid realizing the bad feeling). The result: you cap your edge and let your risk run free. The fix is to define exits by the plan, not the P&L: target hit → take profit; stop hit → take the loss. Feelings are not exit signals.",
      },
      {
        type: "emotion",
        scenario: "You're in two trades. Trade A is +$140. Trade B is −$90. Your rules say: take profit at target, stop is structural. Both are still open.",
        prompt: "Which do you feel pulled to close right now?",
        xp: 2,
        options: [
          { label: "Close A — bank the win while I'm up", emoji: "💰", mindsetDelta: -8, note: "Disposition effect. You're cutting the winner early for an emotional payout, shrinking your edge." },
          { label: "Close B — stop the bleeding", emoji: "🛑", mindsetDelta: 8, note: "Rules-based. The stop says exit, so you exit — even though it stings. That's discipline." },
          { label: "Close both — I can't take the suspense", emoji: "😰", mindsetDelta: -2, note: "Panic exits rarely follow a plan. If the plan says hold, holding is the trade." },
          { label: "Hold both exactly by the plan", emoji: "📋", mindsetDelta: 10, note: "Textbook. You've separated the decision from the feeling. This is what consistency looks like." },
        ],
      },
      {
        type: "quiz",
        q: "What is the disposition effect?",
        options: ["Selling winners early and holding losers long", "Hedging with options", "Trading only disposals", "A tax rule"],
        correct: 0,
        notes: ["Right — it's loss aversion made visible in your trade log.", "That's hedging, a different tool.", "Not a real term here.", "No, it's a behavioral bias."],
      },
      {
        type: "quiz",
        q: "What should drive your exit decision?",
        options: ["How you feel about the P&L", "The plan: target hit or stop hit", "The news ticker", "Your account balance"],
        correct: 1,
        notes: ["Feelings are not exit signals.", "Correct. The plan is pre-decided; feelings only execute it.", "News changes context, not your exit rule mid-trade.", "Balance doesn't move your stop."],
      },
    ],
  },

  {
    id: "revenge-tilt",
    type: "concept",
    title: "Revenge Trading & Tilt",
    stages: [
      {
        type: "teach",
        heading: "How a bad day becomes a blown account",
        body: "Tilt is the state where emotion takes the controls — usually after a loss or a string of losses. Revenge trading is tilt in motion: increasing size or frequency to 'make it back.' This is the mechanism by which one bad day becomes a destroyed account. The daily loss limit exists to force you out before tilt compounds. Learn to read tilt in your body: tight chest, the urge to 'just get one back,' a conviction that the next trade is different. Those are not signals to trade — they're signals to stop.",
      },
      {
        type: "emotion",
        scenario: "You just got stopped out for a $200 loss — your third loser in a row. Your heart is up. A new setup is forming, slightly earlier than your rules allow.",
        prompt: "What do you feel you should do?",
        xp: 2,
        options: [
          { label: "Take it, bigger, to make back the $200", emoji: "🤬", mindsetDelta: -12, note: "Revenge trading. You're increasing size to erase a feeling, not to take an edge. This is how accounts end." },
          { label: "Stop for the day — the limit is the limit", emoji: "🛑", mindsetDelta: 10, note: "Disciplined. The daily limit's whole purpose is to catch you right here, before tilt compounds." },
          { label: "Take it normal size — 'this one's different'", emoji: "🙏", mindsetDelta: -6, note: "'This one's different' is tilt rationalizing itself. If it breaks your rules, it's not a trade." },
          { label: "Switch instruments to 'reset my head'", emoji: "🔄", mindsetDelta: -2, note: "Avoidance dressed as discipline. A new symbol with a tilted mind is the same risk in a different chart." },
        ],
      },
      {
        type: "quiz",
        q: "What is the purpose of a daily loss limit?",
        options: ["To make you trade more carefully after", "To force you out before tilt compounds", "A broker suggestion", "To increase leverage later"],
        correct: 1,
        notes: ["It's not about being careful after — it's about stopping.", "Exactly. It's a pre-committed circuit breaker for the exact moment you'd otherwise revenge trade.", "It's your rule, not the broker's.", "It exists to stop you, not to reload you."],
      },
      {
        type: "quiz",
        q: "Which is a reliable body signal that you're tilting?",
        options: ["Calm, slow breathing", "A tight chest and the urge to 'get one back'", "Boredom", "Hunger"],
        correct: 1,
        notes: ["Calm is the opposite of tilt.", "Right. Learn that signal and treat it as a stop instruction, not a trading cue.", "Boredom might mean low opportunity, not tilt.", "Not a tilt signal."],
      },
    ],
  },

  {
    id: "overconfidence",
    type: "concept",
    title: "Overconfidence & Sizing",
    stages: [
      {
        type: "teach",
        heading: "The mirror image of tilt",
        body: "After a winning streak, your brain rewrites the story: 'I have a feel for this now.' You increase size, widen your discretion, skip steps in your process. Overconfidence is the mirror image of tilt — both abandon the process, just in opposite directions. The fix is to size by the formula (stop ticks × tick value × contracts = dollars at risk), never by confidence. A hot streak is not new information about your skill. It's variance. Treat it that way and your account survives the inevitable cold streak that follows.",
      },
      {
        type: "emotion",
        scenario: "You're up +$600 on the week — your best stretch ever. A setup appears that's slightly outside your rules but 'feels right.' Your normal size is 1 contract.",
        prompt: "What crosses your mind?",
        xp: 2,
        options: [
          { label: "Take 2 contracts — I'm reading it well", emoji: "😎", mindsetDelta: -10, note: "Overconfidence. A hot streak is variance, not a new edge. Sizing up on a rule-break compounds two mistakes." },
          { label: "Take 1 contract exactly by the rules", emoji: "📐", mindsetDelta: 8, note: "Disciplined. The streak changes nothing about your process. Same size, same rules." },
          { label: "Skip it — it's not my setup", emoji: "🚫", mindsetDelta: 6, note: "Patient. 'Outside my rules' is a complete sentence. Passing is a position too." },
          { label: "Take 3 — it's basically free money right now", emoji: "🤑", mindsetDelta: -14, note: "Gambler's fallacy. 'Free money' thinking is exactly when the market reclaims its variance tax." },
        ],
      },
      {
        type: "quiz",
        q: "Why should you size by a formula, not by confidence?",
        options: ["Confidence is always wrong", "A hot streak is variance, not new skill information", "Formulas are faster", "Confidence is illegal"],
        correct: 1,
        notes: ["Confidence isn't always wrong — it's just not a sizing input.", "Right. Sizing by feelings makes your risk track your mood, not your plan.", "Speed isn't the point; consistency is.", "Not illegal — just dangerous."],
      },
      {
        type: "quiz",
        q: "Overconfidence and tilt are alike because both…",
        options: ["Happen only to beginners", "Abandon the process", "Increase win rate", "Require leverage"],
        correct: 1,
        notes: ["Experienced traders tilt and overconfide too — often worse.", "Exactly. Both are the same disease: letting emotion override the plan, in opposite directions.", "Neither improves win rate.", "Leverage isn't required for either."],
      },
    ],
  },

  // --- Existing practical units, enriched with teach + emotion stages ---

  {
    id: "position-sizing",
    type: "concept",
    title: "Position Sizing",
    stages: [
      {
        type: "teach",
        heading: "A formula, not a feeling",
        body: "Position sizing is a formula, not a feeling: Stop distance in ticks × tick value × number of contracts = dollars at risk. Decide that dollar number BEFORE looking at the chart. This is where Micros earn their place — they're the lever that makes the formula work on a small account, letting you size to your risk budget instead of rounding up to a full contract.",
      },
      {
        type: "emotion",
        scenario: "Your stop distance says risk $200 on 2 contracts. But $200 feels like a lot today after a losing morning.",
        prompt: "What do you do?",
        xp: 2,
        options: [
          { label: "Take 2 anyway — the math is the math", emoji: "🧮", mindsetDelta: -4, note: "The math is right, but ignoring that $200 feels heavy means you'll panic-exit at the worst moment. Size to what you can hold calmly." },
          { label: "Drop to 1 contract so risk is $100", emoji: "📉", mindsetDelta: 8, note: "Disciplined. Smaller size so you can hold the trade to its stop or target without flinching." },
          { label: "Skip the trade", emoji: "🚪", mindsetDelta: 4, note: "Acceptable. If the risk doesn't fit today, passing is valid." },
          { label: "Move the stop closer to risk less", emoji: "✂️", mindsetDelta: -8, note: "Dangerous. A closer stop that isn't structural just gets picked off — you pay the loss without the thesis being wrong." },
        ],
      },
      {
        type: "quiz",
        q: "What's the position sizing formula?",
        options: ["Ticks × contracts", "Stop ticks × tick value × contracts", "Account size × leverage", "Price × volume"],
        correct: 1,
        notes: ["Incomplete — you need tick value and stop distance.", "Right: stop ticks × tick value × contracts = dollars at risk.", "Account size sets the budget; it isn't the formula.", "Price × volume isn't risk."],
      },
      {
        type: "quiz",
        q: "When should you decide your dollar risk?",
        options: ["After entering", "Before looking at the chart", "When the trade is profitable", "Never"],
        correct: 1,
        notes: ["After entering is too late — you're already emotionally invested.", "Correct. Pre-decide the budget so the chart can't negotiate it up.", "Profit doesn't change the risk you took.", "Never is how accounts end."],
      },
      {
        type: "quiz",
        q: "Why do Micros matter for sizing?",
        options: ["They're cheaper to trade", "They let you size precisely to a risk budget", "They have no risk", "They increase leverage"],
        correct: 1,
        notes: ["'Cheaper' is the surface reason; precision is the real one.", "Exactly — they're the fine-grained lever for hitting an exact dollar risk.", "They have risk like anything else.", "They reduce leverage per contract, not increase it."],
      },
    ],
  },

  {
    id: "stops",
    type: "concept",
    title: "Stop-Loss Discipline",
    stages: [
      {
        type: "teach",
        heading: "Decided before entry, not after pain",
        body: "Every trade needs a stop, decided before entry. In a leveraged product, an unmanaged loser outruns your reaction time — the market can move more ticks in seconds than your gut is willing to accept in dollars. The stop is the price where your thesis is wrong, full stop. If that stop is too far for your risk budget, you trade fewer contracts or you don't take the trade.",
      },
      {
        type: "emotion",
        scenario: "Your stop is 6 ticks away. Price comes within 1 tick of your stop, then bounces back toward your target. You're shaken.",
        prompt: "What's the disciplined read?",
        xp: 2,
        options: [
          { label: "My stop was too close — move it next time", emoji: "🔧", mindsetDelta: -6, note: "A stop that almost triggers but holds is doing its job. 'Too close' is hindsight rewriting a valid plan." },
          { label: "That's what stops look like — the plan is fine", emoji: "🧊", mindsetDelta: 8, note: "Disciplined. Near-stops are normal. The plan survives because you didn't flinch." },
          { label: "Remove the stop so I don't get tagged", emoji: "❌", mindsetDelta: -14, note: "Catastrophic. No stop turns a controlled loss into an open-ended one. This is the single most account-ending choice in trading." },
          { label: "Widen stops so they can't get hit", emoji: "↔️", mindsetDelta: -8, note: "Wider stops mean more dollars at risk — you've silently changed your position size after entry. Don't." },
        ],
      },
      {
        type: "quiz",
        q: "When is a stop-loss decided?",
        options: ["After the trade goes against you", "Before entry", "At end of day", "When margin call hits"],
        correct: 1,
        notes: ["After is reaction, not a plan.", "Correct — pre-entry, so pain can't negotiate it.", "End of day is far too late in a leveraged product.", "Margin call means the stop was never there."],
      },
      {
        type: "quiz",
        q: "Why can't you rely on reaction time to exit losers?",
        options: ["Leverage moves faster than you can react", "Brokers won't let you exit", "It's illegal", "Stops cost money"],
        correct: 0,
        notes: ["Right. Price can move more ticks in seconds than you'll accept in dollars.", "You can exit — but not fast enough.", "Not illegal.", "A stop isn't a cost; it's insurance."],
      },
      {
        type: "quiz",
        q: "If the structural stop is too far for your budget, what do you do?",
        options: ["Move the stop closer", "Trade fewer contracts or skip the trade", "Add leverage", "Hope"],
        correct: 1,
        notes: ["Moving it closer makes it non-structural — it'll get hit for the wrong reason.", "Exactly. Fewer contracts (or no trade) keeps risk inside your budget without breaking the level.", "Leverage increases risk, the opposite of what you need.", "Hope is not a risk management tool."],
      },
    ],
  },

  {
    id: "risk-reward",
    type: "concept",
    title: "Risk-to-Reward",
    stages: [
      {
        type: "teach",
        heading: "You can be wrong most of the time and still win",
        body: "Target roughly 1.5–2x the amount you risk. With a 2:1 reward-to-risk, you can be wrong more than half the time and still be profitable — a system doesn't need a high win rate to work. The drill: given an entry and a stop, where does the target have to be to justify the trade?",
      },
      {
        type: "emotion",
        scenario: "A setup gives you 1:1 reward-to-risk — equal. It 'looks clean.' Your rule is a 2:1 minimum.",
        prompt: "What do you feel?",
        xp: 2,
        options: [
          { label: "Take it — it's clean, that's enough", emoji: "✨", mindsetDelta: -6, note: "A clean 1:1 still fails your rule. 'Clean' doesn't replace math. You need an edge in R:R, not vibes." },
          { label: "Skip it — it fails my R:R minimum", emoji: "📏", mindsetDelta: 8, note: "Disciplined. A setup that breaks your minimum isn't a setup for you, today." },
          { label: "Take it, but bigger to make the R:R worth it", emoji: "💸", mindsetDelta: -10, note: "Bigger size on a worse R:R just loses more per unit of being wrong. Two wrongs." },
          { label: "Wait — maybe it improves to 2:1", emoji: "👀", mindsetDelta: 4, note: "Reasonable patience — if the structure can offer 2:1, let it develop. But don't fool yourself into hoping." },
        ],
      },
      {
        type: "quiz",
        q: "What's a healthy minimum reward-to-risk target?",
        options: ["0.5:1", "1:1", "1.5–2:1", "10:1"],
        correct: 2,
        notes: ["Too low — you need a very high win rate to survive.", "Break-even territory after costs.", "Right. 1.5–2:1 lets you be wrong often and still profit.", "10:1 is a lottery ticket, not a plan."],
      },
      {
        type: "quiz",
        q: "With 2:1 R:R, what win rate keeps you profitable?",
        options: ["Over 90%", "Roughly above one-third", "Exactly 50%", "100%"],
        correct: 1,
        notes: ["You don't need that — that's the whole point.", "Correct. Above ~34% you're profitable at 2:1, which is the beauty of the ratio.", "50% would be very profitable at 2:1.", "Nothing needs 100%."],
      },
      {
        type: "quiz",
        q: "Given a 4-tick stop, where should a 2:1 target sit?",
        options: ["2 ticks away", "4 ticks away", "8 ticks away", "16 ticks away"],
        correct: 2,
        notes: ["That's 0.5:1 — backwards.", "That's 1:1.", "Right — 2× the 4-tick risk = 8 ticks to target.", "That's 4:1, more than required but fine if realistic."],
      },
    ],
  },

  {
    id: "daily-loss-limit",
    type: "concept",
    title: "Daily Loss Limit",
    stages: [
      {
        type: "teach",
        heading: "The circuit breaker that saves your account",
        body: "A daily loss limit is a hard dollar or trade-count stop for the session. It prevents one bad day from becoming a bad week. This pairs naturally with the app's hearts mechanic — same idea in game form. When the limit is hit, you stop. Full stop. Revenge trading to 'make it back' is how small losses become account-ending ones.",
      },
      {
        type: "emotion",
        scenario: "You've hit your daily loss limit — down 3 trades. It's 1pm. The afternoon session just opened.",
        prompt: "What's the disciplined move?",
        xp: 2,
        options: [
          { label: "Trade the afternoon to recover it", emoji: "🔄", mindsetDelta: -12, note: "Revenge trading. The limit exists to stop exactly this. 'Recover it' is tilt with a calendar." },
          { label: "Stop — limit hit, done for the day", emoji: "🏁", mindsetDelta: 10, note: "Disciplined. Tomorrow's a new session with a clear head. Today you survived by stopping." },
          { label: "Trade smaller to 'test the waters'", emoji: "🤏", mindsetDelta: -6, note: "Rationalization. Smaller size is still trading past your limit — the rule is a stop, not a downgrade." },
          { label: "Switch to a different instrument to reset", emoji: "🔀", mindsetDelta: -2, note: "A new chart with a tilted mind is the same risk relocated. The limit applies to you, not the symbol." },
        ],
      },
      {
        type: "quiz",
        q: "What is a daily loss limit?",
        options: ["A suggested guideline", "A hard dollar or trade-count stop for the session", "A tax on losses", "A broker feature"],
        correct: 1,
        notes: ["A guideline you can ignore isn't a limit.", "Correct — hard, pre-decided, non-negotiable.", "It's not a tax.", "Some brokers offer it, but yours is your own rule."],
      },
      {
        type: "quiz",
        q: "What should you do when the daily limit is hit?",
        options: ["Trade smaller to recover", "Stop for the day", "Switch instruments", "Increase leverage"],
        correct: 1,
        notes: ["Smaller to recover is still revenge trading.", "Right. Stop. Full stop.", "Switching doesn't reset your mental state.", "Increasing leverage after losses is the worst possible response."],
      },
      {
        type: "quiz",
        q: "What does 'revenge trading' describe?",
        options: ["Trading with a plan", "Trying to make back losses emotionally", "Hedging", "Copying another trader"],
        correct: 1,
        notes: ["A plan is the opposite of revenge trading.", "Exactly — emotionally chasing losses, usually bigger and faster.", "Hedging is a deliberate risk tool.", "Copying is a different (also risky) behavior."],
      },
    ],
  },
];

// Diary entries unlocked by completing the matching psychology unit.
export const DIARY_ENTRIES = [
  {
    id: "diary-trader-mindset",
    unlockUnit: "trader-mindset",
    title: "On the edge",
    body: "My edge isn't the chart. It's the gap between what the market does and what I do about it. Consistency, not brilliance.",
  },
  {
    id: "diary-fomo",
    unlockUnit: "fomo",
    title: "On the move I didn't take",
    body: "The move I didn't trade cost me nothing. The move I chased cost me everything. My edge is the entry trigger — not the candle.",
  },
  {
    id: "diary-loss-aversion",
    unlockUnit: "loss-aversion",
    title: "On winners and losers",
    body: "I sell my winners too early and hold my losers too long, because losing feels twice as bad as winning feels good. From today, exits are the plan's, not mine.",
  },
  {
    id: "diary-revenge-tilt",
    unlockUnit: "revenge-tilt",
    title: "On the third loser",
    body: "A tight chest and 'just get one back' is not a trading signal — it's a stop instruction. The daily limit exists to save me from myself.",
  },
  {
    id: "diary-overconfidence",
    unlockUnit: "overconfidence",
    title: "On the hot streak",
    body: "A winning streak is variance, not a new me. I size by the formula, never by how I feel. The cold streak is coming; I'll be the same trader either way.",
  },
];