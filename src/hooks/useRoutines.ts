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

const EMPTY: Routine[] = [];

export function useRoutines() {
  const routines = useSyncExternalStore(subscribeStorage, getSnapshot, () => EMPTY);

  const addRoutine = useCallback((input: RoutineInput, taskDate?: string): Routine => {
    const routine: Routine = {
      id: generateId(),
      title: input.title.trim(),
      description: input.description.trim(),
      url: input.url.trim(),
      timerSeconds: input.timerSeconds,
      kind: input.kind,
      sectionId: input.sectionId,
      createdAt: new Date().toISOString(),
      ...(input.kind === 'task' && taskDate ? { taskDate } : {}),
    };
    writeJSON(STORAGE_KEYS.routines, [...loadRoutines(), routine]);
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
            timerSeconds: input.timerSeconds,
            kind: input.kind,
            sectionId: input.sectionId,
          }
        : r
    );
    writeJSON(STORAGE_KEYS.routines, next);
  }, []);

  const removeRoutine = useCallback((id: string) => {
    writeJSON(STORAGE_KEYS.routines, loadRoutines().filter((r) => r.id !== id));
  }, []);

  const getRoutine = useCallback((id: string): Routine | undefined => {
    return loadRoutines().find((r) => r.id === id);
  }, []);

  /**
   * Move `activeId` so it sits where `overId` currently is. If `overSectionId`
   * is supplied, the moved routine also adopts that section (cross-section DnD).
   * When `overId` is null, the routine is appended to the end of overSectionId.
   */
  const reorderRoutines = useCallback(
    (activeId: string, overId: string | null, overSectionId?: string) => {
      const current = loadRoutines();
      const oldIndex = current.findIndex((r) => r.id === activeId);
      if (oldIndex < 0) return;

      const moved = { ...current[oldIndex] };
      if (overSectionId && moved.sectionId !== overSectionId) {
        moved.sectionId = overSectionId;
      }

      const without = current.filter((r) => r.id !== activeId);
      let insertAt: number;
      if (overId && overId !== activeId) {
        const overIndex = without.findIndex((r) => r.id === overId);
        insertAt = overIndex < 0 ? without.length : overIndex;
      } else {
        // append after the last routine of the target section
        const targetSection = overSectionId ?? moved.sectionId;
        let lastIdx = -1;
        without.forEach((r, i) => {
          if (r.sectionId === targetSection) lastIdx = i;
        });
        insertAt = lastIdx + 1;
      }
      without.splice(insertAt, 0, moved);
      writeJSON(STORAGE_KEYS.routines, without);
    },
    []
  );

  /** Move every routine in a removed section to a fallback section. */
  const reassignSection = useCallback((fromSectionId: string, toSectionId: string) => {
    const next = loadRoutines().map((r) =>
      r.sectionId === fromSectionId ? { ...r, sectionId: toSectionId } : r
    );
    writeJSON(STORAGE_KEYS.routines, next);
  }, []);

  return {
    routines,
    addRoutine,
    updateRoutine,
    removeRoutine,
    getRoutine,
    reorderRoutines,
    reassignSection,
  };
}
