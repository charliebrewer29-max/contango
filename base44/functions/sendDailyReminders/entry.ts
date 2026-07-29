import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// sendDailyReminders - invoked hourly by the "Daily Reminders" workflow.
// CAN-SPAM compliant: every message carries a working no-login unsubscribe
// link and the sender's physical postal address. Fails CLOSED (sends nothing)
// if any compliance env var is unset, rather than ship a non-compliant email.
//
// Scalable: server-side filter on enabled=true + unsubscribed_at=null, ordered
// by last_sent_date so the window advances across hourly runs; bounded
// concurrency (15) with a 50s time budget; catch-up window so a missed hour
// doesn't break streaks; dormant users get a final email then auto-disable;
// bounce_count auto-disables at 3; Progress is the source of truth for
// personalization (not the denormalized snapshot). Failures are written to a
// SendLog entity; >10% failure rate logs a high-severity entry.
// Admin-only (the workflow runs it as the app owner).

const CONCURRENCY = 15;
const TIME_BUDGET_MS = 50_000;
const DORMANT_DAYS = 14;
const BOUNCE_LIMIT = 3;
const PAGE_SIZE = 500;
const LATEST_HOUR = 22; // never email after 10pm local

function hourInTz(tz, date) {
  try {
    const s = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', hour12: false }).format(date);
    const h = parseInt(s, 10);
    return isNaN(h) ? date.getUTCHours() : h;
  } catch {
    return date.getUTCHours();
  }
}

function dateInTz(tz, date) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const get = (t) => parts.find((p) => p.type === t)?.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function daysSince(iso, now) {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  if (isNaN(t)) return Infinity;
  return Math.floor((now.getTime() - t) / 86400000);
}

function randomToken() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unsubUrl(base, token) {
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function composeText({ progress, reminder, appBaseUrl, unsubLink, postal, finalDormant }) {
  const settingsUrl = appBaseUrl + '/settings';
  const lines = [];
  lines.push('Hey,');
  lines.push('');
  if (finalDormant) {
    lines.push("It looks like you haven't practiced in a while, so we've paused these daily reminders to avoid cluttering your inbox.");
    lines.push('If you still want them, turn reminders back on in the app anytime.');
  } else {
    lines.push("A quick nudge to keep your streak going. Here's where you stand in Contango:");
    lines.push('');
    if (progress) {
      lines.push(`• ${(progress.streak || 0)}-day streak`);
      lines.push(`• ${(progress.dailyXp || 0)}/${(progress.dailyGoal || 20)} XP toward today's goal`);
      lines.push(`• ${(progress.completedLessons || []).length} lessons completed`);
      lines.push(`• ${(progress.badges || []).length} branch badges earned`);
    } else {
      lines.push('Open Contango and pick up where you left off.');
    }
    lines.push('');
    if (progress && reminder && reminder.next_lesson_title) lines.push(`Your next lesson: "${reminder.next_lesson_title}".`);
    lines.push('');
    lines.push('Even ten minutes keeps the momentum - small, consistent reps are how traders are built.');
  }
  lines.push('');
  lines.push('- Tango, your trading mentor');
  lines.push('');
  lines.push('---');
  lines.push("You're getting this because you turned on daily practice reminders in Contango.");
  lines.push('Unsubscribe: ' + unsubLink);
  lines.push('Manage reminders: ' + settingsUrl);
  lines.push('');
  lines.push('Contango');
  lines.push(postal);
  lines.push('');
  lines.push('Simulated educational practice only. No real trades, no signals, no investment advice.');
  return lines.join('\n');
}

function composeHtml({ progress, reminder, appBaseUrl, unsubLink, postal, finalDormant }) {
  const settingsUrl = appBaseUrl + '/settings';
  const stats = progress
    ? [
        ['Streak', (progress.streak || 0) + '-day'],
        ['Today', (progress.dailyXp || 0) + '/' + (progress.dailyGoal || 20) + ' XP'],
        ['Lessons', (progress.completedLessons || []).length + ' done'],
        ['Badges', (progress.badges || []).length + ' earned'],
      ]
    : null;
  const nextLesson = (reminder && reminder.next_lesson_title) || '';
  let intro, closing;
  if (finalDormant) {
    intro = "It looks like you haven't practiced in a while, so we've paused these daily reminders to avoid cluttering your inbox.";
    closing = 'If you still want them, turn reminders back on in the app anytime.';
  } else {
    intro = "A quick nudge to keep your streak going. Here's where you stand in Contango:";
    closing = nextLesson ? `Your next lesson: "${esc(nextLesson)}".` : 'Open Contango and pick up where you left off.';
  }
  const statRows = stats
    ? stats.map(([k, v]) => `<tr><td style="padding:6px 0;color:#94a3b8;font-size:14px">${esc(k)}</td><td style="padding:6px 0;color:#e2e8f0;font-size:14px;text-align:right">${esc(v)}</td></tr>`).join('')
    : '';
  const statsBlock = stats
    ? `<tr><td style="padding:8px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${statRows}</table></td></tr>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contango</title></head>
<body style="margin:0;background:#0a0e16;font-family:Inter,Arial,sans-serif;color:#e2e8f0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e16"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0f151f;border:1px solid #1e293b;border-radius:16px">
<tr><td style="padding:24px 24px 0"><div style="font-size:18px;font-weight:600;color:#fbbf24">Contango</div></td></tr>
<tr><td style="padding:16px 24px 8px"><p style="margin:0;font-size:15px;line-height:1.6;color:#e2e8f0">${esc(intro)}</p></td></tr>
${statsBlock}
<tr><td style="padding:8px 24px 16px"><p style="margin:0;font-size:15px;line-height:1.6;color:#94a3b8">${esc(closing)}</p></td></tr>
<tr><td style="padding:0 24px 16px"><p style="margin:0;font-size:14px;line-height:1.6;color:#94a3b8">Even ten minutes keeps the momentum.</p><p style="margin:8px 0 0;font-size:14px;color:#64748b">- Tango, your trading mentor</p></td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #1e293b">
<p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#64748b">You're getting this because you turned on daily practice reminders in Contango.</p>
<p style="margin:0 0 4px;font-size:12px;line-height:1.5;color:#64748b">Unsubscribe: <a href="${esc(unsubLink)}" style="color:#fbbf24;text-decoration:none">${esc(unsubLink)}</a></p>
<p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#64748b">Manage reminders: <a href="${esc(settingsUrl)}" style="color:#fbbf24;text-decoration:none">${esc(settingsUrl)}</a></p>
<p style="margin:0 0 4px;font-size:12px;line-height:1.5;color:#94a3b8">Contango<br>${esc(postal)}</p>
<p style="margin:8px 0 0;font-size:11px;line-height:1.5;color:#475569">Simulated educational practice only. No real trades, no signals, no investment advice.</p>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const postal = (secrets.get('PHYSICAL_POSTAL_ADDRESS') || '').trim();
    const appBaseUrl = (secrets.get('APP_BASE_URL') || '').trim().replace(/\/$/, '');
    const unsubBase = (secrets.get('UNSUBSCRIBE_BASE_URL') || '').trim().replace(/\/$/, '');
    if (!postal || !appBaseUrl || !unsubBase) {
      console.error('[sendDailyReminders] COMPLIANCE REFUSE: missing env', {
        postal: !!postal, appBaseUrl: !!appBaseUrl, unsubBase: !!unsubBase,
      });
      return Response.json({ error: 'compliance_env_missing', sent: 0 }, { status: 500 });
    }
    const useHtml = secrets.get('REMINDER_HTML_BODY') === 'true';

    const now = new Date();
    const start = Date.now();
    let sent = 0, skipped = 0, dormantDisabled = 0, bounceDisabled = 0, processed = 0;
    const errors = [];

    // Server-side narrow: enabled and not unsubscribed. Ordered by
    // last_sent_date so the least-recently-sent (and never-sent) rows come
    // first, advancing the working window across hourly runs.
    const rows = await base44.asServiceRole.entities.Reminder.filter(
      { enabled: true, unsubscribed_at: null },
      'last_sent_date',
      PAGE_SIZE
    );
    const queue = (rows || []).filter((r) => r.enabled && !r.unsubscribed_at);

    async function handle(r) {
      try {
        const tz = r.timezone || 'UTC';
        const hour = hourInTz(tz, now);
        const today = dateInTz(tz, now);
        if (r.last_sent_date === today) { skipped++; return; }
        if (hour < (r.reminder_hour == null ? 9 : r.reminder_hour)) { skipped++; return; } // catch-up: only at/after chosen hour
        if (hour >= LATEST_HOUR) { skipped++; return; } // no late-night sends
        if (!r.email) { skipped++; return; }
        if ((r.bounce_count || 0) >= BOUNCE_LIMIT) { skipped++; return; }

        // Backfill a token for legacy rows that predate unsub_token.
        let token = r.unsub_token;
        if (!token) {
          token = randomToken();
          try { await base44.asServiceRole.entities.Reminder.update(r.id, { unsub_token: token }); }
          catch { skipped++; return; }
        }
        const unsubLink = unsubUrl(unsubBase, token);

        // Progress = source of truth for personalization (not the snapshot).
        let progress = null;
        try {
          const pRows = await base44.asServiceRole.entities.Progress.filter({ created_by_id: r.created_by_id });
          progress = pRows && pRows[0];
        } catch { progress = null; }

        // Dormancy: days since last app activity.
        const dormantDays = daysSince(progress && progress.lastActiveDate, now);
        const finalDormant = dormantDays > DORMANT_DAYS;

        const body = useHtml
          ? composeHtml({ progress, reminder: r, appBaseUrl, unsubLink, postal, finalDormant })
          : composeText({ progress, reminder: r, appBaseUrl, unsubLink, postal, finalDormant });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: r.email,
          subject: finalDormant ? 'Still want your Contango reminders?' : 'Contango - your daily practice nudge',
          body,
          from_name: 'Tango',
        });

        const update = { last_sent_date: today };
        if (finalDormant) update.enabled = false; // auto-disable after the final nudge
        await base44.asServiceRole.entities.Reminder.update(r.id, update);
        if (finalDormant) dormantDisabled++; else sent++;
      } catch (e) {
        const msg = (e && e.message) || String(e);
        errors.push({ id: r.id, error: msg });
        // Heuristic hard-bounce detection: increment + auto-disable at the limit.
        if (/bounce|rejected|invalid.*email|does not exist|mailbox|undeliverable/i.test(msg)) {
          try {
            const next = (r.bounce_count || 0) + 1;
            const upd = { bounce_count: next };
            if (next >= BOUNCE_LIMIT) upd.enabled = false;
            await base44.asServiceRole.entities.Reminder.update(r.id, upd);
            if (next >= BOUNCE_LIMIT) bounceDisabled++;
          } catch { /* ignore */ }
        }
      }
    }

    // Bounded concurrency with an overall time budget. If the budget runs out,
    // stop cleanly; remaining rows are picked up by the next hourly run.
    let idx = 0;
    async function worker() {
      while (true) {
        if (Date.now() - start > TIME_BUDGET_MS) return;
        const i = idx++;
        if (i >= queue.length) return;
        processed++;
        await handle(queue[i]);
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
    const remaining = Math.max(0, queue.length - processed);

    // Persist failures to SendLog (admin-only). High-severity entry if >10% fail.
    try {
      if (errors.length) {
        const failRate = processed > 0 ? errors.length / processed : 0;
        const writes = errors.slice(0, 50).map((er) =>
          base44.asServiceRole.entities.SendLog.create({
            reminder_id: er.id, error: er.error, timestamp: new Date().toISOString(),
            attempt_count: 1, severity: failRate > 0.1 ? 'high' : 'normal',
          })
        );
        if (failRate > 0.1) {
          writes.push(base44.asServiceRole.entities.SendLog.create({
            reminder_id: '', error: `HIGH FAILURE RATE: ${errors.length}/${processed} failed this run`,
            timestamp: new Date().toISOString(), attempt_count: errors.length, severity: 'high',
          }));
          console.error('[sendDailyReminders] HIGH FAILURE RATE', errors.length, '/', processed);
        }
        await Promise.all(writes);
      }
    } catch { /* logging must never break the run */ }

    return Response.json({
      sent, skipped, dormantDisabled, bounceDisabled, processed, remaining,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}