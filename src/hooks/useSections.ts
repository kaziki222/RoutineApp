import { useCallback, useSyncExternalStore } from 'react';
import { generateId } from '../lib/id';
import { DEFAULT_SECTION_ID, readJSON, STORAGE_KEYS, subscribeStorage, writeJSON } from '../lib/storage';
import type { Section } from '../types';

function loadSections(): Section[] {
  const data = readJSON<Section[]>(STORAGE_KEYS.sections, []);
  if (Array.isArray(data) && data.length > 0) return data;
  return [{ id: DEFAULT_SECTION_ID, title: 'マイルーティン' }];
}

let cache: Section[] = loadSections();
let cacheRaw: string | null = JSON.stringify(cache);

function getSnapshot(): Section[] {
  const raw = window.localStorage.getItem(STORAGE_KEYS.sections);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  cache = loadSections();
  return cache;
}

export function useSections() {
  const sections = useSyncExternalStore(subscribeStorage, getSnapshot, getSnapshot);

  const addSection = useCallback((title: string): Section => {
    const section: Section = { id: generateId(), title: title.trim() || '新しいセクション' };
    writeJSON(STORAGE_KEYS.sections, [...loadSections(), section]);
    return section;
  }, []);

  const updateSection = useCallback((id: string, title: string) => {
    const next = loadSections().map((s) => (s.id === id ? { ...s, title: title.trim() || s.title } : s));
    writeJSON(STORAGE_KEYS.sections, next);
  }, []);

  const removeSection = useCallback((id: string) => {
    const current = loadSections();
    if (current.length <= 1) return; // keep at least one section
    writeJSON(STORAGE_KEYS.sections, current.filter((s) => s.id !== id));
  }, []);

  return { sections, addSection, updateSection, removeSection };
}
