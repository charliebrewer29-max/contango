import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import TickerTape from "./TickerTape";
import StatsBar from "./StatsBar";
import { useContango } from "@/contexts/ContangoContext";
import BottomNav from "./BottomNav";

// Screen shell: ticker tape + optional stats + back nav + content.
export default function ScreenShell({ children, showStats = true, backTo, title, right, tab }) {
  const { progress } = useContango();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <TickerTape reducedMotion={progress.reducedMotion} />
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {backTo ? (
              <Link to={backTo} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-100">
                <ChevronLeft className="h-5 w-5" /> Back
              </Link>
            ) : (
              <Link to="/" className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-amber-400">Contango</span>
              </Link>
            )}
          </div>
          {title && <h1 className="font-display text-sm font-semibold text-slate-300">{title}</h1>}
          <div className="flex items-center gap-3">{right}</div>
        </div>
      </header>
      {showStats && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <StatsBar />
        </div>
      )}
      <main className={`mx-auto max-w-2xl px-4 pt-4 ${tab ? "pb-28" : "pb-24"}`}>{children}</main>
      {tab && <BottomNav active={tab} />}
    </div>
  );
}