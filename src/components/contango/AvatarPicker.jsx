import React from "react";
import { X } from "lucide-react";
import { useContango } from "@/contexts/ContangoContext";
import { AVATAR_OPTIONS } from "@/components/contango/avatars";

// Bottom-sheet picker for the in-app avatars. Stores the choice on progress.avatar.
export default function AvatarPicker({ open, onClose }) {
  const { progress, update } = useContango();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-slate-800 bg-slate-900 p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp 0.28s ease-out" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-100">Choose your avatar</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {AVATAR_OPTIONS.map((a) => {
            const selected = progress.avatar === a.id;
            return (
              <button
                key={a.id}
                onClick={() => { update({ avatar: a.id }); onClose(); }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition ${
                  selected ? "border-amber-400 bg-amber-400/10" : "border-slate-800 bg-slate-950 hover:border-slate-600"
                }`}
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-full border ${a.ring} ${a.bg} text-2xl leading-none`}>
                  {a.emoji}
                </span>
                <span className={`text-[11px] ${selected ? "text-amber-300" : "text-slate-500"}`}>{a.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => { update({ avatar: null }); onClose(); }}
          className="mt-4 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400 hover:border-slate-600"
        >
          Reset to default
        </button>

        <style>{`@keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }`}</style>
      </div>
    </div>
  );
}