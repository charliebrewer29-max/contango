import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Native-feeling pull-to-refresh. Tracks touch gesture when the page is
// scrolled to the top, drags a spinner down with rubber-band resistance,
// and fires onRefresh once the threshold is crossed. Relies on the
// overscroll-behavior:none set on html/body so the browser doesn't
// rubber-band underneath us.
const THRESHOLD = 70;
const MAX_PULL = 100;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);

  useEffect(() => {
    function onTouchStart(e) {
      if (refreshing) return;
      if (window.scrollY > 0) { pulling.current = false; return; }
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
    function onTouchMove(e) {
      if (!pulling.current || refreshing) return;
      if (window.scrollY > 0) { pulling.current = false; if (pullRef.current) { setPull(0); pullRef.current = 0; } return; }
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) { if (pullRef.current) { setPull(0); pullRef.current = 0; } return; }
      const dist = Math.min(dy * 0.5, MAX_PULL);
      setPull(dist);
      pullRef.current = dist;
    }
    async function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
        pullRef.current = THRESHOLD;
        try { await onRefresh?.(); } finally {
          setRefreshing(false);
          setPull(0);
          pullRef.current = 0;
        }
      } else {
        setPull(0);
        pullRef.current = 0;
      }
    }
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [refreshing, onRefresh]);

  return (
    <>
      <div
        className="flex items-end justify-center overflow-hidden"
        style={{ height: pull, transition: refreshing ? "none" : "height 0.2s ease-out" }}
      >
        <Loader2
          className={`mb-2 h-6 w-6 text-amber-400 ${refreshing ? "animate-spin" : ""}`}
          style={{ opacity: Math.min(1, pull / THRESHOLD) }}
        />
      </div>
      <div style={{ transform: `translateY(${pull}px)`, transition: refreshing ? "none" : "transform 0.2s ease-out" }}>
        {children}
      </div>
    </>
  );
}