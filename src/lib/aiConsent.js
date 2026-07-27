import { base44 } from "@/api/base44Client";

// AI data-sharing consent (spec 13.1). Stored server-side on the user record
// via updateMe, keyed to a version that changes when the data flow materially
// changes (free = one session; premium = full history + memory). The backend
// proxy re-reads this before every call - a client flag alone is never trusted.
export const CONSENT_VERSIONS = {
  session: "v1-session",
  history: "v2-history",
};

export function versionForFlow(flow) {
  return CONSENT_VERSIONS[flow] || CONSENT_VERSIONS.session;
}

export function getConsent(user) {
  const c = user && user.aiCoachConsent;
  return c && typeof c === "object" ? c : { granted: false, version: null };
}

export function hasConsent(user, flow) {
  const c = getConsent(user);
  return !!c.granted && c.version === versionForFlow(flow);
}

// Persist consent for the given flow. `granted=false` revokes.
export async function setConsent(granted, flow = "session") {
  await base44.auth.updateMe({
    aiCoachConsent: { granted: !!granted, version: versionForFlow(flow), at: new Date().toISOString() },
  });
}

export async function fetchMe() {
  return await base44.auth.me();
}