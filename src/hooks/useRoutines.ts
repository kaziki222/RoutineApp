import { useCallback, useSyncExternalStore } from 'react';
import { generateId } from '../lib/id';
import { readJSON, STORAGE_KEYS, subscribeStorage, writeJSON } from '../lib/storage';
import type { Routine, RoutineInput } from '../types';

function loadRoutines(): Routine[] {
  const data = readJSON<Routine[]>(STORAGE_KEYS.routines, []);
  return Array.isArray(data) ? data : [];
}

let cachedSnapshot: Routine[] = loadRoutines();
let cachedRaw: string | null = JSON.stringify(cachedSnapshot);

function getSnapshot(): Routine[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.routines);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = loadRoutines();
  return cachedSnapshot;
}

export function useRoutines() {
  const routines = useSyncExternalStore(subscribeStorage, getSnapshot, () => []);

  const addRoutine = useCallback((input: RoutineInput): Routine => {
    const routine: Routine = {
      id: generateId(),
      title: input.title.trim(),
      description: input.description.trim(),
      url: input.url.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [...loadRoutines(), routine];
    writeJSON(STORAGE_KEYS.routines, next);
    return routine;
  }, []);

  const updateRoutine = useCallback((id: string, input: RoutineInput) => {
    const next = loadRoutines().map((r) =>
      r.id === id
        ? {
            ...r,
            title: input.title.trim(),
            description: input.description.trim(),
            url: input.url.trim(),
          }
        : r
    );
    writeJSON(STORAGE_KEYS.routines, next);
  }, []);

  const removeRoutine = useCallback((id: string) => {
    const next = loadRoutines().filter((r) => r.id !== id);
    writeJSON(STORAGE_KEYS.routines, next);
  }, []);

  const getRoutine = useCallback((id: string): Routine | undefined => {
    return loadRoutines().find((r) => r.id === id);
  }, []);

  return { routines, addRoutine, updateRoutine, removeRoutine, getRoutine };
}
