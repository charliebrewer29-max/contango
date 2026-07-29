import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// serverTime - the only trusted clock for daily-reset logic. A pure client
// date check can be defeated by changing the device clock, which would hand
// out unlimited hearts. The client fetches this once on load, computes the
// offset between server and client time, and anchors the hearts + practice
// reset checks to server time. Returns nothing but the current instant.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const now = new Date();
    return Response.json({ iso: now.toISOString(), epochMs: now.getTime() });
  } catch (error) {
    return Response.json({ error: String((error && error.message) || error) }, { status: 500 });
  }
}