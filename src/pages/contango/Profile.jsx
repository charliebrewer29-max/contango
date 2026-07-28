import React from "react";
import { Link } from "react-router-dom";
import { User, Settings, Bell, Eye, Volume2, Vibrate, Crown, Trash2, LogOut, Bot, ChevronRight, BookOpen, Pencil } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import { MAX_HEARTS } from "@/lib/gamification";
import { COACH_NAME } from "@/lib/contangoTheme";
import { isPremium, trialDaysLeft, canRepairStreak } from "@/lib/subscription";
import TraderDiary from "@/components/contango/TraderDiary";
import MindsetMeter from "@/components/contango/MindsetMeter";
import BranchBadge, { BRANCH_BADGES } from "@/components/contango/BranchBadge";
import ReminderSettings from "@/components/contango/ReminderSettings";
import StreakRewards from "@/components/contango/StreakRewards";
import { getEquippedFlair } from "@/lib/streakRewards";
import { base44 } from "@/api/base44Client";
import { fetchMe, hasConsent, setConsent } from "@/lib/aiConsent";
import { avatarById } from "@/components/contango/avatars";
import AvatarPicker from "@/components/contango/AvatarPicker";

export default function Profile() {
  const { progress, update, refillHearts, resetProgress, repairStreak } = useContango();
  const flair = getEquippedFlair(progress);
  const avatar = avatarById(progress.avatar);
  const flow = isPremium(progress) ? "history" : "session";
  const [aiOn, setAiOn] = React.useState(false);
  const [aiBusy, setAiBusy] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

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
    if (!confirm("Delete your account and data? This clears your progress and reminders and signs you out. This cannot be undone.")) return;
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
    <ScreenShell showStats={false} title="Profile & Settings" tab="profile">
      {/* identity card - flair showcase */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5">
        {flair && (
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: flair.glow }} />
        )}
        <div className="relative flex items-center gap-4">
          <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 ${flair ? flair.ringClass : ""}`}>
            {avatar ? (
              <span className="text-3xl leading-none">{avatar.emoji}</span>
            ) : (
              <User className="h-8 w-8 text-amber-400" />
            )}
            <button onClick={() => setPickerOpen(true)} aria-label="Change avatar" className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
              <Pencil className="h-3 w-3" />
            </button>
            {flair && (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-sm leading-none">
                {flair.glyph}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold text-slate-100">Trader</div>
            <div className="text-xs text-slate-500">{progress.xp} XP · {progress.streak || 0} day streak</div>
            {flair ? (
              <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `${flair.glow}22`, color: flair.glow }}>
                {flair.glyph} {flair.title}
              </div>
            ) : (
              <div className="mt-1 text-xs text-slate-600">No flair yet - keep your streak going to unlock one</div>
            )}
            <div className="mt-1 text-xs text-amber-400">{progress.subscription === "premium" ? "Premium" : progress.subscription === "trial" ? "Free trial" : "Free tier"}</div>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Lessons" value={progress.completedLessons.length} />
        <Stat label="Drills" value={progress.completedDrills.length} />
        <Stat label="Badges" value={(progress.badges || []).length} />
      </div>

      {/* mindset */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <MindsetMeter value={progress.mindset ?? 75} />
      </div>

      {/* branch badges */}
      <div className="mb-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Branch Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {BRANCH_BADGES.map((b) => {
            const earned = (progress.badges || []).includes(b.id);
            return (
              <div key={b.id} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
                <BranchBadge badge={b} size={52} locked={!earned} />
                <span className={`text-[11px] font-medium ${earned ? "text-slate-200" : "text-slate-600"}`}>{earned ? b.title : "Locked"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <StreakRewards />

      <ReminderSettings />

      {/* trader's diary */}
      <TraderDiary unlocked={progress.diaryUnlocked || []} />

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
        {canRepairStreak(progress) && (
          <button onClick={repairStreak} className="w-full rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-400 hover:bg-amber-500/10">
            Repair streak (monthly Premium perk)
          </button>
        )}
        {progress.hearts < MAX_HEARTS && (
          <button onClick={refillHearts} className="mt-2 w-full rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-400 hover:bg-rose-500/10">
            Refill hearts ({progress.hearts}/{MAX_HEARTS})
          </button>
        )}
      </Section>

      {/* danger zone */}
      <Section title="Account">
        <button onClick={() => { if (confirm("Reset all progress? This cannot be undone.")) resetProgress(); }}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-slate-600">
          <Trash2 className="h-5 w-5 text-rose-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">Reset progress</div>
            <div className="text-xs text-slate-500">Clears XP, streaks, and completion</div>
          </div>
        </button>
        <button onClick={deleteAccount} className="flex w-full items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-left hover:bg-rose-500/10">
          <LogOut className="h-5 w-5 text-rose-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-rose-300">Delete account & data</div>
            <div className="text-xs text-slate-500">Clears progress and reminders, signs you out</div>
          </div>
        </button>
      </Section>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-600">
        Contango is a simulated educational tool. No real money, no live trading, no trade signals.<br />
        Not affiliated with TradingView.
      </p>

      <AvatarPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </ScreenShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
      <div className="font-mono text-2xl font-bold text-amber-400">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({ icon, label, desc, on, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-left">
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-200">{label}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
      <div className={`relative h-6 w-11 rounded-full transition ${on ? "bg-amber-400" : "bg-slate-700"}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </div>
    </button>
  );
}