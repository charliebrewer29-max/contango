// Single source of truth for the legal terms version and the age threshold.
// Shared by Legal.jsx (display), Onboarding.jsx (writes attestations), and
// progressStore.js (migrates legacy flags) so every attestation records WHICH
// version of the terms the user agreed to and at what threshold. A bare
// boolean cannot answer that, which matters if the threshold (EU member-state
// review) or the terms change materially.

export const LEGAL_EFFECTIVE_DATE = "2026-07-29";
export const LEGAL_LAST_UPDATED = "2026-07-29";
export const LEGAL_AGE_THRESHOLD = 17;

// Terms version carried by attestations migrated from the legacy bare
// `ageConfirmed` / `acknowledged` booleans. Do not fabricate a timestamp for
// pre-migration users; `at` is left null (unknown).
export const PRE_MIGRATION_TERMS_VERSION = "pre-2026-07-28";

// One-time, idempotent migration of legacy attestation flags into structured
// records. `ageConfirmed` was written by Onboarding but never persisted
// server-side (it was not in the Progress schema), so it only ever lived in
// the localStorage cache; existing users with it set get an attestation with
// at = null and the pre-migration terms version. Runs on every load; once the
// structured record exists it is left alone.
export function migrateAttestations(data) {
  if (!data) return data;
  let next = data;
  if (next.ageConfirmed === true && !next.age_attestation) {
    next = {
      ...next,
      age_attestation: {
        confirmed: true,
        threshold: LEGAL_AGE_THRESHOLD,
        at: null,
        terms_version: PRE_MIGRATION_TERMS_VERSION,
      },
    };
  }
  if (next.acknowledged === true && !next.disclaimer_attestation) {
    next = {
      ...next,
      disclaimer_attestation: {
        confirmed: true,
        at: null,
        terms_version: PRE_MIGRATION_TERMS_VERSION,
      },
    };
  }
  return next;
}