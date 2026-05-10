export const STORAGE_KEYS = {
  routines: 'routine-app:routines',
  daily: 'routine-app:daily',
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
