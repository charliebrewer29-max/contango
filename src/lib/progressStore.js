// Single owner of all reads/writes of the user's Progress row.
// The Progress entity is the source of truth; localStorage ("contango_progress_v1")
// is the offline cache. No other file should touch the Progress entity.

import { base44 } from "@/api/base44Client";
import { migrateAttestations } from "@/lib/legalVersion";

const STORAGE_KEY = "contango_progress_v1";
const MIGRATED_KEY = "contango_migrated_v1";

// Fields the entity schema knows about. Anything else in the cached object is
// kept in localStorage but never sent server-side, so unknown/future fields
// survive a round-trip through the cache even if the entity drops them.
const KNOWN_FIELDS = [
  "xp", "hearts", "streak", "lastActiveDate", "dailyXp", "dailyGoal",
  "firstLessonDone", "onboardingDone", "goal", "why", "completedLessons",
  "completedDrills", "reducedMotion", "soundOn", "hapticsOn", "subscription",
  "mindset", "diaryUnlocked", "lastDrillReview", "srCards", "badges", "stats",
  "rewards", "equippedFlair", "trialStart", "coachCalls", "drillHistory",
  "streakRepairMonth", "coachMemory", "branchReps", "branchLastTouched",
  "disciplineBannerDismissed", "leagueCohort", "leagueXp", "leagueWeekStart",
  "leaguePrevRank", "practiceUsedToday", "practiceResetDate", "heartsDate", "history",
  "age_attestation", "disclaimer_attestation",
];

let cachedRowId = null;
let saveTimer = null;
let offline = false;
let savingEnabled = false;
let offlineListener = () => {};

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_e) { /* ignore */ }
  return null;
}

function writeCache(obj) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (_e) { /* ignore */ }
}

function pickKnown(obj) {
  const out = {};
  for (const k of KNOWN_FIELDS) if (k in obj) out[k] = obj[k];
  return out;
}

function mergeWithDefault(stored, defaultProgress) {
  return { ...defaultProgress, ...(stored || {}) };
}

function unionByJson(a, b) {
  const seen = new Set();
  const out = [];
  for (const v of [...(a || []), ...(b || [])]) {
    const key = typeof v === "string" ? `s:${v}` : `o:${JSON.stringify(v)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

// Reconcile a server row with the local cache. We bias toward never losing
// progress: take the higher numeric counter, OR the progress booleans, and
// union the arrays. Settings strings/objects prefer the server (latest
// authoritative write) while preserving cache-only keys on objects.
function reconcile(serverData, localData, defaultProgress) {
  const server = mergeWithDefault(serverData, defaultProgress);
  if (!localData) return server;
  const local = mergeWithDefault(localData, defaultProgress);
  const diverged =
    (server.xp || 0) !== (local.xp || 0) ||
    KNOWN_FIELDS.some((k) => {
      if (Array.isArray(server[k]) || Array.isArray(local[k])) {
        return JSON.stringify(server[k] || []) !== JSON.stringify(local[k] || []);
      }
      return false;
    });
  if (diverged) {
    console.warn("[progressStore] server/local diverged; reconciling (max xp, union arrays)");
  }
  const merged = { ...server };
  for (const k of ["xp", "streak", "hearts", "dailyXp", "mindset", "practiceUsedToday", "dailyGoal", "leagueXp"]) {
    merged[k] = Math.max(server[k] || 0, local[k] || 0);
  }
  for (const k of ["firstLessonDone", "onboardingDone"]) {
    merged[k] = !!(server[k] || local[k]);
  }
  for (const k of ["completedLessons", "completedDrills", "diaryUnlocked", "badges", "rewards", "coachMemory", "history", "leagueCohort", "drillHistory"]) {
    merged[k] = unionByJson(server[k], local[k]);
  }
  for (const k of ["srCards", "stats", "coachCalls", "branchReps", "branchLastTouched", "lastDrillReview"]) {
    merged[k] = { ...(local[k] || {}), ...(server[k] || {}) };
  }
  return merged;
}

async function isAuthed() {
  try { return await base44.auth.isAuthenticated(); } catch (_e) { return false; }
}

async function fetchRow() {
  const rows = await base44.entities.Progress.list();
  return rows && rows.length ? rows[0] : null;
}

function setOffline(v) {
  if (offline === v) return;
  offline = v;
  offlineListener(v);
}

export function setOfflineListener(fn) { offlineListener = fn || (() => {}); }
export function isOffline() { return offline; }
export function enableSaving(v) { savingEnabled = !!v; }

// One-time migration: if no server row exists yet, create one from the
// localStorage cache (existing users) or from defaults. The migrated marker
// ensures the import runs at most once per device.
async function ensureRow(defaultProgress) {
  const row = await fetchRow();
  if (row) { cachedRowId = row.id; return row; }
  let marker = false;
  try { marker = localStorage.getItem(MIGRATED_KEY) === "true"; } catch (_e) { /* ignore */ }
  const local = readCache();
  const base = (!marker && local) ? { ...defaultProgress, ...local } : { ...defaultProgress };
  const created = await base44.entities.Progress.create(pickKnown(base));
  if (created && created.id) cachedRowId = created.id;
  if (!marker) { try { localStorage.setItem(MIGRATED_KEY, "true"); } catch (_e) { /* ignore */ } }
  return created || base;
}

export async function loadProgress(defaultProgress) {
  const authed = await isAuthed();
  if (!authed) {
    return { data: migrateAttestations(mergeWithDefault(readCache(), defaultProgress)), offline: false };
  }
  try {
    const row = await ensureRow(defaultProgress);
    const data = reconcile(row, readCache(), defaultProgress);
    setOffline(false);
    return { data: migrateAttestations(data), offline: false };
  } catch (_e) {
    setOffline(true);
    return { data: migrateAttestations(mergeWithDefault(readCache(), defaultProgress)), offline: true };
  }
}

async function flushSave() {
  const local = readCache();
  if (!local) return;
  if (!(await isAuthed())) return;
  const payload = pickKnown(local);
  try {
    if (!cachedRowId) {
      const row = await fetchRow();
      if (row) cachedRowId = row.id;
    }
    if (cachedRowId) {
      await base44.entities.Progress.update(cachedRowId, payload);
    } else {
      const created = await base44.entities.Progress.create(payload);
      if (created && created.id) cachedRowId = created.id;
    }
    setOffline(false);
  } catch (_e) {
    setOffline(true);
  }
}

function flushNow() {
  if (!savingEnabled) return;
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  flushSave();
}

// Write the cache synchronously (always), debounce the server write so rapid
// XP ticks during a drill collapse into one request.
export function saveProgress(progress) {
  writeCache(progress);
  if (!savingEnabled) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 1500);
}

// Delete the server row and clear the cache key. Used by reset + account
// deletion. The migration marker is intentionally left in place.
export async function clearProgress() {
  try {
    if (!cachedRowId) {
      const row = await fetchRow();
      if (row) cachedRowId = row.id;
    }
    if (cachedRowId) await base44.entities.Progress.delete(cachedRowId);
  } catch (_e) { /* ignore */ }
  cachedRowId = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch (_e) { /* ignore */ }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushNow);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushNow();
  });
}