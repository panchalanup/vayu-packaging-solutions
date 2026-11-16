/**
 * Showcase stage: the choreography and state behind chapters 1-3 of /3d-box-designer.
 *
 * Pure (no React, no three.js, no DOM except requestAnimationFrame in the store) so the whole timeline is unit-tested.
 *  - sceneFor(...)   maps (chapter, scroll progress, slider) to every visual channel: fold, camera, layer opacities
 *                    and the reveal steps of the dieline
 *  - beatOf(...)     which of the six captions is active
 *  - createStageStore()  damps those targets (so scroll never feels steppy), notifies subscribers once per frame and
 *                    stops its own loop when everything has settled, so an idle page costs nothing
 */

import type { BoxDimensions, BoxFace, BoxTemplate } from '@/types/boxDesigner';

/** Which chapter owns the stage: 1 hero, 2 the unfold, 3 dieline anatomy */
export type Phase = 1 | 2 | 3;

/** Every animated channel, each 0..1 unless noted */
export interface Scene {
  /** Fold progress of the 3D box: 0 flat blank .. 1 sealed */
  fold: number;
  /** Camera: 0 orbit view .. 1 top-down over the flat blank */
  cam: number;
  /** Opacity of the 3D layer */
  three: number;
  /** Opacity of the illustrated sealed box (the stand-in when there is no 3D) */
  poster: number;
  /** Ink flood over the stage */
  ink: number;
  /** Faint dieline behind the hero box */
  ghost: number;
  /** Cinema layout: 1 = the visual sits off-centre to leave room for the words (the page turns it into px) */
  shift: number;
  /** Cinema, phone: how far the hero box sits higher than the flat blank, clear of the controls (1 in the hero, eases to 0 as it opens) */
  lift: number;
  /** Dieline reveal steps */
  cut: number;
  score: number;
  panel: number;
  depth: number;
  glue: number;
  blank: number;
  legend: number;
}

export const SCENE_KEYS = ['fold', 'cam', 'three', 'poster', 'ink', 'ghost', 'shift', 'lift', 'cut', 'score', 'panel', 'depth', 'glue', 'blank', 'legend'] as const satisfies readonly (keyof Scene)[];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** 0 before a, 1 after b, linear between */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Beat boundaries over the unfold progress p (captions 02.1 .. 02.6) */
export const BEAT_STARTS = [0, 0.15, 0.4, 0.6, 0.75, 0.9] as const;

export function beatOf(p: number): number {
  let beat = 0;
  BEAT_STARTS.forEach((start, i) => {
    if (p >= start) beat = i;
  });
  return beat;
}

/** story: the light split layout (stage beside the text). cinema: the full-screen dark film. */
export type StageVariant = 'story' | 'cinema';

export interface SceneInput {
  phase: Phase;
  variant?: StageVariant;
  /** Unfold progress 0..1 (chapter 2 only) */
  p: number;
  /** "Flat <-> Folded" slider of chapter 3 (0 flat .. 1 folded) */
  slider: number;
  /** A live 3D layer exists; otherwise the illustrated box stands in for it */
  has3d: boolean;
}

const OFF = { cut: 0, score: 0, panel: 0, depth: 0, glue: 0, blank: 0, legend: 0 } as const;

export function sceneFor({ phase, p, slider, has3d, variant = 'story' }: SceneInput): Scene {
  const cinema = variant === 'cinema';
  if (phase === 1) {
    return { fold: 1, cam: 0, three: has3d ? 1 : 0, poster: has3d ? 0 : 1, ink: cinema ? 1 : 0, ghost: cinema ? 0.2 : 0.28, shift: cinema ? 1 : 0, lift: cinema ? 1 : 0, ...OFF };
  }
  if (phase === 3) {
    // cinema: hold the finished dieline for the print scene; story: the folded box with the fold slider
    if (cinema) return { ...FINAL_DIELINE, shift: 1 };
    return { fold: clamp01(slider), cam: 0, three: has3d ? 1 : 0, poster: has3d ? 0 : 1, ink: 1, ghost: 0, shift: 0, lift: 0, ...OFF };
  }
  const q = clamp01(p);
  return {
    // flap-by-flap: the box opens (fold 1 -> 0) while the camera tips over to look straight down at the flat blank
    fold: 1 - ease(seg(q, 0.15, 0.58)),
    cam: ease(seg(q, 0.38, 0.62)),
    three: has3d ? 1 - ease(seg(q, 0.54, 0.68)) : 0,
    poster: has3d ? 0 : 1 - ease(seg(q, 0.1, 0.4)),
    ink: cinema ? 1 : ease(seg(q, 0.5, 0.7)),
    ghost: 0,
    // cinema keeps one composition in every scene: words on one side, the visual on the other
    shift: cinema ? 1 : 0,
    lift: cinema ? 1 - ease(seg(q, 0.02, 0.3)) : 0,
    cut: seg(q, 0.56, 0.7),
    score: ease(seg(q, 0.64, 0.76)),
    panel: seg(q, 0.74, 0.8),
    depth: seg(q, 0.8, 0.86),
    glue: seg(q, 0.8, 0.86),
    blank: seg(q, 0.86, 0.91),
    legend: seg(q, 0.91, 0.97),
  };
}

/** Everything revealed: the end state, also the frame shown with reduced motion */
export const FINAL_DIELINE: Scene = { fold: 0, cam: 1, three: 0, poster: 0, ink: 1, ghost: 0, shift: 0, lift: 0, cut: 1, score: 1, panel: 1, depth: 1, glue: 1, blank: 1, legend: 1 };

export interface ChapterRects {
  /** Viewport-relative top of the chapter 2 section and its height */
  unfoldTop: number;
  unfoldHeight: number;
  /** Viewport-relative top of the chapter 3 section */
  anatomyTop: number;
}

/** The reading line sits slightly above the middle of the screen */
const READING_LINE = 0.52;

export function phaseAndProgress(rects: ChapterRects, viewportHeight: number): { phase: Phase; p: number } {
  const line = viewportHeight * READING_LINE;
  if (rects.anatomyTop <= line) return { phase: 3, p: 1 };
  if (rects.unfoldTop <= line) return { phase: 2, p: clamp01((line - rects.unfoldTop) / Math.max(1, rects.unfoldHeight)) };
  return { phase: 1, p: 0 };
}

// ---------------------------------------------------------------------------------------------------------------
// Store

export interface StageDesign {
  template: BoxTemplate;
  /** Inside dimensions (cm) */
  dims: BoxDimensions;
  colorHex: string;
}

export interface StageSnapshot {
  scene: Scene;
  design: StageDesign;
  highlight: BoxFace | null;
  /** Turntable offset in degrees (auto-spin plus the visitor's drag) */
  spin: number;
  /** Pointer parallax, each -1..1 (eased), so the box leans toward the cursor */
  look: { x: number; y: number };
}

export interface StageStore {
  get(): StageSnapshot;
  subscribe(listener: (s: StageSnapshot) => void): () => void;
  /** Set where the scene should settle; it eases there. `rate` (default 11) is the ease speed: lower is slower. */
  target(next: Scene, rate?: number): void;
  /** Move to a scene immediately (reduced motion, first paint) */
  jump(next: Scene): void;
  setDesign(next: Partial<StageDesign>): void;
  setHighlight(face: BoxFace | null): void;
  /** Lean toward the pointer (each -1..1); eased, and it keeps the loop alive only while it is moving */
  setLook(x: number, y: number): void;
  /** Drag the turntable by a number of degrees */
  nudgeSpin(deg: number): void;
  /** Turntable runs by itself while true */
  setAutoSpin(on: boolean): void;
  /** True while the loop is running (so a canvas knows to keep rendering) */
  isMoving(): boolean;
  dispose(): void;
}

/** Ease rate: ~90 ms time constant, so scroll feels scrubbed rather than stepped */
const RATE = 11;
const EPS = 0.002;
const SPIN_DEG_PER_SEC = 9;
const LOOK_RATE = 6;

export const DEFAULT_STAGE_DESIGN: StageDesign = {
  template: 'mailer',
  dims: { length: 25, width: 18, height: 8 },
  colorHex: '#C9A87C',
};

type Raf = { request: (cb: (t: number) => void) => number; cancel: (id: number) => void };

const browserRaf = (): Raf => ({
  request: (cb) => requestAnimationFrame(cb),
  cancel: (id) => cancelAnimationFrame(id),
});

export function createStageStore(initialScene: Scene, initialDesign: StageDesign = DEFAULT_STAGE_DESIGN, raf: Raf = browserRaf()): StageStore {
  let current: Scene = { ...initialScene };
  let goal: Scene = { ...initialScene };
  let design = initialDesign;
  let highlight: BoxFace | null = null;
  let spin = 0;
  let look = { x: 0, y: 0 };
  let lookGoal = { x: 0, y: 0 };
  let rate = RATE;
  let autoSpin = false;
  let frame = 0;
  let last = 0;
  let snapshot: StageSnapshot = { scene: current, design, highlight, spin, look };
  const listeners = new Set<(s: StageSnapshot) => void>();

  const publish = () => {
    snapshot = { scene: { ...current }, design, highlight, spin, look: { ...look } };
    listeners.forEach((l) => l(snapshot));
  };

  const settled = () => SCENE_KEYS.every((k) => Math.abs(goal[k] - current[k]) < EPS) && Math.abs(lookGoal.x - look.x) < EPS && Math.abs(lookGoal.y - look.y) < EPS;

  const step = (now: number) => {
    frame = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const k = 1 - Math.exp(-rate * dt);
    const kl = 1 - Math.exp(-LOOK_RATE * dt);
    const next = { ...current };
    for (const key of SCENE_KEYS) {
      const moved = current[key] + (goal[key] - current[key]) * k;
      // snap in the same frame the loop would otherwise stop, so a settled scene is exactly on target
      next[key] = Math.abs(goal[key] - moved) < EPS ? goal[key] : moved;
    }
    current = next;
    const towards = (from: number, to: number) => {
      const moved = from + (to - from) * kl;
      return Math.abs(to - moved) < EPS ? to : moved;
    };
    look = { x: towards(look.x, lookGoal.x), y: towards(look.y, lookGoal.y) };
    if (autoSpin) spin = (spin + SPIN_DEG_PER_SEC * dt) % 360;
    publish();
    if (autoSpin || !settled()) frame = raf.request(step);
    else {
      last = 0;
      rate = RATE; // a slow intro ease applies to one move only
    }
  };

  const kick = () => {
    if (!frame) frame = raf.request(step);
  };

  return {
    get: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    target(next, r) {
      goal = next;
      rate = r ?? RATE;
      kick();
    },
    jump(next) {
      goal = next;
      rate = RATE;
      current = { ...next };
      publish();
    },
    setLook(x, y) {
      lookGoal = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
      kick();
    },
    setDesign(next) {
      design = { ...design, ...next, dims: { ...design.dims, ...next.dims } };
      publish();
    },
    setHighlight(face) {
      if (face === highlight) return;
      highlight = face;
      publish();
    },
    nudgeSpin(deg) {
      spin = (((spin + deg) % 360) + 360) % 360;
      publish();
    },
    setAutoSpin(on) {
      if (on === autoSpin) return;
      autoSpin = on;
      if (on) kick();
    },
    isMoving: () => frame !== 0,
    dispose() {
      if (frame) raf.cancel(frame);
      frame = 0;
      listeners.clear();
    },
  };
}
