import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { pickEntitlementRow } from '../../shared/entitlement.ts';

// startTrial - starts the 21-day trial. Once per account, enforced server-side:
// if trial_started is already set, return "already_used" and do not restart.

const TRIAL_DAYS = 21;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await base44.asServiceRole.entities.Entitlement.filter({ user_id: user.id });

    // Check trial_started across EVERY row, not just the selected one. With
    // duplicate rows, checking only one is a second free trial.
    if (Array.isArray(rows) && rows.some((r) => r && r.trial_started)) {
      return Response.json({ status: 'already_used' });
    }

    let row = pickEntitlementRow(rows);
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
    // Log server-side, return a generic message: error strings can carry
    // internal detail (entity names, stack fragments) that clients don't need.
    console.error('[startTrial]', error);
    return Response.json({ error: 'Could not start trial' }, { status: 500 });
  }
}