/**
 * The timeline of the home story (pure, tested). One number, p in 0..1, is the whole state of the section: scrolling
 * (desktop), the autoplay (phones) and the rail all just set p. Everything a scene draws is derived from p here, so
 * the 3D world (world.ts) and the words (StorySection.tsx) can never disagree about what is on screen.
 *
 * Every scene moves during the first 80% of its range and then holds still for the last 20%, so a visitor who stops
 * scrolling always lands on a finished picture, never on a half-way pose.
 */

import { FACTS } from '@/content/facts';
import type { ChapterId, SceneId } from '@/content/story';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, Number.isFinite(x) ? x : 0));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function easeOutBounce(x: number): number {
  const n = 7.5625;
  const d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
}

/** Share of a scene's range at the end that holds still */
export const HOLD = 0.2;
/** Eased motion over the moving part of a scene: local 0..1 in, settled 0..1 out */
export const settle = (local: number) => easeInOut(clamp01(local / (1 - HOLD)));

// --- Scenes --------------------------------------------------------------------------------------------------------

/** [scene, chapter on the rail, share of the whole story in %]. Shares add up to 100 */
const PLAN: ReadonlyArray<readonly [SceneId, ChapterId, number]> = [
  ['product', 'product', 10],
  ['fit', 'product', 10],
  ['reveal', 'design', 8],
  ['design', 'design', 12],
  ['order', 'order', 8],
  ['make', 'make', 14],
  ['ship', 'ship', 14],
  ['door', 'ship', 12],
  ['open', 'open', 12],
];

export interface Scene {
  id: SceneId;
  chapter: ChapterId;
  index: number;
  from: number;
  to: number;
}

export const SCENES: readonly Scene[] = (() => {
  let at = 0;
  return PLAN.map(([id, chapter, share], index) => {
    const from = at / 100;
    at += share;
    return { id, chapter, index, from, to: at / 100 };
  });
})();

export const CHAPTERS: readonly ChapterId[] = ['product', 'design', 'order', 'make', 'ship', 'open'];

export const sceneIndex = (id: SceneId) => SCENES.findIndex((s) => s.id === id);
const IDX = Object.fromEntries(SCENES.map((s) => [s.id, s.index])) as Record<SceneId, number>;

export interface SceneState {
  index: number;
  scene: Scene;
  /** 0..1 across the whole scene (holds included) */
  local: number;
  /** 0..1, eased, finished by the time the hold starts */
  t: number;
}

export function sceneAt(p: number): SceneState {
  const x = clamp01(p);
  let index = SCENES.length - 1;
  for (let i = 0; i < SCENES.length; i++) {
    if (x < SCENES[i].to) {
      index = i;
      break;
    }
  }
  const scene = SCENES[index];
  const local = clamp01((x - scene.from) / (scene.to - scene.from));
  return { index, scene, local, t: settle(local) };
}

/** Where a scene looks finished (inside its hold): the jump target for the rail and the autoplay */
export function holdPoint(index: number): number {
  const s = SCENES[Math.min(SCENES.length - 1, Math.max(0, index))];
  return s.from + (s.to - s.from) * 0.92;
}

const CHAPTER_ANCHOR: Record<ChapterId, SceneId> = { product: 'product', design: 'design', order: 'order', make: 'make', ship: 'ship', open: 'open' };
export const chapterAnchor = (chapter: ChapterId) => holdPoint(IDX[CHAPTER_ANCHOR[chapter]]);
export const chapterIndexOf = (sceneIdx: number) => CHAPTERS.indexOf(SCENES[Math.min(SCENES.length - 1, Math.max(0, sceneIdx))].chapter);

// --- Camera --------------------------------------------------------------------------------------------------------

type V3 = readonly [number, number, number];
export interface CamPose {
  pos: V3;
  target: V3;
  /** Vertical field of view in degrees for a wide (16:9) screen */
  fov: number;
}

/**
 * Where everything lives in the world (1 unit is about 10 cm of the real thing). The desk and the monitor sit at the
 * origin; the map and the doorstep are laid out along x, so the camera "travels" between places instead of cutting.
 */
export const WORLD = {
  screenCenter: [0, 6.4, -6.1] as V3,
  screenSize: [20, 11.25] as const,
  stage: [0, 1.1, -5.7] as V3,
  pallet: [0, 0, 6] as V3,
  map: [80, 0, 0] as V3,
  door: [140, 0, 0] as V3,
} as const;

// Tuned by eye with scripts/screenshots/jobs/story-beats.mjs
const START: CamPose = { pos: [7, 4.6, 10.5], target: [-2.2, 2.2, -5.5], fov: 30 };
const POSES: Record<SceneId, CamPose> = {
  product: { pos: [4.2, 3.6, 8.5], target: [-2.2, 2.2, -5.5], fov: 30 },
  fit: { pos: [6.2, 5.2, 9.2], target: [-2.2, 2.6, -5.5], fov: 30 },
  reveal: { pos: [-2, 9, 36], target: [-3.5, 5, -4], fov: 30 },
  design: { pos: [-2, 8, 30], target: [-5.5, 5.3, -5], fov: 30 },
  order: { pos: [-2, 8.5, 31], target: [-4.5, 6, 0], fov: 30 },
  make: { pos: [20, 19, 36], target: [-1, 3.5, 3], fov: 30 },
  ship: { pos: [80, 62, 50], target: [80, 0, 1], fov: 30 },
  door: { pos: [138, 5, 23], target: [138, 3.2, 0], fov: 30 },
  open: { pos: [140, 11, 19], target: [138.5, 3.4, 2], fov: 30 },
};

const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export function cameraAt(p: number): CamPose {
  const { index, scene, t } = sceneAt(p);
  const from = index === 0 ? START : POSES[SCENES[index - 1].id];
  const to = POSES[scene.id];
  return { pos: lerp3(from.pos, to.pos, t), target: lerp3(from.target, to.target, t), fov: lerp(from.fov, to.fov, t) };
}

/**
 * Keeps the same width in view when the screen is narrower than 16:9 (phones), so the monitor and the pallet still
 * fit; wider screens use the pose's own field of view.
 */
export function fitFov(fov: number, aspect: number, reference = 16 / 9): number {
  const wide = reference * 0.9;
  if (aspect >= wide || !Number.isFinite(aspect) || aspect <= 0) return fov;
  const half = Math.atan(Math.tan((fov * Math.PI) / 360) * wide);
  return Math.min(72, (2 * Math.atan(Math.tan(half) / aspect) * 180) / Math.PI);
}

// --- Per-scene state -----------------------------------------------------------------------------------------------

/** Progress of one scene's own motion, 0 before it and 1 after it */
function sceneProgress(p: number, id: SceneId): number {
  const { index, t } = sceneAt(p);
  const own = IDX[id];
  return index < own ? 0 : index > own ? 1 : t;
}

/** "Your product.": measuring lines draw along the jar */
export const measureAt = (p: number) => sceneProgress(p, 'product');
/** "Sized to fit.": the flat blank folds up around the jar */
export const foldAt = (p: number) => sceneProgress(p, 'fit');
/** "Made for you.": 0..1 while the pallet fills */
export const makeAt = (p: number) => sceneProgress(p, 'make');
/** "On its way.": how far along the route the truck is */
export const shipAt = (p: number) => sceneProgress(p, 'ship');
/** "Your turn.": how far the flaps are open */
export const openAt = (p: number) => sceneProgress(p, 'open');
/** The jar rises out of the open box once the flaps are most of the way open */
export const jarRiseAt = (p: number) => clamp01((openAt(p) - 0.4) / 0.6);

export const PALLET_BOXES = 16;
/** The ×N counter: 1 up to the minimum order, rolling as the pallet fills */
export const counterAt = (p: number) => Math.round(1 + (FACTS.moqBoxes - 1) * easeOutCubic(makeAt(p)));

/** The box lands on the doorstep: height above its resting place (0 once it has landed), with a bounce */
export function doorDropAt(p: number): { visible: boolean; height: number } {
  const { index, local } = sceneAt(p);
  if (index < IDX.door) return { visible: false, height: 0 };
  const landed = index > IDX.door ? 1 : clamp01(local / 0.5);
  return { visible: true, height: (1 - easeOutBounce(landed)) * 9 };
}

// --- The mini designer on the monitor ------------------------------------------------------------------------------

/** Where the scripted cursor goes, in the designer screen's own space (0..1 across and down, as the real tool lays out) */
const SCREEN = { w: 570, h: 320 } as const;
const at = (x: number, y: number): [number, number] => [x / SCREEN.w, y / SCREEN.h];
export const MINI = {
  swatch: (i: number) => at(41 + 20 * i, 80),
  logo: at(99, 129),
  ply: (i: number) => at(34 + 44 * i + 20.5, 180),
  quote: at(516, 13),
  idle: [0.62, 0.62] as [number, number],
} as const;

/** The board colours the cursor chooses between: kraft, white, black, red, blue, brand green */
export const SWATCH_COUNT = 6;

type Waypoint = readonly [number, [number, number]];
const DESIGN_PATH: readonly Waypoint[] = [
  [0, MINI.idle],
  [0.12, MINI.swatch(1)],
  [0.34, MINI.swatch(5)],
  [0.56, MINI.logo],
  [0.78, MINI.ply(1)],
  [1, MINI.ply(1)],
];
const ORDER_PATH: readonly Waypoint[] = [
  [0, MINI.ply(1)],
  [0.35, MINI.quote],
  [1, MINI.quote],
];
/** [time in the scene, what the click does] */
const DESIGN_CLICKS = [
  [0.16, { color: 1 }],
  [0.38, { color: 5 }],
  [0.6, { logo: true }],
  [0.82, { ply: 1 }],
] as const;
const QUOTE_CLICK = 0.38;

const copy = (v: readonly [number, number]): [number, number] => [v[0], v[1]];

function samplePath(path: readonly Waypoint[], x: number): [number, number] {
  const last = path[path.length - 1];
  if (x >= last[0]) return copy(last[1]);
  for (let i = 1; i < path.length; i++) {
    if (x <= path[i][0]) {
      const [t0, a] = path[i - 1];
      const [t1, b] = path[i];
      const k = easeInOut(clamp01((x - t0) / (t1 - t0)));
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    }
  }
  return copy(last[1]);
}

export interface MiniState {
  cursor: [number, number];
  /** Index into the six swatches (0 = kraft) */
  colorIndex: number;
  logo: boolean;
  /** Index of the highlighted board button (0 = 3-ply, 1 = 5-ply, 2 = 7-ply) */
  ply: number;
  /** 0..1 ripple right after a click */
  click: number;
  quoteHot: boolean;
  /** 0..1: the box on screen steps out into the room */
  exit: number;
}

export function miniAt(p: number): MiniState {
  const { index, local } = sceneAt(p);
  const out: MiniState = { cursor: copy(MINI.idle), colorIndex: 0, logo: false, ply: 0, click: 0, quoteHot: false, exit: 0 };
  if (index < IDX.design) return out;

  const dLocal = index === IDX.design ? local : 1;
  out.cursor = samplePath(DESIGN_PATH, dLocal);
  for (const [t, effect] of DESIGN_CLICKS) {
    if (dLocal < t) continue;
    if ('color' in effect) out.colorIndex = effect.color;
    if ('logo' in effect) out.logo = effect.logo;
    if ('ply' in effect) out.ply = effect.ply;
    if (index === IDX.design) out.click = Math.max(out.click, 1 - clamp01((dLocal - t) / 0.06));
  }
  if (index < IDX.order) return out;

  const oLocal = index === IDX.order ? local : 1;
  out.cursor = samplePath(ORDER_PATH, oLocal);
  out.quoteHot = oLocal >= QUOTE_CLICK;
  if (index === IDX.order && oLocal >= QUOTE_CLICK) out.click = Math.max(out.click, 1 - clamp01((oLocal - QUOTE_CLICK) / 0.06));
  out.exit = easeInOut(clamp01((oLocal - 0.42) / 0.5));
  return out;
}

/** Share of the "reveal" scene after which the monitor stops showing the spotlight and shows the designer */
export const REVEAL_SWAP = 0.8;
