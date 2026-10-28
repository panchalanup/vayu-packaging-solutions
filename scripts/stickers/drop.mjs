/** Ids removed after visual review (ugly, unrecognisable, near-invisible on light stock, duplicate or off-brief). Kept here so a rebuild never brings them back. */
export const DROP = new Set([
  // original generators
  'mark-two-way-arrows', 'mark-cut-line', 'mark-arrows-up-pair', 'shape-blob', 'ribbon-welcome', 'label-hello',
  // emoji items with white or missing parts, or unrecognisable at sticker size
  'lorry', 'baguette', 'pretzel', 'takeout-box', 'pouring', 'popping-bottle', 'mate', 'glasses', 'clutch', 'flat-shoe',
  'lab-coat', 'martial-arts-uniform', 'briefs', 'bikini', 'dolphin', 'puzzle-piece', 'bone', 'fork-and-knife', 'ladybird',
  'white-flower', 'wilted-flower', 'leaf-in-wind', 'grain-sheaf', 'envelope', 'postbox',
  // duplicates of artwork already in the library
  'kite-kids', 'rainbow-kids', 'moon-kids', 'flower-rosette', 'aroma-herb', 'blossom', 'crown-gift', 'cake', 'mushroom-plant', 'house-plant',
]);
/** Mono line icons are kept only where they match the neighbours (symbols, shipping, contact). */
export const OUTLINE_OK = new Set(['shapes-frames', 'shipping-marks', 'contact-icons']);
