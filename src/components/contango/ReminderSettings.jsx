import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { base44 } from "@/api/base44Client";
import { getMyReminder, saveReminder, buildSnapshot } from "@/lib/reminders";

// Daily reminders settings - one private Reminder record per user. Lets the
// learner toggle reminders on, pick a time, and confirm the email they go to.
// Saving also pushes a fresh progress snapshot so reminder emails stay
// personalized (streak, daily goal, lessons done, next lesson, badges).
export default function ReminderSettings() {
  const { progress } = useContango();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("off"); // on | off | error
  const [ready, setReady] = useState(false);
  const [priorUnsub, setPriorUnsub] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (me?.email) setEmail(me.email);
      } catch { /* ignore */ }
      const r = await getMyReminder();
      if (!alive) return;
      if (r) {
        setEnabled(!!r.enabled);
        setTime(r.reminder_time || "09:00");
        if (r.email) setEmail(r.email);
        setStatus(r.enabled ? "on" : "off");
        setPriorUnsub(r.unsubscribed_at || null);
      }
      setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  async function save() {
    setSaving(true);
    try {
      await saveReminder({ enabled, reminder_time: time, email }, buildSnapshot(progress));
      setStatus(enabled ? "on" : "off");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  // Optimistic enable/disable: flip the UI instantly, persist in the
  // background, and roll back only if the save fails.
  async function toggleEnabled() {
    if (saving) return;
    const next = !enabled;
    if (next && priorUnsub) console.info("[reminders] in-app opt-in overrides prior opt-out");
    setEnabled(next);
    setStatus(next ? "on" : "off");
    setSaving(true);
    try {
      await saveReminder({ enabled: next, reminder_time: time, email }, buildSnapshot(progress));
    } catch {
      setEnabled(!next);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const label12 = (() => {
    const [h, m] = (time || "09:00").split(":");
    const hh = parseInt(h, 10);
    const ap = hh >= 12 ? "PM" : "AM";
    const h12 = ((hh + 11) % 12) + 1;
    return `${h12}:${m || "00"} ${ap}`;
  })();

  return (
    <div className="mb-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Daily reminders</h3>
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <span className="text-amber-400"><Bell className="h-4 w-4" /></span>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">Practice nudge</div>
            <div className="text-xs text-slate-500">
              {status === "on" ? `On · sends around ${label12} your time` : status === "error" ? "Couldn't save - try again" : "A daily email to keep your streak alive"}
            </div>
          </div>
          <button
            onClick={toggleEnabled}
            disabled={saving}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-amber-400" : "bg-slate-700"}`}
            aria-label="Toggle daily reminders"
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${enabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Remind me at</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500/50"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">Send to</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500/50"
            />
          </label>
        </div>

        <button
          onClick={save}
          disabled={!ready || saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-display font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save reminder"}
        </button>
        <p className="text-center text-[11px] text-slate-600">Reminders email registered app users only.</p>
      </div>
    </div>
  );
}