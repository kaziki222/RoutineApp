export const STORAGE_KEYS = {
  routines: 'routine-app:routines',
  daily: 'routine-app:daily', // legacy, read only during migration
  history: 'routine-app:history',
  stamps: 'routine-app:stamps',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

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
    if (!legacyRaw) return;

    if (!hasHistory) {
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
    window.localStorage.removeItem(STORAGE_KEYS.daily);
  } catch {
    // Migration is best-effort; never block boot.
  }
}
