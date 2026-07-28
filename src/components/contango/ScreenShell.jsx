import React from "react";
import TickerTape from "./TickerTape";
import StatsBar from "./StatsBar";
import { useContango } from "@/contexts/ContangoContext";
import BottomNav from "./BottomNav";
import PullToRefresh from "./PullToRefresh";

// Screen shell: ticker tape + optional stats + back nav + content.
export default function ScreenShell({ children, showStats = true, backTo, title, right, tab }) {
  const { progress, refresh } = useContango();
  return (
    <div className="cg-app-bg min-h-screen text-slate-100">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-800/60 bg-[#0a0e16]/80 backdrop-blur-xl">
        <TickerTape reducedMotion={progress.reducedMotion} />
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