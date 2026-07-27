import React from "react";

// ContangoLogo — the "breakout" mark: ascending candlestick bars that
// culminate in an up-right arrowhead. One confident idea: markets rising
// into a breakout. Bold, geometric, no gradients or glow — crafted, not
// generated. Variants: size sm|md|lg|xl, showWord, animated.

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
          {/* badge */}
          <rect x="1.5" y="1.5" width="45" height="45" rx="13" stroke="#222936" strokeWidth="1.5" fill="#0b1117" />
          {/* ascending bars — the run-up */}
          <rect className="cg-bar b1" x="9"  y="32" width="5.5" height="7"  rx="1.6" fill="#34d399" fillOpacity="0.55" />
          <rect className="cg-bar b2" x="16.5" y="25" width="5.5" height="14" rx="1.6" fill="#34d399" fillOpacity="0.78" />
          <rect className="cg-bar b3" x="24"  y="17" width="5.5" height="22" rx="1.6" fill="#34d399" />
          {/* breakout arrowhead — up-right */}
          <polygon className="cg-arrow" points="40,9 30.5,9 40,18.5" fill="#6ee7b7" />
        </svg>
      </span>

      {showWord && (
        <span className={`font-display font-bold tracking-tight text-slate-50 ${s.font} cg-word`}>
          Contango
        </span>
      )}

      <style>{`
        .cg-bar { transform-box: fill-box; transform-origin: bottom; }
        .cg-arrow { transform-box: fill-box; transform-origin: 75% 75%; }
        .cg-anim .cg-bar { animation: cg-rise 0.5s cubic-bezier(.2,.9,.3,1.1) both; }
        .cg-anim .b1 { animation-delay: 0.05s; }
        .cg-anim .b2 { animation-delay: 0.15s; }
        .cg-anim .b3 { animation-delay: 0.25s; }
        .cg-anim .cg-arrow { animation: cg-pop 0.45s cubic-bezier(.2,.9,.3,1.4) 0.32s both; }
        .cg-word { animation: cg-fade 0.6s ease-out 0.34s both; }
        @keyframes cg-rise { from { transform: scaleY(0.04); opacity: 0.15; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes cg-pop { 70% { transform: scale(1.12); opacity: 1; } from { transform: scale(0.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes cg-fade { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}