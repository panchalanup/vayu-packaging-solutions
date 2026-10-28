/**
 * Physics world for the footer playground: Matter engine, stencil letters as exact compound bodies, walls,
 * drop-in schedule, boxes, tidy-up, dragging. No DOM; the React hook only reads poses from here.
 * Fixed 60 Hz steps, so a given seed always plays out the same way (see the tests).
 */

import type Matter from 'matter-js';
import { LETTERS, type StencilLetter } from '@/components/site/footer/stencilLetters';
import { centroid } from './polygon';
import { createRng, pickStickerIndex } from './boxes';
import type { PlaygroundLayout } from './layout';

export type MatterLib = typeof Matter;
type Body = Matter.Body;

export const STEP_MS = 1000 / 60;
/** Engine sub-steps per 60 Hz step: halves the contact jitter Matter shows on tall resting bodies */
const SUBSTEPS = 2;
/** Delay between letters entering from the top, in reading order */
export const DROP_STAGGER_MS = 260;
const TIDY_MS = 800;
const TIDY_STAGGER_MS = 80;
const BOX_REMOVE_MS = 260;
/** Side walls sit a little inside the stage so a pile never touches the screen edge */
const WALL_INSET = 8;
/** After entering, letters get extra angular damping so they thud down and stay upright (readable wordmark) */
const LANDING_ASSIST_MS = 1200;

interface Pose {
  x: number;
  y: number;
  angle: number;
}

interface EntityBase {
  id: number;
  body: Body;
  /** squash spring: positive is squashed (the hook turns it into a scale) */
  squash: number;
  squashV: number;
}

export interface LetterEntity extends EntityBase {
  kind: 'letter';
  index: number;
  glyph: StencilLetter;
  /** vector from the body centre to the top-left corner of the letter, in body space (px) */
  local: { x: number; y: number };
  home: { x: number; y: number };
  added: boolean;
  /** simulated time the letter entered the world (ms) */
  addedAt: number;
  tween: { t0: number; from: Pose; to: Pose; hop: number; done?: boolean } | null;
}

export interface BoxEntity extends EntityBase {
  kind: 'box';
  w: number;
  h: number;
  stickerIdx: number;
  /** 1 while alive, shrinks to 0 while being tidied away */
  scale: number;
  removeAt: number | null;
}

export type Entity = LetterEntity | BoxEntity;

export interface Impact {
  entity: Entity;
  /** 0..~1.2, impact speed relative to a typical landing */
  norm: number;
  x: number;
  y: number;
  floor: boolean;
}

export interface BodySample {
  speed: number;
  angular: number;
}

const rotate = (x: number, y: number, a: number) => ({ x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) });
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class PlaygroundWorld {
  readonly engine: Matter.Engine;
  layout: PlaygroundLayout;
  letters: LetterEntity[] = [];
  boxes: BoxEntity[] = [];
  /** simulated time in ms */
  time = 0;
  droppedBoxes = 0;
  stickerCount = 1;
  onImpact?: (impact: Impact) => void;
  onBoxesChange?: () => void;

  private rng: () => number;
  private nextId = 1;
  private dropStart: number | null = null;
  private lastSticker = -1;
  private byBody = new Map<number, Entity>();
  private walls: Body[] = [];
  private dragC: Matter.Constraint | null = null;
  private dragged: Entity | null = null;

  constructor(
    private M: MatterLib,
    layout: PlaygroundLayout,
    seed = 7,
  ) {
    this.layout = layout;
    this.rng = createRng(seed);
    this.engine = M.Engine.create({ gravity: { x: 0, y: layout.gravityY }, positionIterations: 14, velocityIterations: 10 });
    M.Events.on(this.engine, 'collisionStart', (e: Matter.IEventCollision<Matter.Engine>) => this.collide(e));
    this.build();
  }

  // ---------------------------------------------------------------- building

  private build() {
    const { M, layout: L } = this;
    this.walls = [
      M.Bodies.rectangle(L.width / 2, L.floorY + 150, L.width + 800, 300, { isStatic: true, label: 'floor', friction: 0.9 }),
      M.Bodies.rectangle(-150 + WALL_INSET, L.floorY - 1200, 300, 4000, { isStatic: true, label: 'wall' }),
      M.Bodies.rectangle(L.width + 150 - WALL_INSET, L.floorY - 1200, 300, 4000, { isStatic: true, label: 'wall' }),
      M.Bodies.rectangle(L.width / 2, -L.stageH * 2.5 - 150, L.width + 800, 300, { isStatic: true, label: 'wall' }),
    ];
    M.Composite.add(this.engine.world, this.walls);
    this.letters = LETTERS.map((glyph, index) => this.makeLetter(glyph, index));
  }

  private makeLetter(glyph: StencilLetter, index: number): LetterEntity {
    const { M, layout: L } = this;
    const home = L.homes[index];
    const parts = glyph.polys.map((poly) => {
      const c = centroid(poly);
      const verts = poly.map(([x, y]) => ({ x: home.x + x * L.k, y: home.y + y * L.k }));
      // ballast: lower parts are denser, so the letters sit low and stand up after landing
      const density = 0.0016 * (0.4 + 2.2 * (c.y / 100));
      return M.Body.create({ position: { x: home.x + c.x * L.k, y: home.y + c.y * L.k }, vertices: verts, density });
    });
    const body = M.Body.create({
      parts,
      label: `letter-${glyph.char}`,
      restitution: 0.06,
      friction: 0.9,
      frictionStatic: 1,
      frictionAir: 0.015,
      density: 0.0016,
      slop: 0.05,
    });
    const entity: LetterEntity = {
      kind: 'letter',
      id: this.nextId++,
      body,
      index,
      glyph,
      local: { x: home.x - body.position.x, y: home.y - body.position.y },
      home: { x: home.x, y: home.y },
      added: false,
      addedAt: 0,
      tween: null,
      squash: 0,
      squashV: 0,
    };
    this.byBody.set(body.id, entity);
    return entity;
  }

  /** Body centre pose for a letter whose top-left corner is at (ox, oy) once rotated by `angle` about the body centre */
  private poseFor(e: LetterEntity, ox: number, oy: number, angle: number): Pose {
    const r = rotate(e.local.x, e.local.y, angle);
    return { x: ox - r.x, y: oy - r.y, angle };
  }

  private place(body: Body, p: Pose) {
    this.M.Body.setAngle(body, p.angle);
    this.M.Body.setPosition(body, { x: p.x, y: p.y });
  }

  // ---------------------------------------------------------------- public controls

  /** Begin the entrance: letters enter one after another from above the stage */
  startDrop() {
    if (this.dropStart !== null) return;
    this.dropStart = this.time;
  }

  get dropped(): boolean {
    return this.dropStart !== null;
  }

  /** Skip the entrance and put every letter at rest on its home position (resize, tests) */
  restAtHome() {
    this.dropStart = this.time;
    for (const e of this.letters) {
      if (!e.added) this.M.Composite.add(this.engine.world, e.body);
      e.added = true;
      e.addedAt = this.time - LANDING_ASSIST_MS;
      e.tween = null;
      this.place(e.body, this.poseFor(e, e.home.x, e.home.y, 0));
      this.M.Body.setVelocity(e.body, { x: 0, y: 0 });
      this.M.Body.setAngularVelocity(e.body, 0);
    }
  }

  dropBox(x?: number): BoxEntity | null {
    const { M, layout: L, rng } = this;
    const live = this.boxes.filter((b) => b.removeAt === null);
    if (live.length >= L.maxBoxes) this.removeBox(live[0], 0);
    const size = 0.9 + rng() * 0.25;
    const w = Math.round(L.boxW * size);
    const h = Math.round(L.boxH * size);
    const margin = w + WALL_INSET;
    const cx = x === undefined ? margin + rng() * (L.width - 2 * margin) : Math.min(L.width - margin, Math.max(margin, x + (rng() - 0.5) * w * 0.5));
    const body = M.Bodies.rectangle(cx, -h, w, h, {
      label: 'box',
      angle: (rng() - 0.5) * 0.7,
      chamfer: { radius: 3 },
      restitution: 0.1,
      friction: 0.9,
      frictionStatic: 1,
      frictionAir: 0.012,
      density: 0.0018,
      slop: 0.05,
    });
    M.Body.setVelocity(body, { x: (rng() - 0.5) * 2, y: L.stageH * 0.012 });
    M.Body.setAngularVelocity(body, (rng() - 0.5) * 0.06);
    this.lastSticker = pickStickerIndex(this.stickerCount, rng, this.lastSticker);
    const entity: BoxEntity = { kind: 'box', id: this.nextId++, body, w, h, stickerIdx: this.lastSticker, scale: 1, removeAt: null, squash: 0, squashV: 0 };
    this.byBody.set(body.id, entity);
    this.boxes.push(entity);
    M.Composite.add(this.engine.world, body);
    this.droppedBoxes++;
    this.onBoxesChange?.();
    return entity;
  }

  private removeBox(b: BoxEntity, delay: number) {
    if (b.removeAt !== null) return;
    if (this.dragged === b) this.release();
    b.removeAt = this.time + delay;
    b.body.collisionFilter.mask = 0;
  }

  /** Letters hop back to their homes, boxes shrink away */
  tidy() {
    this.release();
    this.boxes.forEach((b, i) => this.removeBox(b, i * 30));
    this.letters.forEach((e, i) => {
      if (!e.added) return;
      const from: Pose = { x: e.body.position.x, y: e.body.position.y, angle: e.body.angle };
      const to = this.poseFor(e, e.home.x, e.home.y, 0);
      // nearest equivalent angle so a tumbled letter does not spin the long way round
      from.angle -= Math.round(from.angle / (Math.PI * 2)) * Math.PI * 2;
      e.tween = { t0: this.time + i * TIDY_STAGGER_MS, from, to, hop: this.layout.letterH * 0.45 };
      this.clearImpulse(e.body);
      this.M.Body.setStatic(e.body, true);
    });
  }

  /** Rebuild for a new layout (resize). Keeps the landed state, drops boxes. */
  rebuild(layout: PlaygroundLayout) {
    this.release();
    const landed = this.dropped;
    this.M.Composite.clear(this.engine.world, false, true);
    this.byBody.clear();
    this.boxes = [];
    this.layout = layout;
    this.engine.gravity.y = layout.gravityY;
    this.dropStart = null;
    this.build();
    if (landed) this.restAtHome();
    this.onBoxesChange?.();
  }

  // ---------------------------------------------------------------- dragging

  grab(entity: Entity, x: number, y: number) {
    this.release();
    const { M } = this;
    const b = entity.body;
    const p = this.clampPoint(x, y);
    const local = rotate(p.x - b.position.x, p.y - b.position.y, -b.angle);
    this.dragC = M.Constraint.create({ pointA: p, bodyB: b, pointB: local, stiffness: 0.14, damping: 0.14, length: 0.01 });
    M.Composite.add(this.engine.world, this.dragC);
    this.dragged = entity;
  }

  dragTo(x: number, y: number) {
    if (!this.dragC) return;
    const p = this.clampPoint(x, y);
    this.dragC.pointA.x = p.x;
    this.dragC.pointA.y = p.y;
  }

  release() {
    if (!this.dragC) return;
    this.M.Composite.remove(this.engine.world, this.dragC);
    this.dragC = null;
    this.dragged = null;
  }

  get dragging(): Entity | null {
    return this.dragged;
  }

  private clampPoint(x: number, y: number) {
    const L = this.layout;
    return { x: Math.min(L.width - 12, Math.max(12, x)), y: Math.min(L.floorY - 6, Math.max(4, y)) };
  }

  // ---------------------------------------------------------------- stepping

  step() {
    const { M, layout: L } = this;
    this.time += STEP_MS;

    if (this.dropStart !== null) {
      for (const e of this.letters) {
        if (e.added || this.time - this.dropStart < e.index * DROP_STAGGER_MS) continue;
        e.added = true;
        e.addedAt = this.time;
        const jitter = (this.rng() - 0.5) * L.letterH * 0.05;
        this.place(e.body, this.poseFor(e, e.home.x + jitter, -L.letterH * 1.15, (this.rng() - 0.5) * 0.1));
        M.Body.setVelocity(e.body, { x: 0, y: L.stageH * 0.012 });
        M.Composite.add(this.engine.world, e.body);
      }
    }

    for (const e of this.letters) if (e.tween) this.tweenStep(e);
    this.finishTidy();

    for (let i = 0; i < SUBSTEPS; i++) M.Engine.update(this.engine, STEP_MS / SUBSTEPS);

    const maxSpeed = L.stageH * 0.085;
    for (const e of this.entities()) {
      const b = e.body;
      if (b.isStatic) continue;
      const assist = e.kind === 'letter' && this.time - e.addedAt < LANDING_ASSIST_MS;
      M.Body.setAngularVelocity(b, b.angularVelocity * (assist ? 0.9 : 0.985));
      if (e.kind === 'letter' && this.nearlyUpright(b) && b.speed < 2) {
        // settle the tiny rocking Matter leaves on tall letters; the only equilibrium this close to upright is flat
        M.Body.setAngularVelocity(b, b.angularVelocity * 0.6);
        M.Body.setVelocity(b, { x: b.velocity.x * 0.7, y: b.velocity.y });
      }
      if (b.speed > maxSpeed) M.Body.setVelocity(b, { x: (b.velocity.x / b.speed) * maxSpeed, y: (b.velocity.y / b.speed) * maxSpeed });
      e.squashV = e.squashV * 0.82 - e.squash * 0.2;
      e.squash = Math.max(-0.6, Math.min(1.3, e.squash + e.squashV));
    }

    let changed = false;
    for (const b of [...this.boxes]) {
      if (b.removeAt === null) continue;
      b.scale = Math.max(0, 1 - (this.time - b.removeAt) / BOX_REMOVE_MS);
      if (this.time - b.removeAt >= BOX_REMOVE_MS) {
        M.Composite.remove(this.engine.world, b.body);
        this.byBody.delete(b.body.id);
        this.boxes.splice(this.boxes.indexOf(b), 1);
        changed = true;
      }
    }
    if (changed) this.onBoxesChange?.();
  }

  private nearlyUpright(b: Body): boolean {
    const a = Math.abs(((b.angle + Math.PI) % (Math.PI * 2)) - Math.PI);
    return a < 0.07 && b.bounds.max.y > this.layout.floorY - 3;
  }

  private tweenStep(e: LetterEntity) {
    const tw = e.tween;
    if (!tw) return;
    const t = (this.time - tw.t0) / TIDY_MS;
    if (t < 0) return;
    const k = easeInOut(Math.min(1, t));
    this.place(e.body, {
      x: tw.from.x + (tw.to.x - tw.from.x) * k,
      y: tw.from.y + (tw.to.y - tw.from.y) * k - Math.sin(Math.PI * k) * tw.hop,
      angle: tw.from.angle + (tw.to.angle - tw.from.angle) * k,
    });
    if (t >= 1) tw.done = true;
  }

  /** A static body never decays the constraint impulse left by dragging, which would shove it when it is freed again */
  private clearImpulse(b: Body) {
    const impulse = (b as unknown as { constraintImpulse: { x: number; y: number; angle: number } }).constraintImpulse;
    impulse.x = 0;
    impulse.y = 0;
    impulse.angle = 0;
  }

  /** Letters stay frozen at home until the last one arrives, so a late arrival never shoves an early one */
  private finishTidy() {
    const moving = this.letters.filter((l) => l.tween);
    if (!moving.length || !moving.every((l) => l.tween?.done)) return;
    for (const e of moving) {
      e.tween = null;
      this.M.Body.setStatic(e.body, false);
      this.clearImpulse(e.body);
      this.M.Body.setVelocity(e.body, { x: 0, y: 0 });
      this.M.Body.setAngularVelocity(e.body, 0);
      e.squashV = 0.35;
    }
  }

  private collide(event: Matter.IEventCollision<Matter.Engine>) {
    for (const pair of event.pairs) {
      const pa = pair.bodyA.parent;
      const pb = pair.bodyB.parent;
      const norm = Math.hypot(pa.velocity.x - pb.velocity.x, pa.velocity.y - pb.velocity.y) / (this.layout.letterH * 0.1);
      if (norm < 0.12) continue;
      const support = pair.collision.supports[0];
      const floor = pa.label === 'floor' || pb.label === 'floor';
      for (const entity of [this.byBody.get(pa.id), this.byBody.get(pb.id)]) {
        if (!entity || entity.body.isStatic) continue;
        entity.squashV += Math.min(norm, 1.2) * 0.14;
        this.onImpact?.({ entity, norm, floor, x: support?.x ?? entity.body.position.x, y: support?.y ?? entity.body.position.y });
      }
    }
  }

  // ---------------------------------------------------------------- queries

  entities(): Entity[] {
    return [...this.letters.filter((l) => l.added), ...this.boxes];
  }

  /** True while something is scripted to happen (entrance pending, tidy, dragging) so the loop must not sleep */
  get busy(): boolean {
    return (
      this.dragC !== null ||
      this.letters.some((l) => l.tween) ||
      this.boxes.some((b) => b.removeAt !== null) ||
      (this.dropStart !== null && this.letters.some((l) => !l.added))
    );
  }

  samples(): BodySample[] {
    return this.entities()
      .filter((e) => !e.body.isStatic)
      .map((e) => ({ speed: e.body.speed, angular: e.body.angularSpeed }));
  }
}
