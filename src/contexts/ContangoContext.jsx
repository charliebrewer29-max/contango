import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MAX_HEARTS, applyProgress, todayStr, monthStr, serverToday } from "@/lib/gamification";
import { loadProgress, saveProgress, clearProgress, enableSaving, setOfflineListener } from "@/lib/progressStore";
import { scheduleCard } from "@/lib/spacedRepetition";
import { isPremium } from "@/lib/subscription";
import { ensureServerTime, getServerOffset } from "@/lib/serverClock";
import { branchForLessonId } from "@/lib/branchMastery";
import { isBranchComplete } from "@/lib/branchProgress";

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
  practiceUsedToday: 0,
  practiceResetDate: null,
  heartsDate: null,
};

const ContangoContext = createContext(null);

// Apply the server-anchored daily reset to a freshly loaded progress object.
// Hearts return to MAX at the user's local midnight, and the free practice
// allowance rolls over. Both are gated on a known server offset - if we could
// not reach /serverTime we fail closed and do NOT grant a reset (a spoofable
// device clock must never hand out hearts).
function withDailyReset(data, offset) {
  if (offset === null || offset === undefined) return data;
  const today = serverToday(offset);
  let next = data;
  if (next.heartsDate !== today) {
    next = { ...next, hearts: MAX_HEARTS, heartsDate: today };
  }
  if (!isPremium(next) && next.practiceResetDate !== today) {
    next = { ...next, practiceUsedToday: 0, practiceResetDate: today };
  }
  return next;
}

export function ContangoProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
    } catch (e) { /* ignore */ }
    return { ...DEFAULT_PROGRESS };
  });
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => { saveProgress(progress); }, [progress]);

  // Server load + reconcile. localStorage seeds the first paint synchronously
  // (above); this effect resolves the authoritative server row, reconciles,
  // and only then enables server writes so pre-load ticks don't race the row
  // lookup and create a duplicate.
  useEffect(() => {
    setOfflineListener(setOffline);
    let alive = true;
    (async () => {
      const [res] = await Promise.all([loadProgress(DEFAULT_PROGRESS), ensureServerTime()]);
      if (!alive) return;
      setOffline(res.offline);
      enableSaving(true);
      setProgress(withDailyReset(res.data, getServerOffset()));
      setLoading(false);
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
    const res = await loadProgress(DEFAULT_PROGRESS);
    await ensureServerTime();
    setOffline(res.offline);
    setProgress(withDailyReset(res.data, getServerOffset()));
  }, []);

  // Run a lesson/drill result through the gamification engine
  const recordSession = useCallback((session) => {
    let emittedEvents = [];
    setProgress(prev => {
      const { progress: next, events } = applyProgress(prev, session);
      emittedEvents = events;
      return next;
    });
    return emittedEvents;
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
      const hearts = Math.max(0, (prev.hearts ?? MAX_HEARTS) - 1);
      depleted = hearts === 0;
      return { ...prev, hearts };
    });
    return depleted;
  }, []);

  // Earn one heart back by finishing a practice drill. Capped at MAX.
  // Applies identically to free, trial, and premium - hearts are never sold.
  const earnHeart = useCallback(() => {
    let gained = false;
    setProgress(prev => {
      if ((prev.hearts ?? 0) >= MAX_HEARTS) return prev;
      gained = true;
      return { ...prev, hearts: Math.min(MAX_HEARTS, (prev.hearts ?? 0) + 1) };
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

  const startTrial = useCallback(() => {
    setProgress(prev => ({ ...prev, subscription: "trial", trialStart: new Date().toISOString() }));
  }, []);

  const goPremium = useCallback(() => {
    setProgress(prev => ({ ...prev, subscription: "premium" }));
  }, []);

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
    setProgress(prev => {
      if (!isPremium(prev)) return prev;
      const month = monthStr();
      if (prev.streakRepairMonth === month) return prev;
      return { ...prev, streak: (prev.streak || 0) + 1, streakRepairMonth: month, lastActiveDate: todayStr() };
    });
  }, []);

  const value = {
    progress,
    loading,
    offline,
    update,
    refresh,
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
    goPremium,
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