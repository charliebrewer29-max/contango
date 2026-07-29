# AGENTS.md

## Project Context

This is a Base44 app repository (Contango — a simulated futures-trading education app). Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `base44/entities/`: entity schemas (Progress, Entitlement, AiUsage, Reminder, SendLog, GuardrailHit, AIReport).
- `base44/functions/`: backend functions (serverTime, getEntitlement, startTrial, revenuecatWebhook, aiCoachFeedback, sendDailyReminders, unsubscribe).
- `base44/agents/`: in-app AI agent configs.
- `vite.config.js`: Vite config and Base44 Vite plugin setup (vendor manualChunks).
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend (it can run backend + frontend together).
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` (`lint`, `build`) before finishing code changes.

## Contango invariants (do not violate)

These are product-defining constraints. A change that breaks one is wrong, even if it "works."

- **Never add a client-writable path to premium entitlement.** Premium tier is server-authoritative via the `Entitlement` entity (admin-only writes). The client may set `subscription` locally as an optimistic flag the server confirms, but never trust it for gating that matters — always re-check via `getEntitlement`.
- **Never sell, gift, or Premium-gate hearts.** Hearts reset daily (server-anchored) and are earned back only via Practice or the daily reset. No IAP, no Premium bypass, no "buy hearts." Hearts gate the graded curriculum only; the Practice sandbox is never heart-gated.
- **Never let the app produce real-market buy/sell directives.** All content is educational and simulated. The AI coach must stay non-directive; the server-side guardrails in `aiCoachFeedback` reject trading-advice language — do not weaken them. Drills and charts are generated OHLC, not live data.
- **Never remove the AI consent gate or the server-side consent check.** Reflections go to the LLM only after explicit, stored consent, checked server-side before every call.
- **Never remove the unsubscribe link or physical postal address from reminder emails.** `sendDailyReminders` fails closed (sends nothing) if `PHYSICAL_POSTAL_ADDRESS`, `APP_BASE_URL`, or `UNSUBSCRIBE_BASE_URL` are unset. The `unsubscribe` endpoint must stay no-auth and return the same confirmation page for known and unknown tokens.
- **Price data is simulated and must be labeled as such.** Ticker, charts, and drills use generated OHLC. Keep the SIM labeling on the ticker tape and keep `lastVerified` in `src/lib/instruments.js` accurate; re-verify the base-price anchors quarterly.