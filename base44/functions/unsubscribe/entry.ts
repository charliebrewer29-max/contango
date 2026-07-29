// unsubscribe - public, NO-AUTH, one-click opt-out endpoint linked from
// reminder emails. Looks up the Reminder by unsub_token via the service role,
// sets enabled=false and unsubscribed_at=now. Returns the SAME styled HTML
// confirmation page whether or not the token was found (never reveals token
// existence), so it is safe to hit with arbitrary tokens. Idempotent.
// Rate-limited per IP (best-effort, per isolate) to blunt token enumeration.

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const IP_HITS = new Map();

function clientIp(req) {
  const h = req.headers;
  const v = (h.get && (h.get('cf-connecting-ip') || h.get('x-forwarded-for'))) || '';
  return v.split(',')[0].trim() || 'unknown';
}

function rateLimited(ip) {
  const now = Date.now();
  const arr = (IP_HITS.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  IP_HITS.set(ip, arr);
  if (IP_HITS.size > 2000) IP_HITS.clear(); // bound memory
  return arr.length > RATE_MAX;
}

function confirmationHtml(appBaseUrl) {
  const home = (appBaseUrl || '').trim().replace(/\/$/, '');
  const link = home
    ? `<a href="${home}" style="color:#fbbf24;text-decoration:none">Open Contango</a>`
    : 'Contango';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title></head>
<body style="margin:0;background:#0a0e16;font-family:Inter,system-ui,-apple-system,sans-serif;color:#e2e8f0">
<div style="max-width:480px;margin:0 auto;padding:48px 24px;text-align:center">
<div style="font-size:20px;font-weight:600;color:#fbbf24;margin-bottom:16px">Contango</div>
<h1 style="font-size:22px;font-weight:600;margin:0 0 16px;color:#f8fafc">You're unsubscribed</h1>
<p style="font-size:15px;line-height:1.6;color:#94a3b8;margin:0 0 24px">You won't get any more practice reminders.</p>
<p style="font-size:13px;color:#64748b">${link}</p>
</div></body></html>`;
}

function htmlResponse(appBaseUrl) {
  return new Response(confirmationHtml(appBaseUrl), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export default async function (req) {
  let appBaseUrl = '';
  try {
    // APP_BASE_URL only powers the optional "back to app" link; absent is fine here.
    const { secrets } = await import('base44:runtime');
    appBaseUrl = secrets.get('APP_BASE_URL') || '';
  } catch { /* ignore */ }

  try {
    const ip = clientIp(req);
    if (rateLimited(ip)) return htmlResponse(appBaseUrl);

    const url = new URL(req.url);
    const token = (url.searchParams.get('token') || '').trim();
    if (token && token.length >= 16) {
      const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.40');
      const base44 = createClientFromRequest(req);
      const rows = await base44.asServiceRole.entities.Reminder.filter({ unsub_token: token });
      const r = rows && rows[0];
      if (r) {
        await base44.asServiceRole.entities.Reminder.update(r.id, {
          enabled: false,
          unsubscribed_at: new Date().toISOString(),
        });
      }
    }
    return htmlResponse(appBaseUrl);
  } catch (_e) {
    // Never leak internals - return the same confirmation page on any error.
    return htmlResponse(appBaseUrl);
  }
}