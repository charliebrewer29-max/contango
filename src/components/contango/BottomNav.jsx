import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Tapping the already-active tab pops back to that tab's root route.
  function handleTabClick(e, t, isActive) {
    if (isActive && location.pathname !== t.to) {
      e.preventDefault();
      navigate(t.to);
    }
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 pb-safe">
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="cg-soft flex items-stretch justify-around rounded-2xl border border-slate-800/60 bg-[#0a0e16]/85 px-1.5 py-1 backdrop-blur-xl">
          {TABS.map((t) => {
            const isActive = active ? t.id === active : t.match(location.pathname);
            const Icon = t.icon;
            return (
              <Link key={t.id} data-tour={`nav-${t.id}`} to={t.to} onClick={(e) => handleTabClick(e, t, isActive)} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition ${isActive ? "bg-amber-400/10" : "hover:bg-slate-800/40"}`}>
                <Icon
                  className={`h-6 w-6 ${isActive ? "text-amber-400" : "text-slate-500"}`}
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
                <span className={`text-[10px] font-medium ${isActive ? "text-amber-400" : "text-slate-500"}`}>
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}