import React from "react";
import {
  GraduationCap, ShieldCheck, Layers, MonitorPlay, TrendingUp, Activity,
  Circle, Zap, Target, DollarSign, BookOpen,
} from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { BRANCHES } from "@/lib/content";
import BranchNode from "@/components/contango/BranchNode";

const ICONS = { GraduationCap, ShieldCheck, Layers, MonitorPlay, TrendingUp, Activity, Circle, Zap, Target, DollarSign, BookOpen };

// Skill tree: branching path of branches. Each node shows how far the learner
// is through the branch, turns gold with repeated mastery, and cracks when a
// finished branch is left untouched too long.
export default function SkillTree() {
  const { progress } = useContango();

  return (
    <div className="flex flex-col items-center gap-2.5 py-5">
      {BRANCHES.map((branch, idx) => {
        const Icon = ICONS[branch.icon] || Circle;
        const offset = [0, 24, -24, 16, -16, 0][idx % 6];
        return (
          <BranchNode key={branch.id} branch={branch} icon={Icon} offset={offset} progress={progress} />
        );
      })}
    </div>
  );
}