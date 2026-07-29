import { base44 } from "@/api/base44Client";

// Server-anchored clock. The hearts daily reset and the practice allowance
// reset must not trust the device clock (it can be rolled back to farm hearts).
// On app load we fetch /serverTime once, compute offsetMs = server - client,
// and keep it in memory. serverToday(offset) then formats the server's instant
// in the device's LOCAL timezone, so the user's calendar day is preserved but
// anchored to server time.
//
// Fail closed: until/unless server time is known, offsetMs is null and the
// reset checks refuse to grant a reset. We never hand out hearts on an
// untrusted clock.

let offsetMs = null; // null = unknown (fail closed)
let inflight = null;

export function getServerOffset() {
  return offsetMs;
}

async function doFetch() {
  try {
    const res = await base44.functions.invoke("serverTime", {});
    const data = res && res.data ? res.data : null;
    if (data && typeof data.epochMs === "number") {
      offsetMs = data.epochMs - Date.now();
    }
  } catch (_e) {
    /* fail closed: offsetMs stays null */
  }
  inflight = null;
  return offsetMs;
}

export async function ensureServerTime() {
  if (offsetMs !== null) return offsetMs;
  if (inflight) return inflight;
  inflight = doFetch();
  return inflight;
}