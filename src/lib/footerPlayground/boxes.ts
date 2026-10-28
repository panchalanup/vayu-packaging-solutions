/** Box helpers: seeded random, sticker choice, box size jitter, CTA rule (pure). */

/** Small seeded generator (mulberry32) so physics tests are deterministic */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick a sticker index, avoiding the one used last time when there is a choice */
export function pickStickerIndex(count: number, rnd: () => number, previous = -1): number {
  if (count <= 1) return 0;
  let i = Math.floor(rnd() * count);
  if (i === previous) i = (i + 1 + Math.floor(rnd() * (count - 1))) % count;
  return i;
}

/** The "design your own box" line shows once enough boxes have been dropped */
export const shouldShowCta = (dropped: number, ctaAfter: number) => dropped >= ctaAfter;

export const CTA_HREF = '/box-designer?src=footer.playground';
