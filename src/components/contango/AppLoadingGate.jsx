import React, { useState, useEffect, useRef } from "react";
import { useContango } from "@/contexts/ContangoContext";
import { useAuth } from "@/lib/AuthContext";

// Branded loading gate for return visits. The app mounts immediately with
// DEFAULT_PROGRESS (and a null entitlement), so a returning user briefly sees
// 0 XP / locked premium content before the server row resolves. This gate
// holds a branded screen until both `loading` and `entitlementLoading` clear,
// so the user never sees that intermediate state.
//
// Timing rules (no strobe, no trap):
//   - 250ms show delay: fast loads render nothing at all.
//   - 400ms minimum show: once visible, it never flickers off.
//   - 8s hard cap: never hold the user forever; render with cached data.
//   - offline: render immediately with whatever cached data exists.
//
// Only authenticated users are gated (and the brief auth-check window, since
// we don't yet know if they're logged in — gating there avoids a flash for
// returning users whose auth resolves a beat after progress starts loading).

const SHOW_DELAY = 250;
const MIN_SHOW = 400;
const MAX_WAIT = 8000;

export default function AppLoadingGate({ children }) {
  const { loading, entitlementLoading, offline } = useContango();
  const { isAuthenticated, isLoadingAuth } = useAuth();

  const gateActive = isAuthenticated || isLoadingAuth;
  const dataReady = !loading && !entitlementLoading;

  const [visible, setVisible] = useState(false);
  const [released, setReleased] = useState(false);
  const shownAtRef = useRef(null);

  // Show the loader only after the delay (fast loads show nothing). Offline
  // or already-ready data releases immediately.
  useEffect(() => {
    if (!gateActive || released) return;
    if (offline || dataReady) { setReleased(true); return; }
    const t = setTimeout(() => {
      setVisible(true);
      shownAtRef.current = Date.now();
    }, SHOW_DELAY);
    return () => clearTimeout(t);
  }, [gateActive, dataReady, offline, released]);

  // Never trap the user: release after the hard cap regardless of readiness.
  useEffect(() => {
    if (!gateActive) return;
    const t = setTimeout(() => setReleased(true), MAX_WAIT);
    return () => clearTimeout(t);
  }, [gateActive]);

  // Once data is ready, hold the loader for the minimum show time so it never
  // flickers, then release. If it was never shown, release immediately.
  useEffect(() => {
    if (!gateActive || !dataReady) return;
    if (!visible) { setReleased(true); return; }
    const elapsed = Date.now() - (shownAtRef.current ?? Date.now());
    const remaining = Math.max(0, MIN_SHOW - elapsed);
    const t = setTimeout(() => setReleased(true), remaining);
    return () => clearTimeout(t);
  }, [gateActive, dataReady, visible]);

  if (!gateActive || released) return children;
  if (!visible) return null;
  return <LoadingScreen />;
}

function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading your progress"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 text-center"
      style={{
        backgroundColor: "#020617",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <ContangoMark />
        <div>
          <div className="font-display text-2xl font-bold tracking-tight" style={{ color: "#fbbf24" }}>
            Contango
          </div>
          <p className="mt-2 text-xs text-slate-500">Loading your progress</p>
        </div>
      </div>
      <style>{KEYFRAMES}</style>
    </div>
  );
}

// A rising contango curve: the futures curve slopes up from near to far term.
// Draws on once, then a gentle pulse on the far-term dot signals life —
// restrained, not a spinner. Reduced-motion users get a simple fade-in.
function ContangoMark() {
  return (
    <svg width="120" height="48" viewBox="0 0 120 48" fill="none" aria-hidden="true">
      <path
        className="cg-curve"
        d="M6 40 C 30 38, 50 30, 70 20 S 104 8, 114 6"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle className="cg-dot" cx="114" cy="6" r="3.5" fill="#fbbf24" />
    </svg>
  );
}

const KEYFRAMES = `
@keyframes cg-draw {
  from { stroke-dashoffset: 160; }
  to { stroke-dashoffset: 0; }
}
@keyframes cg-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes cg-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.cg-curve {
  stroke-dasharray: 160;
  stroke-dashoffset: 160;
  animation: cg-draw 1.1s ease-out forwards, cg-fade 0.4s ease-out forwards;
}
.cg-dot {
  opacity: 0;
  animation: cg-fade 0.4s ease-out 1.0s forwards, cg-pulse 1.6s ease-in-out 1.4s infinite;
}
@media (prefers-reduced-motion: reduce) {
  .cg-curve {
    stroke-dashoffset: 0;
    animation: cg-fade 0.6s ease-out forwards;
  }
  .cg-dot {
    animation: cg-fade 0.6s ease-out 0.3s forwards;
  }
}
`;