import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// startTrial - starts the 21-day trial. Once per account, enforced server-side:
// if trial_started is already set, return "already_used" and do not restart.

const TRIAL_DAYS = 21;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await base44.asServiceRole.entities.Entitlement.filter({ user_id: user.id });
    let row = rows && rows.length ? rows[0] : null;
    if (!row) {
      row = await base44.asServiceRole.entities.Entitlement.create({
        user_id: user.id,
        tier: 'free',
        trial_started: null,
        trial_ends: null,
        source: 'dev',
        updated_at: new Date().toISOString(),
      });
    }
    if (row.trial_started) {
      return Response.json({ status: 'already_used' });
    }
    const now = new Date();
    const trial_ends = new Date(now.getTime() + TRIAL_DAYS * 86400000).toISOString();
    await base44.asServiceRole.entities.Entitlement.update(row.id, {
      tier: 'trial',
      trial_started: now.toISOString(),
      trial_ends,
      source: 'trial',
      updated_at: now.toISOString(),
    });
    const daysLeft = Math.max(0, Math.ceil((new Date(trial_ends).getTime() - now.getTime()) / 86400000));
    return Response.json({ status: 'ok', tier: 'trial', trial_ends, daysLeft });
  } catch (error) {
    return Response.json({ error: String((error && error.message) || error) }, { status: 500 });
  }
}