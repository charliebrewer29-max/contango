import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";

// First-run guided tour of the dashboard. Five steps, dimmed overlay, sturdy
// region-anchored tooltips (no pixel-perfect cutouts — they break across
// viewports and this app is wrapped for iOS). Fires once when tourSeen is
// false, sets it true on finish OR skip so it never appears twice. Respects
// reducedMotion, Escape skips from any step, Skip is always visible.
const STEPS = [
  {
    region: "center",
    label: "The skill tree",
    caption: "This is the curriculum. Work top to bottom — each branch builds on the one before it.",
  },
  {
    region: "top",
    label: "Your stats",
    caption: "Hearts are a daily loss limit, not lives. Five wrong calls and you're done until tomorrow — the same rule that protects a real trader's daily downside.",
  },
  {
    region: "above-nav",
    label: "Leagues",
    caption: "A weekly league against other learners. The top three promote every Sunday, so consistency beats bursts.",
  },
  {
    region: "above-nav",
    label: "Coach",
    caption: "This is Tango. Ask him anything, and after drills he'll tell you what your decisions reveal about your discipline.",
  },
  {
    region: "above-nav",
    label: "Profile",
    caption: "Settings, your journal, and your Discipline profile live here. Tango can also give you personalised guidance.",
    link: true,
  },
];

export default function GuidedTour() {
  const { progress, update } = useContango();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  // Fire once on first dashboard visit (tourSeen false). Short delay so the
  // page paints behind the dim before the tooltip appears.
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
  const reduced = progress.reducedMotion;
  const fade = reduced ? "" : "tour-fade";

  // Sturdy vertical regions — no pixel cutouts. above-nav clears the fixed
  // bottom tab bar (bottom-28 = 112px) so tooltips never hide behind it.
  const vertical =
    s.region === "top" ? "top-24" :
    s.region === "above-nav" ? "bottom-28" :
    "top-1/2 -translate-y-1/2";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="App tour">
      <div className={`absolute inset-0 bg-[#020617]/85 ${fade}`} />

      {/* Skip — always reachable, top-right, clears the notch */}
      <button
        onClick={close}
        className="absolute right-4 z-10 text-sm font-medium text-slate-400 transition hover:text-slate-100"
        style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
      >
        Skip
      </button>

      <div className={`absolute left-0 right-0 px-4 ${vertical}`}>
        <div className={`mx-auto w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl ${fade}`}>
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
}