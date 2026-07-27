// Long-term streak milestones → unique cosmetic flair for the profile.
// Each tier unlocks an avatar ring color, a title shown under the name, and a
// glyph. Unlocked automatically by the gamification engine when the streak
// crosses the threshold; the learner equips any unlocked tier on their profile.

export const STREAK_REWARDS = [
  { id: "spark", streak: 3, name: "Spark", ringClass: "ring-2 ring-amber-400", title: "Kindling", glyph: "🔥" },
  { id: "ember", streak: 7, name: "Ember", ringClass: "ring-2 ring-orange-500", title: "Steady Hand", glyph: "🌅" },
  { id: "blaze", streak: 14, name: "Blaze", ringClass: "ring-2 ring-rose-500", title: "Fortnight", glyph: "♨️" },
  { id: "inferno", streak: 30, name: "Inferno", ringClass: "ring-2 ring-red-500", title: "Monthly Grinder", glyph: "🌋" },
  { id: "eternal", streak: 60, name: "Eternal Flame", ringClass: "ring-2 ring-violet-500", title: "Iron Discipline", glyph: "💎" },
  { id: "centurion", streak: 100, name: "Centurion", ringClass: "ring-2 ring-emerald-400", title: "Centurion", glyph: "👑" },
  { id: "immortal", streak: 365, name: "Immortal", ringClass: "ring-2 ring-sky-400", title: "Immortal", glyph: "⭐" },
];

export function getEquippedFlair(progress) {
  const rewards = progress?.rewards || [];
  const equipped = progress?.equippedFlair;
  return STREAK_REWARDS.find((r) => r.id === equipped && rewards.includes(r.id)) || null;
}