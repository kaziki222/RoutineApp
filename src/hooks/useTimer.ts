import { useCallback, useEffect, useRef, useState } from 'react';

const TIMER_KEY = 'routine-app:activeTimer';

type StoredTimer = {
  routineId: string;
  endsAt: number; // Date.now() ms
  totalSeconds: number;
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
      return parsed;
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
    // ignore quota/private-mode errors
  }
}

export function useTimer() {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() => {
    const stored = loadStoredTimer();
    if (!stored) return null;
    const now = Date.now();
    const finished = stored.endsAt <= now;
    // If a stale timer ended long ago (>1 min after end), clear it on boot.
    if (finished && now - stored.endsAt > 60_000) {
      persistStoredTimer(null);
      return null;
    }
    return { ...stored, finished };
  });
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    const stored = loadStoredTimer();
    return stored ? Math.max(0, stored.endsAt - Date.now()) : 0;
  });
  const alarmFiredRef = useRef(false);

  useEffect(() => {
    if (!activeTimer) {
      setRemainingMs(0);
      alarmFiredRef.current = false;
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
            // not supported
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
    };
    persistStoredTimer(next);
    alarmFiredRef.current = false;
    setActiveTimer({ ...next, finished: false });
    setRemainingMs(seconds * 1000);
  }, []);

  const stopTimer = useCallback(() => {
    persistStoredTimer(null);
    setActiveTimer(null);
    setRemainingMs(0);
    alarmFiredRef.current = false;
  }, []);

  return { activeTimer, remainingMs, startTimer, stopTimer };
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
