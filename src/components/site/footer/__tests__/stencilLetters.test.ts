import { describe, expect, it } from 'vitest';
import { bounds, isConvex, overlapArea, signedArea } from '@/lib/footerPlayground/polygon';
import { LETTERS, LETTER_GAPS, LETTER_HEIGHT, LETTER_OFFSETS, WORDMARK_UNITS } from '../stencilLetters';

describe('stencil letter geometry', () => {
  it('spells VAYU', () => {
    expect(LETTERS.map((l) => l.char).join('')).toBe('VAYU');
  });

  for (const letter of LETTERS) {
    describe(letter.char, () => {
      it('uses convex polygons with the clockwise winding', () => {
        for (const poly of letter.polys) {
          expect(poly.length).toBeGreaterThanOrEqual(3);
          expect(signedArea(poly)).toBeGreaterThan(1);
          expect(isConvex(poly)).toBe(true);
        }
      });

      it('fits the letter box exactly (height 100, declared width)', () => {
        const b = bounds(letter.polys);
        expect(b.minX).toBeCloseTo(0, 3);
        expect(b.maxX).toBeCloseTo(letter.width, 3);
        expect(b.minY).toBeCloseTo(0, 3);
        expect(b.maxY).toBeCloseTo(LETTER_HEIGHT, 3);
      });

      it('has no overlaps beyond the joins', () => {
        const total = letter.polys.reduce((s, p) => s + signedArea(p), 0);
        for (let i = 0; i < letter.polys.length; i++) {
          for (let j = i + 1; j < letter.polys.length; j++) {
            expect(overlapArea(letter.polys[i], letter.polys[j])).toBeLessThan(total * 0.002);
          }
        }
      });

      it('has a flat base wide enough to stand on', () => {
        const base = letter.polys.flatMap((p) => p.filter(([, y]) => y >= LETTER_HEIGHT - 1e-6).map(([x]) => x));
        expect(Math.max(...base) - Math.min(...base)).toBeGreaterThan(24);
      });
    });
  }

  it('keeps the tape inside the letter box', () => {
    for (const l of LETTERS) {
      if (!l.tape) continue;
      expect(l.tape.x - l.tape.w / 2).toBeGreaterThan(-4);
      expect(l.tape.x + l.tape.w / 2).toBeLessThan(l.width + 4);
    }
  });

  it('wordmark offsets add up and letters never touch', () => {
    expect(WORDMARK_UNITS).toBe(LETTERS.reduce((s, l) => s + l.width, 0) + LETTER_GAPS.reduce((a, g) => a + g, 0));
    LETTERS.forEach((l, i) => {
      if (i === 0) return;
      expect(LETTER_OFFSETS[i] - (LETTER_OFFSETS[i - 1] + LETTERS[i - 1].width)).toBe(LETTER_GAPS[i - 1]);
    });
  });
});
