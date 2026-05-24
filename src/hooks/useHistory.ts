import { useCallback, useSyncExternalStore } from 'react';
import { readJSON, STORAGE_KEYS, subscribeStorage, writeJSON } from '../lib/storage';
import type { CompletionHistory, SkipHistory } from '../types';

function loadHistory(): CompletionHistory {
  const data = readJSON<CompletionHistory>(STORAGE_KEYS.history, {});
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

function loadSkipped(): SkipHistory {
  const data = readJSON<SkipHistory>(STORAGE_KEYS.skipped, {});
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

let skipCache: SkipHistory = loadSkipped();
let skipRaw: string | null = JSON.stringify(skipCache);
function getSkipSnapshot(): SkipHistory {
  const raw = window.localStorage.getItem(STORAGE_KEYS.skipped);
  if (raw === skipRaw) return skipCache;
  skipRaw = raw;
  skipCache = loadSkipped();
  return skipCache;
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

function ensureStamp(date: string) {
  const existing = loadStamps();
  if (!existing.includes(date)) writeJSON(STORAGE_KEYS.stamps, [...existing, date]);
}

export function useHistory() {
  const history = useSyncExternalStore(subscribeStorage, getHistorySnapshot, getHistorySnapshot);
  const skipped = useSyncExternalStore(subscribeStorage, getSkipSnapshot, getSkipSnapshot);
  const stamps = useSyncExternalStore(subscribeStorage, getStampsSnapshot, getStampsSnapshot);

  const isCompleted = useCallback(
    (date: string, id: string) => (history[date] ?? []).includes(id),
    [history]
  );
  const isSkipped = useCallback(
    (date: string, id: string) => (skipped[date] ?? []).includes(id),
    [skipped]
  );

  const toggleComplete = useCallback((date: string, id: string) => {
    const hist = loadHistory();
    const dayList = hist[date] ?? [];
    const has = dayList.includes(id);
    const nextDay = has ? dayList.filter((x) => x !== id) : [...dayList, id];
    const nextHist: CompletionHistory = { ...hist, [date]: nextDay };
    if (nextDay.length === 0) delete nextHist[date];
    writeJSON(STORAGE_KEYS.history, nextHist);

    if (!has) {
      // completing also clears any skip mark for the same routine/day
      const skip = loadSkipped();
      const daySkip = skip[date] ?? [];
      if (daySkip.includes(id)) {
        const nextSkip: SkipHistory = { ...skip, [date]: daySkip.filter((x) => x !== id) };
        if (nextSkip[date].length === 0) delete nextSkip[date];
        writeJSON(STORAGE_KEYS.skipped, nextSkip);
      }
      ensureStamp(date);
    }
  }, []);

  const toggleSkip = useCallback((date: string, id: string) => {
    const skip = loadSkipped();
    const dayList = skip[date] ?? [];
    const has = dayList.includes(id);
    const nextDay = has ? dayList.filter((x) => x !== id) : [...dayList, id];
    const nextSkip: SkipHistory = { ...skip, [date]: nextDay };
    if (nextDay.length === 0) delete nextSkip[date];
    writeJSON(STORAGE_KEYS.skipped, nextSkip);

    if (!has) {
      // skipping clears any completion mark for the same routine/day
      const hist = loadHistory();
      const dayHist = hist[date] ?? [];
      if (dayHist.includes(id)) {
        const nextHist: CompletionHistory = { ...hist, [date]: dayHist.filter((x) => x !== id) };
        if (nextHist[date].length === 0) delete nextHist[date];
        writeJSON(STORAGE_KEYS.history, nextHist);
      }
      ensureStamp(date);
    }
  }, []);

  const removeRoutineFromHistory = useCallback((id: string) => {
    const prune = (
      map: Record<string, string[]>
    ): { next: Record<string, string[]>; changed: boolean } => {
      let changed = false;
      const next: Record<string, string[]> = {};
      for (const [date, ids] of Object.entries(map)) {
        const filtered = ids.filter((x) => x !== id);
        if (filtered.length !== ids.length) changed = true;
        if (filtered.length > 0) next[date] = filtered;
      }
      return { next, changed };
    };
    const h = prune(loadHistory());
    if (h.changed) writeJSON(STORAGE_KEYS.history, h.next);
    const s = prune(loadSkipped());
    if (s.changed) writeJSON(STORAGE_KEYS.skipped, s.next);
  }, []);

  return {
    history,
    skipped,
    stamps,
    isCompleted,
    isSkipped,
    toggleComplete,
    toggleSkip,
    removeRoutineFromHistory,
  };
}

/**
 * Completion rate for a single day given the routine IDs that were visible
 * that day. Completed counts toward the rate; skipped does NOT.
 */
export function computeDayRate(
  history: CompletionHistory,
  date: string,
  visibleIds: string[]
): { completed: number; total: number; percent: number } {
  const total = visibleIds.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };
  const done = history[date] ?? [];
  const completed = visibleIds.filter((id) => done.includes(id)).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}
