# Contango

Contango is a Duolingo-style futures-trading education app: bite-sized lessons, interactive chart-replay drills, and an AI coach focused on behavioral discipline. Everything in the app is **simulated and educational only** — no real money, no broker, no live prices, and no trade signals.

## Local setup

This is a Base44 app repository.

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Install the Base44 CLI: `npm install -g base44@latest`.
4. Run the full local dev environment (backend + frontend) from the project root:

   ```bash
   base44 dev
   ```

   `base44 dev` starts the local Base44 development backend and, when configured, the frontend dev server too. The serve command lives in `base44/config.jsonc` (e.g. `"serveCommand": "npm run dev"`).

For **frontend-only** work against the hosted backend:

```bash
npm run dev
```

and set `.env.local` in the project root:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

`VITE_BASE44_APP_ID` identifies the Base44 app; `VITE_BASE44_APP_BASE_URL` tells the Base44 Vite plugin where to send local `/api` requests. With `base44 dev` these are injected for you, so `.env.local` is mainly for frontend-only workflows.

## Publish

After pushing to git, publish from the Base44 dashboard:

```bash
base44 dashboard open
```

Any change pushed to the repo is also reflected in the Base44 Builder.

Docs: https://docs.base44.com · CLI reference: https://docs.base44.com/developers/references/cli/commands/introduction · Support: https://app.base44.com/support

## Architecture

### Where progress lives
Per-user learning state — XP, streak, hearts, completed lessons/drills, spaced-repetition cards, drill history, league, and settings — lives in the **`Progress`** entity (`base44/entities/Progress.jsonc`), one row per user (RLS: only the owner can read/write their row). The client seeds first paint from `localStorage` and reconciles against the server row on load; the server row is authoritative (`src/lib/progressStore.js`, `src/contexts/ContangoContext.jsx`). Daily hearts/practice resets are server-anchored via the `serverTime` function and **fail closed** if the server clock is unreachable (a spoofable device clock never grants a reset).

### Where entitlement lives
Premium access is **server-authoritative** in the **`Entitlement`** entity (`base44/entities/Entitlement.jsonc`): `tier` ∈ `free | trial | premium`, plus the trial window and source. Only admins can create/update/delete entitlement rows — the client never writes premium status directly. iOS digital subscriptions use **Apple IAP** (App Store guideline 3.1.1); there is no Stripe/web checkout path.

### Backend functions (`base44/functions/`)
- **`serverTime`** — trusted UTC clock for daily hearts/practice resets (anti-clock-spoofing).
- **`getEntitlement`** — returns the calling user's current tier.
- **`startTrial`** — opens a time-limited free trial.
- **`revenuecatWebhook`** — reconciles App Store/IAP purchases into the `Entitlement` row.
- **`aiCoachFeedback`** — rate-limited, tier-gated, server-side proxy to the LLM for coach reflections; enforces consent, PII scrubbing, directive guardrails, and output caps.
- **`sendDailyReminders`** — hourly CAN-SPAM-compliant practice-reminder email: physical postal address + no-login unsubscribe link in every message, fail-closed on missing env, server-side filtering, bounded concurrency, a catch-up window, dormancy auto-disable, and Progress-sourced personalization.
- **`unsubscribe`** — public, no-auth one-click opt-out endpoint; sets `enabled=false` + `unsubscribed_at`.

### AI usage & consent
AI coach calls are tracked in the **`AiUsage`** entity (per-user daily/hourly limits) and gated by a server-side consent flag. Guardrail hits and user reports are stored in **`GuardrailHit`** / **`AIReport`** (admin-only).

### In-app agents
In-app AI agents (`base44/agents/`) are JSON configs with entity/function tool permissions. See `AGENTS.md` for the invariants an agent must not violate.

## Non-negotiables

- **No real money.** Contango never touches capital, holds balances, or connects to a broker.
- **No signals.** Nothing in the app is a buy/sell/hold recommendation. The AI coach is explicitly non-directive; server-side guardrails reject trading-advice language.
- **Hearts are never sold.** Hearts gate the graded curriculum only; they reset daily (server-anchored) and are earned back via Practice. No purchase, no Premium bypass.
- **Price data is simulated.** The ticker tape, charts, and drills use generated OHLC data and are labeled as such. `lastVerified` in `src/lib/instruments.js` records when the base-price anchors were last checked against CME front-month settles.

## Refreshing instrument prices

Base prices and per-bar volatility for ES / NQ / CL / GC live in `src/lib/instruments.js` (`INSTRUMENTS`), with the `lastVerified` date exported alongside. To refresh:

1. Check CME front-month settles for ES, NQ, CL, GC.
2. Update `basePrice` for each instrument and tune `barVol` for realistic per-bar ranges (verify against generated scenarios).
3. Update the front-month contract codes in `TICKER_SYMBOLS` (`src/lib/contangoTheme.js`) — e.g. ES rolls Mar(H) → Jun(M) → Sep(U) → Dec(Z); GC rolls Aug(Q) → Dec(Z).
4. Bump `export const lastVerified = "YYYY-MM-DD";` at the top of `instruments.js`.

These levels are anchors for simulated data, not live quotes — re-verify quarterly and keep `lastVerified` accurate.