import React from "react";

// League trophy badge: a gradient disc with the tier's icon.
// Higher tiers add an animated glow, and Platinum adds a shimmer sweep —
// so reaching a higher league visibly feels like a bigger milestone.
export default function LeagueTrophy({ tier }) {
  const Icon = tier.icon;
  const size = tier.iconSize + 18;
  const glowColor = tier.glow === "sky" ? "bg-sky-400/50" : "bg-amber-400/50";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {tier.glow && (
        <div
          className={`absolute inset-0 rounded-full blur-lg ${glowColor}`}
          style={{ animation: "leagueGlow 2.4s ease-in-out infinite" }}
        />
      )}
      <div className={`relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${tier.badge} ring-2 ${tier.ring}`}>
        <Icon className={tier.iconColor} style={{ width: tier.iconSize, height: tier.iconSize }} />
        {tier.shimmer && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className="absolute -inset-y-2 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              style={{ animation: "leagueShimmer 2.8s linear infinite" }}
            />
          </div>
        )}
      </div>
      <style>{`
        @keyframes leagueGlow { 0%,100%{opacity:.35;transform:scale(.9)} 50%{opacity:.75;transform:scale(1.12)} }
        @keyframes leagueShimmer { 0%{transform:translateX(-60%)} 60%,100%{transform:translateX(280%)} }
      `}</style>
    </div>
  );
}