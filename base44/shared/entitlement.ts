// Shared entitlement resolver. Both getEntitlement and aiCoachFeedback need the
// caller's effective tier, so this lives here instead of being duplicated.
// Trial expiry is evaluated here on the server, on read - never trust a
// client clock. All writes use asServiceRole (RLS blocks client writes).
//
// Rows are created via asServiceRole, which stamps created_by_id to the service
// role, so we link a row to its owner with an explicit `user_id` field and
// filter by that.

// Pure tier resolution (no SDK), so trial-expiry is unit-testable without a
// server. Returns 'free' when a trial has passed its trial_ends, else the
// stored tier (or 'free' if missing). resolveEntitlement uses this then
// persists the downgrade so a later read is consistent.
export function effectiveTier(row, now = Date.now()) {
  const tier = row?.tier || 'free';
  const trial_ends = row?.trial_ends;
  if (tier === 'trial' && trial_ends && new Date(trial_ends).getTime() <= now) return 'free';
  return tier;
}

// Duplicate rows are possible: there is no uniqueness constraint on user_id and
// row creation is read-then-write, so two concurrent requests can both create
// one. Taking rows[0] is then non-deterministic, and the failure mode is
// expensive: the RevenueCat webhook updates one row while a read picks the
// other, serving a PAYING customer as free.
//
// So never take rows[0]. Pick the highest EFFECTIVE tier (an expired trial
// resolves to free, so it cannot outrank a genuine free row), breaking ties on
// the oldest row for stability across calls.
const TIER_RANK = { premium: 3, trial: 2, free: 1 };

export function pickEntitlementRow(rows, now = Date.now()) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => {
    const ra = TIER_RANK[effectiveTier(a, now)] || 0;
    const rb = TIER_RANK[effectiveTier(b, now)] || 0;
    if (rb !== ra) return rb - ra;
    const ta = Date.parse(a?.created_date || a?.updated_at || '') || 0;
    const tb = Date.parse(b?.created_date || b?.updated_at || '') || 0;
    return ta - tb;
  });
  return sorted[0];
}

export async function resolveEntitlement(base44, userId) {
  const rows = await base44.asServiceRole.entities.Entitlement.filter({ user_id: userId });
  if (rows && rows.length > 1) {
    // Surfaces the condition without failing the request. Duplicates need
    // manual reconciliation; serving the best row is the safe interim.
    console.warn('[entitlement] duplicate rows for user', userId, 'count', rows.length);
  }
  let row = pickEntitlementRow(rows);
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
  const now = Date.now();
  let tier = effectiveTier(row, now);
  let trial_ends = row.trial_ends;
  if (row.tier === 'trial' && tier === 'free' && trial_ends) {
    trial_ends = null;
    await base44.asServiceRole.entities.Entitlement.update(row.id, {
      tier: 'free',
      trial_ends: null,
      updated_at: new Date().toISOString(),
    });
  }
  const daysLeft = tier === 'trial' && trial_ends
    ? Math.max(0, Math.ceil((new Date(trial_ends).getTime() - now) / 86400000))
    : 0;
  return { row, tier, trial_ends, daysLeft };
}