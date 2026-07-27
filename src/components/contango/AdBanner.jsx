import React from "react";
import { Link } from "react-router-dom";
import { useContango } from "@/contexts/ContangoContext";
import { isPremium } from "@/lib/subscription";

// Lightweight ad placeholder for the free tier. Premium hides it.
// (No real ad network wired — this is the slot the spec reserves.)
export default function AdBanner() {
  const { progress } = useContango();
  if (isPremium(progress)) return null;
  return (
    <Link
      to="/paywall"
      className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 transition hover:border-slate-700"
    >
      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">Ad</span>
      <p className="flex-1 text-[12px] text-slate-500">
        Ads keep Contango free. <span className="text-amber-400">Go ad-free with Premium.</span>
      </p>
    </Link>
  );
}