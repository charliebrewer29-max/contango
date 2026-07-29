// STUB - not yet wired. There is no payment processor connected, so this
// endpoint is intentionally non-functional. It must NOT grant Premium.
//
// When RevenueCat is integrated, implement:
//   1. Verify the RevenueCat webhook signature (shared secret / X-Rev-Signature)
//      before trusting anything - anyone can reach this endpoint.
//   2. Parse the event; map event.app_user_id to a Contango user id.
//   3. On entitlement grant/transfer: write tier "premium", source "revenuecat".
//   4. On expiration/cancellation: write tier "free", source "revenuecat".
//   5. Always set updated_at. Use base44.asServiceRole.entities.Entitlement.
//
// Until then this returns 501 so nobody can use it to grant Premium.

export default async function(req) {
  return Response.json({ error: 'not_implemented' }, { status: 501 });
}