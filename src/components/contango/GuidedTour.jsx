import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";

// First-run guided tour of the dashboard.
//
// Anchoring, and why this is portalled: ScreenShell wraps its content in
// PullToRefresh, whose inner div always carries `transform: translateY(Npx)`
// — even at rest, where it is translateY(0px). A non-`none` transform makes
// that div the containing block for every `position: fixed` descendant, so an
// overlay rendered in the normal tree is positioned against the *content box*
// (as tall as the whole page), not the viewport. That is why "center" landed
// near the bottom of a tall page. Portalling to document.body escapes the
// transform, and only then does `fixed` mean "relative to the viewport".
//
// Measurement order matters just as much: the target is scrolled into the
// band between the sticky header and the fixed bottom nav, and its rect is
// read only *after* the scroll has settled (rAF poll on scrollY), never in
// the same tick as the scroll request.
//
// Fires once when tourSeen is false, sets it true on finish OR skip so it
// never appears twice. Respects reducedMotion, Escape skips, Skip is always
// visible, and a missing target degrades to a plain dimmed card.
const STEPS = [
  {
    target: "skill-tree",
    label: "The skill tree",
    caption: "This is the curriculum. Work top to bottom — each branch builds on the one before it.",
  },
  {
    target: "stats",
    label: "Your stats",
    caption: "Hearts are a daily loss limit, not lives. Five wrong calls and you're done until tomorrow — the same rule that protects a real trader's daily downside.",
  },
  {
    target: "daily-goal",
    label: "Today's goal",
    caption: "Your daily XP target, and the one button that always takes you to the next thing. Consistency is the whole game.",
  },
  {
    target: "nav-leagues",
    label: "Leagues",
    caption: "A weekly league against other learners. The top three promote every Sunday, so consistency beats bursts.",
  },
  {
    target: "nav-coach",
    label: "Coach",
    caption: "This is Tango. Ask him anything, and after drills he'll tell you what your decisions reveal about your discipline.",
  },
  {
    target: "nav-profile",
    label: "Profile",
    caption: "Settings, your journal, and your Discipline profile live here. Tango can also give you personalised guidance.",
    link: true,
  },
];

const PAD = 6;   // ring padding around the target
const GAP = 12;  // space between ring and caption card
const EDGE = 12; // min gap from the edges of the usable band

// The usable vertical band: below the sticky header, above the fixed nav.
// Both are measured live rather than hardcoded, so the compact and full
// StatsBar variants (different header heights) both land correctly.
function readBand() {
  const vh = window.innerHeight;
  const header = document.querySelector("header");
  const nav = document.querySelector("nav");
  const top = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
  const bottom = nav ? Math.min(vh, nav.getBoundingClientRect().top) : vh;
  return { top: top + EDGE, bottom: bottom - EDGE };
}

// A target inside a fixed ancestor (the bottom nav) is already on screen and
// cannot be scrolled — scrolling toward it would just move the page for no
// reason and leave the rect unchanged.
function hasFixedAncestor(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (window.getComputedStyle(n).position === "fixed") return true;
  }
  return false;
}

function findTarget(step) {
  return document.querySelector(`[data-tour="${STEPS[step].target}"]`);
}

export default function GuidedTour() {
  const { progress, update } = useContango();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const [band, setBand] = useState(null);
  const [cardH, setCardH] = useState(0);
  const [ready, setReady] = useState(false);
  const cardRef = useRef(null);

  const reduced = progress.reducedMotion;

  // Fire once on first dashboard visit (tourSeen false). Short delay so the
  // page paints — and the targets exist — before we measure anything.
  useEffect(() => {
    if (progress.tourSeen) return;
    const t = setTimeout(() => setOpen(true), 300);
    return () => clearTimeout(t);
  }, [progress.tourSeen]);

  // Escape skips the tour from any step.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Scroll the step's target into the band, then measure it once the scroll
  // has actually stopped. Measuring in the same tick as the scroll request
  // reads the pre-scroll rect, which is what put captions next to the wrong
  // thing in earlier attempts.
  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    let raf = 0;
    setReady(false);

    const el = findTarget(step);
    if (!el) {
      setRect(null);
      setBand(readBand());
      setReady(true);
      return undefined;
    }

    const b = readBand();
    const r0 = el.getBoundingClientRect();
    const bandH = b.bottom - b.top;
    const offscreen = r0.top < b.top || r0.bottom > b.bottom;
    const willScroll = offscreen && !hasFixedAncestor(el);

    // Resolve the exact destination up front, clamped to the document's own
    // scroll range, so settling can be tested against a known value rather
    // than inferred from movement.
    let targetY = null;
    if (willScroll) {
      // Centre it in the band, or pin its top when it is taller than the band.
      const want = r0.height >= bandH ? b.top : b.top + (bandH - r0.height) / 2;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      targetY = Math.max(0, Math.min(maxY, Math.round(window.scrollY + r0.top - want)));
      window.scrollTo({ top: targetY, behavior: reduced ? "auto" : "smooth" });
    }

    const measure = () => {
      if (cancelled) return;
      setRect(el.getBoundingClientRect());
      setBand(readBand());
      setReady(true);
    };

    if (targetY === null || reduced) {
      // Instant scroll (or none): one frame is enough for layout to apply.
      raf = requestAnimationFrame(() => { raf = requestAnimationFrame(measure); });
    } else {
      // Smooth scroll: wait for ARRIVAL at targetY, not for "scrollY stopped
      // changing". A stopped-changing test fires during the slow opening
      // frames of a smooth scroll — scrollY rounds to the same integer for
      // several frames — and measures a pre-scroll rect, which parks the card
      // off screen. The deadline covers a scroll the browser interrupts.
      const t0 = performance.now();
      const tick = () => {
        if (cancelled) return;
        if (Math.abs(window.scrollY - targetY) <= 1 || performance.now() - t0 > 1000) { measure(); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [open, step, reduced]);

  // Keep the anchor honest across rotation and resize.
  useEffect(() => {
    if (!open) return undefined;
    const onResize = () => {
      const el = findTarget(step);
      setRect(el ? el.getBoundingClientRect() : null);
      setBand(readBand());
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [open, step]);

  // The card's height drives whether it fits above or below the target, so it
  // has to be measured before the placement is decided.
  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [step, open, ready]);

  function close() {
    update({ tourSeen: true });
    setOpen(false);
  }

  function next() {
    if (step + 1 < STEPS.length) setStep(step + 1);
    else close();
  }

  if (!open) return null;

  const s = STEPS[step];
  const fade = reduced ? "" : "tour-fade";
  const b = band || { top: EDGE, bottom: (typeof window !== "undefined" ? window.innerHeight : 800) - EDGE };

  // Place the card below the target when it fits, otherwise above, otherwise
  // clamp it into the band. Nav targets sit at the bottom, so they always
  // resolve to "above" — which is what keeps the card clear of the fixed nav.
  let cardTop;
  if (!rect || !cardH) {
    cardTop = b.top + Math.max(0, (b.bottom - b.top - cardH) / 2);
  } else {
    const below = rect.bottom + PAD + GAP;
    const above = rect.top - PAD - GAP - cardH;
    if (below + cardH <= b.bottom) cardTop = below;
    else if (above >= b.top) cardTop = above;
    else cardTop = Math.max(b.top, Math.min(b.bottom - cardH, below));
  }

  // Invariant: the card stays inside the band no matter what the rect says.
  // Without this, one bad measurement puts the caption off screen with no way
  // back — the failure this component is meant to have stopped having.
  cardTop = Math.max(b.top, Math.min(Math.max(b.top, b.bottom - cardH), cardTop));

  const overlay = (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="App tour">
      {rect ? (
        // Spotlight: the ring's huge outward box-shadow *is* the dim, so the
        // target itself stays at full brightness — "lit up" rather than veiled.
        <div
          aria-hidden="true"
          className={fade}
          style={{
            position: "fixed",
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 16,
            border: "2px solid #fbbf24",
            boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.85), 0 0 24px rgba(251, 191, 36, 0.45)",
            pointerEvents: "none",
            transition: reduced ? "none" : "top .25s ease-out, left .25s ease-out, width .25s ease-out, height .25s ease-out",
          }}
        />
      ) : (
        <div className={`absolute inset-0 bg-[#020617]/85 ${fade}`} aria-hidden="true" />
      )}

      {/* Skip — always reachable, top-right, clears the notch */}
      <button
        onClick={close}
        className="absolute right-4 z-10 text-sm font-medium text-slate-400 transition hover:text-slate-100"
        style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
      >
        Skip
      </button>

      <div
        className="fixed px-1"
        style={{
          top: cardTop,
          left: EDGE,
          right: EDGE,
          opacity: ready ? 1 : 0,
          transition: reduced ? "none" : "top .25s ease-out, opacity .2s ease-out",
        }}
      >
        <div
          ref={cardRef}
          className={`mx-auto w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl ${fade}`}
        >
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            {s.label} · {step + 1} of {STEPS.length}
          </p>
          <p className="text-sm leading-relaxed text-slate-200" aria-live="polite">
            {s.caption}
          </p>
          {s.link && (
            <Link
              to="/guide"
              onClick={close}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              See how it works <ChevronRight className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={next}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            {step + 1 < STEPS.length ? "Next" : "Got it"} <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!reduced && (
        <style>{`@keyframes tourFade{from{opacity:0}to{opacity:1}}.tour-fade{animation:tourFade .3s ease-out}`}</style>
      )}
    </div>
  );

  // Portal to body: escapes PullToRefresh's transform containing block.
  return createPortal(overlay, document.body);
}
