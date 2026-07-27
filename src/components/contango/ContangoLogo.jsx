import React from "react";

// ContangoLogo — a bold ascending-bars mark on a dark badge. Three rising
// bars + an upward chevron read instantly as growth and trading, and the
// heavier shapes hold up better at small sizes than the old thin curve.
// Variants: size sm|md|lg|xl, showWord, animated.

const SIZES = {
  sm: { box: 28, font: "text-base" },
  md: { box: 40, font: "text-xl" },
  lg: { box: 64, font: "text-3xl" },
  xl: { box: 84, font: "text-5xl" },
};

export default function ContangoLogo({ size = "md", showWord = false, animated = true, className = "" }) {
  const s = SIZES[size] || SIZES.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: s.box, height: s.box }}>
        <svg viewBox="0 0 48 48" width={s.box} height={s.box} fill="none" className={animated ? "cg-anim" : ""}>
          {/* rounded badge */}
          <rect x="1.5" y="1.5" width="45" height="45" rx="13" stroke="#272d38" strokeWidth="1.5" fill="#0b1117" />

          {/* ascending bars — bar chart rising */}
          <rect className="cg-bar" x="10" y="29" width="6" height="8" rx="2" fill="#34d399" style={animated ? { animationDelay: "0.1s" } : undefined} />
          <rect className="cg-bar" x="21" y="23" width="6" height="14" rx="2" fill="#34d399" style={animated ? { animationDelay: "0.28s" } : undefined} />
          <rect className="cg-bar" x="32" y="17" width="6" height="20" rx="2" fill="#34d399" style={animated ? { animationDelay: "0.46s" } : undefined} />

          {/* upward chevron above the bars */}
          <path className="cg-tip" d="M24 13 L33 7 L42 13" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      {showWord && (
        <span className={`font-display font-bold tracking-tight text-slate-50 ${s.font} cg-word`}>
          Contango
        </span>
      )}

      <style>{`
        .cg-bar { transform-box: fill-box; transform-origin: bottom; }
        .cg-anim .cg-bar { transform: scaleY(0); animation: cg-rise 0.55s cubic-bezier(.2,.9,.3,1.2) forwards; }
        .cg-anim .cg-tip { opacity: 0; animation: cg-pop 0.45s ease-out 0.6s forwards; transform-origin: 33px 10px; }
        .cg-word { animation: cg-fade 0.6s ease-out 0.3s both; }
        @keyframes cg-rise { to { transform: scaleY(1); } }
        @keyframes cg-pop { 0%{opacity:0;transform:scale(0.4)} 70%{opacity:1;transform:scale(1.12)} 100%{opacity:1;transform:scale(1)} }
        @keyframes cg-fade { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}