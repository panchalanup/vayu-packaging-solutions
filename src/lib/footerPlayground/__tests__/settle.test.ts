import { describe, expect, it } from 'vitest';
import { createSettleDetector, isStill } from '../settle';
import { CTA_HREF, createRng, pickStickerIndex, shouldShowCta } from '../boxes';

describe('settle detection', () => {
  const still = { speed: 0.01, angular: 0.0001 };
  const moving = { speed: 3, angular: 0 };

  it('classifies samples', () => {
    expect(isStill(still)).toBe(true);
    expect(isStill(moving)).toBe(false);
    expect(isStill({ speed: 0, angular: -0.5 })).toBe(false);
  });

  it('settles only after enough consecutive still steps', () => {
    const d = createSettleDetector({ frames: 5 });
    for (let i = 0; i < 4; i++) expect(d.update([still, still])).toBe(false);
    expect(d.update([still, still])).toBe(true);
  });

  it('any movement restarts the count', () => {
    const d = createSettleDetector({ frames: 3 });
    d.update([still]);
    d.update([still]);
    expect(d.update([still, moving])).toBe(false);
    expect(d.stillFrames).toBe(0);
    d.update([still]);
    d.update([still]);
    expect(d.update([still])).toBe(true);
    d.reset();
    expect(d.stillFrames).toBe(0);
  });

  it('treats an empty world as settled once the count is reached', () => {
    const d = createSettleDetector({ frames: 2 });
    d.update([]);
    expect(d.update([])).toBe(true);
  });
});

describe('box helpers', () => {
  it('seeded rng is deterministic and in range', () => {
    const a = createRng(5);
    const b = createRng(5);
    for (let i = 0; i < 50; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('never repeats the previous sticker when there is a choice', () => {
    const rnd = createRng(11);
    let prev = -1;
    for (let i = 0; i < 200; i++) {
      const n = pickStickerIndex(12, rnd, prev);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(12);
      expect(n).not.toBe(prev);
      prev = n;
    }
    expect(pickStickerIndex(1, rnd, 0)).toBe(0);
  });

  it('shows the CTA after enough boxes and links to the designer with the source tag', () => {
    expect(shouldShowCta(7, 8)).toBe(false);
    expect(shouldShowCta(8, 8)).toBe(true);
    expect(CTA_HREF).toBe('/box-designer?src=footer.playground');
  });
});
