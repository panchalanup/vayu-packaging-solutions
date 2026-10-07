/** Tiny external store for the hero fold progress, so scroll updates never re-render React */

export interface FoldStore {
  get(): number;
  set(value: number): void;
  subscribe(listener: (value: number) => void): () => void;
}

export function createFoldStore(initial = 0): FoldStore {
  let value = initial;
  const listeners = new Set<(value: number) => void>();
  return {
    get: () => value,
    set(next) {
      const clamped = Math.min(1, Math.max(0, Number.isFinite(next) ? next : 0));
      if (clamped === value) return;
      value = clamped;
      listeners.forEach((listener) => listener(value));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Hero box: inside dimensions in cm (RSC) */
export const HERO_BOX = { length: 40, width: 30, height: 25 } as const;
