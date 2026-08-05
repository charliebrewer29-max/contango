import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import TickerTape from "./TickerTape";
import StatsBar from "./StatsBar";
import { useContango } from "@/contexts/ContangoContext";
import BottomNav from "./BottomNav";
import PullToRefresh from "./PullToRefresh";

// Screen shell: ticker tape + optional stats + back nav + content.
export default function ScreenShell({ children, showStats = true, backTo, title, right, tab }) {
  const { progress, refresh } = useContango();
  const navigate = useNavigate();

  // Dynamic back: pop the history stack when there's a page to go back to,
  // otherwise fall back to the hardcoded `backTo` route. This mirrors native
  // navigation (a deep-linked entry has no back stack, so we route forward).
  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else if (backTo) {
      navigate(backTo);
    }
  }

  return (
    <div className="cg-app-bg min-h-screen text-slate-100">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-800/60 bg-[#0a0e16]/80 backdrop-blur-xl">
        <TickerTape reducedMotion={progress.reducedMotion} />
        {(title || backTo) && (
          <div className="mx-auto flex h-12 max-w-2xl items-center gap-2 px-5">
            {backTo && (
              <button type="button" onClick={handleBack} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-100">
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {title && <h1 className="font-display text-[17px] font-semibold tracking-tight text-slate-100">{title}</h1>}
            {right && <div className="ml-auto">{right}</div>}
          </div>
        )}
      </header>
      <PullToRefresh onRefresh={refresh}>
        {showStats && (
          <div className="mx-auto max-w-2xl px-5 pt-5">
            <StatsBar />
          </div>
        )}
        <main className={`mx-auto max-w-2xl px-5 pt-5 pb-safe ${tab ? "pb-28" : "pb-24"}`}>{children}</main>
      </PullToRefresh>
      {tab && <BottomNav active={tab} />}
    </div>
  );
}