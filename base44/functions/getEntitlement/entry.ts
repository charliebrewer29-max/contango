import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { resolveEntitlement } from '../../shared/entitlement.ts';

// getEntitlement - the single source of truth for the caller's tier. The
// client never stores or decides tier; it calls this on mount, after a trial
// starts, and on window focus. Trial expiry is evaluated here, on read.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { tier, trial_ends, daysLeft } = await resolveEntitlement(base44, user.id);
    return Response.json({ tier, trial_ends, daysLeft });
  } catch (error) {
    return Response.json({ error: String((error && error.message) || error) }, { status: 500 });
  }
}