// Client entitlement fetch. The tier comes only from the server (getEntitlement
// backend function). localStorage caches the last known tier for first-paint
// display ONLY - it is never used as an access decision. Gates wait for the
// server value (see ContangoContext: `entitlement` is null until the first
// server resolve, `entitlementLoading` tracks that).

import { base44 } from "@/api/base44Client";

const CACHE_KEY = "contango_entitlement_v1";

export function readEntitlementCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_e) { /* ignore */ }
  return null;
}

function writeEntitlementCache(e) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(e)); } catch (_e) { /* ignore */ }
}

export async function fetchEntitlement() {
  const res = await base44.functions.invoke("getEntitlement", {});
  const data = res.data || {};
  const ent = { tier: data.tier || "free", trial_ends: data.trial_ends || null, daysLeft: data.daysLeft ?? 0 };
  writeEntitlementCache(ent);
  return ent;
}

export async function beginTrial() {
  const res = await base44.functions.invoke("startTrial", {});
  return res.data || {};
}