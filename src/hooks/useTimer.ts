import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { todayKey } from '../lib/date';
import { readJSON, STORAGE_KEYS, subscribeStorage, writeJSON } from '../lib/storage';
import type { TimerOverrides } from '../types';

const TIMER_KEY = 'routine-app:activeTimer';

type StoredTimer = {
  routineId: string;
  endsAt: number; // Date.now() ms target end. Stale when paused.
  totalSeconds: number;
  startDate: string; // YYYY-MM-DD the timer was started (for per-day override)
  pausedRemainingMs?: number; // present => paused; ms remaining at pause moment
};

type ActiveTimer = StoredTimer & {
  finished: boolean;
};

function loadStoredTimer(): StoredTimer | null {
  try {
    const raw = window.localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTimer;
    if (
      typeof parsed?.routineId === 'string' &&
      typeof parsed?.endsAt === 'number' &&
      typeof parsed?.totalSeconds === 'number'
    ) {
      return { ...parsed, startDate: parsed.startDate ?? todayKey() };
    }
  } catch {
    // ignore
  }
  return null;
}

function persistStoredTimer(t: StoredTimer | null): void {
  try {
    if (t) window.localStorage.setItem(TIMER_KEY, JSON.stringify(t));
    else window.localStorage.removeItem(TIMER_KEY);
  } catch {
    // ignore quota / private-mode errors
  }
}

function loadOverrides(): TimerOverrides {
  const data = readJSON<TimerOverrides>(STORAGE_KEYS.timerOverrides, {});
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

function writeOverride(date: string, routineId: string, seconds: number) {
  const current = loadOverrides();
  const day = { ...(current[date] ?? {}), [routineId]: seconds };
  writeJSON(STORAGE_KEYS.timerOverrides, { ...current, [date]: day });
}

let overridesCache: TimerOverrides = loadOverrides();
let overridesRaw: string | null = JSON.stringify(overridesCache);
function getOverridesSnapshot(): TimerOverrides {
  const raw = window.localStorage.getItem(STORAGE_KEYS.timerOverrides);
  if (raw === overridesRaw) return overridesCache;
  overridesRaw = raw;
  overridesCache = loadOverrides();
  return overridesCache;
}

export function useTimer() {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() => {
    const stored = loadStoredTimer();
    if (!stored) return null;
    const now = Date.now();
    const isPaused = typeof stored.pausedRemainingMs === 'number';
    if (isPaused) return { ...stored, finished: false };
    const finished = stored.endsAt <= now;
    if (finished && now - stored.endsAt > 60_000) {
      persistStoredTimer(null);
      return null;
    }
    return { ...stored, finished };
  });

  const [remainingMs, setRemainingMs] = useState<number>(() => {
    const stored = loadStoredTimer();
    if (!stored) return 0;
    if (typeof stored.pausedRemainingMs === 'number') return stored.pausedRemainingMs;
    return Math.max(0, stored.endsAt - Date.now());
  });

  const overrides = useSyncExternalStore(
    subscribeStorage,
    getOverridesSnapshot,
    getOverridesSnapshot
  );
  const alarmFiredRef = useRef(false);

  useEffect(() => {
    if (!activeTimer) {
      setRemainingMs(0);
      alarmFiredRef.current = false;
      return;
    }
    if (typeof activeTimer.pausedRemainingMs === 'number') {
      setRemainingMs(activeTimer.pausedRemainingMs);
      return;
    }
    const tick = () => {
      const left = activeTimer.endsAt - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        if (!alarmFiredRef.current) {
          alarmFiredRef.current = true;
          try {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
          } catch {
            // vibration not supported
          }
        }
        setActiveTimer((prev) => (prev && !prev.finished ? { ...prev, finished: true } : prev));
      } else {
        setRemainingMs(left);
      }
    };
    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [activeTimer]);

  const startTimer = useCallback((routineId: string, seconds: number) => {
    if (seconds <= 0) return;
    const next: StoredTimer = {
      routineId,
      endsAt: Date.now() + seconds * 1000,
      totalSeconds: seconds,
      startDate: todayKey(),
    };
    persistStoredTimer(next);
    alarmFiredRef.current = false;
    setActiveTimer({ ...next, finished: false });
    setRemainingMs(seconds * 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    setActiveTimer((prev) => {
      if (!prev || prev.finished) return prev;
      if (typeof prev.pausedRemainingMs === 'number') return prev;
      const remaining = Math.max(0, prev.endsAt - Date.now());
      const next: ActiveTimer = { ...prev, pausedRemainingMs: remaining };
      persistStoredTimer({
        routineId: next.routineId,
        endsAt: next.endsAt,
        totalSeconds: next.totalSeconds,
        startDate: next.startDate,
        pausedRemainingMs: remaining,
      });
      setRemainingMs(remaining);
      return next;
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setActiveTimer((prev) => {
      if (!prev || prev.finished) return prev;
      if (typeof prev.pausedRemainingMs !== 'number') return prev;
      const remaining = prev.pausedRemainingMs;
      const newEndsAt = Date.now() + remaining;
      const next: ActiveTimer = { ...prev, endsAt: newEndsAt, pausedRemainingMs: undefined };
      persistStoredTimer({
        routineId: next.routineId,
        endsAt: newEndsAt,
        totalSeconds: next.totalSeconds,
        startDate: next.startDate,
      });
      return next;
    });
  }, []);

  const addMinutes = useCallback((minutes: number) => {
    const addMs = minutes * 60 * 1000;
    setActiveTimer((prev) => {
      if (!prev) return prev;
      const isPaused = typeof prev.pausedRemainingMs === 'number';
      const newTotal = prev.totalSeconds + minutes * 60;
      let next: ActiveTimer;
      if (isPaused) {
        const newRemaining = (prev.pausedRemainingMs ?? 0) + addMs;
        next = { ...prev, totalSeconds: newTotal, pausedRemainingMs: newRemaining, finished: false };
        setRemainingMs(newRemaining);
        persistStoredTimer({
          routineId: next.routineId,
          endsAt: next.endsAt,
          totalSeconds: newTotal,
          startDate: next.startDate,
          pausedRemainingMs: newRemaining,
        });
      } else {
        // base the new end on whichever is later: now (if finished) or current endsAt
        const base = prev.finished ? Date.now() : prev.endsAt;
        const newEndsAt = base + addMs;
        next = { ...prev, totalSeconds: newTotal, endsAt: newEndsAt, finished: false };
        alarmFiredRef.current = false;
        setRemainingMs(Math.max(0, newEndsAt - Date.now()));
        persistStoredTimer({
          routineId: next.routineId,
          endsAt: newEndsAt,
          totalSeconds: newTotal,
          startDate: next.startDate,
        });
      }
      // record per-day total used for this routine
      writeOverride(next.startDate, next.routineId, newTotal);
      return next;
    });
  }, []);

  const stopTimer = useCallback(() => {
    persistStoredTimer(null);
    setActiveTimer(null);
    setRemainingMs(0);
    alarmFiredRef.current = false;
  }, []);

  return {
    activeTimer,
    remainingMs,
    overrides,
    startTimer,
    pauseTimer,
    resumeTimer,
    addMinutes,
    stopTimer,
  };
}

export function effectiveTimerSeconds(
  overrides: TimerOverrides,
  date: string,
  routineId: string,
  baseSeconds: number
): number {
  return overrides[date]?.[routineId] ?? baseSeconds;
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
