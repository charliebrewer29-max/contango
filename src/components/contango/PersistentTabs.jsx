import React, { Suspense, lazy, useEffect, useState } from "react";
import Dashboard from "@/pages/contango/Dashboard";
import Coach from "@/pages/contango/Coach";
import Profile from "@/pages/contango/Profile";

const Leaderboard = lazy(() => import("@/pages/contango/Leaderboard"));

const TABS = [
  { path: "/", Comp: Dashboard },
  { path: "/leaderboard", Comp: Leaderboard },
  { path: "/coach", Comp: Coach },
  { path: "/profile", Comp: Profile },
];

const TAB_PATHS = new Set(TABS.map((t) => t.path));

// Keeps the four bottom-nav tab pages mounted (hidden when inactive) so
// switching tabs preserves scroll position and in-page state instead of
// remounting from scratch on every route change. A tab page is mounted the
// first time it is visited and then kept alive for the session; non-tab
// routes render through the animated router in App.jsx as before.
export default function PersistentTabs({ currentPath }) {
  const [visited, setVisited] = useState(
    () => new Set(TAB_PATHS.has(currentPath) ? [currentPath] : [])
  );

  useEffect(() => {
    if (!TAB_PATHS.has(currentPath)) return;
    setVisited((prev) => (prev.has(currentPath) ? prev : new Set(prev).add(currentPath)));
  }, [currentPath]);

  return (
    <>
      {TABS.map(({ path, Comp }) => {
        if (!visited.has(path)) return null;
        const active = currentPath === path;
        return (
          <div
            key={path}
            aria-hidden={!active}
            style={{ display: active ? "block" : "none" }}
          >
            <Suspense fallback={<div className="cg-app-bg min-h-screen" />}>
              <Comp />
            </Suspense>
          </div>
        );
      })}
    </>
  );
}