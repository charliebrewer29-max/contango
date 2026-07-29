// unsubscribe - public, NO-AUTH, one-click opt-out endpoint linked from
// reminder emails.
//
// Method-split to defeat pre-fetch attacks: email security scanners, link
// previewers and corporate proxies issue GET requests against every URL in an
// email on delivery. A GET must NEVER mutate state, or recipients get silently
// unsubscribed before a human opens the message.
//   GET / HEAD  -> render a confirmation page with a POST form. NO writes.
//   POST        -> perform the unsubscribe (enabled=false, unsubscribed_at=now),
//                  then render the "You're unsubscribed" page.
//   other       -> 405 with Allow: GET, HEAD, POST.
//
// Returns the SAME styled HTML whether or not the token was found (never
// reveals token existence), so it is safe to hit with arbitrary tokens.
// Idempotent. Rate-limited per IP (best-effort, per isolate) to blunt token
// enumeration.

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

// Shared headers for every response: never cache a personalized opt-out page,
// and keep it out of search indices.
const BASE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shell(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#0a0e16;font-family:Inter,system-ui,-apple-system,sans-serif;color:#e2e8f0">
<div style="max-width:480px;margin:0 auto;padding:48px 24px;text-align:center">
<div style="font-size:20px;font-weight:600;color:#fbbf24;margin-bottom:16px">Contango</div>
${body}
</div></body></html>`;
}

// GET / HEAD page: asks the user to confirm. Emphasizes nothing has changed
// yet. The token rides in a hidden field so the confirmation button posts it
// back; the token is HTML-escaped before embedding.
function confirmHtml(appBaseUrl, token) {
  const home = (appBaseUrl || '').trim().replace(/\/$/, '');
  const link = home
    ? `<a href="${escapeHtml(home)}" style="color:#fbbf24;text-decoration:none">Open Contango</a>`
    : 'Contango';
  const action = (typeof URL !== 'undefined') ? new URL(appBaseUrl ? appBaseUrl : 'http://localhost').pathname : '/';
  return shell('Confirm unsubscription', `
<h1 style="font-size:22px;font-weight:600;margin:0 0 16px;color:#f8fafc">Unsubscribe from reminders?</h1>
<p style="font-size:15px;line-height:1.6;color:#94a3b8;margin:0 0 8px">You're about to stop Contango practice reminders.</p>
<p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 24px">Nothing has changed yet — your reminders are still active until you confirm below.</p>
<form method="POST" action="${escapeHtml(action)}" style="margin:0 0 24px">
<input type="hidden" name="token" value="${escapeHtml(token || '')}">
<button type="submit" style="cursor:pointer;border:none;border-radius:10px;background:#fbbf24;color:#0a0e16;font-size:15px;font-weight:600;padding:12px 22px;font-family:inherit">Yes, unsubscribe me</button>
</form>
<p style="font-size:13px;color:#64748b">${link}</p>`);
}

// POST page: identical whether or not the token was found.
function unsubscribedHtml(appBaseUrl) {
  const home = (appBaseUrl || '').trim().replace(/\/$/, '');
  const link = home
    ? `<a href="${escapeHtml(home)}" style="color:#fbbf24;text-decoration:none">Open Contango</a>`
    : 'Contango';
  return shell('Unsubscribed', `
<h1 style="font-size:22px;font-weight:600;margin:0 0 16px;color:#f8fafc">You're unsubscribed</h1>
<p style="font-size:15px;line-height:1.6;color:#94a3b8;margin:0 0 24px">You won't get any more practice reminders.</p>
<p style="font-size:13px;color:#64748b">${link}</p>`);
}

function methodNotAllowedHtml() {
  return shell('Method not allowed', `
<h1 style="font-size:22px;font-weight:600;margin:0 0 16px;color:#f8fafc">Method not allowed</h1>
<p style="font-size:15px;line-height:1.6;color:#94a3b8;margin:0">This link only accepts GET, HEAD or POST.</p>`);
}

function respond(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...BASE_HEADERS, ...extra } });
}

export default async function (req) {
  let appBaseUrl = '';
  try {
    // APP_BASE_URL only powers the optional "back to app" link; absent is fine here.
    const { secrets } = await import('base44:runtime');
    appBaseUrl = secrets.get('APP_BASE_URL') || '';
  } catch { /* ignore */ }

  const method = (req.method || 'GET').toUpperCase();

  // Resolve the response page for this method (used for both the rate-limited
  // short-circuit and the normal path so a rate-limited GET never falsely
  // reports "unsubscribed").
  const pageFor = () => {
    if (method === 'POST') return unsubscribedHtml(appBaseUrl);
    if (method === 'GET' || method === 'HEAD') return confirmHtml(appBaseUrl, '');
    return methodNotAllowedHtml();
  };

  try {
    const ip = clientIp(req);
    if (rateLimited(ip)) {
      if (method === 'GET' || method === 'HEAD' || method === 'POST') return respond(pageFor());
      return respond(methodNotAllowedHtml(), 405, { Allow: 'GET, HEAD, POST' });
    }

    const url = new URL(req.url);
    let token = (url.searchParams.get('token') || '').trim();

    if (method === 'GET' || method === 'HEAD') {
      // Confirmation page only. NO database writes, NO token lookup.
      return respond(confirmHtml(appBaseUrl, token));
    }

    if (method === 'POST') {
      // Fall back to the posted form body for the confirmation button.
      if (!token) {
        try {
          const body = await req.text();
          token = (new URLSearchParams(body).get('token') || '').trim();
        } catch { /* ignore malformed body */ }
      }
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
      // Same page whether or not the token was found.
      return respond(unsubscribedHtml(appBaseUrl));
    }

    // Any other method.
    return respond(methodNotAllowedHtml(), 405, { Allow: 'GET, HEAD, POST' });
  } catch (_e) {
    // Never leak internals - return the method-appropriate page on any error.
    if (method === 'GET' || method === 'HEAD') return respond(confirmHtml(appBaseUrl, ''));
    if (method === 'POST') return respond(unsubscribedHtml(appBaseUrl));
    return respond(methodNotAllowedHtml(), 405, { Allow: 'GET, HEAD, POST' });
  }
}