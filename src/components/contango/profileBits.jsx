import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Small shared building blocks used by the Profile, Rewards, and Settings
// screens so each page stays focused and the card styling stays consistent.

export function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
      <div className="font-mono text-2xl font-bold text-amber-400">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Toggle({ icon, label, desc, on, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled || undefined}
      className={`flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-200">{label}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
      <div className={`relative h-6 w-11 rounded-full transition ${on ? "bg-amber-400" : "bg-slate-700"}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </div>
    </button>
  );
}

export function LinkRow({ to, icon, title, subtitle }) {
  return (
    <Link to={to} className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-600">
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-100">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-600" />
    </Link>
  );
}