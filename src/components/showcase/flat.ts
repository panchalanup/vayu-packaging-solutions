/**
 * Shared framing of the flat blank, used by both the SVG dieline layer and the 3D camera so the hand-off between
 * them lines up. Kept out of ShowcaseCanvas so the main chunk never imports three.js just for two numbers.
 */

/** Share of the stage the flat blank fills (the dieline layer is inset by the remainder) */
export const FLAT_FILL = 0.86;

/** The cinema film on a wide screen keeps the left third for words, so the blank is framed smaller */
export const CINEMA_FILL_WIDE = 0.6;

/** Extra space (mm) under the blank that the SVG keeps for its dimension captions */
export const BELOW_MM = 14;
