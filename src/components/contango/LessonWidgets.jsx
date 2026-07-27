import React, { useState } from "react";

// Interactive lesson widgets — the one thing a trading app can do that
// Duolingo can't: let learners drag the number they get wrong and watch it.
// All three are learn-phase widgets: no grading, no hearts, free exploration.
// The rule (spec): for every lesson, find the one number people get wrong,
// and let them move it.

export default function LessonWidget({ stage }) {
  if (stage.widget === "leverage") return <LeverageWidget />;
  if (stage.widget === "tick") return <TickWidget />;
  if (stage.widget === "micro") return <MicroWidget />;
  return null;
}

function Slider({ value, min, max, step, onChange }) {
  return (
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-amber-400"
    />
  );
}

// Leverage: drag the market move, watch a $500 deposit against a $50k contract.
// Push to -1% → your $500 is gone; -1.5% → you owe the difference.
function LeverageWidget() {
  const [move, setMove] = useState(0);
  const deposit = 500;
  const notional = 50000;
  const leverage = notional / deposit; // 100×
  const pnl = deposit * (move / 100) * leverage; // move is in %
  const balance = deposit + pnl;
  const owe = balance < 0 ? -balance : 0;
  const wiped = balance <= 0 + 0.5; // treat ≤0 as wiped
  const up = pnl >= 0;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm leading-relaxed text-slate-400">
        You put up <span className="font-mono text-slate-200">${deposit}</span> to control a{" "}
        <span className="font-mono text-slate-200">${notional.toLocaleString()}</span> contract. That's{" "}
        <span className="font-semibold text-amber-400">{leverage}× leverage</span>.
      </p>

      <div className="my-5">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Market move</span>
          <span className="font-mono text-slate-300">{move > 0 ? "+" : ""}{move.toFixed(1)}%</span>
        </div>
        <Slider value={move} min={-2} max={2} step={0.1} onChange={setMove} />
        <div className="mt-1 flex justify-between text-[10px] text-slate-600"><span>−2%</span><span>0</span><span>+2%</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-center">
          <div className="text-xs text-slate-500">P&amp;L</div>
          <div className={`font-mono text-2xl font-bold ${up ? "text-emerald-400" : "text-rose-400"}`}>
            {up ? "+" : "−"}${Math.abs(Math.round(pnl))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-center">
          <div className="text-xs text-slate-500">Your balance</div>
          <div className={`font-mono text-2xl font-bold ${wiped ? "text-rose-400" : "text-slate-100"}`}>
            ${Math.max(0, Math.round(balance))}
          </div>
        </div>
      </div>

      {wiped && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-center" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <p className="text-sm font-semibold text-rose-300">
            Your ${deposit} is gone{owe > 0.5 ? ` — and you'd owe $${Math.round(owe)}` : ""}.
          </p>
          <p className="mt-1 text-xs text-slate-400">Leverage is symmetric: it magnifies gains and losses by the same amount.</p>
        </div>
      )}
    </div>
  );
}

// Tick: drag ticks, watch price / points / dollars update together for ES & MES.
function TickWidget() {
  const [ticks, setTicks] = useState(4);
  const points = ticks * 0.25;
  const es = ticks * 12.5;
  const mes = ticks * 1.25;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="my-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Ticks</span><span className="font-mono text-slate-300">{ticks}</span>
        </div>
        <Slider value={ticks} min={0} max={20} step={1} onChange={setTicks} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ContractCol name="ES" perTick="$12.50" points={points} dollars={es} accent="text-sky-400" />
        <ContractCol name="MES" perTick="$1.25" points={points} dollars={mes} accent="text-amber-400" />
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">Same ticks, same points — but ES dollars are 10× MES dollars.</p>
    </div>
  );
}

// Micro: drag "how wrong you were," see the same mistake priced on ES vs MES.
function MicroWidget() {
  const [ticks, setTicks] = useState(20);
  const es = ticks * 12.5;
  const mes = ticks * 1.25;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="my-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>How wrong you were</span><span className="font-mono text-slate-300">{ticks} ticks</span>
        </div>
        <Slider value={ticks} min={0} max={20} step={1} onChange={setTicks} />
      </div>
      <p className="mb-3 text-center text-sm text-slate-400">The same mistake, priced two ways:</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-center">
          <div className="text-xs text-slate-500">ES (full size)</div>
          <div className="font-mono text-2xl font-bold text-rose-400">${es.toFixed(0)}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-center">
          <div className="text-xs text-slate-500">MES (Micro)</div>
          <div className="font-mono text-2xl font-bold text-emerald-400">${mes.toFixed(2)}</div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-amber-400">The Micro is one-tenth the size — the same error costs a tenth as much.</p>
    </div>
  );
}

function ContractCol({ name, perTick, points, dollars, accent }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-center">
      <div className={`text-sm font-semibold ${accent}`}>{name}</div>
      <div className="text-[11px] text-slate-500">{perTick}/tick</div>
      <div className="mt-2 font-mono text-lg text-slate-200">{points} pts</div>
      <div className={`font-mono text-2xl font-bold ${accent}`}>${dollars.toFixed(2)}</div>
    </div>
  );
}