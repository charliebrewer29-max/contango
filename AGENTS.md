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

## Verified state (do not fix again)

- **Drill.jsx unmount cleanup is COMPLETE.** `src/pages/contango/Drill.jsx` has a `later()` helper wrapping `setTimeout`, handles tracked in `timeoutsRef`, a `mountedRef` guard, and an unmount effect clearing the replay interval and all tracked timeouts. The file contains exactly one raw `setTimeout`, inside `later()`. Do not add a second cleanup path.
- **The server entitlement backend already works.** `getEntitlement`, `startTrial`, and `base44/shared/entitlement.ts` are functional. The historical bug was only that the client never called them — the client-side wiring is now in place (`src/lib/entitlement.js`, `ContangoContext`).
- **`base44/functions/revenuecatWebhook` returning 501 is deliberate.** No payment processor is connected and it must not grant Premium. Do not "fix" the 501 by granting entitlement.

## Landmines

- **`npm run lint` checks only `src/components/**`, `src/pages/**` and `src/Layout.jsx`.** `src/lib/**` is explicitly ignored and `src/contexts/**` matches nothing, so `ContangoContext.jsx` is never linted. `--quiet` also hides all warnings.
- **`react-hooks/exhaustive-deps` is NOT enabled.** Every `eslint-disable-next-line react-hooks/exhaustive-deps` comment in the repo is a no-op, and stale-closure bugs will not be caught by tooling. Check dependency arrays by hand, especially any `useCallback` reading `entitlement`.
- **The `SendEmail` integration accepts only `{ to, subject, body, from_name }`.** There is NO header passthrough (see `node_modules/@base44/sdk/dist/modules/integrations.types.d.ts`). RFC 8058 `List-Unsubscribe` headers therefore cannot currently be sent. Do not keep re-attempting this.
- **`src/lib/app-params.js` depends on URL query params.** The hosted app works only because Base44 serves it with `?app_id=...` on first load. The committed `FALLBACK_APP_ID` and `FALLBACK_APP_BASE_URL` constants are load-bearing for any bundled or native build. Do not remove them.
- **`serverUrl` in `src/api/base44Client.js` is intentionally conditional.** It is `''` on web (same-origin, avoids CORS) and absolute in the Capacitor shell (page origin is `capacitor://localhost`). The SDK builds its axios `baseURL` as `${serverUrl}/api`.
- **The `unsubscribe` function must never write on GET.** Email security scanners prefetch every link on delivery; a GET that mutates state would silently opt users out.

## Open decisions

- **DECIDED — ship via Base44's native build flow, not Capacitor.** Base44 support confirmed in writing that (a) custom URL schemes cannot be allowlisted as `from_url`, (b) Universal Links are not supported, and (c) there is no supported path for social login in a Capacitor wrapper. Independently, Google refuses OAuth in embedded webviews, and this repo has no deep-link infrastructure (no `CFBundleURLSchemes`, no `appUrlOpen` listener, no `@capacitor/browser`). Base44's native build wraps the **published** app over HTTPS, so `from_url` stays HTTPS and OAuth works normally.
  - **Do not gate social login.** On Base44's build the app is served from HTTPS and Google/Apple sign-in work normally. There is no native-shell special case to write.
  - **Known tradeoff: no push notifications.** The native build supports neither APNs nor FCM, and web push is limited in WKWebView. Email reminders via `sendDailyReminders` are the current substitute. If push becomes a growth blocker, *that* is the trigger to reconsider migrating — not the subscription cost.
  - **Workflow: the native build wraps whatever is currently PUBLISHED in Base44, not GitHub HEAD.** Order is: merge to `main` → let the sync carry it to Base44 → publish → build. Building before publishing ships the previous release.
  - **`nativeAwareFromUrl()` in `src/lib/platform.js` is a no-op.** It reproduces the exact string the SDK already derives: the SDK does `new URL(fromUrl, window.location.origin)`, and in a native shell that origin is already `capacitor://localhost`, so `"/"` and `"capacitor://localhost/"` both resolve to `capacitor://localhost/`. It solved nothing — do not assume otherwise, and do not build on it.
  - **The `capacitor-ios` branch stays unmerged as a parked option.** Do not merge it; do not delete it.
- **The leaderboard ranks on `progress.xp` (lifetime)** while `leagueXp` resets weekly and is displayed nowhere.
- **The Discipline Engine NEUTRAL is 70** while formula midpoints are 50, so collecting data can lower a score versus having none.
- **The main bundle is 209.70 kB gzipped (671.53 kB raw) against a 200 kB target — the target is breached and has been since PR #2.** The earlier "~198 kB" figure was accurate at `e68ad6c` and went stale. Measured progression of the `index-*.js` chunk: `e68ad6c` 198.71 → #1 `f3b24ce` 199.04 → #2 `141e9ae` 202.38 (**target first breached here**) → #3 `f38487a` 203.96 → #4 `f220659` 207.57 → `8646b64` 207.68 → `b6e1541` 208.64 → current 209.70. The bulk (+8.97 kB) came from the curriculum expansions — mean-reversion units, drill prompt pools 8→32, risk-psych 22→45. The remaining +2.02 kB is the guided tour and its rewrite. framer-motion is still a separate 125.40 kB vendor chunk (42.14 kB gzipped) used in one file, and is the obvious first cut if the target is to be met.

## Verification discipline

- Read every target file before editing.
- Establish a test baseline first.
- Re-read after editing to confirm the change landed.
- Run lint, test and build before claiming done.