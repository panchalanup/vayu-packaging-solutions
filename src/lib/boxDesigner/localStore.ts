/**
 * Tiny localStorage wrapper for the designer's per-browser features (onboarding, my designs, brand kit, studio
 * preferences). Storage can be missing or full (private mode, quota); every call fails soft and returns a fallback.
 * SECURITY: only design data and preferences are stored, never personal data. Readers validate what comes back.
 */

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The browser store, or null when it is unavailable */
export function browserStore(): KeyValueStore | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readString(key: string, store: KeyValueStore | null = browserStore()): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Returns false when the value could not be written (quota exceeded or no storage) */
export function writeString(key: string, value: string, store: KeyValueStore | null = browserStore()): boolean {
  if (!store) return false;
  try {
    store.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string, store: KeyValueStore | null = browserStore()): void {
  try {
    store?.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Parse JSON safely; the caller validates the shape */
export function readJson(key: string, store: KeyValueStore | null = browserStore()): unknown {
  const raw = readString(key, store);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** In-memory store for tests and for browsers without storage */
export function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, String(value)),
    removeItem: (key) => void data.delete(key),
  };
}
