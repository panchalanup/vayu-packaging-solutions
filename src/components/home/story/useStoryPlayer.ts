/**
 * Phone "stories" mode: instead of pinning the page (which fights thumb scrolling), the story plays by itself while
 * it is in view, about 2.5 s a scene, and the visitor can tap to step, or pause. It only ever sets the story progress,
 * exactly like scrolling does on desktop.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FoldStore } from '../hero/foldStore';
import { SCENES, easeInOut, holdPoint } from './beats';

const MOVE_MS = 1600;
const HOLD_MS = 900;

type Phase = 'move' | 'hold' | 'done';

export function useStoryPlayer(store: FoldStore, active: boolean) {
  const [paused, setPaused] = useState(false);
  // Bumped by tap navigation so the loop restarts even if it had finished or was paused
  const [run, setRun] = useState(0);
  const state = useRef<{ index: number; from: number; t0: number; phase: Phase }>({ index: 0, from: 0, t0: 0, phase: 'move' });

  const goto = useCallback(
    (index: number) => {
      const i = Math.min(SCENES.length - 1, Math.max(0, index));
      state.current = { index: i, from: store.get(), t0: performance.now(), phase: 'move' };
      setPaused(false);
      setRun((n) => n + 1);
    },
    [store]
  );

  useEffect(() => {
    if (!active || paused) return;
    let frame = 0;
    // Resume from wherever the story is, aiming at the scene it is in (or the next one if it is already finished)
    if (state.current.phase === 'done') state.current = { ...state.current, phase: 'hold', t0: performance.now() };
    else state.current = { ...state.current, from: store.get(), t0: performance.now(), phase: state.current.phase === 'hold' ? 'hold' : 'move' };

    const tick = (now: number) => {
      const s = state.current;
      const elapsed = now - s.t0;
      if (s.phase === 'move') {
        const target = holdPoint(s.index);
        const k = Math.min(1, elapsed / MOVE_MS);
        store.set(s.from + (target - s.from) * easeInOut(k));
        if (k >= 1) state.current = { ...s, phase: 'hold', t0: now };
      } else if (s.phase === 'hold' && elapsed >= HOLD_MS) {
        state.current = s.index >= SCENES.length - 1 ? { ...s, phase: 'done' } : { index: s.index + 1, from: store.get(), t0: now, phase: 'move' };
      }
      if (state.current.phase !== 'done') frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, paused, run, store]);

  return { paused, setPaused, goto };
}
