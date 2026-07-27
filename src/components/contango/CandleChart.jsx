import React, { useRef, useMemo } from "react";

// CandleChart: renders OHLC bars with optional entry/stop/exit price lines.
// Supports reveal-to-bar (progressive disclosure) and tap-to-select for `tap` decision points.
// Pure SVG, no external deps.

const PAD_L = 8;
const PAD_R = 38;
const PAD_T = 12;
const PAD_B = 16;

export default function CandleChart({
  bars,
  revealTo,          // number of bars visible (progressive)
  entryPrice,
  stopPrice,
  exitPrice,
  tapMode,           // { zoneStart, zoneEnd } | null
  onTapZone,         // (barIndex) => void
  selectedBar,       // currently tapped bar index
  height = 240,
}) {
  const svgRef = useRef(null);
  const visible = revealTo ? bars.slice(0, revealTo) : bars;

  const { min, max } = useMemo(() => {
    let lo = Infinity, hi = -Infinity;
    for (const b of visible) {
      if (b.low < lo) lo = b.low;
      if (b.high > hi) hi = b.high;
    }
    const pad = (hi - lo) * 0.08;
    return { min: lo - pad, max: hi + pad };
  }, [visible]);

  const width = 600; // viewBox width; scales responsively
  const plotW = width - PAD_L - PAD_R;
  const plotH = height - PAD_T - PAD_B;

  const xFor = (i) => PAD_L + (i / Math.max(1, bars.length - 1)) * plotW;
  const yFor = (p) => PAD_T + (1 - (p - min) / (max - min || 1)) * plotH;
  const barW = Math.max(3, (plotW / bars.length) * 0.62);
  const fmt = (p) => (Math.abs(p) >= 100 ? p.toFixed(1) : p.toFixed(2));

  function priceLine(price, color, label) {
    if (price == null) return null;
    const y = yFor(price);
    return (
      <g>
        <line x1={PAD_L} y1={y} x2={width - PAD_R} y2={y} stroke={color} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.85} />
        <text x={width - PAD_R - 2} y={y - 3} textAnchor="end" className="fill-current" style={{ fontSize: 9, fontWeight: 600 }} fill={color}>{label}</text>
      </g>
    );
  }

  function handleSvgClick(e) {
    if (!tapMode) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * width;
    // map x back to bar index
    const idx = Math.round(((clickX - PAD_L) / plotW) * (bars.length - 1));
    const clamped = Math.max(0, Math.min(bars.length - 1, idx));
    if (onTapZone) onTapZone(clamped);
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={tapMode ? "cursor-crosshair w-full" : "w-full"}
        style={{ height }}
        onClick={handleSvgClick}
      >
        {/* grid + right price axis */}
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <g key={f}>
            <line x1={PAD_L} y1={PAD_T + f * plotH} x2={width - PAD_R} y2={PAD_T + f * plotH} stroke="#1e293b" strokeWidth={0.5} />
            <text x={width - PAD_R + 3} y={PAD_T + f * plotH + 3} style={{ fontSize: 8, fontWeight: 500 }} fill="#475569" className="font-mono">
              {fmt(max - f * (max - min))}
            </text>
          </g>
        ))}

        {/* candles */}
        {visible.map((b, i) => {
          const x = xFor(i);
          const up = b.close >= b.open;
          const color = up ? "#34d399" : "#fb7185";
          const bodyTop = yFor(Math.max(b.open, b.close));
          const bodyBot = yFor(Math.min(b.open, b.close));
          const inZone = tapMode && i >= tapMode.zoneStart && i <= tapMode.zoneEnd;
          const isSelected = selectedBar === i;
          return (
            <g key={i}>
              <line x1={x} y1={yFor(b.high)} x2={x} y2={yFor(b.low)} stroke={color} strokeWidth={1} opacity={0.9} />
              <rect
                x={x - barW / 2}
                y={bodyTop}
                width={barW}
                height={Math.max(1, bodyBot - bodyTop)}
                fill={color}
                opacity={inZone || isSelected ? 1 : 0.85}
                rx={0.5}
              />
              {inZone && (
                <rect x={x - barW / 2 - 1} y={PAD_T} width={barW + 2} height={plotH} fill="#fbbf24" opacity={0.06} />
              )}
              {isSelected && (
                <rect x={x - barW / 2 - 2} y={PAD_T} width={barW + 4} height={plotH} fill="#fbbf24" opacity={0.15} stroke="#fbbf24" strokeWidth={0.5} />
              )}
            </g>
          );
        })}

        {/* decision point markers (the bar index for an mcq) */}
        {priceLine(stopPrice, "#fb7185", stopPrice != null ? `STOP ${stopPrice}` : "")}
        {priceLine(entryPrice, "#34d399", entryPrice != null ? `ENTRY ${entryPrice}` : "")}
        {priceLine(exitPrice, "#38bdf8", exitPrice != null ? `EXIT ${exitPrice}` : "")}
      </svg>
    </div>
  );
}