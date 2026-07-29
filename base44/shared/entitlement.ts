// Shared entitlement resolver. Both getEntitlement and aiCoachFeedback need the
// caller's effective tier, so this lives here instead of being duplicated.
// Trial expiry is evaluated here on the server, on read - never trust a
// client clock. All writes use asServiceRole (RLS blocks client writes).
//
// Rows are created via asServiceRole, which stamps created_by_id to the service
// role, so we link a row to its owner with an explicit `user_id` field and
// filter by that.

export async function resolveEntitlement(base44, userId) {
  const rows = await base44.asServiceRole.entities.Entitlement.filter({ user_id: userId });
  let row = rows && rows.length ? rows[0] : null;
  if (!row) {
    row = await base44.asServiceRole.entities.Entitlement.create({
      user_id: userId,
      tier: 'free',
      trial_started: null,
      trial_ends: null,
      source: 'dev',
      updated_at: new Date().toISOString(),
    });
  }
  let tier = row.tier || 'free';
  let trial_ends = row.trial_ends;
  if (tier === 'trial' && trial_ends && new Date(trial_ends).getTime() <= Date.now()) {
    tier = 'free';
    trial_ends = null;
    await base44.asServiceRole.entities.Entitlement.update(row.id, {
      tier: 'free',
      trial_ends: null,
      updated_at: new Date().toISOString(),
    });
  }
  const daysLeft = tier === 'trial' && trial_ends
    ? Math.max(0, Math.ceil((new Date(trial_ends).getTime() - Date.now()) / 86400000))
    : 0;
  return { row, tier, trial_ends, daysLeft };
}