import React from "react";

// LeagueTrophy - hand-drawn style minted-coin badges.
// Each league has a distinct motif with its own personality, drawn as simple
// strokes (round caps, soft fills) so it reads as crafted, not generated:
//   Rookie  → sprout   (new growth, just starting)
//   Bronze  → flame    (warming up, early grind)
//   Silver  → summit flag (hitting stride)
//   Gold    → crown    (in the money)
//   Platinum→ gem      (elite)
// No gradients or glow - a quiet, human feel.

const Motif = {
  Rookie: ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 37 C 19 37, 29 37, 33 37" strokeWidth="2" />
      <path d="M24 37 C 24 32, 24 28, 24 24" strokeWidth="2" />
      <path d="M24 26 C 20 25, 17 21, 17 18 C 21 18, 24 22, 24 26 Z" fill={ink} fillOpacity="0.22" strokeWidth="1.5" />
      <path d="M24 24 C 28 23, 31 19, 31 16 C 27 16, 24 20, 24 24 Z" fill={ink} fillOpacity="0.22" strokeWidth="1.5" />
    </g>
  ),
  Bronze: ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 11 C 19 17, 17 22, 19 28 C 20 32, 24 35, 24 35 C 28 33, 30 28, 29 22 C 28 17, 25 14, 24 11 Z" fill={ink} fillOpacity="0.2" strokeWidth="1.8" />
      <path d="M24 23 C 22 26, 22 29, 24 31 C 26 29, 26 26, 24 23 Z" fill={ink} fillOpacity="0.5" strokeWidth="1.4" />
    </g>
  ),
  Silver: ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 38 L 24 14 L 39 38" strokeWidth="2" />
      <path d="M16 30 L 24 21" strokeWidth="1.5" />
      <path d="M24 14 L 24 7" strokeWidth="2" />
      <path d="M24 7 L 33 9.5 L 24 12 Z" fill={ink} fillOpacity="0.35" strokeWidth="1.5" />
    </g>
  ),
  Gold: ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 31 L 16 19 L 21 26 L 24 16 L 27 26 L 32 19 L 36 31 Z" fill={ink} fillOpacity="0.2" strokeWidth="1.8" />
      <rect x="13" y="31" width="22" height="5" rx="1.5" fill={ink} fillOpacity="0.3" strokeWidth="1.6" />
      <circle cx="16" cy="19" r="1.5" fill={ink} stroke="none" />
      <circle cx="24" cy="16" r="1.8" fill={ink} stroke="none" />
      <circle cx="32" cy="19" r="1.5" fill={ink} stroke="none" />
    </g>
  ),
  Platinum: ({ ink }) => (
    <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 21 L 24 12 L 34 21 L 24 37 Z" fill={ink} fillOpacity="0.15" strokeWidth="1.8" />
      <path d="M14 21 L 34 21" strokeWidth="1.5" />
      <path d="M24 12 L 24 21" strokeWidth="1.4" />
      <path d="M14 21 L 24 37" strokeWidth="1.4" />
      <path d="M34 21 L 24 37" strokeWidth="1.4" />
      <path d="M33 12 L 33 16 M 31 14 L 35 14" strokeWidth="1.4" />
    </g>
  ),
};

export default function LeagueTrophy({ tier, size }) {
  const s = size ?? tier.iconSize + 16;
  const M = Motif[tier.name] || Motif.Rookie;
  return (
    <svg viewBox="0 0 48 48" width={s} height={s} fill="none" className="shrink-0">
      <rect x="3" y="3" width="42" height="42" rx="11" fill={tier.tint} stroke={tier.ink} strokeWidth="1.8" />
      <M ink={tier.ink} />
    </svg>
  );
}