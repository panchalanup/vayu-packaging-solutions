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

// --- World and camera ----------------------------------------------------------------------------------------------

type V3 = readonly [number, number, number];
export interface CamPose {
  pos: V3;
  target: V3;
  /** Vertical field of view in degrees for a wide (16:9) screen */
  fov: number;
}

/**
 * Where everything lives, at real scale: 1 unit = 10 cm and the floor is y = 0. Each place is far enough from the
 * others that nothing ever has to be hidden or swapped between scenes (popping objects read as flicker); the camera
 * simply travels.
 *  - studio: the product shot (scenes 1-2), a seamless floor under a spotlight, well away from everything
 *  - desk: a 160 x 80 cm desk, top at 75 cm, with a 27" monitor (scenes 3a-3c)
 *  - factory: the pallet of boxes (scene 4); road along x to the house (scenes 5-7)
 */
export const WORLD = {
  studio: [-80, 0, 0] as V3,
  /** Where the box blank lands beside the jar in the studio */
  studioBox: [-77, 0, 0.2] as V3,
  deskTop: 7.5,
  screenCenter: [0, 10.35, -2.6] as V3,
  /** 27" 16:9 panel, 60 x 33.75 cm */
  screenSize: [6, 3.375] as const,
  /** Where the box lands on the desk after stepping out of the screen */
  landing: [4.6, 7.5, -1.3] as V3,
  factory: [40, 0, 2] as V3,
  /** The road runs in front of the house (the house faces +z), well clear of the factory */
  roadZ: 64,
  truckFrom: 46,
  truckTo: 286,
  /** The box's resting spot on the doormat */
  door: [300, 0, 39] as V3,
} as const;

const [SX, SY, SZ] = WORLD.screenCenter;
const S = WORLD.studio;
const at3 = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];

/**
 * The camera framed so the monitor's screen exactly fills a 16:9 view. The reveal starts here: the monitor is showing
 * the studio shot (rendered from the "fit" pose), so the switch from the studio to the desk is invisible, and then
 * the camera pulls back.
 */
export const SCREEN_FILL: CamPose = {
  pos: [SX, SY, SZ + WORLD.screenSize[1] / 2 / Math.tan((15 * Math.PI) / 180)],
  target: [SX, SY, SZ],
  fov: 30,
};

/** Truck position along the road (x) for a ship progress 0..1 */
export const truckX = (ship: number) => lerp(WORLD.truckFrom, WORLD.truckTo, easeInOut(clamp01(ship)));

// Tuned by eye with scripts/screenshots/jobs/story-beats.mjs. Subjects sit right of centre: the words are on the left.
const START: CamPose = { pos: at3(S, 3.4, 2.4, 8.8), target: at3(S, -0.9, 0.8, 0), fov: 30 };
const POSES: Record<SceneId, CamPose | ((p: number) => CamPose)> = {
  product: { pos: at3(S, 2.3, 1.7, 6.6), target: at3(S, -0.95, 0.75, 0), fov: 30 },
  fit: { pos: at3(S, 4.6, 3.6, 10.2), target: at3(S, 1.0, 0.9, 0.1), fov: 30 },
  reveal: { pos: [-0.6, 12.4, 22], target: [-2.2, 9.5, -1.4], fov: 30 },
  design: { pos: [0.6, 11.7, 12.6], target: [-1.5, 9.85, -1.8], fov: 30 },
  order: { pos: [1.4, 11.4, 13.8], target: [-0.4, 9.3, -1.0], fov: 30 },
  make: { pos: [64, 27, 36], target: [40, 5, 2], fov: 30 },
  // a tracking shot: the camera follows the truck down the road
  ship: (p) => {
    const x = truckX(shipAt(p));
    return { pos: [x - 50, 44, WORLD.roadZ + 95], target: [x + 10, 6, WORLD.roadZ], fov: 30 };
  },
  door: { pos: at3(WORLD.door, 1.7, 2.5, 8.2), target: at3(WORLD.door, -0.7, 1.7, -0.6), fov: 30 },
  open: { pos: at3(WORLD.door, 1.3, 4.9, 4.9), target: at3(WORLD.door, -0.45, 1.25, -0.1), fov: 30 },
};

const poseOf = (id: SceneId, p: number): CamPose => {
  const pose = POSES[id];
  return typeof pose === 'function' ? pose(p) : pose;
};

/** Where the studio camera sits for the shot shown on the monitor at the start of the reveal */
export const STUDIO_SHOT = POSES.fit as CamPose;

/** Scenes that open with an intentional, invisible cut instead of a camera move from the previous scene */
export const CUT_IN: readonly SceneId[] = ['reveal'];

const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/**
 * Share of a scene the camera takes to arrive. Where the scene has its own action (the pallet filling, the parcel
 * dropping) the camera arrives early and the action plays to a settled frame instead of a moving one.
 */
const CAMERA_SHARE: Partial<Record<SceneId, number>> = { make: 0.4, ship: 0.25, door: 0.42 };

export function cameraAt(p: number): CamPose {
  const { index, scene, local } = sceneAt(p);
  const t = easeInOut(clamp01(local / (CAMERA_SHARE[scene.id] ?? 1 - HOLD)));
  const from = index === 0 ? START : scene.id === 'reveal' ? SCREEN_FILL : poseOf(SCENES[index - 1].id, p);
  const to = poseOf(scene.id, p);
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

const span = (t: number, a: number, b: number) => easeInOut(clamp01((t - a) / (b - a)));

/** "Your product.": measuring lines draw along the jar */
export const measureAt = (p: number) => sceneProgress(p, 'product');
/** "Sized to fit." as a whole */
export const foldAt = (p: number) => sceneProgress(p, 'fit');

/**
 * "Sized to fit." choreography, all from the designer's own carton rig: the flat blank slides in beside the jar,
 * folds up to an open box (rig progress 0 -> 0.72), the jar lifts over and settles inside, then the top flaps close
 * (0.72 -> 1).
 */
export function fitAt(p: number): { slide: number; rig: number; jar: number } {
  const t = foldAt(p);
  const rig = t < 0.8 ? 0.72 * span(t, 0.12, 0.52) : 0.72 + 0.28 * span(t, 0.8, 1);
  return { slide: span(t, 0, 0.14), rig, jar: span(t, 0.54, 0.8) };
}

/** Eased 0..1 over a window [a, b] of one scene's range; 0 before the scene, 1 after it */
function sceneWindow(p: number, id: SceneId, a: number, b: number): number {
  const { index, local } = sceneAt(p);
  const own = IDX[id];
  return index < own ? 0 : index > own ? 1 : span(local, a, b);
}

/** "Made for you.": 0..1 while the pallet fills, once the camera has arrived at the factory */
export const makeAt = (p: number) => sceneWindow(p, 'make', 0.3, 0.86);
/** "On its way.": how far along the road the truck is (it waits at the factory until the camera has joined it) */
export const shipAt = (p: number) => sceneWindow(p, 'ship', 0.22, 0.86);
/** "Your turn.": how far the flaps are open */
export const openAt = (p: number) => sceneProgress(p, 'open');
/** The jar rises out of the open box once the flaps are most of the way open */
export const jarRiseAt = (p: number) => clamp01((openAt(p) - 0.4) / 0.6);

/** The pallet holds exactly the minimum order, so the ×N counter and the boxes on screen always agree */
export const PALLET_BOXES = FACTS.moqBoxes;
/** Boxes on the pallet (and the ×N counter): from 1 up to the minimum order */
export const counterAt = (p: number) => Math.max(1, Math.min(PALLET_BOXES, Math.round(PALLET_BOXES * makeAt(p))));

/** How high (in units) the parcel starts above the doormat */
export const DOOR_DROP = 6;
/** The box lands on the doorstep: height above its resting place (0 once it has landed), with a bounce */
export function doorDropAt(p: number): { visible: boolean; height: number } {
  const { index, local } = sceneAt(p);
  if (index < IDX.door) return { visible: false, height: DOOR_DROP };
  // the parcel drops once the camera has settled at the doorstep
  const landed = index > IDX.door ? 1 : clamp01((local - 0.42) / 0.4);
  return { visible: true, height: (1 - easeOutBounce(landed)) * DOOR_DROP };
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
