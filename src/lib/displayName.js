// Display name (nickname) validation, shared by Onboarding and Settings.
// A nickname, not a legal name: 1-20 chars, letters/numbers/spaces/hyphens/
// underscores. Empty is valid (the step is skippable) and persists as null.
const NAME_RE = /^[\p{L}\p{N} _-]{1,20}$/u;

export function validateDisplayName(raw) {
  const trimmed = (raw || "").trim();
  if (trimmed.length === 0) return { trimmed, valid: true, error: null };
  if (trimmed.length > 20) return { trimmed, valid: false, error: "Keep it under 20 characters" };
  if (!NAME_RE.test(trimmed)) return { trimmed, valid: false, error: "Letters, numbers, spaces, hyphens, or underscores only" };
  return { trimmed, valid: true, error: null };
}