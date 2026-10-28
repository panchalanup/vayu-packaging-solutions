import { describe, expect, it } from 'vitest';
import { LETTERS, LETTER_OFFSETS, WORDMARK_UNITS } from '@/components/site/footer/stencilLetters';
import { computeLayout, FLOOR_H } from '../layout';

const WIDTHS = [320, 390, 640, 768, 1024, 1440, 1920, 2560];

describe('computeLayout', () => {
  it('fits the wordmark inside the container at every width', () => {
    for (const w of WIDTHS) {
      const l = computeLayout(w);
      const left = l.homes[0].x;
      const last = LETTERS.length - 1;
      const right = l.homes[last].x + LETTERS[last].width * l.k;
      expect(left).toBeGreaterThanOrEqual(0);
      expect(right).toBeLessThanOrEqual(l.width);
      expect(left + right).toBeCloseTo(l.width, 3); // centred
      expect((right - left) / l.k).toBeCloseTo(WORDMARK_UNITS, 3);
    }
  });

  it('scales with the container until the cap, then stays centred', () => {
    const small = computeLayout(390);
    const mid = computeLayout(768);
    const big = computeLayout(1920);
    const huge = computeLayout(2560);
    expect(mid.k).toBeGreaterThan(small.k);
    expect(big.k).toBeGreaterThan(mid.k);
    expect(huge.k).toBe(big.k);
    expect(huge.homes[0].x).toBeGreaterThan(big.homes[0].x);
  });

  it('rests the letters on the floor with headroom above', () => {
    for (const w of WIDTHS) {
      const l = computeLayout(w);
      expect(l.homes.every((h) => Math.abs(h.y + l.letterH - l.floorY) < 1e-6)).toBe(true);
      expect(l.floorY).toBe(l.stageH - FLOOR_H);
      expect(l.stageH).toBeGreaterThan(l.letterH * 1.5);
      expect(l.homes[0].y).toBeGreaterThan(l.letterH * 0.5);
    }
  });

  it('keeps letters apart in px (no touching at home)', () => {
    const l = computeLayout(390);
    for (let i = 1; i < LETTERS.length; i++) {
      const prevRight = l.homes[i - 1].x + LETTERS[i - 1].width * l.k;
      expect(l.homes[i].x - prevRight).toBeGreaterThan(5);
      expect(l.homes[i].x).toBeCloseTo(l.homes[0].x + LETTER_OFFSETS[i] * l.k, 6);
    }
  });

  it('uses fewer boxes and a lower CTA threshold on phones', () => {
    expect(computeLayout(390).maxBoxes).toBe(6);
    expect(computeLayout(390).ctaAfter).toBe(6);
    expect(computeLayout(1440).maxBoxes).toBeGreaterThan(8);
    expect(computeLayout(1440).ctaAfter).toBe(8);
  });

  it('clamps absurd widths', () => {
    expect(computeLayout(0).width).toBe(240);
  });
});
