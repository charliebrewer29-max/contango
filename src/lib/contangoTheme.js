// Contango design tokens - ported from spec Section 3
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
  { sym: "ESU6", base: 7450.00 },
  { sym: "NQU6", base: 27850.00 },
  { sym: "CLU6", base: 79.40 },
  // Gold front month: GC rolls Aug (Q) -> Dec (Z) -> Feb (G) -> Apr (J) -> Jun (M).
  // Re-check this code alongside the basePrice refresh in instruments.js.
  { sym: "GCQ6", base: 4075.00 },
  { sym: "RTYU6", base: 2310.00 },
  { sym: "ZB", base: 119.84 },
  { sym: "ZN", base: 110.27 },
];

export const GOAL_OPTIONS = [
  { id: "casual", label: "Casual", xp: 50, sub: "50 XP / day" },
  { id: "regular", label: "Regular", xp: 120, sub: "120 XP / day" },
  { id: "serious", label: "Serious", xp: 250, sub: "250 XP / day" },
  { id: "intense", label: "Intense", xp: 500, sub: "500 XP / day" },
];