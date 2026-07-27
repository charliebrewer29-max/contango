import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// sendDailyReminders — invoked hourly by the "Daily Reminders" workflow.
// For each enabled reminder whose chosen hour matches the current hour in
// the user's own timezone (and that hasn't already sent today), compose a
// progress-aware email and send it, then stamp last_sent_date.
// Admin-only (the workflow runs it as the app owner).

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

function composeEmail(r) {
  const lines = [];
  lines.push("Hey,");
  lines.push("");
  lines.push("A quick nudge to keep your streak going. Here's where you stand in Contango:");
  lines.push("");
  lines.push(`• ${(r.streak || 0)}-day streak`);
  lines.push(`• ${(r.daily_xp || 0)}/${(r.daily_goal || 20)} XP toward today's goal`);
  lines.push(`• ${(r.lessons_done || 0)} lessons completed`);
  lines.push(`• ${(r.badges_count || 0)} branch badges earned`);
  lines.push("");
  if (r.next_lesson_title) {
    lines.push(`Your next lesson: "${r.next_lesson_title}".`);
  } else {
    lines.push("Open Contango and pick up where you left off.");
  }
  lines.push("");
  lines.push("Even ten minutes keeps the momentum — small, consistent reps are how traders are built.");
  lines.push("");
  lines.push("— Tango, your trading mentor");
  lines.push("");
  lines.push("(Simulated educational practice only — no real trades, no signals.)");
  return lines.join("\n");
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const all = await base44.asServiceRole.entities.Reminder.filter({});
    const now = new Date();
    let sent = 0;
    let skipped = 0;
    const errors = [];

    for (const r of (all || [])) {
      try {
        if (!r.enabled) { skipped++; continue; }
        const tz = r.timezone || 'UTC';
        const hour = hourInTz(tz, now);
        const today = dateInTz(tz, now);
        if (r.reminder_hour !== hour) { skipped++; continue; }
        if (r.last_sent_date === today) { skipped++; continue; }
        if (!r.email) { skipped++; continue; }

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: r.email,
          subject: 'Contango — your daily practice nudge',
          body: composeEmail(r),
          from_name: 'Tango',
        });
        await base44.asServiceRole.entities.Reminder.update(r.id, { last_sent_date: today });
        sent++;
      } catch (e) {
        errors.push({ id: r.id, error: e?.message || String(e) });
      }
    }

    return Response.json({ sent, skipped, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}