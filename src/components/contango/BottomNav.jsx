import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, MessageCircle, User } from "lucide-react";

// Native-style bottom tab bar. Shown only on the four "tab" screens.
// Respects iOS safe-area inset so it sits above the home indicator.
const TABS = [
  { id: "learn", label: "Learn", to: "/", icon: Home, match: (p) => p === "/" },
  { id: "leagues", label: "Leagues", to: "/leaderboard", icon: Trophy, match: (p) => p.startsWith("/leaderboard") },
  { id: "coach", label: "Coach", to: "/coach", icon: MessageCircle, match: (p) => p.startsWith("/coach") },
  { id: "profile", label: "Profile", to: "/profile", icon: User, match: (p) => p.startsWith("/profile") },
];

export default function BottomNav({ active }) {
  const location = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur pb-safe">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {TABS.map((t) => {
          const isActive = active ? t.id === active : t.match(location.pathname);
          const Icon = t.icon;
          return (
            <Link key={t.id} to={t.to} className="flex flex-1 flex-col items-center gap-1 py-2.5">
              <Icon
                className={`h-6 w-6 ${isActive ? "text-amber-400" : "text-slate-500"}`}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-amber-400" : "text-slate-500"}`}>
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}