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
          {/* rounded badge */}
          <rect x="1.5" y="1.5" width="45" height="45" rx="13" stroke="#272d38" strokeWidth="1.5" fill="#0b1117" />

          {/* contango curve: upward sloping, single restrained stroke */}
          <path
            d="M9 37 C 17 35, 22 29, 28 24 S 38 13, 39 11"
            stroke="#3fae84"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="cg-curve"
            style={animated ? { strokeDasharray: 58, strokeDashoffset: 58 } : undefined}
          />

          {/* candlestick riding the curve */}
          <g className="cg-candle">
            <line x1="32" y1="15" x2="32" y2="29" stroke="#3fae84" strokeWidth="1.1" />
            <rect x="29.8" y="18" width="4.4" height="8" rx="1" fill="#3fae84" />
          </g>

          {/* arrow tip at the end of the curve */}
          <path d="M39 11 L 34.5 12 M 39 11 L 37.5 15" stroke="#3fae84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cg-tip" />
        </svg>
      </span>

      {showWord && (
        <span className={`font-display font-semibold tracking-tight text-slate-200 ${s.font} cg-word`}>
          Contango
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