// Contango design tokens — ported from spec Section 3
// Colors map directly to Tailwind slate/emerald/rose/amber/sky palettes.

export const COLORS = {
  bg: "bg-slate-950",
  bgSoft: "bg-slate-900",
  surface: "bg-slate-900",
  surfaceBorder: "border-slate-800",
  bullish: "text-emerald-400",
  bearish: "text-rose-400",
  accent: "text-amber-400",
  coach: "text-sky-400",
  textPrimary: "text-slate-100",
  textMuted: "text-slate-400",
  textFaint: "text-slate-600",
};

export const COACH_NAME = "Tango";

export const TICKER_SYMBOLS = [
  { sym: "ESU6", base: 5987.50 },
  { sym: "NQU6", base: 21340.75 },
  { sym: "CLU6", base: 71.42 },
  { sym: "GCU6", base: 2385.20 },
  { sym: "RTYU6", base: 2310.00 },
  { sym: "ZB", base: 119.84 },
  { sym: "ZN", base: 110.27 },
];

export const GOAL_OPTIONS = [
  { id: "casual", label: "Casual", xp: 10, sub: "10 XP / day" },
  { id: "regular", label: "Regular", xp: 20, sub: "20 XP / day" },
  { id: "serious", label: "Serious", xp: 50, sub: "50 XP / day" },
  { id: "intense", label: "Intense", xp: 100, sub: "100 XP / day" },
];