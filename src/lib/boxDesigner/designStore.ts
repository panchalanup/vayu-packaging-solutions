/**
 * Design store
 * One undoable state for the whole design (template, size, board, colour, artwork) with:
 *  - undo/redo (50 steps; rapid edits with the same key, e.g. a slider drag, coalesce into one step)
 *  - autosave to localStorage (artwork included when it fits; otherwise saved without images)
 *  - restore from a share link (#design=...) first, then from autosave
 * SECURITY: only the design is stored locally (no personal data); restored data goes through parseDesign().
 */

import { useCallback, useEffect, useReducer } from 'react';
import type { BoxDesign } from '@/types/boxDesigner';
import { DEFAULT_DESIGN, decodeShareHash, parseDesign, serializeDesign } from './designCodec';

const STORAGE_KEY = 'vayu-box-designer:v1';
const HISTORY_LIMIT = 50;
const COALESCE_MS = 800;

interface HistoryState {
  past: BoxDesign[];
  present: BoxDesign;
  future: BoxDesign[];
  lastKey: string | null;
  lastAt: number;
}

type Action =
  | { type: 'update'; patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>); key?: string }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'replace'; design: BoxDesign };

function reducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case 'update': {
      const patch = typeof action.patch === 'function' ? action.patch(state.present) : action.patch;
      const next = { ...state.present, ...patch };
      const now = Date.now();
      const coalesce = !!action.key && action.key === state.lastKey && now - state.lastAt < COALESCE_MS;
      return {
        past: coalesce ? state.past : [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
        lastKey: action.key ?? null,
        lastAt: now,
      };
    }
    case 'undo': {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future], lastKey: null, lastAt: 0 };
    }
    case 'redo': {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return { past: [...state.past, state.present], present: next, future: rest, lastKey: null, lastAt: 0 };
    }
    case 'replace':
      return { past: [...state.past, state.present].slice(-HISTORY_LIMIT), present: action.design, future: [], lastKey: null, lastAt: 0 };
  }
}

/** Where the initial design came from (shown to the user once) */
export type DesignOrigin = 'default' | 'shared' | 'restored';

function loadInitial(): { design: BoxDesign; origin: DesignOrigin } {
  if (typeof window === 'undefined') return { design: DEFAULT_DESIGN, origin: 'default' };
  const shared = decodeShareHash(window.location.hash);
  if (shared) return { design: shared, origin: 'shared' };
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const design = saved ? parseDesign(saved) : null;
    if (design) return { design, origin: 'restored' };
  } catch {
    /* storage unavailable (private mode) */
  }
  return { design: DEFAULT_DESIGN, origin: 'default' };
}

export function useDesignStore() {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const { design } = loadInitial();
    return { past: [], present: design, future: [], lastKey: null, lastAt: 0 };
  });

  // Debounced autosave
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, serializeDesign(state.present, { includeImages: true }));
      } catch {
        try {
          // quota exceeded: keep everything except the images
          window.localStorage.setItem(STORAGE_KEY, serializeDesign(state.present, { includeImages: false }));
        } catch {
          /* storage unavailable */
        }
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [state.present]);

  const update = useCallback(
    (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) =>
      dispatch({ type: 'update', patch, key }),
    []
  );
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const replace = useCallback((design: BoxDesign) => dispatch({ type: 'replace', design }), []);
  const reset = useCallback(() => dispatch({ type: 'replace', design: DEFAULT_DESIGN }), []);

  return {
    design: state.present,
    update,
    undo,
    redo,
    replace,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}

export const getInitialDesignOrigin = (): DesignOrigin => loadInitial().origin;
