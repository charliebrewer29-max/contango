import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bot, Eye, Volume2, Vibrate, Crown, BookOpen, Trash2, LogOut } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { COACH_NAME } from "@/lib/contangoTheme";
import { isPremium, trialDaysLeft, restorePurchases } from "@/lib/subscription";
import ReminderSettings from "@/components/contango/ReminderSettings";
import { base44 } from "@/api/base44Client";
import { fetchMe, hasConsent, setConsent } from "@/lib/aiConsent";
import { clearProgress } from "@/lib/progressStore";
import { Section, Toggle } from "@/components/contango/profileBits";
import { validateDisplayName } from "@/lib/displayName";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Settings - reminders, privacy, preferences, subscription, and account.
// Reached from the Profile screen. The delete-account action is gated behind
// an explicit confirmation dialog (not a single tap).
export default function Settings() {
  const { progress, entitlement, update, resetProgress } = useContango();
  const flow = isPremium(entitlement) ? "history" : "session";
  const [aiOn, setAiOn] = React.useState(false);
  const [aiBusy, setAiBusy] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(progress.displayName || "");
  const nameCheck = validateDisplayName(displayName);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await fetchMe();
        if (alive) setAiOn(hasConsent(me, flow));
      } catch (_e) { /* not logged in yet */ }
    })();
    return () => { alive = false; };
  }, [flow]);

  async function toggleConsent() {
    const next = !aiOn;
    setAiOn(next); // optimistic - flip immediately, revert on failure
    setAiBusy(true);
    try {
      await setConsent(next, flow);
    } catch (_e) {
      setAiOn(!next); // rollback
    } finally { setAiBusy(false); }
  }

  async function deleteAccount() {
    try {
      const reminders = await base44.entities.Reminder.filter({});
      for (const r of reminders) { try { await base44.entities.Reminder.delete(r.id); } catch (_e) {} }
    } catch (_e) {}
    try { await clearProgress(); } catch (_e) {}
    try { await base44.auth.logout(); } catch (_e) {}
  }

  function toggle(field) {
    update({ [field]: !progress[field] });
  }

  function saveDisplayName() {
    if (!nameCheck.valid) return;
    update({ displayName: nameCheck.trimmed || null });
  }

  return (
    <ScreenShell showStats backTo="/" title="Settings">
      <Link to="/profile" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-200">
        <ChevronLeft className="h-4 w-4" /> Profile
      </Link>

      {/* profile */}
      <Section title="Profile">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <label className="text-sm font-medium text-slate-100" htmlFor="display-name">Display name</label>
          <p className="mt-0.5 text-xs text-slate-500">Shown on your leaderboard. You can change it anytime.</p>
          <div className="mt-3 flex gap-2">
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nickname (optional)"
              maxLength={20}
              aria-label="Display name"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none md:text-sm"
            />
            <button
              onClick={saveDisplayName}
              disabled={!nameCheck.valid || nameCheck.trimmed === (progress.displayName || "")}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-amber-400"
            >
              Save
            </button>
          </div>
          {nameCheck.error && <p className="mt-2 text-xs text-rose-400">{nameCheck.error}</p>}
        </div>
      </Section>

      {/* daily reminders */}
      <ReminderSettings />

      {/* privacy */}
      <Section title="Privacy">
        <Toggle icon={<Bot className="h-4 w-4 text-sky-400" />} label="AI coach feedback" desc={aiOn ? "Allowed - sends drill data to Anthropic" : "Off - AI coach is disabled"} on={aiOn} onClick={toggleConsent} disabled={aiBusy} />
        <Link to="/legal" className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600">
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-100">Privacy Policy & Terms</div>
            <div className="text-xs text-slate-500">Data sharing, AI consent, account deletion</div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </Link>
      </Section>

      {/* subscription - restore */}
      <Section title="Subscription">
        <button onClick={restorePurchases} className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-slate-600">
          <Crown className="h-5 w-5 text-amber-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-100">Restore Purchases</div>
            <div className="text-xs text-slate-500">Re-link prior App Store purchases to this account</div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </Section>

      {/* preferences */}
      <Section title="Preferences">
        <Toggle icon={<Eye className="h-4 w-4" />} label="Reduced motion" desc="Disable the ticker animation" on={progress.reducedMotion} onClick={() => toggle("reducedMotion")} />
        <Toggle icon={<Volume2 className="h-4 w-4" />} label="Sound" desc="Correct/wrong/complete cues" on={progress.soundOn} onClick={() => toggle("soundOn")} />
        <Toggle icon={<Vibrate className="h-4 w-4" />} label="Haptics" desc="Tap feedback on answers" on={progress.hapticsOn} onClick={() => toggle("hapticsOn")} />
      </Section>

      {/* subscription */}
      <Section title="Subscription">
        <Link to="/paywall" className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600">
          <Crown className="h-5 w-5 text-amber-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-100">
              {entitlement?.tier === "premium" ? "Premium active" : entitlement?.tier === "trial" ? `Free trial · ${trialDaysLeft(entitlement)} days left` : "Free tier"}
            </div>
            <div className="text-xs text-slate-500">Practice sandbox, all branches, {COACH_NAME} memory, full journal</div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </Link>
        <Link to="/journal" className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600">
          <BookOpen className="h-5 w-5 text-emerald-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-100">Trade Journal</div>
            <div className="text-xs text-slate-500">{isPremium(entitlement) ? "Full history & analytics" : "Last session · full history with Premium"}</div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </Link>
      </Section>

      {/* account */}
      <Section title="Account">
        <button onClick={() => { if (confirm("Reset all progress? This cannot be undone.")) resetProgress(); }}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-slate-600">
          <Trash2 className="h-5 w-5 text-rose-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">Reset progress</div>
            <div className="text-xs text-slate-500">Clears XP, streaks, and completion</div>
          </div>
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-left hover:bg-rose-500/10">
              <LogOut className="h-5 w-5 text-rose-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-rose-300">Delete account & data</div>
                <div className="text-xs text-slate-500">Clears progress and reminders, signs you out</div>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-slate-700 bg-slate-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-100">Delete account & data?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This permanently deletes your progress, XP, streaks, badges, reminders, and account data, then signs you out. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount} className="bg-rose-500 text-white hover:bg-rose-600">Delete everything</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-600">
        Contango is a simulated educational tool. No real money, no live trading, no trade signals.<br />
        Not affiliated with TradingView.
      </p>
    </ScreenShell>
  );
}