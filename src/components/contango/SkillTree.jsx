import React from "react";
import {
  GraduationCap, ShieldCheck, Layers, MonitorPlay, TrendingUp, Activity,
  Circle, Zap, Target, DollarSign, BookOpen,
} from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { BRANCHES } from "@/lib/content";
import { branchMasteryStatus } from "@/lib/branchMastery";
import { canAccessBranch } from "@/lib/subscription";
import BranchNode from "@/components/contango/BranchNode";

const ICONS = { GraduationCap, ShieldCheck, Layers, MonitorPlay, TrendingUp, Activity, Circle, Zap, Target, DollarSign, BookOpen };

function isUnlocked(branch, progress) {
  const foundationDone = (progress.completedLessons || []).length > 0;
  const foundationUnlocked = branch.unlockRequires.length === 0 ||
    (branch.unlockRequires.includes("foundation-complete") && foundationDone);
  const premiumLocked = branch.type === "strategy" && !canAccessBranch(branch, progress);
  return foundationUnlocked && !premiumLocked;
}

// Skill tree: a flat, evenly-aligned list of branches. Each node shows how far
// the learner is through the branch. Exactly one node - the first unlocked,
// not-yet-finished branch - is accented as the next action; every other
// unlocked card shares the same neutral surface.
export default function SkillTree() {
  const { progress } = useContango();
  // At 0 hearts the graded curriculum is locked - the disciplined move is to
  // stop and go back to the sandbox. Learn is still reachable via the
  // dashboard's Continue CTA; the nodes themselves read as dimmed + locked.
  const heartsEmpty = (progress.hearts ?? 5) <= 0;

  let nextBranchId = null;
  for (const b of BRANCHES) {
    if (!isUnlocked(b, progress)) continue;
    const s = branchMasteryStatus(progress, b);
    if (!s.finished) { nextBranchId = b.id; break; }
  }

  return (
    <div className="flex flex-col gap-2.5 py-5">
      {BRANCHES.map((branch) => {
        const Icon = ICONS[branch.icon] || Circle;
        return (
          <BranchNode
            key={branch.id}
            branch={branch}
            icon={Icon}
            progress={progress}
            isNext={branch.id === nextBranchId}
            dimmed={heartsEmpty}
          />
        );
      })}
    </div>
  );
}