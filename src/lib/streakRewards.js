// Long-term streak milestones → unique cosmetic flair for the profile.
// Each tier unlocks an avatar ring color, a title shown under the name, a
// glyph, and a `glow` hex used to tint the profile showcase. Unlocked
// automatically by the gamification engine when the streak crosses the
// threshold; the learner equips any unlocked tier on their profile.

export const STREAK_REWARDS = [
  { id: "spark", streak: 3, name: "Spark", ringClass: "ring-2 ring-amber-400", title: "Kindling", glyph: "🔥", glow: "#fbbf24" },
  { id: "ember", streak: 7, name: "Ember", ringClass: "ring-2 ring-orange-500", title: "Steady Hand", glyph: "🌅", glow: "#f97316" },
  { id: "blaze", streak: 14, name: "Blaze", ringClass: "ring-2 ring-rose-500", title: "Fortnight", glyph: "♨️", glow: "#f43f5e" },
  { id: "inferno", streak: 30, name: "Inferno", ringClass: "ring-2 ring-red-500", title: "Monthly Grinder", glyph: "🌋", glow: "#ef4444" },
  { id: "eternal", streak: 60, name: "Eternal Flame", ringClass: "ring-2 ring-violet-500", title: "Iron Discipline", glyph: "💎", glow: "#8b5cf6" },
  { id: "centurion", streak: 100, name: "Centurion", ringClass: "ring-2 ring-emerald-400", title: "Centurion", glyph: "👑", glow: "#34d399" },
  { id: "vanguard", streak: 180, name: "Vanguard", ringClass: "ring-2 ring-teal-400", title: "Vanguard", glyph: "🛡️", glow: "#2dd4bf" },
  { id: "immortal", streak: 365, name: "Immortal", ringClass: "ring-2 ring-sky-400", title: "Immortal", glyph: "⭐", glow: "#38bdf8" },
];

export function getEquippedFlair(progress) {
  const rewards = progress?.rewards || [];
  const equipped = progress?.equippedFlair;
  return STREAK_REWARDS.find((r) => r.id === equipped && rewards.includes(r.id)) || null;
}