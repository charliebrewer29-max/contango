import React from "react";

// ContangoLogo — memorable animated mark.
// The shape is a contango curve: an upward-sloping forward curve (the literal
// meaning of "contango") drawn as a glowing line with a candlestick riding
// it. The line draws itself in, the candle pops, then a slow pulse loops.
// Variants: size sm|md|lg, showWord, animated.

const SIZES = {
  sm: { box: 28, font: "text-base" },
  md: { box: 40, font: "text-xl" },
  lg: { box: 64, font: "text-3xl" },
  xl: { box: 84, font: "text-5xl" },
};

export default function ContangoLogo({ size = "md", showWord = false, animated = true, className = "" }) {
  const s = SIZES[size] || SIZES.md;
  const uid = "cg-" + size;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center"
        style={{ width: s.box, height: s.box }}
      >
        <svg
          viewBox="0 0 48 48"
          width={s.box}
          height={s.box}
          fill="none"
          className={animated ? "cg-anim" : ""}
        >
          <defs>
            <linearGradient id={`${uid}-curve`} x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" />
              <stop offset="0.55" stopColor="#34d399" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id={`${uid}-candle`} x1="0" y1="20" x2="0" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
            <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* rounded badge */}
          <rect x="1.5" y="1.5" width="45" height="45" rx="13" stroke="#1e293b" strokeWidth="1.5" fill="#020617" />

          {/* contango curve: upward sloping */}
          <path
            d="M8 38 C 16 36, 22 30, 28 24 S 38 12, 40 9"
            stroke={`url(#${uid}-curve)`}
            strokeWidth="2.6"
            strokeLinecap="round"
            filter={`url(#${uid}-glow)`}
            className="cg-curve"
            style={animated ? { strokeDasharray: 60, strokeDashoffset: 60 } : undefined}
          />

          {/* candlestick riding the curve */}
          <g className="cg-candle">
            <line x1="33" y1="13" x2="33" y2="29" stroke="#34d399" strokeWidth="1.2" />
            <rect x="30.6" y="17" width="4.8" height="9" rx="1" fill={`url(#${uid}-candle)`} />
          </g>

          {/* arrow tip at the end of the curve */}
          <path d="M40 9 L 35.5 11 M 40 9 L 38.5 13.5" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="cg-tip" />
        </svg>
      </span>

      {showWord && (
        <span className={`font-display font-bold tracking-tight ${s.font} cg-word`}>
          <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
            Contango
          </span>
        </span>
      )}

      <style>{`
        .cg-anim .cg-curve { animation: cg-draw 1.1s ease-out forwards; }
        .cg-anim .cg-candle { opacity: 0; animation: cg-pop 0.5s ease-out 0.9s forwards; transform-origin: 33px 24px; }
        .cg-anim .cg-tip { opacity: 0; animation: cg-pop 0.4s ease-out 1.15s forwards; transform-origin: 40px 9px; }
        .cg-word { animation: cg-fade 0.6s ease-out 0.3s both; }
        @keyframes cg-draw { to { stroke-dashoffset: 0; } }
        @keyframes cg-pop { 0%{opacity:0;transform:scale(0.3)} 70%{opacity:1;transform:scale(1.12)} 100%{opacity:1;transform:scale(1)} }
        @keyframes cg-fade { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}