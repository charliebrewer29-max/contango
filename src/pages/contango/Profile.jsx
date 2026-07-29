import React from "react";
import { User, Pencil, BarChart3, Repeat, Gift, Settings as SettingsIcon, Lock } from "lucide-react";
import ScreenShell from "@/components/contango/ScreenShell";
import { useContango } from "@/contexts/ContangoContext";
import MindsetMeter from "@/components/contango/MindsetMeter";
import BranchBadge, { BRANCH_BADGES } from "@/components/contango/BranchBadge";
import { getEquippedFlair } from "@/lib/streakRewards";
import { BRANCHES } from "@/lib/content";
import { branchUnitCount } from "@/lib/branchProgress";
import { avatarById } from "@/components/contango/avatars";
import AvatarPicker from "@/components/contango/AvatarPicker";
import { LinkRow, Stat } from "@/components/contango/profileBits";
import { isPremium } from "@/lib/subscription";

// Profile - the bottom-nav destination. Holds only the trader identity,
// quick stats, mindset, and branch badges; everything else lives behind the
// link rows to Rewards, Insights, Practice, and Settings.
export default function Profile() {
  const { progress } = useContango();
  const flair = getEquippedFlair(progress);
  const avatar = avatarById(progress.avatar);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  return (
    <ScreenShell showStats={false} title="Profile" tab="profile">
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
            const branch = BRANCHES.find((x) => x.id === b.id);
            const total = branch ? branchUnitCount(branch) : 0;
            const lessons = branch && branch.buildDrill ? total - 1 : total;
            const condition = branch
              ? (branch.buildDrill ? `Complete ${lessons} lessons + drill` : `Complete ${lessons} lessons`)
              : "";
            return (
              <div key={b.id} className="relative flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
                {!earned && <Lock className="absolute right-1.5 top-1.5 h-2.5 w-2.5 text-slate-500" />}
                <div className={earned ? "" : "opacity-40"}>
                  <BranchBadge badge={b} size={52} locked={false} />
                </div>
                <span className={`text-[13px] font-semibold ${earned ? "text-white" : "text-slate-400"}`}>{b.title}</span>
                <span className="text-[11px] text-slate-500/60">{condition}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* link rows out to the split screens */}
      <LinkRow to="/rewards" icon={<Gift className="h-5 w-5 text-amber-400" />} title="Rewards" subtitle="Streak rewards and your trader's diary" />
      <LinkRow to="/insights" icon={<BarChart3 className="h-5 w-5 text-emerald-400" />} title="Insights" subtitle="Performance data, mastery, and discipline profile" />
      <LinkRow to="/practice" icon={<Repeat className="h-5 w-5 text-sky-400" />} title="Practice" subtitle={isPremium(progress) ? "Unlimited sim sandbox" : "Sim sandbox - 3 free drills a day"} />
      <LinkRow to="/settings" icon={<SettingsIcon className="h-5 w-5 text-slate-300" />} title="Settings" subtitle="Reminders, privacy, preferences, subscription, account" />

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-600">
        Contango is a simulated educational tool. No real money, no live trading, no trade signals.<br />
        Not affiliated with TradingView.
      </p>

      <AvatarPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </ScreenShell>
  );
}