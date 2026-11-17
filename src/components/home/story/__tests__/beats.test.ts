import { describe, expect, it } from 'vitest';
import { FACTS } from '@/content/facts';
import { CHAPTER_LABELS, SCENE_WORDS, deskNote } from '@/content/story';
import {
  CHAPTERS,
  HOLD,
  PALLET_BOXES,
  SCENES,
  cameraAt,
  chapterAnchor,
  chapterIndexOf,
  counterAt,
  doorDropAt,
  fitFov,
  foldAt,
  holdPoint,
  jarRiseAt,
  makeAt,
  measureAt,
  miniAt,
  openAt,
  sceneAt,
  settle,
  shipAt,
} from '../beats';

describe('scenes', () => {
  it('cover 0..1 without gaps or overlaps', () => {
    expect(SCENES[0].from).toBe(0);
    expect(SCENES[SCENES.length - 1].to).toBe(1);
    for (let i = 1; i < SCENES.length; i++) expect(SCENES[i].from).toBe(SCENES[i - 1].to);
  });

  it('have a word entry each, and only the reveal is wordless', () => {
    for (const s of SCENES) expect(s.id in SCENE_WORDS).toBe(true);
    expect(SCENES.filter((s) => SCENE_WORDS[s.id] === '').map((s) => s.id)).toEqual(['reveal']);
  });

  it('keep every phrase to three words or fewer (text budget)', () => {
    for (const w of Object.values(SCENE_WORDS)) expect(w.split(' ').filter(Boolean).length).toBeLessThanOrEqual(3);
  });

  it('belong to chapters that appear on the rail in order', () => {
    expect(CHAPTERS.map((c) => CHAPTER_LABELS[c])).toEqual(['Product', 'Design', 'Order', 'Make', 'Ship', 'Open']);
    const seen = SCENES.map((s) => s.chapter).filter((c, i, a) => a.indexOf(c) === i);
    expect(seen).toEqual([...CHAPTERS]);
  });
});

describe('sceneAt', () => {
  it('clamps outside 0..1 and ignores NaN', () => {
    expect(sceneAt(-3).index).toBe(0);
    expect(sceneAt(7).index).toBe(SCENES.length - 1);
    expect(sceneAt(7).local).toBe(1);
    expect(sceneAt(Number.NaN).index).toBe(0);
  });

  it('switches scene exactly on a boundary', () => {
    for (let i = 1; i < SCENES.length; i++) {
      expect(sceneAt(SCENES[i].from).index).toBe(i);
      expect(sceneAt(SCENES[i].from - 1e-9).index).toBe(i - 1);
    }
  });

  it('finishes each scene\'s motion before its hold starts, then stays put', () => {
    expect(settle(1 - HOLD)).toBe(1);
    expect(settle(1)).toBe(1);
    expect(settle(0)).toBe(0);
    const s = SCENES[3];
    const a = sceneAt(s.from + (s.to - s.from) * (1 - HOLD)).t;
    const b = sceneAt(s.from + (s.to - s.from) * 0.99).t;
    expect(a).toBeCloseTo(1, 6);
    expect(b).toBe(1);
  });

  it('puts the hold point inside its own scene, in the hold', () => {
    SCENES.forEach((s, i) => {
      const h = holdPoint(i);
      const st = sceneAt(h);
      expect(st.index).toBe(i);
      expect(st.local).toBeGreaterThan(1 - HOLD);
      expect(st.t).toBe(1);
    });
  });
});

describe('rail', () => {
  it('jumps to the scene that carries each chapter name', () => {
    for (const c of CHAPTERS) {
      const st = sceneAt(chapterAnchor(c));
      expect(st.scene.chapter).toBe(c);
      expect(st.scene.id).toBe(c);
    }
  });

  it('maps scenes to chapter positions that never go backwards', () => {
    let last = -1;
    for (let i = 0; i < SCENES.length; i++) {
      const c = chapterIndexOf(i);
      expect(c).toBeGreaterThanOrEqual(last);
      last = c;
    }
  });
});

describe('camera', () => {
  const near = (a: readonly number[], b: readonly number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 4));

  it('has no jump at any scene boundary', () => {
    for (let i = 1; i < SCENES.length; i++) {
      const before = cameraAt(SCENES[i].from - 1e-7);
      const after = cameraAt(SCENES[i].from + 1e-7);
      near(before.pos, after.pos);
      near(before.target, after.target);
      expect(before.fov).toBeCloseTo(after.fov, 3);
    }
  });

  it('stands still through every hold', () => {
    SCENES.forEach((s) => {
      const a = cameraAt(s.from + (s.to - s.from) * 0.85);
      const b = cameraAt(s.from + (s.to - s.from) * 0.99);
      near(a.pos, b.pos);
    });
  });

  it('widens the field of view on a portrait phone but not on a wide screen', () => {
    expect(fitFov(30, 16 / 9)).toBe(30);
    expect(fitFov(30, 2.4)).toBe(30);
    const phone = fitFov(30, 390 / 844);
    expect(phone).toBeGreaterThan(30);
    expect(phone).toBeLessThanOrEqual(72);
    expect(fitFov(30, 0)).toBe(30);
  });
});

describe('scene progress', () => {
  it('is 0 before a scene, 1 after it, and rises monotonically inside it', () => {
    const cases = [
      ['product', measureAt],
      ['fit', foldAt],
      ['make', makeAt],
      ['ship', shipAt],
      ['open', openAt],
    ] as const;
    for (const [id, fn] of cases) {
      const s = SCENES.find((x) => x.id === id)!;
      expect(fn(Math.max(0, s.from - 1e-6))).toBe(0);
      expect(fn(s.to + (s.to === 1 ? 0 : 1e-6))).toBe(1);
      let prev = -1;
      for (let k = 0; k <= 20; k++) {
        const v = fn(s.from + ((s.to - s.from) * k) / 20 - (k === 20 ? 1e-9 : 0));
        expect(v).toBeGreaterThanOrEqual(prev);
        prev = v;
      }
    }
  });

  it('rolls the counter from 1 to the minimum order and fills the pallet', () => {
    const make = SCENES.find((s) => s.id === 'make')!;
    expect(counterAt(0)).toBe(1);
    expect(counterAt(holdPoint(make.index))).toBe(FACTS.moqBoxes);
    expect(counterAt(1)).toBe(FACTS.moqBoxes);
    expect(PALLET_BOXES).toBe(16);
  });

  it('only lifts the jar out once the flaps are well open', () => {
    const open = SCENES.find((s) => s.id === 'open')!;
    expect(jarRiseAt(open.from)).toBe(0);
    expect(jarRiseAt(holdPoint(open.index))).toBe(1);
  });

  it('bounces the box onto the doorstep and keeps it there', () => {
    const door = SCENES.find((s) => s.id === 'door')!;
    expect(doorDropAt(door.from - 0.01).visible).toBe(false);
    const start = doorDropAt(door.from);
    expect(start.visible).toBe(true);
    expect(start.height).toBeCloseTo(9, 4);
    expect(doorDropAt(holdPoint(door.index)).height).toBe(0);
    expect(doorDropAt(1).height).toBe(0);
  });
});

describe('mini designer on the monitor', () => {
  const design = SCENES.find((s) => s.id === 'design')!;
  const order = SCENES.find((s) => s.id === 'order')!;
  const at = (scene: typeof design, local: number) => scene.from + (scene.to - scene.from) * local;

  it('starts untouched: kraft, no logo, nothing clicked', () => {
    const s = miniAt(0);
    expect(s.colorIndex).toBe(0);
    expect(s.logo).toBe(false);
    expect(s.exit).toBe(0);
    expect(s.quoteHot).toBe(false);
  });

  it('picks white, then the brand colour, then adds the logo and the board, in that order', () => {
    expect(miniAt(at(design, 0.1)).colorIndex).toBe(0);
    expect(miniAt(at(design, 0.2)).colorIndex).toBe(1);
    expect(miniAt(at(design, 0.45)).colorIndex).toBe(5);
    expect(miniAt(at(design, 0.45)).logo).toBe(false);
    expect(miniAt(at(design, 0.65)).logo).toBe(true);
    expect(miniAt(at(design, 0.7)).ply).toBe(0);
    expect(miniAt(at(design, 0.9)).ply).toBe(1);
  });

  it('keeps the finished design through the order scene', () => {
    const s = miniAt(at(order, 0.1));
    expect(s.colorIndex).toBe(5);
    expect(s.logo).toBe(true);
    expect(s.ply).toBe(1);
  });

  it('clicks "Quote this design" and only then pushes the box out of the screen', () => {
    expect(miniAt(at(order, 0.2)).quoteHot).toBe(false);
    expect(miniAt(at(order, 0.45)).quoteHot).toBe(true);
    expect(miniAt(at(order, 0.3)).exit).toBe(0);
    expect(miniAt(holdPoint(order.index)).exit).toBe(1);
    expect(miniAt(1).exit).toBe(1);
  });

  it('moves the cursor continuously and keeps it on the screen', () => {
    let prev = miniAt(0).cursor;
    for (let k = 1; k <= 400; k++) {
      const c = miniAt(design.from + ((order.to - design.from) * k) / 400).cursor;
      expect(c[0]).toBeGreaterThanOrEqual(0);
      expect(c[0]).toBeLessThanOrEqual(1);
      expect(c[1]).toBeGreaterThanOrEqual(0);
      expect(c[1]).toBeLessThanOrEqual(1);
      expect(Math.hypot(c[0] - prev[0], c[1] - prev[1])).toBeLessThan(0.08);
      prev = c;
    }
  });
});

describe('desk note', () => {
  it('names an occasion for every month and the minimum order', () => {
    for (let m = 0; m < 12; m++) {
      const [line1, line2] = deskNote(new Date(2026, m, 15));
      expect(line1.length).toBeGreaterThan(3);
      expect(line2).toBe(`${FACTS.moqBoxes} pcs!`);
    }
  });

  it('follows the season', () => {
    expect(deskNote(new Date(2026, 9, 20))[0]).toBe('Diwali order');
    expect(deskNote(new Date(2026, 2, 5))[0]).toBe('Holi order');
  });
});
