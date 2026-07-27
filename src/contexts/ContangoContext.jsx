import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MAX_HEARTS, applyProgress, todayStr } from "@/lib/gamification";
import { scheduleCard } from "@/lib/spacedRepetition";
import { isPremium } from "@/lib/subscription";

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
};

const ContangoContext = createContext(null);

export function ContangoProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
    } catch (e) { /* ignore */ }
    return { ...DEFAULT_PROGRESS };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ }
  }, [progress]);

  const update = useCallback((updater) => {
    setProgress(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  // Pull-to-refresh: re-sync progress from storage so stats reflect any
  // external changes and the UI re-renders fresh.
  const refresh = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress({ ...DEFAULT_PROGRESS, ...JSON.parse(raw) });
    } catch (e) { /* ignore */ }
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
    setProgress(prev => prev.completedLessons.includes(lessonId) ? prev :
      { ...prev, completedLessons: [...prev.completedLessons, lessonId] });
  }, []);

  const markDrillComplete = useCallback((drillId) => {
    setProgress(prev => prev.completedDrills.includes(drillId) ? prev :
      { ...prev, completedDrills: [...prev.completedDrills, drillId] });
  }, []);

  const refillHearts = useCallback(() => {
    setProgress(prev => ({ ...prev, hearts: MAX_HEARTS }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS });
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
      return { ...prev, drillHistory: hist };
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
      const month = new Date().toISOString().slice(0, 7);
      if (prev.streakRepairMonth === month) return prev;
      return { ...prev, streak: (prev.streak || 0) + 1, streakRepairMonth: month, lastActiveDate: todayStr() };
    });
  }, []);

  const value = {
    progress,
    update,
    refresh,
    recordSession,
    markLessonComplete,
    markDrillComplete,
    refillHearts,
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