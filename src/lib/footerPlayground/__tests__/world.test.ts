import Matter from 'matter-js';
import { describe, expect, it } from 'vitest';
import { createSettleDetector } from '../settle';
import { computeLayout } from '../layout';
import { PlaygroundWorld, STEP_MS, type Impact } from '../world';

function run(world: PlaygroundWorld, ms: number) {
  const n = Math.round(ms / STEP_MS);
  for (let i = 0; i < n; i++) world.step();
}

function landed(width: number, seed = 7) {
  const layout = computeLayout(width);
  const world = new PlaygroundWorld(Matter, layout, seed);
  const firstFloor: (number | null)[] = [null, null, null, null];
  world.onImpact = (e: Impact) => {
    if (e.entity.kind === 'letter' && e.floor && firstFloor[e.entity.index] === null) firstFloor[e.entity.index] = world.time;
  };
  world.startDrop();
  run(world, 6000);
  return { world, layout, firstFloor };
}

describe('playground physics (deterministic)', () => {
  it.each([390, 1440])('letters land in reading order and rest on the floor at %i px', (width) => {
    const { world, layout, firstFloor } = landed(width);
    const times = firstFloor as number[];
    expect(times.every((t) => t !== null)).toBe(true);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    for (const l of world.letters) {
      expect(l.added).toBe(true);
      expect(l.body.bounds.max.y).toBeLessThanOrEqual(layout.floorY + 1.5);
      expect(l.body.bounds.max.y).toBeGreaterThan(layout.floorY - 6); // resting on the floor, not floating
      expect(Math.abs(l.body.angle)).toBeLessThan(0.2); // still readable
      expect(Math.abs(l.body.position.x + l.local.x - l.home.x)).toBeLessThan(layout.letterH * 0.5);
    }
  });

  it('settles so the loop can sleep', () => {
    const { world } = landed(1440);
    const d = createSettleDetector();
    let settled = false;
    for (let i = 0; i < 300 && !settled; i++) {
      world.step();
      settled = d.update(world.samples());
    }
    expect(settled).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const pose = (w: PlaygroundWorld) => w.letters.map((l) => [l.body.position.x, l.body.position.y, l.body.angle]);
    expect(pose(landed(768, 3).world)).toEqual(pose(landed(768, 3).world));
  });

  it('drops boxes that stay inside the stage and caps the pile', () => {
    const { world, layout } = landed(390);
    world.stickerCount = 12;
    for (let i = 0; i < 9; i++) {
      world.dropBox();
      run(world, 250);
    }
    run(world, 4000);
    const live = world.boxes.filter((b) => b.removeAt === null);
    expect(live.length).toBeLessThanOrEqual(layout.maxBoxes);
    expect(world.droppedBoxes).toBe(9);
    for (const b of live) {
      expect(b.body.position.x).toBeGreaterThan(0);
      expect(b.body.position.x).toBeLessThan(layout.width);
      expect(b.body.bounds.max.y).toBeLessThanOrEqual(layout.floorY + 1.5);
      expect(b.stickerIdx).toBeGreaterThanOrEqual(0);
      expect(b.stickerIdx).toBeLessThan(12);
    }
  });

  it('tidy sends letters home and clears the boxes', () => {
    const { world, layout } = landed(1440);
    for (let i = 0; i < 4; i++) world.dropBox();
    run(world, 1500);
    const grabbed = world.letters[2];
    world.grab(grabbed, grabbed.body.position.x, grabbed.body.position.y);
    world.dragTo(layout.width * 0.1, layout.stageH * 0.3);
    run(world, 600);
    world.release();
    world.tidy();
    run(world, 2500);
    expect(world.boxes.length).toBe(0);
    expect(world.busy).toBe(false);
    world.letters.forEach((l) => {
      expect(Math.abs(l.body.angle)).toBeLessThan(0.05);
      expect(Math.abs(l.body.position.x + l.local.x - l.home.x)).toBeLessThan(2);
    });
  });

  it('rebuild keeps the landed state for a new width', () => {
    const { world } = landed(1440);
    const next = computeLayout(390);
    world.rebuild(next);
    expect(world.dropped).toBe(true);
    expect(world.letters.every((l) => l.added)).toBe(true);
    run(world, 500);
    for (const l of world.letters) expect(l.body.bounds.max.y).toBeLessThanOrEqual(next.floorY + 1.5);
  });
});

describe('entrance robustness', () => {
  it.each([390, 1440])('the wordmark stays readable for many seeds at %i px', (width) => {
    for (let seed = 1; seed <= 16; seed++) {
      const world = new PlaygroundWorld(Matter, computeLayout(width), seed);
      world.startDrop();
      run(world, 7000);
      for (const l of world.letters) expect(Math.abs(l.body.angle), `seed ${seed} ${l.glyph.char}`).toBeLessThan(0.12);
    }
  });
});
