import React from "react";

// ContangoLogo — a single bold up-right growth arrow inside a rounded badge.
// One confident mark: memorable, geometric, no gradients or glow. Variants:
// size sm|md|lg|xl, showWord, animated.

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
          <rect x="1.5" y="1.5" width="45" height="45" rx="13" stroke="#272d38" strokeWidth="1.5" fill="#0b1117" />
          <polygon className="cg-arrow" points="25.5,28.5 19.9,22.9 24.8,13.8 34,14 34.7,23.7" fill="#34d399" />
        </svg>
      </span>

      {showWord && (
        <span className={`font-display font-bold tracking-tight text-slate-50 ${s.font} cg-word`}>
          Contango
        </span>
      )}

      <style>{`
        .cg-arrow { transform-box: fill-box; transform-origin: center; }
        .cg-anim .cg-arrow { transform: scale(0.5); opacity: 0; animation: cg-arrow-in 0.55s cubic-bezier(.2,.9,.3,1.2) 0.1s forwards; }
        .cg-word { animation: cg-fade 0.6s ease-out 0.3s both; }
        @keyframes cg-arrow-in { 70%{opacity:1;transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes cg-fade { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}