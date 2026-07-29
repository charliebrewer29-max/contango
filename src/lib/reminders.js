// Client-side helpers for the daily reminder system. Each user owns one
// Reminder record (RLS-enforced). The record carries a live progress snapshot
// (synced on save and on lesson/drill completion) so the backend reminder
// email can be personalized without server access to localStorage.

import { base44 } from "@/api/base44Client";
import { findNextLesson } from "./branchProgress";

const ID_KEY = "contango_reminder_id";

function localTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function hourOf(time) {
  if (!time) return 9;
  const h = parseInt(String(time).split(":")[0], 10);
  return isNaN(h) ? 9 : h;
}

// Cryptographically random opt-out token (32+ chars). Generated only when a
// Reminder row is created; never derived from the user id or email.
function randomToken() {
  try {
    const b = new Uint8Array(24);
    crypto.getRandomValues(b);
    return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export function buildSnapshot(progress) {
  const next = findNextLesson(progress);
  return {
    xp: progress.xp || 0,
    streak: progress.streak || 0,
    lessons_done: (progress.completedLessons || []).length,
    daily_goal: progress.dailyGoal || 20,
    daily_xp: progress.dailyXp || 0,
    next_lesson_title: next?.title || "",
    badges_count: (progress.badges || []).length,
  };
}

export async function getMyReminder() {
  try {
    const list = await base44.entities.Reminder.filter({}, "-updated_date", 5);
    return (list && list[0]) || null;
  } catch {
    return null;
  }
}

export async function saveReminder({ enabled, reminder_time, email }, snapshot) {
  const payload = {
    enabled: !!enabled,
    reminder_time: reminder_time || "09:00",
    reminder_hour: hourOf(reminder_time),
    timezone: localTz(),
    email: email || "",
    xp: snapshot?.xp ?? 0,
    streak: snapshot?.streak ?? 0,
    lessons_done: snapshot?.lessons_done ?? 0,
    daily_goal: snapshot?.daily_goal ?? 20,
    daily_xp: snapshot?.daily_xp ?? 0,
    next_lesson_title: snapshot?.next_lesson_title ?? "",
    badges_count: snapshot?.badges_count ?? 0,
  };
  // An explicit in-app opt-in overrides a prior email opt-out (CAN-SPAM
  // allows re-subscription; the durable opt-out record is cleared on enable).
  if (enabled) payload.unsubscribed_at = null;

  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    const existing = await getMyReminder();
    id = existing?.id || null;
  }

  let record;
  if (id) {
    record = await base44.entities.Reminder.update(id, payload);
  } else {
    record = await base44.entities.Reminder.create({ ...payload, unsub_token: randomToken() });
    id = record?.id || null;
  }
  if (id) localStorage.setItem(ID_KEY, id);
  return record;
}

// Fire-and-forget snapshot sync on lesson/drill completion. Swallows errors so
// a reminder hiccup never breaks the learning flow.
export function syncReminderSnapshot(snapshot) {
  const id = localStorage.getItem(ID_KEY);
  if (!id) return Promise.resolve();
  return base44.entities.Reminder.update(id, {
    xp: snapshot?.xp ?? 0,
    streak: snapshot?.streak ?? 0,
    lessons_done: snapshot?.lessons_done ?? 0,
    daily_goal: snapshot?.daily_goal ?? 20,
    daily_xp: snapshot?.daily_xp ?? 0,
    next_lesson_title: snapshot?.next_lesson_title ?? "",
    badges_count: snapshot?.badges_count ?? 0,
  }).catch(() => {});
}