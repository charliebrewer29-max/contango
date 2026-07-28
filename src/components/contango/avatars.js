// In-app avatar options the user can pick from on their Profile.
// No uploads - just a curated set of emoji avatars with themed backgrounds.
// Tailwind sees the literal bg/ring classes here, so they are not purged.

export const AVATAR_OPTIONS = [
  { id: "bull", emoji: "🐂", label: "Bull", bg: "bg-emerald-500/20", ring: "border-emerald-500/40" },
  { id: "bear", emoji: "🐻", label: "Bear", bg: "bg-rose-500/20", ring: "border-rose-500/40" },
  { id: "wolf", emoji: "🐺", label: "Wolf", bg: "bg-sky-500/20", ring: "border-sky-500/40" },
  { id: "fox", emoji: "🦊", label: "Fox", bg: "bg-amber-500/20", ring: "border-amber-500/40" },
  { id: "owl", emoji: "🦉", label: "Owl", bg: "bg-violet-500/20", ring: "border-violet-500/40" },
  { id: "lion", emoji: "🦁", label: "Lion", bg: "bg-orange-500/20", ring: "border-orange-500/40" },
  { id: "rocket", emoji: "🚀", label: "Rocket", bg: "bg-sky-500/20", ring: "border-sky-500/40" },
  { id: "trend", emoji: "📈", label: "Trend", bg: "bg-emerald-500/20", ring: "border-emerald-500/40" },
  { id: "diamond", emoji: "💎", label: "Diamond", bg: "bg-cyan-500/20", ring: "border-cyan-500/40" },
  { id: "skull", emoji: "💀", label: "Reaper", bg: "bg-slate-500/20", ring: "border-slate-500/40" },
  { id: "robot", emoji: "🤖", label: "Bot", bg: "bg-violet-500/20", ring: "border-violet-500/40" },
  { id: "ninja", emoji: "🥷", label: "Ninja", bg: "bg-slate-600/20", ring: "border-slate-400/40" },
  { id: "fire", emoji: "🔥", label: "Hot Streak", bg: "bg-rose-500/20", ring: "border-rose-500/40" },
  { id: "crown", emoji: "👑", label: "King", bg: "bg-amber-500/20", ring: "border-amber-500/40" },
];

export function avatarById(id) {
  return AVATAR_OPTIONS.find((a) => a.id === id);
}