import React from "react";

// BranchBadge — hand-drawn minted-coin badges, one unique motif per
// curriculum branch. Same crafted feel as LeagueTrophy: soft fills, round
// caps, no gradients or glow. Locked variants render muted so an unearned
// badge still reads as a badge, just out of reach.
//
//   foundation          → classical pillars      (you built the base)
//   risk-psych          → shield + heartbeat     (discipline under pressure)
//   instruments         → stacked layers         (know your terrain)
//   platform-literacy   → monitor + candle       (at home on the platform)
//   trend               → rising line + arrow    (rode the breakout)
//   mean-reversion      → range bands + wave     (faded the extremes)

const Motifs = {
  foundation: ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M10 36 L38 36" strokeWidth="2" />
      <path d="M13 36 L13 15 M35 36 L35 15" strokeWidth="2.2" />
      <path d="M10 15 L38 15" strokeWidth="2" />
      <path d="M10 15 L24 9 L38 15 Z" fill={ink} fillOpacity="0.16" strokeWidth="1.8" />
      <path d="M18 36 L18 15 M30 36 L30 15" strokeWidth="1.1" />
    </g>
  ),
  "risk-psych": ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M24 8 L36 13 L36 24 C36 31 31 35 24 38 C17 35 12 31 12 24 L12 13 Z" strokeWidth="2" fill={ink} fillOpacity="0.12" />
      <path d="M15 24 L19 24 L21 18 L24 30 L26 21 L29 24 L33 24" strokeWidth="1.8" />
    </g>
  ),
  instruments: ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <rect x="10" y="30" width="28" height="6" rx="1.5" strokeWidth="1.8" fill={ink} fillOpacity="0.18" />
      <rect x="13" y="22" width="22" height="6" rx="1.5" strokeWidth="1.8" fill={ink} fillOpacity="0.14" />
      <rect x="16" y="14" width="16" height="6" rx="1.5" strokeWidth="1.8" fill={ink} fillOpacity="0.1" />
    </g>
  ),
  "platform-literacy": ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <rect x="9" y="11" width="30" height="20" rx="2.5" strokeWidth="2" />
      <path d="M16 34 L32 34 M20 34 L20 38 M28 34 L28 38" strokeWidth="1.6" />
      <path d="M19 25 L19 18" strokeWidth="1.4" />
      <rect x="17.2" y="19" width="3.6" height="5" fill={ink} fillOpacity="0.4" strokeWidth="1.1" />
      <path d="M28 27 L28 20" strokeWidth="1.4" />
      <rect x="26.2" y="21" width="3.6" height="5" fill="none" strokeWidth="1.1" />
    </g>
  ),
  trend: ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M10 35 L36 12" strokeWidth="2.4" />
      <path d="M29 12 L36 12 L36 19" strokeWidth="1.8" />
      <path d="M14 30 L16 30 M19 25 L21 25 M24 20 L26 20" strokeWidth="1.4" />
    </g>
  ),
  "mean-reversion": ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M9 13 L39 13" strokeWidth="1.3" strokeDasharray="3 3" />
      <path d="M9 35 L39 35" strokeWidth="1.3" strokeDasharray="3 3" />
      <path d="M10 24 C 15 16, 20 16, 24 24 C 28 32, 33 32, 38 24" strokeWidth="2.1" />
    </g>
  ),
};

export const BRANCH_BADGES = [
  { id: "foundation", title: "Foundation", subtitle: "Mastered the mechanics", ink: "#f59e0b", tint: "#2a1a0c" },
  { id: "risk-psych", title: "Steady Hand", subtitle: "Discipline under pressure", ink: "#fb7185", tint: "#2a1216" },
  { id: "instruments", title: "Instrument Tour", subtitle: "Know your terrain", ink: "#38bdf8", tint: "#0e2a38" },
  { id: "platform-literacy", title: "Chart Reader", subtitle: "At home on the platform", ink: "#a78bfa", tint: "#1a1330" },
  { id: "trend", title: "Trend Rider", subtitle: "Rode the breakout", ink: "#34d399", tint: "#0c2a1c" },
  { id: "mean-reversion", title: "Range Master", subtitle: "Faded the extremes", ink: "#fbbf24", tint: "#2a200c" },
];

export function badgeForBranch(branchId) {
  return BRANCH_BADGES.find(b => b.id === branchId);
}

export default function BranchBadge({ badge, size = 64, locked = false }) {
  if (!badge) return null;
  const ink = locked ? "#475569" : badge.ink;
  const tint = locked ? "#172033" : badge.tint;
  const M = Motifs[badge.id];
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" className="shrink-0">
      <rect x="3" y="3" width="42" height="42" rx="11" fill={tint} stroke={ink} strokeWidth="1.8" />
      <rect x="6" y="6" width="36" height="36" rx="8.5" fill="none" stroke={ink} strokeWidth="0.7" strokeOpacity="0.35" />
      {M && <M ink={ink} />}
    </svg>
  );
}