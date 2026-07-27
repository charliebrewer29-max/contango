// Pure helpers for the Insights page: time-series of daily XP, and mastery
// levels derived from the spaced-repetition card state, grouped by branch
// and by individual concept (lesson unit).

import { BRANCHES, allUnitsFlat, findBranch } from "./content";
import { branchDoneCount, branchUnitCount } from "./branchProgress";

const DAY = 86400000;

const UNIT_TO_BRANCH = {};
for (const { branch, unit } of allUnitsFlat()) UNIT_TO_BRANCH[unit.id] = branch;

// Last N calendar days, filled with zeros where there's no activity record.
// Cumulative XP carries forward so the growth line never dips.
export function lastNDays(n, history = []) {
  const map = {};
  for (const h of history || []) map[h.date] = h;
  const out = [];
  const today = new Date();
  let carryXp = 0;
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY);
    const ds = d.toISOString().slice(0, 10);
    const h = map[ds];
    if (h && h.xp != null) carryXp = h.xp;
    out.push({
      date: ds,
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      dailyXp: h?.dailyXp || 0,
      xp: h ? h.xp : carryXp,
      active: !!h,
      streak: h?.streak || 0,
    });
  }
  return out;
}

// Per-card mastery from SM-2 state: 0 until first review, then maturity grows
// with interval (capped at 21 days = 100%) and shrinks with lapses.
function cardMastery(card) {
  if (!card || !card.reps || card.reps === 0) return 0;
  const maturity = Math.min(100, ((card.interval || 0) / 21) * 100);
  const penalty = (card.lapses || 0) * 12;
  return Math.max(0, Math.round(maturity - penalty));
}

function branchForCardId(id) {
  const [kind, a] = id.split(":");
  if (kind === "drill") return findBranch(a);
  return UNIT_TO_BRANCH[a];
}

// Average mastery per curriculum branch, plus lesson completion %.
export function branchMastery(progress) {
  const cards = progress?.srCards || {};
  const byBranch = {};
  for (const [id, card] of Object.entries(cards)) {
    const b = branchForCardId(id);
    if (!b) continue;
    (byBranch[b.id] = byBranch[b.id] || []).push(cardMastery(card));
  }
  return BRANCHES
    .map((b) => {
      const arr = byBranch[b.id] || [];
      const mastery = arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
      const completion = Math.round((branchDoneCount(b, progress) / Math.max(1, branchUnitCount(b, progress))) * 100);
      return { id: b.id, title: b.branchTitle, color: b.color, mastery, completion, cardCount: arr.length };
    })
    .filter((b) => b.completion > 0 || b.cardCount > 0);
}

// Per-concept mastery for every completed lesson that has practice cards.
export function conceptMastery(progress) {
  const cards = progress?.srCards || {};
  const byUnit = {};
  for (const [id, card] of Object.entries(cards)) {
    const [kind, a] = id.split(":");
    if (kind === "drill") continue;
    if (!UNIT_TO_BRANCH[a]) continue;
    (byUnit[a] = byUnit[a] || []).push(cardMastery(card));
  }
  const completed = progress?.completedLessons || [];
  const out = [];
  for (const { branch, unit } of allUnitsFlat()) {
    if (!completed.includes(unit.id)) continue;
    const arr = byUnit[unit.id] || [];
    const mastery = arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
    out.push({ id: unit.id, title: unit.title, branchId: branch.id, color: branch.color, mastery, practiced: arr.length });
  }
  return out;
}