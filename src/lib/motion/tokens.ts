/** Motion tokens (§8.2). Mirrored as CSS custom properties in src/index.css. */

export const DUR = {
  instant: 0.1,
  quick: 0.18,
  base: 0.28,
  slow: 0.48,
  cinematic: 0.8,
} as const;

export const EASE = {
  paper: [0.22, 1, 0.36, 1] as const,
  fold: [0.65, 0, 0.35, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

export const STAGGER = 0.04;

/** Default reveal: rise 16px + fade, once, when 15% is visible */
export const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: DUR.slow, ease: EASE.paper },
} as const;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: fine)').matches;
