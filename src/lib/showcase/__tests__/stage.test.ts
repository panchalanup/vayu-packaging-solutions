import { describe, it, expect } from 'vitest';
import {
  BEAT_STARTS,
  FINAL_DIELINE,
  SCENE_KEYS,
  beatOf,
  createStageStore,
  phaseAndProgress,
  sceneFor,
  type Scene,
} from '../stage';

const steps = (n: number) => Array.from({ length: n + 1 }, (_, i) => i / n);
const unfold = (p: number, has3d = true) => sceneFor({ phase: 2, p, slider: 1, has3d });

describe('sceneFor', () => {
  it('keeps every channel inside 0..1 for every phase and progress', () => {
    for (const has3d of [true, false]) {
      for (const phase of [1, 2, 3] as const) {
        for (const p of steps(100)) {
          const s = sceneFor({ phase, p, slider: 0.5, has3d });
          for (const k of SCENE_KEYS) {
            expect(s[k]).toBeGreaterThanOrEqual(0);
            expect(s[k]).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });

  it('starts the unfold from the hero scene so the handoff between chapters has no jump', () => {
    const hero = sceneFor({ phase: 1, p: 0, slider: 1, has3d: true });
    const start = unfold(0);
    expect(start.fold).toBe(hero.fold);
    expect(start.three).toBe(hero.three);
    expect(start.ink).toBe(hero.ink);
    // only the faint ghost dieline differs, and it is just fading out
    expect(start.ghost).toBeLessThan(hero.ghost);
  });

  it('opens the box, tips the camera over, then reveals the dieline in order', () => {
    expect(unfold(0).fold).toBe(1);
    expect(unfold(0.6).fold).toBe(0);
    expect(unfold(1).cut).toBe(1);
    // each reveal step only starts after the previous one is under way
    const order: (keyof Scene)[] = ['cut', 'score', 'panel', 'depth', 'blank', 'legend'];
    let previousStart = -1;
    for (const key of order) {
      const start = steps(200).find((p) => unfold(p)[key] > 0.001)!;
      expect(start).toBeGreaterThanOrEqual(previousStart);
      previousStart = start;
    }
  });

  it('never shows the 3D layer and the dieline at full strength together', () => {
    for (const p of steps(200)) {
      const s = unfold(p);
      expect(Math.min(s.three, s.cut)).toBeLessThan(0.6);
    }
  });

  it('only moves forward: fold falls and reveals rise as the visitor scrolls down', () => {
    let fold = 2;
    let cut = -1;
    for (const p of steps(200)) {
      const s = unfold(p);
      expect(s.fold).toBeLessThanOrEqual(fold + 1e-9);
      expect(s.cut).toBeGreaterThanOrEqual(cut - 1e-9);
      fold = s.fold;
      cut = s.cut;
    }
  });

  it('uses the illustrated box instead of the 3D layer when there is no 3D', () => {
    expect(sceneFor({ phase: 1, p: 0, slider: 1, has3d: false }).three).toBe(0);
    expect(sceneFor({ phase: 1, p: 0, slider: 1, has3d: false }).poster).toBe(1);
    expect(unfold(0.5, false).three).toBe(0);
    expect(unfold(0, false).poster).toBe(1);
    expect(unfold(0.5, false).poster).toBeLessThan(1);
  });

  it('chapter 3 follows the slider and ends the unfold reveals', () => {
    const s = sceneFor({ phase: 3, p: 1, slider: 0.25, has3d: true });
    expect(s.fold).toBe(0.25);
    expect(s.cut).toBe(0);
    expect(s.ink).toBe(1);
  });

  it('final frame has the whole dieline revealed', () => {
    expect(FINAL_DIELINE.cut).toBe(1);
    expect(FINAL_DIELINE.legend).toBe(1);
    expect(FINAL_DIELINE.three).toBe(0);
  });
});

describe('cinema variant', () => {
  const cinema = (phase: 1 | 2 | 3, p = 0, has3d = true) => sceneFor({ phase, p, slider: 1, has3d, variant: 'cinema' });

  it('is always on the dark stage and keeps every channel inside 0..1', () => {
    for (const phase of [1, 2, 3] as const) {
      for (const p of steps(100)) {
        const s = cinema(phase, p);
        expect(s.ink).toBe(1);
        for (const k of SCENE_KEYS) {
          expect(s[k]).toBeGreaterThanOrEqual(0);
          expect(s[k]).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('keeps one composition in every scene: the visual stays off-centre, words get the other side', () => {
    for (const phase of [1, 2, 3] as const) for (const p of steps(20)) expect(cinema(phase, p).shift).toBe(1);
  });

  it('lifts the hero box on a phone, then lets it settle onto the flat blank as it opens', () => {
    expect(cinema(1).lift).toBe(1);
    expect(cinema(2, 0).lift).toBe(1);
    expect(cinema(2, 0.4).lift).toBe(0);
    expect(cinema(3).lift).toBe(0);
    for (const p of steps(20)) expect(sceneFor({ phase: 2, p, slider: 1, has3d: true }).lift).toBe(0);
  });

  it('starts the unfold from the hero scene without a jump', () => {
    const hero = cinema(1);
    const start = cinema(2, 0);
    for (const k of ['fold', 'cam', 'three', 'poster', 'ink', 'shift'] as const) expect(start[k], k).toBe(hero[k]);
  });

  it('holds the finished dieline for the print scene, so the unfold ends where it begins', () => {
    expect(cinema(3)).toEqual({ ...FINAL_DIELINE, shift: 1 });
    const end = cinema(2, 1);
    for (const k of ['cut', 'score', 'panel', 'depth', 'blank', 'legend'] as const) expect(end[k], k).toBe(1);
    expect(end.three).toBe(0);
  });

  it('the story variant never shifts the box', () => {
    for (const phase of [1, 2, 3] as const) expect(sceneFor({ phase, p: 0.3, slider: 1, has3d: true }).shift).toBe(0);
  });
});

describe('beatOf', () => {
  it('walks 0..5 across the unfold', () => {
    expect(beatOf(0)).toBe(0);
    expect(beatOf(0.14)).toBe(0);
    expect(beatOf(0.15)).toBe(1);
    expect(beatOf(0.89)).toBe(4);
    expect(beatOf(1)).toBe(5);
    expect(BEAT_STARTS).toHaveLength(6);
  });
});

describe('phaseAndProgress', () => {
  const vh = 800;
  it('is the hero until the unfold reaches the reading line', () => {
    expect(phaseAndProgress({ unfoldTop: 900, unfoldHeight: 2000, anatomyTop: 2900 }, vh)).toEqual({ phase: 1, p: 0 });
  });
  it('maps position inside the unfold to progress', () => {
    const top = 800 * 0.52 - 1000; // 1000 px into a 2000 px section
    const { phase, p } = phaseAndProgress({ unfoldTop: top, unfoldHeight: 2000, anatomyTop: top + 2000 }, vh);
    expect(phase).toBe(2);
    expect(p).toBeCloseTo(0.5, 5);
  });
  it('is chapter 3 once its top passes the reading line', () => {
    expect(phaseAndProgress({ unfoldTop: -3000, unfoldHeight: 2000, anatomyTop: 100 }, vh).phase).toBe(3);
  });
  it('never returns a progress outside 0..1', () => {
    const { p } = phaseAndProgress({ unfoldTop: -99999, unfoldHeight: 10, anatomyTop: 99999 }, vh);
    expect(p).toBe(1);
  });
});

describe('stage store', () => {
  /** Fake clock: frames run only when the test pumps them, so the loop's start and stop are observable */
  const fakeRaf = () => {
    let queue: { id: number; cb: (t: number) => void }[] = [];
    let next = 1;
    let now = 0;
    return {
      raf: {
        request: (cb: (t: number) => void) => {
          queue.push({ id: next, cb });
          return next++;
        },
        cancel: (id: number) => {
          queue = queue.filter((q) => q.id !== id);
        },
      },
      pending: () => queue.length,
      frame: (ms = 16) => {
        now += ms;
        const run = queue;
        queue = [];
        run.forEach((q) => q.cb(now));
      },
    };
  };
  const hero = sceneFor({ phase: 1, p: 0, slider: 1, has3d: true });

  it('eases to a new target and then stops asking for frames', () => {
    const clock = fakeRaf();
    const store = createStageStore(hero, undefined, clock.raf);
    store.target(unfold(0.6));
    expect(clock.pending()).toBe(1);
    let frames = 0;
    while (clock.pending() && frames < 400) {
      clock.frame();
      frames++;
    }
    expect(clock.pending()).toBe(0);
    expect(frames).toBeGreaterThan(5); // it eased, it did not jump
    expect(frames).toBeLessThan(120); // and it settled quickly (about 1.5 s at 16 ms)
    expect(store.get().scene.fold).toBeCloseTo(0, 3);
    expect(store.isMoving()).toBe(false);
  });

  it('does not run any frames while nothing changes', () => {
    const clock = fakeRaf();
    createStageStore(hero, undefined, clock.raf);
    expect(clock.pending()).toBe(0);
  });

  it('notifies subscribers once per frame, with a stable snapshot between frames', () => {
    const clock = fakeRaf();
    const store = createStageStore(hero, undefined, clock.raf);
    let calls = 0;
    const off = store.subscribe(() => calls++);
    store.target(unfold(0.3));
    clock.frame();
    clock.frame();
    expect(calls).toBe(2);
    expect(store.get()).toBe(store.get());
    off();
    clock.frame();
    expect(calls).toBe(2);
  });

  it('jump snaps without scheduling frames (reduced motion)', () => {
    const clock = fakeRaf();
    const store = createStageStore(hero, undefined, clock.raf);
    store.jump(FINAL_DIELINE);
    expect(store.get().scene.cut).toBe(1);
    expect(clock.pending()).toBe(0);
  });

  it('merges design changes and keeps the dimensions it was not given', () => {
    const store = createStageStore(hero, undefined, fakeRaf().raf);
    store.setDesign({ dims: { length: 40, width: 30, height: 12 } });
    store.setDesign({ template: 'rsc' });
    expect(store.get().design).toMatchObject({ template: 'rsc', dims: { length: 40, width: 30, height: 12 } });
  });

  it('turntable runs only while auto-spin is on and stops its loop when it is off', () => {
    const clock = fakeRaf();
    const store = createStageStore(hero, undefined, clock.raf);
    store.setAutoSpin(true);
    clock.frame(100);
    clock.frame(100);
    expect(store.get().spin).toBeGreaterThan(0);
    store.setAutoSpin(false);
    clock.frame();
    expect(clock.pending()).toBe(0);
  });

  it('eases the pointer lean and stops the loop once it has arrived', () => {
    const clock = fakeRaf();
    const store = createStageStore(hero, undefined, clock.raf);
    store.setLook(0.8, -0.4);
    let frames = 0;
    while (clock.pending() && frames < 300) {
      clock.frame();
      frames++;
    }
    expect(clock.pending()).toBe(0);
    expect(store.get().look.x).toBeCloseTo(0.8, 3);
    expect(store.get().look.y).toBeCloseTo(-0.4, 3);
    store.setLook(9, -9);
    clock.frame();
    clock.frame(2000);
    expect(Math.abs(store.get().look.x)).toBeLessThanOrEqual(1);
  });

  it('a slower ease rate stretches one move and then returns to the normal rate', () => {
    const run = (rate?: number) => {
      const clock = fakeRaf();
      const store = createStageStore(hero, undefined, clock.raf);
      store.target(unfold(0.6), rate);
      let frames = 0;
      while (clock.pending() && frames < 1000) {
        clock.frame();
        frames++;
      }
      return { frames, store, clock };
    };
    const normal = run().frames;
    const slow = run(2.2);
    expect(slow.frames).toBeGreaterThan(normal * 2);
    // the next move is fast again
    slow.store.target(unfold(0));
    let frames = 0;
    while (slow.clock.pending() && frames < 1000) {
      slow.clock.frame();
      frames++;
    }
    expect(frames).toBeLessThanOrEqual(normal + 2);
  });

  it('nudging the turntable wraps into 0..360', () => {
    const store = createStageStore(hero, undefined, fakeRaf().raf);
    store.nudgeSpin(-10);
    expect(store.get().spin).toBe(350);
    store.nudgeSpin(20);
    expect(store.get().spin).toBe(10);
  });

  it('dispose cancels the pending frame', () => {
    const clock = fakeRaf();
    const store = createStageStore(hero, undefined, clock.raf);
    store.target(unfold(0.6));
    store.dispose();
    expect(clock.pending()).toBe(0);
  });
});
