import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import TickerTape from "./TickerTape";
import StatsBar from "./StatsBar";
import { useContango } from "@/contexts/ContangoContext";
import BottomNav from "./BottomNav";
import ContangoLogo from "./ContangoLogo";
import PullToRefresh from "./PullToRefresh";

// Screen shell: ticker tape + optional stats + back nav + content.
export default function ScreenShell({ children, showStats = true, backTo, title, right, tab }) {
  const { progress, refresh } = useContango();
  return (
    <div className="cg-app-bg min-h-screen text-slate-100">
      <TickerTape reducedMotion={progress.reducedMotion} />
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-800/60 bg-[#0a0e16]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            {backTo ? (
              <Link to={backTo} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-100">
                <ChevronLeft className="h-5 w-5" /> Back
              </Link>
            ) : (
              <Link to="/" className="flex items-center gap-2">
                <ContangoLogo size="sm" showWord />
              </Link>
            )}
          </div>
          {title && <h1 className="font-display text-base font-semibold text-slate-100">{title}</h1>}
          <div className="flex items-center gap-3">{right}</div>
        </div>
      </header>
      <PullToRefresh onRefresh={refresh}>
        {showStats && (
          <div className="mx-auto max-w-2xl px-5 pt-5">
            <StatsBar />
          </div>
        )}
        <main className={`mx-auto max-w-2xl px-5 pt-5 ${tab ? "pb-28" : "pb-24"}`}>{children}</main>
      </PullToRefresh>
      {tab && <BottomNav active={tab} />}
    </div>
  );
}