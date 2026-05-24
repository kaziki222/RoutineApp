export const STORAGE_KEYS = {
  routines: 'routine-app:routines',
  daily: 'routine-app:daily', // legacy, read only during migration
  history: 'routine-app:history',
  skipped: 'routine-app:skipped',
  stamps: 'routine-app:stamps',
  sections: 'routine-app:sections',
  timerOverrides: 'routine-app:timerOverrides',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const DEFAULT_SECTION_ID = 'section-default';

export function readJSON<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: StorageKey, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('routine-app:storage', { detail: { key } }));
  } catch {
    // Quota exceeded or storage disabled — silent fail; UI state still updates this session.
  }
}

export function subscribeStorage(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener('storage', handler);
  window.addEventListener('routine-app:storage', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('routine-app:storage', handler);
  };
}

/**
 * Migrate the legacy `routine-app:daily` (today-only) into the new
 * `routine-app:history` (per-day map). Idempotent and safe to call once on boot.
 */
export function migrateLegacyDaily(): void {
  try {
    const hasHistory = window.localStorage.getItem(STORAGE_KEYS.history) !== null;
    const legacyRaw = window.localStorage.getItem(STORAGE_KEYS.daily);
    if (legacyRaw && !hasHistory) {
      const legacy = JSON.parse(legacyRaw) as { date?: string; completedRoutineIds?: string[] };
      if (
        legacy &&
        typeof legacy.date === 'string' &&
        Array.isArray(legacy.completedRoutineIds)
      ) {
        const history: Record<string, string[]> = {
          [legacy.date]: legacy.completedRoutineIds,
        };
        window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
      }
    }
    if (legacyRaw) window.localStorage.removeItem(STORAGE_KEYS.daily);
  } catch {
    // best-effort
  }
}

/**
 * Ensure there is at least one section, and backfill kind/sectionId on
 * routines created before sections existed. Idempotent.
 */
export function migrateSections(): void {
  try {
    const sectionsRaw = window.localStorage.getItem(STORAGE_KEYS.sections);
    let sections: { id: string; title: string }[] = sectionsRaw ? JSON.parse(sectionsRaw) : [];
    if (!Array.isArray(sections) || sections.length === 0) {
      sections = [{ id: DEFAULT_SECTION_ID, title: 'マイルーティン' }];
      window.localStorage.setItem(STORAGE_KEYS.sections, JSON.stringify(sections));
    }
    const fallbackSectionId = sections[0].id;

    const routinesRaw = window.localStorage.getItem(STORAGE_KEYS.routines);
    if (routinesRaw) {
      const routines = JSON.parse(routinesRaw) as Array<Record<string, unknown>>;
      if (Array.isArray(routines)) {
        let changed = false;
        const next = routines.map((r) => {
          const updated = { ...r };
          if (typeof updated.kind !== 'string') {
            updated.kind = 'routine';
            changed = true;
          }
          if (typeof updated.sectionId !== 'string') {
            updated.sectionId = fallbackSectionId;
            changed = true;
          }
          return updated;
        });
        if (changed) {
          window.localStorage.setItem(STORAGE_KEYS.routines, JSON.stringify(next));
        }
      }
    }
  } catch {
    // best-effort
  }
}
