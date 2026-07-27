import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MAX_HEARTS, applyProgress, todayStr } from "@/lib/gamification";
import { scheduleCard } from "@/lib/spacedRepetition";

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

  // Spaced-repetition: update one card's review schedule (no XP here — that's batched at session end).
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

  const value = {
    progress,
    update,
    recordSession,
    markLessonComplete,
    markDrillComplete,
    refillHearts,
    resetProgress,
    adjustMindset,
    unlockDiary,
    setLastDrillReview,
    reviewCard,
    unlockBadge,
    todayStr,
  };

  return <ContangoContext.Provider value={value}>{children}</ContangoContext.Provider>;
}

export function useContango() {
  const ctx = useContext(ContangoContext);
  if (!ctx) throw new Error("useContango must be used within ContangoProvider");
  return ctx;
}