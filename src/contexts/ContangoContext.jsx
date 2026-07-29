import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MAX_HEARTS, applyProgress, xpForSession, todayStr, monthStr, serverToday, spendHeart, refundHeart, resetHeartsForToday } from "@/lib/gamification";
import { loadProgress, saveProgress, clearProgress, enableSaving, setOfflineListener } from "@/lib/progressStore";
import { scheduleCard } from "@/lib/spacedRepetition";
import { isPremium } from "@/lib/subscription";
import { fetchEntitlement, beginTrial } from "@/lib/entitlement";
import { ensureServerTime, getServerOffset } from "@/lib/serverClock";
import { branchForLessonId } from "@/lib/branchMastery";
import { isBranchComplete } from "@/lib/branchProgress";
import { migrateAttestations } from "@/lib/legalVersion";

const STORAGE_KEY = "contango_progress_v1";

const DEFAULT_PROGRESS = {
  xp: 0,
  hearts: MAX_HEARTS,
  streak: 0,
  lastActiveDate: null,
  dailyXp: 0,
  dailyGoal: 20,
  firstLessonDone: false,
  onboardingDone: false,
  goal: "regular",
  why: "curiosity",
  completedLessons: [],
  completedDrills: [],
  reducedMotion: false,
  soundOn: true,
  hapticsOn: true,
  // KEPT FOR SHAPE COMPATIBILITY ONLY — never use this as an access decision.
  // The server entitlement (ContangoContext.entitlement) is the sole source of
  // truth for tier. See src/lib/subscription.js.
  subscription: "free",
  mindset: 75,
  diaryUnlocked: [],
  lastDrillReview: null,
  srCards: {},
  badges: [],
  stats: {},
  rewards: [],
  equippedFlair: null,
  trialStart: null,
  coachCalls: { date: null, count: 0 },
  drillHistory: [],
  streakRepairMonth: null,
  coachMemory: [],
  branchReps: {},
  branchLastTouched: {},
  disciplineBannerDismissed: false,
  leagueCohort: null,
  leagueXp: 0,
  leagueWeekStart: null,
  leaguePrevRank: null,
  practiceUsedToday: 0,
  practiceResetDate: null,
  heartsDate: null,
  displayName: null,
  age_attestation: null,
  disclaimer_attestation: null,
};

const ContangoContext = createContext(null);

// Apply the server-anchored daily reset to a freshly loaded progress object.
// Hearts return to MAX at the user's local midnight, and the free practice
// allowance rolls over. Both are gated on a known server offset - if we could
// not reach /serverTime we fail closed and do NOT grant a reset (a spoofable
// device clock must never hand out hearts).
function withDailyReset(data, offset, entitlement) {
  if (offset === null || offset === undefined) return data;
  const today = serverToday(offset);
  let next = data;
  next = resetHeartsForToday(next, today);
  if (!isPremium(entitlement) && next.practiceResetDate !== today) {
    next = { ...next, practiceUsedToday: 0, practiceResetDate: today };
  }
  return next;
}

export function ContangoProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return migrateAttestations({ ...DEFAULT_PROGRESS, ...JSON.parse(raw) });
    } catch (e) { /* ignore */ }
    return { ...DEFAULT_PROGRESS };
  });
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  // Entitlement is null until the first server resolve; gates fail closed
  // (isPremium(null) === false) so nothing premium shows before we know.
  const [entitlement, setEntitlement] = useState(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);

  useEffect(() => { saveProgress(progress); }, [progress]);

  // Server load + reconcile. localStorage seeds the first paint synchronously
  // (above); this effect resolves the authoritative server row, reconciles,
  // and only then enables server writes so pre-load ticks don't race the row
  // lookup and create a duplicate.
  useEffect(() => {
    setOfflineListener(setOffline);
    let alive = true;
    (async () => {
      try {
        const [res, ent] = await Promise.all([
          loadProgress(DEFAULT_PROGRESS),
          ensureServerTime().then(() => fetchEntitlement().catch(() => null)),
        ]);
        if (!alive) return;
        setOffline(res.offline);
        enableSaving(true);
        setEntitlement(ent);
        setProgress(withDailyReset(res.data, getServerOffset(), ent));
      } catch {
        // loadProgress or ensureServerTime rejected: the server row did not
        // resolve. Reflect that in the UI, but do NOT enableSaving(true) here
        // — enabling writes after a failed row lookup risks creating a
        // duplicate Progress row. Saving stays local-only on failure.
        if (alive) setOffline(true);
      } finally {
        if (alive) {
          setEntitlementLoading(false);
          setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  const update = useCallback((updater) => {
    setProgress(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  // Pull-to-refresh: re-sync progress from storage so stats reflect any
  // external changes and the UI re-renders fresh.
  const refresh = useCallback(async () => {
    const [res, ent] = await Promise.all([
      loadProgress(DEFAULT_PROGRESS),
      ensureServerTime().then(() => fetchEntitlement().catch(() => null)),
    ]);
    setOffline(res.offline);
    setEntitlement(ent);
    setProgress(withDailyReset(res.data, getServerOffset(), ent));
  }, []);

  // Re-resolve the server entitlement on demand (e.g. after a trial starts,
  // on window focus, or after a purchase completes in the native shell).
  const refreshEntitlement = useCallback(async () => {
    const ent = await fetchEntitlement().catch(() => null);
    setEntitlement(ent);
    return ent;
  }, []);

  // Run a lesson/drill result through the gamification engine. Returns
  // { events, xpGained, heartsLost } so callers use the engine's own XP figure
  // instead of recomputing it with literals (which drift from the constants).
  // heartsLost is 0 here: hearts are spent per wrong graded answer via loseHeart,
  // not in applyProgress, so a session carries no aggregated heart loss.
  const recordSession = useCallback((session) => {
    const xpGained = xpForSession(session);
    let emittedEvents = [];
    setProgress(prev => {
      const { progress: next, events } = applyProgress(prev, session);
      emittedEvents = events;
      return next;
    });
    return { events: emittedEvents, xpGained, heartsLost: 0 };
  }, []);

  const markLessonComplete = useCallback((lessonId) => {
    setProgress(prev => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const branch = branchForLessonId(lessonId);
      const next = { ...prev, completedLessons: [...prev.completedLessons, lessonId] };
      if (branch) {
        // Touching the branch refreshes its staleness clock.
        next.branchLastTouched = { ...(prev.branchLastTouched || {}), [branch.id]: new Date().toISOString() };
        // Core branches (no drill) earn their first "rep" the moment they're
        // fully completed - strategy branches accrue reps via logDrill instead.
        if (!branch.buildDrill && isBranchComplete(branch, next)) {
          next.branchReps = { ...(prev.branchReps || {}), [branch.id]: ((prev.branchReps || {})[branch.id] || 0) + 1 };
        }
      }
      return next;
    });
  }, []);

  const markDrillComplete = useCallback((drillId) => {
    setProgress(prev => prev.completedDrills.includes(drillId) ? prev :
      { ...prev, completedDrills: [...prev.completedDrills, drillId] });
  }, []);

  // Spend one heart on a wrong graded answer. Returns true if this drop
  // emptied the last heart, so the lesson/drill can cut off mid-session.
  const loseHeart = useCallback(() => {
    let depleted = false;
    setProgress(prev => {
      const { hearts, depleted: d } = spendHeart(prev.hearts);
      depleted = d;
      return { ...prev, hearts };
    });
    return depleted;
  }, []);

  // Earn one heart back by finishing a practice drill. Capped at MAX.
  // Applies identically to free, trial, and premium - hearts are never sold.
  const earnHeart = useCallback(() => {
    let gained = false;
    setProgress(prev => {
      const { hearts, gained: g } = refundHeart(prev.hearts);
      gained = g;
      return g ? { ...prev, hearts } : prev;
    });
    return gained;
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS });
    clearProgress();
  }, []);

  const adjustMindset = useCallback((delta) => {
    setProgress(prev => ({ ...prev, mindset: Math.max(0, Math.min(100, (prev.mindset ?? 75) + delta)) }));
  }, []);

  const unlockDiary = useCallback((id) => {
    setProgress(prev => (prev.diaryUnlocked || []).includes(id) ? prev :
      { ...prev, diaryUnlocked: [...(prev.diaryUnlocked || []), id] });
  }, []);

  const setLastDrillReview = useCallback((review) => {
    setProgress(prev => ({ ...prev, lastDrillReview: review }));
  }, []);

  // Spaced-repetition: update one card's review schedule (no XP here - that's batched at session end).
  const reviewCard = useCallback((cardId, grade) => {
    setProgress(prev => {
      const prevCard = (prev.srCards || {})[cardId];
      const next = scheduleCard(prevCard, grade);
      return { ...prev, srCards: { ...(prev.srCards || {}), [cardId]: next } };
    });
  }, []);

  const unlockBadge = useCallback((id) => {
    setProgress(prev => (prev.badges || []).includes(id) ? prev : { ...prev, badges: [...(prev.badges || []), id] });
  }, []);

  // Per-concept accuracy tracking: every graded lesson/chart answer is recorded
  // so the app can surface strengths/weaknesses and target practice at weak areas.
  const recordAnswer = useCallback((unitId, isCorrect) => {
    setProgress(prev => {
      const cur = (prev.stats || {})[unitId] || { seen: 0, correct: 0 };
      const nextStat = { seen: cur.seen + 1, correct: cur.correct + (isCorrect ? 1 : 0), lastCorrect: isCorrect };
      return { ...prev, stats: { ...(prev.stats || {}), [unitId]: nextStat } };
    });
  }, []);

  // Starts the server-backed trial (startTrial backend function, once per
  // account), then re-resolves the entitlement so gates open immediately.
  const startTrial = useCallback(async () => {
    await beginTrial();
    const ent = await fetchEntitlement().catch(() => null);
    setEntitlement(ent);
    return ent;
  }, []);

  // goPremium was removed: Premium access is granted only by the server
  // (App Store IAP -> revenuecatWebhook -> Entitlement row). The client must
  // never write tier — that was a free-forever localStorage bypass.

  const recordCoachCall = useCallback(() => {
    setProgress(prev => {
      const today = todayStr();
      const cur = prev.coachCalls && prev.coachCalls.date === today ? prev.coachCalls : { date: today, count: 0 };
      return { ...prev, coachCalls: { date: today, count: cur.count + 1 } };
    });
  }, []);

  // Append a structured drill record so the Journal can aggregate it.
  const logDrill = useCallback((entry) => {
    setProgress(prev => {
      const hist = [...(prev.drillHistory || []), { ...entry, date: new Date().toISOString() }];
      if (hist.length > 100) hist.shift();
      const bid = entry?.branchId;
      const next = { ...prev, drillHistory: hist };
      if (bid) {
        // Every drill run is one "rep" of that branch (mastery) and refreshes
        // its last-touched timestamp so a finished branch stops cracking.
        next.branchLastTouched = { ...(prev.branchLastTouched || {}), [bid]: new Date().toISOString() };
        next.branchReps = { ...(prev.branchReps || {}), [bid]: ((prev.branchReps || {})[bid] || 0) + 1 };
      }
      return next;
    });
  }, []);

  // Premium coach memory: the last few exchanges, baked into later prompts.
  const pushCoachMemory = useCallback((entry) => {
    setProgress(prev => {
      const mem = [...(prev.coachMemory || []), entry].slice(-8);
      return { ...prev, coachMemory: mem };
    });
  }, []);

  const repairStreak = useCallback(() => {
    if (!isPremium(entitlement)) return;
    setProgress(prev => {
      const month = monthStr();
      if (prev.streakRepairMonth === month) return prev;
      return { ...prev, streak: (prev.streak || 0) + 1, streakRepairMonth: month, lastActiveDate: todayStr() };
    });
  }, [entitlement]);

  const value = {
    progress,
    loading,
    offline,
    entitlement,
    entitlementLoading,
    update,
    refresh,
    refreshEntitlement,
    recordSession,
    markLessonComplete,
    markDrillComplete,
    loseHeart,
    earnHeart,
    resetProgress,
    adjustMindset,
    unlockDiary,
    setLastDrillReview,
    reviewCard,
    recordAnswer,
    unlockBadge,
    startTrial,
    recordCoachCall,
    logDrill,
    pushCoachMemory,
    repairStreak,
    todayStr,
  };

  return <ContangoContext.Provider value={value}>{children}</ContangoContext.Provider>;
}

export function useContango() {
  const ctx = useContext(ContangoContext);
  if (!ctx) throw new Error("useContango must be used within ContangoProvider");
  return ctx;
}