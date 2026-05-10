import { useCallback, useSyncExternalStore } from 'react';
import { readJSON, STORAGE_KEYS, subscribeStorage, writeJSON } from '../lib/storage';
import { todayKey } from '../lib/date';
import type { DailyState } from '../types';

function loadDaily(): DailyState {
  const stored = readJSON<DailyState | null>(STORAGE_KEYS.daily, null);
  const today = todayKey();
  if (!stored || stored.date !== today || !Array.isArray(stored.completedRoutineIds)) {
    return { date: today, completedRoutineIds: [] };
  }
  return stored;
}

function loadStamps(): string[] {
  const data = readJSON<string[]>(STORAGE_KEYS.stamps, []);
  return Array.isArray(data) ? data : [];
}

let dailyCache: DailyState = loadDaily();
let dailyRaw: string | null = JSON.stringify(dailyCache);

function getDailySnapshot(): DailyState {
  const raw = window.localStorage.getItem(STORAGE_KEYS.daily);
  const today = todayKey();
  if (raw === dailyRaw && dailyCache.date === today) return dailyCache;
  dailyRaw = raw;
  dailyCache = loadDaily();
  return dailyCache;
}

let stampsCache: string[] = loadStamps();
let stampsRaw: string | null = JSON.stringify(stampsCache);

function getStampsSnapshot(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.stamps);
  if (raw === stampsRaw) return stampsCache;
  stampsRaw = raw;
  stampsCache = loadStamps();
  return stampsCache;
}

export function useDailyState(totalRoutineCount: number) {
  const daily = useSyncExternalStore(subscribeStorage, getDailySnapshot, getDailySnapshot);
  const stamps = useSyncExternalStore(subscribeStorage, getStampsSnapshot, getStampsSnapshot);

  const persistDaily = (next: DailyState) => writeJSON(STORAGE_KEYS.daily, next);
  const persistStamps = (next: string[]) => writeJSON(STORAGE_KEYS.stamps, next);

  const toggleComplete = useCallback(
    (routineId: string) => {
      const current = loadDaily();
      const has = current.completedRoutineIds.includes(routineId);
      const completedRoutineIds = has
        ? current.completedRoutineIds.filter((id) => id !== routineId)
        : [...current.completedRoutineIds, routineId];
      const nextDaily: DailyState = { date: current.date, completedRoutineIds };
      persistDaily(nextDaily);

      if (totalRoutineCount > 0 && completedRoutineIds.length >= totalRoutineCount) {
        const existing = loadStamps();
        if (!existing.includes(current.date)) {
          persistStamps([...existing, current.date]);
        }
      }
    },
    [totalRoutineCount]
  );

  const removeRoutineFromDaily = useCallback((routineId: string) => {
    const current = loadDaily();
    if (!current.completedRoutineIds.includes(routineId)) return;
    persistDaily({
      date: current.date,
      completedRoutineIds: current.completedRoutineIds.filter((id) => id !== routineId),
    });
  }, []);

  return { daily, stamps, toggleComplete, removeRoutineFromDaily };
}
