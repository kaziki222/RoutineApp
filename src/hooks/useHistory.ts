import { useCallback, useSyncExternalStore } from 'react';
import { readJSON, STORAGE_KEYS, subscribeStorage, writeJSON } from '../lib/storage';
import type { CompletionHistory } from '../types';

function loadHistory(): CompletionHistory {
  const data = readJSON<CompletionHistory>(STORAGE_KEYS.history, {});
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

function loadStamps(): string[] {
  const data = readJSON<string[]>(STORAGE_KEYS.stamps, []);
  return Array.isArray(data) ? data : [];
}

let historyCache: CompletionHistory = loadHistory();
let historyRaw: string | null = JSON.stringify(historyCache);

function getHistorySnapshot(): CompletionHistory {
  const raw = window.localStorage.getItem(STORAGE_KEYS.history);
  if (raw === historyRaw) return historyCache;
  historyRaw = raw;
  historyCache = loadHistory();
  return historyCache;
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

export function useHistory() {
  const history = useSyncExternalStore(subscribeStorage, getHistorySnapshot, getHistorySnapshot);
  const stamps = useSyncExternalStore(subscribeStorage, getStampsSnapshot, getStampsSnapshot);

  const isCompleted = useCallback(
    (date: string, routineId: string) => (history[date] ?? []).includes(routineId),
    [history]
  );

  const toggleComplete = useCallback((date: string, routineId: string) => {
    const current = loadHistory();
    const dayList = current[date] ?? [];
    const has = dayList.includes(routineId);
    const nextDayList = has ? dayList.filter((id) => id !== routineId) : [...dayList, routineId];

    const nextHistory: CompletionHistory = { ...current, [date]: nextDayList };
    if (nextDayList.length === 0) {
      delete nextHistory[date];
    }
    writeJSON(STORAGE_KEYS.history, nextHistory);

    // Stamp on first completion of the day, persisted (never auto-removed).
    if (nextDayList.length >= 1) {
      const existing = loadStamps();
      if (!existing.includes(date)) {
        writeJSON(STORAGE_KEYS.stamps, [...existing, date]);
      }
    }
  }, []);

  const removeRoutineFromHistory = useCallback((routineId: string) => {
    const current = loadHistory();
    let changed = false;
    const next: CompletionHistory = {};
    for (const [date, ids] of Object.entries(current)) {
      const filtered = ids.filter((id) => id !== routineId);
      if (filtered.length !== ids.length) changed = true;
      if (filtered.length > 0) next[date] = filtered;
    }
    if (changed) writeJSON(STORAGE_KEYS.history, next);
  }, []);

  return { history, stamps, isCompleted, toggleComplete, removeRoutineFromHistory };
}
