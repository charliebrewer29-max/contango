import React, { useEffect, useRef, useState } from "react";
import { TICKER_SYMBOLS } from "@/lib/contangoTheme";

// Persistent scrolling ticker tape - the signature ambient-motion element.
// Respects reduced-motion setting via a prop (driven by user prefs).
export default function TickerTape({ reducedMotion = false }) {
  const [quotes, setQuotes] = useState(() =>
    TICKER_SYMBOLS.map(s => ({ ...s, price: s.base, change: 0 }))
  );
  const rafRef = useRef();

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setQuotes(prev => prev.map(q => {
        const drift = (Math.random() - 0.48) * q.base * 0.0009;
        const newPrice = Math.max(0.01, q.price + drift);
        return { ...q, price: newPrice, change: newPrice - q.base };
      }));
    }, 1600);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const items = [...quotes, ...quotes];
  return (
    <div
      className="relative overflow-hidden border-b border-slate-800/60 bg-[#0a0e16]/90 backdrop-blur"
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 48px, #000 calc(100% - 48px), transparent)",
        maskImage: "linear-gradient(to right, transparent, #000 48px, #000 calc(100% - 48px), transparent)",
      }}
    >
      {!reducedMotion ? (
        <div
          ref={rafRef}
          className="flex whitespace-nowrap py-2"
          style={{ animation: "tickerScroll 38s linear infinite" }}
        >
          {items.map((q, i) => {
            const up = q.change >= 0;
            return (
              <span key={i} className="mx-6 inline-flex items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-500">{q.sym}</span>
                <span className="text-slate-200">{q.price.toFixed(q.base < 100 ? 2 : 1)}</span>
                <span className={up ? "text-emerald-400" : "text-rose-400"}>
                  {up ? "▲" : "▼"}{Math.abs(q.change).toFixed(2)}
                </span>
              </span>
            );
          })}
        </div>
      ) : (
        <div className="flex overflow-x-auto py-2 no-scrollbar">
          {quotes.map((q, i) => {
            const up = q.change >= 0;
            return (
              <span key={i} className="mx-6 inline-flex items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-500">{q.sym}</span>
                <span className="text-slate-200">{q.price.toFixed(q.base < 100 ? 2 : 1)}</span>
                <span className={up ? "text-emerald-400" : "text-rose-400"}>
                  {up ? "▲" : "▼"}{Math.abs(q.change).toFixed(2)}
                </span>
              </span>
            );
          })}
        </div>
      )}
      <style>{`@keyframes tickerScroll { from { transform: translateX(0) } to { transform: translateX(-50%) } } .no-scrollbar::-webkit-scrollbar { display:none } .no-scrollbar { scrollbar-width:none }`}</style>
    </div>
  );
}