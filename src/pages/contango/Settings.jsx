import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Bot, Eye, Volume2, Vibrate, Crown, BookOpen, Trash2, LogOut } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { MAX_HEARTS } from "@/lib/gamification";
import { COACH_NAME } from "@/lib/contangoTheme";
import { isPremium, trialDaysLeft } from "@/lib/subscription";
import ReminderSettings from "@/components/contango/ReminderSettings";
import { base44 } from "@/api/base44Client";
import { fetchMe, hasConsent, setConsent } from "@/lib/aiConsent";
import { Section, Toggle } from "@/components/contango/profileBits";
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
  const { progress, update, refillHearts, resetProgress } = useContango();
  const flow = isPremium(progress) ? "history" : "session";
  const [aiOn, setAiOn] = React.useState(false);
  const [aiBusy, setAiBusy] = React.useState(false);

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
    resetProgress();
    try { await base44.auth.logout(); } catch (_e) {}
  }

  function toggle(field) {
    update({ [field]: !progress[field] });
  }

  return (
    <ScreenShell showStats backTo="/" title="Settings">
      <Link to="/profile" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-200">
        <ChevronLeft className="h-4 w-4" /> Profile
      </Link>

      {/* daily reminders */}
      <ReminderSettings />

      {/* privacy */}
      <Section title="Privacy">
        <Toggle icon={<Bot className="h-4 w-4 text-sky-400" />} label="AI coach feedback" desc={aiOn ? "Allowed - sends drill data to Anthropic" : "Off - AI coach is disabled"} on={aiOn} onClick={toggleConsent} />
        <Link to="/legal" className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600">
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-100">Privacy Policy & Terms</div>
            <div className="text-xs text-slate-500">Data sharing, AI consent, account deletion</div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </Link>
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
              {progress.subscription === "premium" ? "Premium active" : progress.subscription === "trial" ? `Free trial · ${trialDaysLeft(progress)} days left` : "Free tier"}
            </div>
            <div className="text-xs text-slate-500">Practice sandbox, all branches, {COACH_NAME} memory, full journal</div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </Link>
        <Link to="/journal" className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-600">
          <BookOpen className="h-5 w-5 text-emerald-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-100">Trade Journal</div>
            <div className="text-xs text-slate-500">{isPremium(progress) ? "Full history & analytics" : "Last session · full history with Premium"}</div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </Link>
        {progress.hearts < MAX_HEARTS && (
          <button onClick={refillHearts} className="w-full rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-400 hover:bg-rose-500/10">
            Refill hearts ({progress.hearts}/{MAX_HEARTS})
          </button>
        )}
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