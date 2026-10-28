/**
 * Templates gallery (#16, phase 2): ready-made starting points for common jobs, each with a sensible spec, sample
 * text and a small sticker composition from the cutout library. Only templates whose style has a 3D model are
 * offered (availableTemplates). Applying a template keeps the user's unit and quantity; the sample brand text is a
 * placeholder ("Your Brand") the user replaces in one tap.
 *
 * Content rules: original art only (library stickers, tiny SVG marks), no third-party brands, no certificates, no
 * "organic / certified / premium" claims; festive designs use neutral symbols (sparklers, ribbons, snowflakes, stars). Stickers are referenced by library id so templates stay tiny.
 * Sample text sizes are computed from the face width so they fit (size is in real points).
 */

import type {
  BoxDesign,
  BoxDimensions,
  BoxFace,
  BoxTemplate,
  DesignOptions,
  FluteType,
  PlyType,
  PrintFinish,
  StickerPlacement,
  TextElement,
} from '@/types/boxDesigner';
import { DEFAULT_DESIGN, DEFAULT_OPTIONS } from './designCodec';
import { hasStyleModel } from './styleAvailability';
import { templateArtUrl, TemplateArtId } from './templateArt';
import { clampSticker, makeSticker } from './stickers/placement';

export type TemplateCategory =
  | 'produce'
  | 'food'
  | 'clothing'
  | 'beauty'
  | 'electronics'
  | 'gifts'
  | 'home'
  | 'toys'
  | 'stationery'
  | 'pets'
  | 'plants'
  | 'display'
  | 'shipping';

/** A sticker of a template composition (position and size as in StickerPlacement; ids come from the library) */
export interface TemplateSticker {
  id: string;
  face: BoxFace;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  flip?: boolean;
  tint?: string;
  opacity?: number;
}

export interface DesignTemplate {
  id: string;
  name: string;
  /** One line: who it is for */
  blurb: string;
  category: TemplateCategory;
  style: BoxTemplate;
  dimensions: BoxDimensions;
  ply: PlyType;
  flutes: FluteType[];
  colorHex: string;
  finish: PrintFinish;
  insideColorHex: string | null;
  showIcons: boolean;
  /** Single sample logo (the original eight-or-so tiny SVG marks); newer templates use stickers instead */
  art: { id: TemplateArtId; face: BoxFace; position: { x: number; y: number }; scale: number } | null;
  texts: Omit<TextElement, 'id'>[];
  /** Cutout composition (library ids) */
  stickers: TemplateSticker[];
  /** Opening options (hand holes, vents, window, front cut); anything the style cannot cut is ignored */
  options: Partial<DesignOptions>;
  /** Extra search words (product names, transliterations) */
  tags: string[];
}

// ---------------------------------------------------------------------------------------------------------------
// Authoring helpers
// ---------------------------------------------------------------------------------------------------------------

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const text = (
  face: BoxFace,
  value: string,
  size: number,
  color: string,
  y: number,
  font = 'Inter',
  x = 0.5
): Omit<TextElement, 'id'> => ({ face, text: value, font, size, color, position: { x, y }, rotation: 0, align: 'center' });

const BOARDS = {
  '3E': ['3-ply', ['E']],
  '3B': ['3-ply', ['B']],
  '3C': ['3-ply', ['C']],
  '5BC': ['5-ply', ['B', 'C']],
  '5EB': ['5-ply', ['E', 'B']],
  '7': ['7-ply', ['C', 'B', 'C']],
} as const satisfies Record<string, readonly [PlyType, readonly FluteType[]]>;

type BoardCode = keyof typeof BOARDS;

interface TextSpec {
  face: BoxFace;
  value: string;
  color: string;
  y: number;
  x?: number;
  /** Share of the face width the text should fill (default 0.6) */
  fill?: number;
  font?: string;
}

interface Spec {
  id: string;
  name: string;
  blurb: string;
  category: TemplateCategory;
  style: BoxTemplate;
  /** Length, width, height (cm, inside) */
  size: [number, number, number];
  board: BoardCode;
  color: string;
  inside?: string | null;
  finish?: PrintFinish;
  icons?: boolean;
  options?: Partial<DesignOptions>;
  texts?: TextSpec[];
  stickers?: TemplateSticker[];
  tags?: string[];
}

/** Width of a face in the template's own size (used only to size the sample text) */
function faceWidthCm(face: BoxFace, [length, width]: [number, number, number]): number {
  return face === 'left' || face === 'right' || face === 'lid-left' || face === 'lid-right' ? width : length;
}

const fitSize = (value: string, widthCm: number, fill: number) =>
  clamp(Math.round((widthCm * fill * 47) / Math.max(1, value.length)), 10, 160);

const s = (
  id: string,
  face: BoxFace,
  x: number,
  y: number,
  scale: number,
  extra: Partial<Pick<TemplateSticker, 'rotation' | 'flip' | 'tint' | 'opacity'>> = {}
): TemplateSticker => ({ id, face, x, y, scale, ...extra });

const T = (face: BoxFace, value: string, color: string, y: number, extra: Partial<Omit<TextSpec, 'face' | 'value' | 'color' | 'y'>> = {}): TextSpec => ({
  face,
  value,
  color,
  y,
  ...extra,
});

function define(spec: Spec): DesignTemplate {
  const [ply, flutes] = BOARDS[spec.board];
  const [length, width, height] = spec.size;
  return {
    id: spec.id,
    name: spec.name,
    blurb: spec.blurb,
    category: spec.category,
    style: spec.style,
    dimensions: { length, width, height },
    ply,
    flutes: [...flutes],
    colorHex: spec.color,
    finish: spec.finish ?? 'matte',
    insideColorHex: spec.inside ?? null,
    showIcons: spec.icons ?? false,
    art: null,
    texts: (spec.texts ?? []).map((t) =>
      text(t.face, t.value, fitSize(t.value, faceWidthCm(t.face, spec.size), t.fill ?? 0.6), t.color, t.y, t.font ?? 'Inter', t.x ?? 0.5)
    ),
    stickers: spec.stickers ?? [],
    options: spec.options ?? {},
    tags: spec.tags ?? [],
  };
}

/** Old single-logo templates (kept exactly as they were; ids are linked from landing pages) */
function legacy(
  spec: Omit<DesignTemplate, 'stickers' | 'options' | 'tags'> & Partial<Pick<DesignTemplate, 'stickers' | 'options' | 'tags'>>
): DesignTemplate {
  return { stickers: [], options: {}, tags: [], ...spec };
}

// Board and ink colours (the same presets as the colour picker, plus two inks)
const KRAFT = '#C9A87C';
const GOLD = '#D9B77E';
const BROWN = '#8B6F47';
const WHITE = '#F5F5F0';
const BLACK = '#2B2B2D';
const RED = '#A8352E';
const NAVY = '#2E4F7F';
const GREEN = '#3F6B4A';
const YELLOW = '#E3B53C';
const PINK = '#E6A9B8';
const CREAM = '#FBF8F3';
const INK = '#17231C';
const SAND = '#E8D5B3';

/**
 * Vented produce cartons have a slot row across the middle of the long walls, so the artwork sits above and below
 * it: two stickers in the top corners and the brand line in the strip underneath.
 */
const vented = (left: string, right: string, label: string, ink: string, fill = 0.55): Pick<Spec, 'stickers' | 'texts'> => ({
  stickers: [s(left, 'front', 0.17, 0.16, 0.3), s(right, 'front', 0.83, 0.16, 0.3)],
  texts: [T('front', label, ink, 0.88, { fill })],
});

// VERIFY-LATER[DSG-61]: check template sizes and boards against what customers actually order most
// VERIFY-LATER[TPL-01]: owner to review the sample wording and sizes of the phase 2 templates (fruit cartons, bakery,
// apparel, beauty, gifts) before launch; sizes are typical inside sizes, not a customer-confirmed range
export const DESIGN_TEMPLATES: DesignTemplate[] = [
  // ---- Shipping & export ------------------------------------------------------------------------------------
  legacy({
    id: 'ecommerce-shipper',
    name: 'E-commerce shipper',
    blurb: 'Everyday courier carton with your logo',
    category: 'shipping',
    style: 'rsc',
    dimensions: { length: 30, width: 22, height: 15 },
    ply: '5-ply',
    flutes: ['B', 'C'],
    colorHex: '#C9A87C',
    finish: 'matte',
    insideColorHex: null,
    showIcons: true,
    art: { id: 'leaf', face: 'front', position: { x: 0.36, y: 0.4 }, scale: 0.45 },
    // kept left of centre and higher so it clears the handling marks at the bottom right
    texts: [text('front', 'YOUR BRAND', 52, '#17231C', 0.74, 'Inter', 0.36)],
    tags: ['courier', 'parcel', 'online store', 'rsc'],
  }),
  legacy({
    id: 'subscription-box',
    name: 'Subscription box',
    blurb: 'Monthly kit with a coloured outside',
    category: 'shipping',
    style: 'mailer',
    dimensions: { length: 25, width: 20, height: 8 },
    ply: '3-ply',
    flutes: ['E'],
    colorHex: '#3F6B4A',
    finish: 'matte',
    insideColorHex: '#F5F5F0',
    showIcons: false,
    art: { id: 'spark', face: 'lid', position: { x: 0.25, y: 0.5 }, scale: 0.75 },
    texts: [text('lid', 'This month’s box', 36, '#FBF8F3', 0.5, 'Inter', 0.64)],
    tags: ['monthly', 'kit', 'unboxing'],
  }),
  define({
    id: 'fragile-shipper',
    name: 'Fragile goods carton',
    blurb: 'Courier carton with handling marks for glass and ceramics',
    category: 'shipping',
    style: 'rsc',
    size: [40, 30, 25],
    board: '5BC',
    color: KRAFT,
    icons: false,
    stickers: [s('mark-fragile', 'front', 0.2, 0.3, 0.3, { tint: RED }), s('mark-this-way-up', 'front', 0.8, 0.3, 0.3, { tint: INK })],
    texts: [T('front', 'YOUR BRAND', INK, 0.74)],
    tags: ['glass', 'ceramic', 'handle with care', 'courier'],
  }),
  define({
    id: 'air-freight-carton',
    name: 'Air freight carton',
    blurb: 'Light, strong carton for air cargo',
    category: 'shipping',
    style: 'rsc',
    size: [45, 35, 30],
    board: '5BC',
    color: KRAFT,
    icons: true,
    stickers: [s('air-freight', 'front', 0.2, 0.34, 0.3), s('mark-keep-dry', 'front', 0.8, 0.34, 0.28, { tint: INK })],
    texts: [T('front', 'AIR FREIGHT', INK, 0.74, { fill: 0.5 })],
    tags: ['export', 'cargo', 'plane'],
  }),
  define({
    id: 'sea-freight-carton',
    name: 'Sea freight carton',
    blurb: 'Double overlap carton for container loads',
    category: 'shipping',
    style: 'fol',
    size: [50, 40, 40],
    board: '7',
    color: KRAFT,
    icons: true,
    stickers: [s('sea-freight', 'front', 0.2, 0.34, 0.28), s('mark-stack-limit', 'front', 0.8, 0.34, 0.28, { tint: INK })],
    texts: [T('front', 'SEA FREIGHT', INK, 0.74, { fill: 0.5 })],
    tags: ['export', 'container', 'ship', 'heavy'],
  }),
  legacy({
    id: 'export-carton',
    name: 'Export carton',
    blurb: 'Heavy-duty carton for containers',
    category: 'shipping',
    style: 'rsc',
    dimensions: { length: 50, width: 40, height: 40 },
    ply: '7-ply',
    flutes: ['C', 'B', 'C'],
    colorHex: '#C9A87C',
    finish: 'matte',
    insideColorHex: null,
    showIcons: true,
    art: { id: 'globe', face: 'front', position: { x: 0.5, y: 0.35 }, scale: 0.4 },
    texts: [text('front', 'MADE IN INDIA', 72, '#17231C', 0.72)],
    tags: ['container', 'shipping', 'heavy'],
  }),
  legacy({
    id: 'heavy-duty',
    name: 'Heavy-duty overlap',
    blurb: 'Double layer top and bottom for heavy parts',
    category: 'shipping',
    style: 'fol',
    dimensions: { length: 45, width: 30, height: 30 },
    ply: '7-ply',
    flutes: ['C', 'B', 'C'],
    colorHex: '#C9A87C',
    finish: 'matte',
    insideColorHex: null,
    showIcons: true,
    art: null,
    texts: [text('front', 'HANDLE WITH CARE', 60, '#17231C', 0.5)],
    tags: ['industrial', 'machinery', 'parts', 'fol'],
  }),
  legacy({
    id: 'moving-box',
    name: 'Moving box',
    blurb: 'Plain carton with a label area',
    category: 'shipping',
    style: 'rsc',
    dimensions: { length: 45, width: 35, height: 35 },
    ply: '5-ply',
    flutes: ['B', 'C'],
    colorHex: '#C9A87C',
    finish: 'matte',
    insideColorHex: null,
    showIcons: true,
    art: null,
    texts: [text('front', 'ROOM: ____________', 54, '#17231C', 0.35, 'Courier New'), text('front', 'CONTENTS: ________', 54, '#17231C', 0.55, 'Courier New')],
    tags: ['storage', 'relocation', 'house shifting'],
  }),

  // ---- Fruit & produce --------------------------------------------------------------------------------------
  define({
    id: 'mango-carton',
    name: 'Mango carton',
    blurb: 'Ventilated 5 kg-style carton with hand holes',
    category: 'produce',
    style: 'produce',
    size: [36, 26, 14],
    board: '5BC',
    color: KRAFT,
    options: { vents: true, handHoles: true },
    ...vented('mango', 'leaf-sprig', 'Your Brand Mangoes', INK),
    tags: ['aam', 'keri', 'fruit', 'summer', 'alphonso'],
  }),
  define({
    id: 'apple-tray',
    name: 'Apple tray',
    blurb: 'Open ventilated tray for apples and pears',
    category: 'produce',
    style: 'produce-tray',
    size: [40, 30, 12],
    board: '3B',
    color: KRAFT,
    options: { vents: true },
    ...vented('apple', 'green-apple', 'Your Brand Apples', INK),
    tags: ['seb', 'fruit', 'orchard', 'pear'],
  }),
  define({
    id: 'grape-box',
    name: 'Grape box',
    blurb: 'Vented 2 kg-style box for grapes',
    category: 'produce',
    style: 'produce',
    size: [30, 20, 12],
    board: '3C',
    color: GREEN,
    options: { vents: true, handHoles: true },
    ...vented('grapes', 'leaf-sprig', 'Your Brand Grapes', CREAM),
    tags: ['angoor', 'draksh', 'fruit', 'vine'],
  }),
  define({
    id: 'banana-carton',
    name: 'Banana carton',
    blurb: 'Tall ventilated carton for bunches',
    category: 'produce',
    style: 'produce',
    size: [50, 35, 22],
    board: '5BC',
    color: KRAFT,
    options: { vents: true, handHoles: true },
    ...vented('banana', 'banana', 'Your Brand Bananas', INK),
    tags: ['kela', 'fruit', 'tropical'],
  }),
  define({
    id: 'citrus-carton',
    name: 'Citrus carton',
    blurb: 'Vented carton for oranges, lemons and limes',
    category: 'produce',
    style: 'produce',
    size: [40, 30, 20],
    board: '5BC',
    color: KRAFT,
    options: { vents: true, handHoles: true },
    ...vented('orange', 'lemon', 'Your Brand Citrus', INK),
    tags: ['santra', 'nimbu', 'orange', 'lemon', 'lime', 'fruit'],
  }),
  define({
    id: 'berry-tray',
    name: 'Berry tray',
    blurb: 'Shallow open tray for small fruit',
    category: 'produce',
    style: 'produce-tray',
    size: [24, 18, 7],
    board: '3E',
    color: WHITE,
    options: { vents: true },
    ...vented('strawberry', 'blueberries', 'Your Brand Berries', INK),
    tags: ['strawberry', 'blueberry', 'cherry', 'punnet', 'fruit'],
  }),
  define({
    id: 'vegetable-crate',
    name: 'Vegetable crate',
    blurb: 'Strong open tray for loose vegetables',
    category: 'produce',
    style: 'produce-tray',
    size: [50, 35, 20],
    board: '5BC',
    color: KRAFT,
    options: { vents: true },
    ...vented('tomato', 'carrot', 'Your Brand Vegetables', INK),
    tags: ['sabzi', 'greens', 'tomato', 'vegetables', 'mandi'],
  }),
  define({
    id: 'tropical-fruit-box',
    name: 'Tropical fruit box',
    blurb: 'Vented box for papaya, guava and similar fruit',
    category: 'produce',
    style: 'produce',
    size: [40, 28, 16],
    board: '5BC',
    color: KRAFT,
    options: { vents: true, handHoles: true },
    ...vented('papaya', 'guava', 'Your Brand Fruit', INK),
    tags: ['papaya', 'guava', 'chikoo', 'pomegranate', 'fruit'],
  }),
  define({
    id: 'dry-fruits-gift',
    name: 'Dry fruits gift box',
    blurb: 'Slide-out gift box for nuts and dry fruit',
    category: 'produce',
    style: 'slide-box',
    size: [24, 18, 6],
    board: '3E',
    color: GREEN,
    inside: CREAM,
    finish: 'gloss',
    stickers: [s('peanuts', 'lid', 0.2, 0.5, 0.42), s('chestnut', 'lid', 0.34, 0.66, 0.26)],
    texts: [T('lid', 'Your Brand', CREAM, 0.42, { x: 0.66, fill: 0.34, font: 'Georgia' }), T('lid', 'DRY FRUITS', SAND, 0.58, { x: 0.66, fill: 0.34 })],
    tags: ['nuts', 'mewa', 'sukha meva', 'almond', 'cashew', 'gift'],
  }),
  define({
    id: 'farm-hamper',
    name: 'Farm basket carton',
    blurb: 'Carry box with hand holes for mixed produce',
    category: 'produce',
    style: 'carry',
    size: [40, 30, 22],
    board: '5BC',
    color: KRAFT,
    options: { handHoles: true },
    stickers: [s('basket', 'front', 0.35, 0.45, 0.5), s('sprout', 'front', 0.68, 0.42, 0.34)],
    texts: [T('front', 'YOUR FARM', INK, 0.86, { fill: 0.4 })],
    tags: ['hamper', 'basket', 'farm shop', 'vegetables'],
  }),

  // ---- Food & bakery ----------------------------------------------------------------------------------------
  define({
    id: 'cake-window-box',
    name: 'Cake box with window',
    blurb: 'Window lid so the cake shows; for 1 kg-style cakes',
    category: 'food',
    style: 'cake-box',
    size: [25, 25, 12],
    board: '3E',
    color: WHITE,
    finish: 'gloss',
    options: { window: true, windowRatio: 0.6 },
    stickers: [s('cake-slice', 'front', 0.17, 0.5, 0.62)],
    texts: [T('front', 'Your Bakery', INK, 0.5, { x: 0.58, fill: 0.5, font: 'Georgia' })],
    tags: ['birthday cake', 'pastry', 'bakery', 'window'],
  }),
  define({
    id: 'cupcake-box',
    name: 'Cupcake box',
    blurb: 'Window box for six cupcakes or muffins',
    category: 'food',
    style: 'cake-box',
    size: [24, 16, 9],
    board: '3E',
    color: PINK,
    options: { window: true, windowRatio: 0.65 },
    stickers: [s('cupcake', 'front', 0.13, 0.5, 0.6), s('cupcake', 'front', 0.87, 0.5, 0.6, { flip: true })],
    texts: [T('front', 'Your Cupcakes', INK, 0.5, { fill: 0.5, font: 'Georgia' })],
    tags: ['muffin', 'dessert', 'bakery'],
  }),
  define({
    id: 'mithai-box',
    name: 'Sweet box (mithai)',
    blurb: 'Flat lid-and-base box for sweets',
    category: 'food',
    style: 'telescope',
    size: [22, 22, 6],
    board: '3E',
    color: RED,
    inside: GOLD,
    finish: 'gloss',
    stickers: [s('divider-diamond', 'lid', 0.5, 0.2, 0.6, { tint: GOLD }), s('sparkles-gift', 'lid', 0.5, 0.48, 0.34), s('divider-diamond', 'lid', 0.5, 0.88, 0.6, { tint: GOLD, flip: true })],
    texts: [T('lid', 'Your Sweets', GOLD, 0.72, { fill: 0.5, font: 'Georgia' })],
    tags: ['mithai', 'sweets', 'laddu', 'barfi', 'festive', 'candy'],
  }),
  define({
    id: 'cookie-clamshell',
    name: 'Cookie box',
    blurb: 'Hinged lid box for cookies and biscuits',
    category: 'food',
    style: 'clamshell',
    size: [18, 14, 6],
    board: '3E',
    color: KRAFT,
    stickers: [s('cookie', 'lid', 0.5, 0.5, 0.5)],
    texts: [T('front', 'Your Cookies', INK, 0.5, { fill: 0.55 })],
    tags: ['biscuit', 'bakery', 'snack'],
  }),
  define({
    id: 'burger-takeaway',
    name: 'Burger takeaway box',
    blurb: 'Hinged clamshell for burgers and wraps',
    category: 'food',
    style: 'clamshell',
    size: [14, 14, 8],
    board: '3E',
    color: KRAFT,
    stickers: [s('burger', 'lid', 0.5, 0.42, 0.5)],
    texts: [T('lid', 'Your Kitchen', INK, 0.84, { fill: 0.55 })],
    tags: ['fast food', 'restaurant', 'sandwich', 'takeaway', 'delivery'],
  }),
  define({
    id: 'honey-jar-box',
    name: 'Honey jar box',
    blurb: 'Crash-lock carton for a 250 g-style jar',
    category: 'food',
    style: 'crash-lock',
    size: [10, 10, 13],
    board: '3E',
    color: YELLOW,
    stickers: [s('honey', 'front', 0.5, 0.36, 0.5), s('bee', 'front', 0.8, 0.14, 0.22)],
    texts: [T('front', 'HONEY', INK, 0.78, { fill: 0.6 })],
    tags: ['jar', 'shahad', 'madh', 'preserve', 'jam'],
  }),
  define({
    id: 'spice-box',
    name: 'Spice box',
    blurb: 'Small tuck-end carton for masala and spices',
    category: 'food',
    style: 'tuck-end',
    size: [8, 8, 12],
    board: '3E',
    color: RED,
    stickers: [s('chilli', 'front', 0.5, 0.36, 0.5)],
    texts: [T('front', 'SPICES', CREAM, 0.72, { fill: 0.6 })],
    tags: ['masala', 'mirch', 'powder', 'seasoning'],
  }),
  define({
    id: 'tea-coffee-box',
    name: 'Tea or coffee box',
    blurb: 'Tuck-end carton for leaf tea and coffee packs',
    category: 'food',
    style: 'tuck-end',
    size: [10, 8, 16],
    board: '3E',
    color: GREEN,
    stickers: [s('teapot', 'front', 0.5, 0.34, 0.5)],
    texts: [T('front', 'TEA', CREAM, 0.72, { fill: 0.4, font: 'Georgia' })],
    tags: ['chai', 'coffee', 'beverage', 'loose leaf'],
  }),
  define({
    id: 'oil-bottle-box',
    name: 'Bottle box (oil, sauce)',
    blurb: 'Tall crash-lock carton for one bottle',
    category: 'food',
    style: 'crash-lock',
    size: [9, 9, 30],
    board: '3C',
    color: KRAFT,
    stickers: [s('olive', 'front', 0.5, 0.26, 0.5), s('water-drop', 'front', 0.5, 0.82, 0.22)],
    texts: [T('front', 'YOUR OIL', INK, 0.55, { fill: 0.7 })],
    tags: ['bottle', 'juice', 'sauce', 'syrup', 'edible oil'],
  }),
  legacy({
    id: 'pizza-box',
    name: 'Pizza box',
    blurb: '12-inch takeaway box',
    category: 'food',
    style: 'pizza',
    dimensions: { length: 31, width: 31, height: 5 },
    ply: '3-ply',
    flutes: ['E'],
    colorHex: '#C9A87C',
    finish: 'matte',
    insideColorHex: '#F5F5F0',
    showIcons: false,
    art: { id: 'pizza', face: 'lid', position: { x: 0.2, y: 0.5 }, scale: 0.8 },
    texts: [text('lid', 'HOT & FRESH', 36, '#A8352E', 0.5, 'Inter', 0.64)],
    tags: ['takeaway', 'delivery', 'restaurant'],
  }),
  legacy({
    id: 'bakery-tray',
    name: 'Bakery tray',
    blurb: 'Open tray for cakes and sweets',
    category: 'food',
    style: 'tray',
    dimensions: { length: 25, width: 25, height: 7 },
    ply: '3-ply',
    flutes: ['E'],
    colorHex: '#F5F5F0',
    finish: 'matte',
    insideColorHex: null,
    showIcons: false,
    art: { id: 'cupcake', face: 'front', position: { x: 0.2, y: 0.5 }, scale: 0.85 },
    texts: [text('front', 'Fresh from the oven', 28, '#8B6F47', 0.5, 'Inter', 0.64)],
    tags: ['cake', 'sweets', 'pastry'],
  }),
  legacy({
    id: 'wine-bottle',
    name: 'Bottle box',
    blurb: 'Tall carton for one 1 L bottle',
    category: 'food',
    style: 'rsc',
    dimensions: { length: 10, width: 10, height: 33 },
    ply: '5-ply',
    flutes: ['B', 'C'],
    colorHex: '#8B6F47',
    finish: 'matte',
    insideColorHex: null,
    showIcons: true,
    art: { id: 'grapes', face: 'front', position: { x: 0.5, y: 0.3 }, scale: 0.7 },
    texts: [text('front', 'RESERVE', 28, '#E8D5B3', 0.55)],
    tags: ['wine', 'oil', 'drink', 'glass'],
  }),

  // ---- Clothing & fashion -----------------------------------------------------------------------------------
  legacy({
    id: 'apparel-mailer',
    name: 'Apparel mailer',
    blurb: 'Tuck-top unboxing for clothing brands',
    category: 'clothing',
    style: 'mailer',
    dimensions: { length: 30, width: 23, height: 6 },
    ply: '3-ply',
    flutes: ['E'],
    colorHex: '#F5F5F0',
    finish: 'matte',
    insideColorHex: '#E6A9B8',
    showIcons: false,
    art: { id: 'hanger', face: 'lid', position: { x: 0.3, y: 0.5 }, scale: 0.7 },
    texts: [text('lid', 'Your Label', 40, '#17231C', 0.5, 'Inter', 0.64)],
    tags: ['garment', 'fashion', 'online store', 'unboxing'],
  }),
  define({
    id: 'tshirt-mailer',
    name: 'T-shirt mailer',
    blurb: 'Flat tuck-top mailer for folded tees',
    category: 'clothing',
    style: 'mailer',
    size: [30, 24, 5],
    board: '3E',
    color: WHITE,
    inside: NAVY,
    stickers: [s('t-shirt', 'lid', 0.27, 0.5, 0.58)],
    texts: [T('lid', 'Your Label', INK, 0.5, { x: 0.68, fill: 0.38 })],
    tags: ['tee', 'shirt', 'apparel', 'online store'],
  }),
  define({
    id: 'saree-box',
    name: 'Saree box',
    blurb: 'Wide lid-and-base box for a folded saree',
    category: 'clothing',
    style: 'telescope',
    size: [38, 28, 8],
    board: '3B',
    color: GOLD,
    inside: WHITE,
    finish: 'gloss',
    stickers: [s('saree', 'lid', 0.3, 0.5, 0.55)],
    texts: [T('lid', 'SAREE', INK, 0.42, { x: 0.7, fill: 0.3, font: 'Georgia' }), T('lid', 'Your Label', INK, 0.58, { x: 0.7, fill: 0.3 })],
    tags: ['sari', 'ethnic', 'garment', 'wedding'],
  }),
  define({
    id: 'kidswear-box',
    name: 'Kidswear box',
    blurb: 'Window mailer for children’s clothes',
    category: 'clothing',
    style: 'window-mailer',
    size: [26, 20, 6],
    board: '3E',
    color: YELLOW,
    options: { window: true, windowRatio: 0.55 },
    stickers: [s('teddy-bear', 'front', 0.1, 0.5, 0.8), s('star', 'front', 0.9, 0.5, 0.5)],
    texts: [T('front', 'Your Kids Wear', INK, 0.5, { fill: 0.5 })],
    tags: ['baby', 'children', 'garment', 'frock'],
  }),
  define({
    id: 'sandal-box',
    name: 'Sandal or slipper box',
    blurb: 'Lid-and-base box for one pair',
    category: 'clothing',
    style: 'telescope',
    size: [30, 15, 9],
    board: '3B',
    color: WHITE,
    stickers: [s('sandal', 'lid', 0.28, 0.5, 0.6)],
    texts: [T('lid', 'Your Footwear', INK, 0.5, { x: 0.68, fill: 0.4 })],
    tags: ['chappal', 'flip flop', 'footwear', 'shoes'],
  }),
  define({
    id: 'handloom-box',
    name: 'Handloom gift box',
    blurb: 'Book-style box for scarves and stoles',
    category: 'clothing',
    style: 'book-box',
    size: [30, 24, 6],
    board: '3E',
    color: KRAFT,
    stickers: [s('yarn', 'lid', 0.26, 0.5, 0.5), s('needle', 'lid', 0.4, 0.62, 0.28, { rotation: -20 })],
    texts: [T('lid', 'Handloom', INK, 0.5, { x: 0.7, fill: 0.34, font: 'Georgia' })],
    tags: ['scarf', 'stole', 'dupatta', 'textile', 'thread'],
  }),
  define({
    id: 'accessories-box',
    name: 'Accessories box',
    blurb: 'Slide-out box for sunglasses and small accessories',
    category: 'clothing',
    style: 'slide-box',
    size: [20, 14, 5],
    board: '3E',
    color: PINK,
    stickers: [s('sunglasses', 'lid', 0.27, 0.5, 0.5)],
    texts: [T('lid', 'Your Accessories', INK, 0.5, { x: 0.68, fill: 0.4 })],
    tags: ['belt', 'sunglasses', 'wallet', 'fashion'],
  }),
  define({
    id: 'jewellery-box',
    name: 'Jewellery gift box',
    blurb: 'Hinged book box with a coloured lining',
    category: 'clothing',
    style: 'book-box',
    size: [16, 12, 5],
    board: '3E',
    color: BLACK,
    inside: GOLD,
    finish: 'gloss',
    stickers: [s('ring', 'lid', 0.5, 0.38, 0.4)],
    texts: [T('lid', 'Your Jewels', GOLD, 0.76, { fill: 0.6, font: 'Georgia' })],
    tags: ['ring', 'necklace', 'earrings', 'gem', 'ornament'],
  }),
  define({
    id: 'watch-box',
    name: 'Watch box',
    blurb: 'Compact book box for a wristwatch',
    category: 'clothing',
    style: 'book-box',
    size: [14, 14, 8],
    board: '3E',
    color: BLACK,
    inside: CREAM,
    stickers: [s('watch', 'lid', 0.5, 0.4, 0.46)],
    texts: [T('lid', 'Your Watches', SAND, 0.78, { fill: 0.6, font: 'Georgia' })],
    tags: ['timepiece', 'accessory', 'gift'],
  }),
  define({
    id: 'shoe-box',
    name: 'Shoe box',
    blurb: 'Two-piece box sized for a pair of shoes',
    category: 'clothing',
    style: 'telescope',
    size: [33, 20, 12],
    board: '3B',
    color: WHITE,
    stickers: [s('sneaker', 'lid', 0.25, 0.5, 0.6)],
    texts: [T('lid', 'SIZE 9 · UK', INK, 0.5, { x: 0.64, fill: 0.4 })],
    tags: ['sneaker', 'footwear', 'boots', 'pair'],
  }),

  // ---- Beauty & wellness ------------------------------------------------------------------------------------
  define({
    id: 'soap-box',
    name: 'Soap box',
    blurb: 'Small tuck-end carton for a bar of soap',
    category: 'beauty',
    style: 'tuck-end',
    size: [10, 7, 5],
    board: '3E',
    color: WHITE,
    stickers: [s('soap', 'front', 0.2, 0.5, 0.7), s('lotus', 'lid', 0.5, 0.5, 0.5)],
    texts: [T('front', 'Your Soap', INK, 0.5, { x: 0.62, fill: 0.5 })],
    tags: ['bar', 'handmade soap', 'bath', 'wash'],
  }),
  define({
    id: 'perfume-carton',
    name: 'Perfume carton',
    blurb: 'Tall black carton with a gold-ink look',
    category: 'beauty',
    style: 'tuck-end',
    size: [8, 8, 14],
    board: '3E',
    color: BLACK,
    finish: 'gloss',
    stickers: [s('shape-crescent', 'front', 0.5, 0.26, 0.28, { tint: GOLD })],
    texts: [T('front', 'YOUR BRAND', GOLD, 0.52, { fill: 0.72, font: 'Georgia' }), T('front', 'PERFUME', SAND, 0.66, { fill: 0.4 })],
    tags: ['fragrance', 'attar', 'scent', 'bottle'],
  }),
  define({
    id: 'skincare-set',
    name: 'Skincare set box',
    blurb: 'Slide-out box for a small gift set',
    category: 'beauty',
    style: 'slide-box',
    size: [24, 18, 7],
    board: '3E',
    color: PINK,
    inside: WHITE,
    stickers: [s('lotion', 'lid', 0.27, 0.5, 0.56), s('lotus', 'lid', 0.42, 0.28, 0.22)],
    texts: [T('lid', 'Skincare Set', INK, 0.44, { x: 0.7, fill: 0.36, font: 'Georgia' }), T('lid', 'Your Brand', INK, 0.58, { x: 0.7, fill: 0.3 })],
    tags: ['cream', 'face', 'lotion', 'gift set', 'cosmetics'],
  }),
  define({
    id: 'candle-box',
    name: 'Candle box',
    blurb: 'Square tuck-end carton for a jar candle',
    category: 'beauty',
    style: 'tuck-end',
    size: [9, 9, 10],
    board: '3E',
    color: GREEN,
    stickers: [s('candle', 'front', 0.5, 0.38, 0.5)],
    texts: [T('front', 'CANDLE', CREAM, 0.76, { fill: 0.6, font: 'Georgia' })],
    tags: ['diya', 'wax', 'home fragrance', 'aroma'],
  }),
  define({
    id: 'incense-box',
    name: 'Incense stick box',
    blurb: 'Slim, tall tuck-end carton',
    category: 'beauty',
    style: 'tuck-end',
    size: [6, 5, 25],
    board: '3E',
    color: KRAFT,
    stickers: [s('lotus', 'front', 0.5, 0.2, 0.8), s('sparkles', 'front', 0.5, 0.78, 0.5)],
    texts: [T('front', 'INCENSE', INK, 0.5, { fill: 0.72 })],
    tags: ['agarbatti', 'dhoop', 'fragrance', 'sticks', 'wellness'],
  }),

  // ---- Electronics & gadgets --------------------------------------------------------------------------------
  define({
    id: 'phone-accessory-box',
    name: 'Phone accessory box',
    blurb: 'Slim tuck-end carton for cases and cables',
    category: 'electronics',
    style: 'tuck-end',
    size: [16, 8, 6],
    board: '3E',
    color: WHITE,
    stickers: [s('mobile-phone', 'front', 0.14, 0.5, 0.7)],
    texts: [T('front', 'Your Phone Case', INK, 0.5, { x: 0.58, fill: 0.55 })],
    tags: ['mobile', 'cover', 'cable', 'gadget'],
  }),
  define({
    id: 'earbuds-window-box',
    name: 'Earbuds window box',
    blurb: 'Tuck-end carton with a window to show the product',
    category: 'electronics',
    style: 'tuck-end',
    size: [12, 6, 12],
    board: '3E',
    color: BLACK,
    options: { window: true, windowRatio: 0.5 },
    stickers: [s('headphones', 'lid', 0.26, 0.5, 0.6)],
    texts: [T('lid', 'Your Audio', CREAM, 0.5, { x: 0.7, fill: 0.4 })],
    tags: ['headphones', 'headset', 'audio', 'gadget'],
  }),
  define({
    id: 'charger-box',
    name: 'Charger box',
    blurb: 'Compact carton for chargers and adapters',
    category: 'electronics',
    style: 'tuck-end',
    size: [14, 8, 6],
    board: '3E',
    color: WHITE,
    stickers: [s('plug', 'front', 0.18, 0.5, 0.7)],
    texts: [T('front', 'Your Charger', INK, 0.5, { x: 0.58, fill: 0.55 })],
    tags: ['adapter', 'power', 'cable', 'battery'],
  }),
  define({
    id: 'small-appliance-carton',
    name: 'Small appliance carton',
    blurb: 'Strong carton with handling marks for kitchen and home gadgets',
    category: 'electronics',
    style: 'rsc',
    size: [30, 24, 24],
    board: '5BC',
    color: KRAFT,
    stickers: [
      s('light-bulb', 'front', 0.5, 0.34, 0.34),
      s('mark-fragile', 'front', 0.14, 0.82, 0.2, { tint: RED }),
      s('mark-this-way-up', 'front', 0.86, 0.82, 0.2, { tint: INK }),
    ],
    texts: [T('front', 'YOUR BRAND', INK, 0.68, { fill: 0.5 })],
    tags: ['mixer', 'kettle', 'iron', 'appliance', 'gadget'],
  }),

  // ---- Gifts & festive --------------------------------------------------------------------------------------
  legacy({
    id: 'gift-box',
    name: 'Gift box',
    blurb: 'Lid-and-base box for festive gifting',
    category: 'gifts',
    style: 'telescope',
    dimensions: { length: 20, width: 20, height: 10 },
    ply: '3-ply',
    flutes: ['E'],
    colorHex: '#2B2B2D',
    finish: 'gloss',
    insideColorHex: '#D9B77E',
    showIcons: false,
    art: { id: 'bow', face: 'lid', position: { x: 0.5, y: 0.5 }, scale: 0.6 },
    texts: [],
    tags: ['present', 'hamper', 'festive', 'birthday'],
  }),
  define({
    id: 'festive-gift-box',
    name: 'Festive gift box',
    blurb: 'Red and gold box for the festival season',
    category: 'gifts',
    style: 'telescope',
    size: [26, 26, 8],
    board: '3E',
    color: RED,
    inside: GOLD,
    finish: 'gloss',
    stickers: [s('divider-stars', 'lid', 0.5, 0.16, 0.7, { tint: GOLD }), s('sparkler', 'lid', 0.5, 0.48, 0.42)],
    texts: [T('lid', 'Festive Gift', GOLD, 0.82, { fill: 0.5, font: 'Georgia' })],
    tags: ['diwali', 'festival', 'celebration', 'sparkler', 'mithai'],
  }),
  define({
    id: 'wedding-favour-box',
    name: 'Wedding favour box',
    blurb: 'Small box for guest gifts and sweets',
    category: 'gifts',
    style: 'telescope',
    size: [12, 12, 6],
    board: '3E',
    color: WHITE,
    inside: PINK,
    stickers: [s('heart-with-ribbon', 'lid', 0.5, 0.5, 0.55)],
    tags: ['shaadi', 'return gift', 'party', 'ring', 'favour'],
  }),
  define({
    id: 'rakhi-box',
    name: 'Rakhi gift box',
    blurb: 'Flat slide-out box for a rakhi and sweets',
    category: 'gifts',
    style: 'slide-box',
    size: [20, 14, 5],
    board: '3E',
    color: GOLD,
    inside: CREAM,
    stickers: [s('rosette', 'lid', 0.26, 0.5, 0.6)],
    texts: [T('lid', 'Rakhi Gift', INK, 0.44, { x: 0.7, fill: 0.34, font: 'Georgia' }), T('lid', 'Your Brand', INK, 0.58, { x: 0.7, fill: 0.3 })],
    tags: ['raksha bandhan', 'festival', 'sibling', 'sweets'],
  }),
  define({
    id: 'corporate-gift-box',
    name: 'Corporate gift box',
    blurb: 'Hinged navy book box for client gifts',
    category: 'gifts',
    style: 'book-box',
    size: [30, 22, 8],
    board: '3E',
    color: NAVY,
    inside: WHITE,
    finish: 'gloss',
    stickers: [s('frame-corners', 'lid', 0.5, 0.5, 0.82, { tint: GOLD }), s('divider-double', 'lid', 0.5, 0.62, 0.4, { tint: GOLD })],
    texts: [T('lid', 'YOUR COMPANY', CREAM, 0.46, { fill: 0.45, font: 'Georgia' })],
    tags: ['employee', 'client', 'corporate', 'office', 'diwali gifting'],
  }),
  define({
    id: 'christmas-gift-box',
    name: 'Winter gift box',
    blurb: 'Green box with snowflake art; no religious symbols',
    category: 'gifts',
    style: 'telescope',
    size: [24, 24, 10],
    board: '3E',
    color: GREEN,
    inside: CREAM,
    stickers: [s('snowflake', 'lid', 0.5, 0.42, 0.5), s('bell', 'lid', 0.14, 0.14, 0.2), s('bell', 'lid', 0.86, 0.14, 0.2, { flip: true })],
    texts: [T('lid', 'Warm Wishes', CREAM, 0.84, { fill: 0.5, font: 'Georgia' })],
    tags: ['christmas', 'new year', 'winter', 'holiday', 'season'],
  }),
  define({
    id: 'hamper-carry-box',
    name: 'Gift hamper carry box',
    blurb: 'Carry box with hand holes for mixed hampers',
    category: 'gifts',
    style: 'carry',
    size: [40, 30, 24],
    board: '5BC',
    color: KRAFT,
    options: { handHoles: true },
    stickers: [s('gift', 'front', 0.36, 0.45, 0.48), s('ribbon', 'front', 0.66, 0.4, 0.34)],
    texts: [T('front', 'Your Hamper', INK, 0.86, { fill: 0.4, font: 'Georgia' })],
    tags: ['basket', 'combo', 'festive', 'gift basket'],
  }),

  // ---- Home & kitchen ---------------------------------------------------------------------------------------
  define({
    id: 'kitchenware-carton',
    name: 'Kitchenware carton',
    blurb: 'Strong carton for pans, plates and cookware',
    category: 'home',
    style: 'rsc',
    size: [40, 30, 25],
    board: '5BC',
    color: KRAFT,
    stickers: [
      s('frying-pan', 'front', 0.22, 0.4, 0.38),
      s('dinner-plate', 'front', 0.78, 0.4, 0.38),
      s('mark-fragile', 'front', 0.92, 0.84, 0.16, { tint: RED }),
    ],
    texts: [T('front', 'Your Kitchenware', INK, 0.82, { x: 0.46, fill: 0.5 })],
    tags: ['utensils', 'cookware', 'steel', 'crockery'],
  }),
  define({
    id: 'home-decor-box',
    name: 'Home decor gift box',
    blurb: 'Wide lid-and-base box for decor and small furnishing',
    category: 'home',
    style: 'telescope',
    size: [34, 34, 12],
    board: '3B',
    color: WHITE,
    stickers: [s('couch-and-lamp', 'lid', 0.5, 0.42, 0.46)],
    texts: [T('lid', 'Your Home', INK, 0.82, { fill: 0.45, font: 'Georgia' })],
    tags: ['decor', 'furnishing', 'candle', 'cushion', 'lamp'],
  }),
  define({
    id: 'hardware-carry-box',
    name: 'Hardware carry box',
    blurb: 'Carry box for tools and fixtures',
    category: 'home',
    style: 'carry',
    size: [35, 22, 14],
    board: '5BC',
    color: KRAFT,
    options: { handHoles: true },
    stickers: [s('toolbox', 'front', 0.2, 0.5, 0.6), s('hammer', 'front', 0.36, 0.5, 0.45, { rotation: 20 })],
    texts: [T('front', 'Your Tools', INK, 0.5, { x: 0.7, fill: 0.34 })],
    tags: ['tools', 'spanner', 'fixtures', 'diy'],
  }),

  // ---- Toys & kids ------------------------------------------------------------------------------------------
  define({
    id: 'toy-window-box',
    name: 'Toy window box',
    blurb: 'Window mailer so the toy shows through the lid',
    category: 'toys',
    style: 'window-mailer',
    size: [30, 22, 10],
    board: '3E',
    color: YELLOW,
    options: { window: true, windowRatio: 0.6 },
    stickers: [s('teddy-bear', 'front', 0.15, 0.5, 0.78), s('rocket', 'front', 0.85, 0.5, 0.78)],
    texts: [T('front', 'Your Toys', INK, 0.5, { fill: 0.4 })],
    tags: ['kids', 'game', 'play', 'doll', 'teddy'],
  }),
  define({
    id: 'activity-kit-box',
    name: 'Kids activity kit',
    blurb: 'Flat mailer for craft and activity kits',
    category: 'toys',
    style: 'mailer',
    size: [26, 20, 6],
    board: '3E',
    color: NAVY,
    inside: CREAM,
    stickers: [s('rainbow', 'lid', 0.26, 0.5, 0.6), s('crayon', 'lid', 0.42, 0.7, 0.32, { rotation: 25 })],
    texts: [T('lid', 'Activity Kit', CREAM, 0.5, { x: 0.7, fill: 0.36, font: 'Georgia' })],
    tags: ['craft', 'diy', 'learning', 'colouring'],
  }),
  define({
    id: 'toy-carry-box',
    name: 'Play set carry box',
    blurb: 'Carry box with hand holes for toy sets',
    category: 'toys',
    style: 'carry',
    size: [35, 25, 18],
    board: '3B',
    color: PINK,
    options: { handHoles: true },
    stickers: [s('carousel-horse', 'front', 0.5, 0.42, 0.5), s('star', 'front', 0.2, 0.2, 0.2), s('star', 'front', 0.8, 0.2, 0.2)],
    texts: [T('front', 'Play Set', INK, 0.84, { fill: 0.4 })],
    tags: ['blocks', 'kids', 'games', 'toy'],
  }),

  // ---- Stationery & books -----------------------------------------------------------------------------------
  define({
    id: 'book-gift-box',
    name: 'Book or diary box',
    blurb: 'Hinged book-style box for diaries and notebooks',
    category: 'stationery',
    style: 'book-box',
    size: [26, 19, 5],
    board: '3E',
    color: KRAFT,
    stickers: [s('frame-rounded', 'lid', 0.5, 0.5, 0.86, { tint: INK }), s('divider-dots', 'lid', 0.5, 0.64, 0.3, { tint: INK })],
    texts: [T('lid', 'YOUR TITLE', INK, 0.46, { fill: 0.42, font: 'Georgia' })],
    tags: ['notebook', 'diary', 'journal', 'novel', 'planner'],
  }),
  define({
    id: 'stationery-set-box',
    name: 'Stationery set box',
    blurb: 'Slide-out box for pens, pencils and art sets',
    category: 'stationery',
    style: 'slide-box',
    size: [26, 18, 6],
    board: '3E',
    color: NAVY,
    inside: CREAM,
    stickers: [s('crayon', 'lid', 0.2, 0.5, 0.5, { rotation: -15 }), s('paintbrush', 'lid', 0.34, 0.5, 0.5, { rotation: 15 })],
    texts: [T('lid', 'Art Set', CREAM, 0.46, { x: 0.7, fill: 0.34, font: 'Georgia' }), T('lid', 'Your Brand', SAND, 0.6, { x: 0.7, fill: 0.3 })],
    tags: ['pens', 'pencils', 'art', 'school', 'office'],
  }),
  define({
    id: 'print-mailer',
    name: 'Print and poster mailer',
    blurb: 'Flat mailer for prints, cards and documents',
    category: 'stationery',
    style: 'mailer',
    size: [34, 26, 5],
    board: '3E',
    color: KRAFT,
    stickers: [s('paper-roll', 'lid', 0.24, 0.5, 0.55)],
    texts: [T('lid', 'Your Prints', INK, 0.5, { x: 0.68, fill: 0.4 })],
    tags: ['poster', 'art print', 'cards', 'documents', 'flat'],
  }),

  // ---- Pets -------------------------------------------------------------------------------------------------
  define({
    id: 'pet-treat-box',
    name: 'Pet treat box',
    blurb: 'Crash-lock carton for treats and pouches',
    category: 'pets',
    style: 'crash-lock',
    size: [14, 9, 20],
    board: '3E',
    color: KRAFT,
    stickers: [s('dog', 'front', 0.5, 0.28, 0.5), s('paw-prints', 'front', 0.5, 0.84, 0.18)],
    texts: [T('front', 'Pet Treats', INK, 0.6, { fill: 0.7 })],
    tags: ['dog', 'cat', 'pet food', 'biscuits'],
  }),
  define({
    id: 'cat-toy-window-box',
    name: 'Cat toy window box',
    blurb: 'Window mailer for pet toys and accessories',
    category: 'pets',
    style: 'window-mailer',
    size: [24, 18, 8],
    board: '3E',
    color: PINK,
    options: { window: true, windowRatio: 0.55 },
    stickers: [s('cat', 'front', 0.16, 0.5, 0.8), s('paw-prints', 'front', 0.88, 0.5, 0.6)],
    texts: [T('front', 'Cat Toys', INK, 0.5, { fill: 0.4 })],
    tags: ['pet', 'kitten', 'toy', 'accessories'],
  }),

  // ---- Plants & flowers -------------------------------------------------------------------------------------
  define({
    id: 'plant-carry-box',
    name: 'Plant carry box',
    blurb: 'Carry box with hand holes for potted plants',
    category: 'plants',
    style: 'carry',
    size: [30, 25, 28],
    board: '3C',
    color: KRAFT,
    options: { handHoles: true },
    stickers: [s('potted-plant', 'front', 0.5, 0.42, 0.5)],
    texts: [T('front', 'Your Plants', INK, 0.84, { fill: 0.45, font: 'Georgia' })],
    tags: ['nursery', 'pot', 'garden', 'sapling'],
  }),
  define({
    id: 'flower-box',
    name: 'Flower box',
    blurb: 'Long vented box for cut flowers',
    category: 'plants',
    style: 'produce',
    size: [60, 25, 16],
    board: '3C',
    color: WHITE,
    options: { vents: true, handHoles: true },
    ...vented('tulip', 'rose', 'Your Flowers', INK, 0.36),
    tags: ['bouquet', 'florist', 'gulab', 'cut flowers'],
  }),
  define({
    id: 'seed-kit-box',
    name: 'Seed or grow kit box',
    blurb: 'Small tuck-end carton for seeds and starter kits',
    category: 'plants',
    style: 'tuck-end',
    size: [12, 8, 16],
    board: '3E',
    color: KRAFT,
    stickers: [s('seedling', 'front', 0.5, 0.28, 0.5), s('sprout', 'front', 0.5, 0.86, 0.2)],
    texts: [T('front', 'SEED KIT', INK, 0.6, { fill: 0.7 })],
    tags: ['seeds', 'gardening', 'grow', 'herb', 'sapling'],
  }),

  // ---- Shop displays ----------------------------------------------------------------------------------------
  legacy({
    id: 'display-tray',
    name: 'Shelf display tray',
    blurb: 'Open-top carton for counters and shelves',
    category: 'display',
    style: 'hsc',
    dimensions: { length: 35, width: 25, height: 12 },
    ply: '3-ply',
    flutes: ['B'],
    colorHex: '#A8352E',
    finish: 'matte',
    insideColorHex: null,
    showIcons: false,
    art: { id: 'tag', face: 'front', position: { x: 0.2, y: 0.5 }, scale: 0.8 },
    texts: [text('front', 'NEW ARRIVAL', 40, '#FBF8F3', 0.5, 'Inter', 0.64)],
    tags: ['counter', 'retail', 'shop', 'pos'],
  }),
  define({
    id: 'snack-counter-tray',
    name: 'Snack counter display',
    blurb: 'Cut-down front so packs can be picked straight off',
    category: 'display',
    style: 'shelf-tray',
    size: [32, 22, 10],
    board: '3E',
    color: RED,
    options: { frontCut: 0.55 },
    // the cut-down front is a strip only 4-5 cm high: keep the artwork centred on it
    stickers: [s('popcorn', 'front', 0.09, 0.5, 0.7)],
    texts: [T('front', 'Grab a Snack', CREAM, 0.5, { x: 0.58, fill: 0.5 })],
    tags: ['counter', 'retail', 'chips', 'confectionery', 'pos', 'shelf'],
  }),
  define({
    id: 'cosmetics-counter-tray',
    name: 'Cosmetics counter display',
    blurb: 'Open front tray for lipsticks, polishes and minis',
    category: 'display',
    style: 'shelf-tray',
    size: [28, 18, 9],
    board: '3E',
    color: PINK,
    options: { frontCut: 0.5 },
    stickers: [s('lipstick', 'front', 0.09, 0.5, 0.7)],
    texts: [T('front', 'Your Beauty', INK, 0.5, { x: 0.58, fill: 0.5, font: 'Georgia' })],
    tags: ['counter', 'retail', 'makeup', 'pos', 'shelf'],
  }),
  legacy({
    id: 'product-sleeve',
    name: 'Product sleeve',
    blurb: 'Printed band that slides over a tray',
    category: 'display',
    style: 'sleeve',
    dimensions: { length: 20, width: 15, height: 6 },
    ply: '3-ply',
    flutes: ['E'],
    colorHex: '#F5F5F0',
    finish: 'gloss',
    insideColorHex: null,
    showIcons: false,
    art: { id: 'leaf', face: 'front', position: { x: 0.2, y: 0.5 }, scale: 0.8 },
    texts: [text('front', 'Your product', 30, '#1B6A2F', 0.5, 'Inter', 0.64)],
    tags: ['band', 'wrap', 'tray', 'food'],
  }),
];

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'produce', label: 'Fruit & produce' },
  { id: 'food', label: 'Food & bakery' },
  { id: 'clothing', label: 'Clothing & fashion' },
  { id: 'beauty', label: 'Beauty & wellness' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'gifts', label: 'Gifts & festive' },
  { id: 'home', label: 'Home & kitchen' },
  { id: 'toys', label: 'Toys & kids' },
  { id: 'stationery', label: 'Stationery & books' },
  { id: 'pets', label: 'Pets' },
  { id: 'plants', label: 'Plants & flowers' },
  { id: 'display', label: 'Shop displays' },
  { id: 'shipping', label: 'Shipping & export' },
];

export const categoryLabel = (id: TemplateCategory) => TEMPLATE_CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** Templates shown first in Quick start (ids; unknown ids are ignored) */
export const POPULAR_TEMPLATE_IDS = [
  'ecommerce-shipper',
  'tshirt-mailer',
  'cake-window-box',
  'mango-carton',
  'gift-box',
  'fragile-shipper',
  'honey-jar-box',
  'jewellery-box',
  'pizza-box',
  'perfume-carton',
] as const;

export function availableTemplates(isAvailable: (s: BoxTemplate) => boolean = hasStyleModel): DesignTemplate[] {
  return DESIGN_TEMPLATES.filter((t) => isAvailable(t.style));
}

export function findTemplate(id: string | null | undefined): DesignTemplate | undefined {
  return id ? DESIGN_TEMPLATES.find((t) => t.id === id) : undefined;
}

const norm = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();

/**
 * Gallery search: every word must match the name, blurb, category, tags or style words (prefix or substring).
 * `styleLabel` is passed in so this stays free of the style registry text.
 */
export function matchTemplates(list: DesignTemplate[], query: string, styleLabel: (style: BoxTemplate) => string = (st) => st): DesignTemplate[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean).slice(0, 6);
  if (!tokens.length) return list;
  return list.filter((t) => {
    const haystack = norm([t.name, t.blurb, categoryLabel(t.category), styleLabel(t.style), t.style, ...t.tags].join(' '));
    return tokens.every((token) => haystack.includes(token));
  });
}

/**
 * The most relevant few templates for Quick start: ones of the current style first (popular before the rest), then
 * popular ones of other styles. Never more than `limit`; no duplicates.
 */
export function suggestedTemplates(style: BoxTemplate, limit = 4, list: DesignTemplate[] = availableTemplates()): DesignTemplate[] {
  const rank = (t: DesignTemplate) => {
    const i = (POPULAR_TEMPLATE_IDS as readonly string[]).indexOf(t.id);
    return i === -1 ? 999 : i;
  };
  const sameStyle = list.filter((t) => t.style === style).sort((a, b) => rank(a) - rank(b));
  const popular = list.filter((t) => t.style !== style && rank(t) < 999).sort((a, b) => rank(a) - rank(b));
  return [...sameStyle, ...popular].slice(0, limit);
}

/** Cutouts of a template as design stickers (fresh ids each time) */
export function stickersFromTemplate(template: Pick<DesignTemplate, 'stickers'>): StickerPlacement[] {
  return template.stickers.map((t) =>
    clampSticker(
      makeSticker(t.id, t.face, {
        position: { x: t.x, y: t.y },
        scale: t.scale,
        rotation: t.rotation ?? 0,
        flip: t.flip ?? false,
        tint: t.tint ?? null,
        opacity: t.opacity ?? 1,
      })
    )
  );
}

/** Build a full design from a template, keeping the user's display unit and quantity */
export function designFromTemplate(template: DesignTemplate, keep: Partial<Pick<BoxDesign, 'unit' | 'quantity'>> = {}): BoxDesign {
  return {
    ...DEFAULT_DESIGN,
    unit: keep.unit ?? DEFAULT_DESIGN.unit,
    quantity: keep.quantity ?? DEFAULT_DESIGN.quantity,
    template: template.style,
    dimensions: { ...template.dimensions },
    ply: template.ply,
    flutes: [...template.flutes],
    colorHex: template.colorHex,
    finish: template.finish,
    insideColorHex: template.insideColorHex,
    showIcons: template.showIcons,
    lidDepth: null,
    name: template.name,
    faceImages: template.art
      ? [{ face: template.art.face, imageUrl: templateArtUrl(template.art.id), position: { ...template.art.position }, scale: template.art.scale, rotation: 0 }]
      : [],
    textElements: template.texts.map((t, i) => ({ ...t, position: { ...t.position }, id: `tpl-${template.id}-${i}` })),
    stickers: stickersFromTemplate(template),
    options: { ...DEFAULT_OPTIONS, ...template.options },
  };
}
