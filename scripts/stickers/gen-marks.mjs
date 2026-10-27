/**
 * Original handling and shipping marks (one colour, line style, 64x64). Simple pictograms in the spirit of
 * common carton handling symbols, drawn for this site. They are decorative stickers, not a compliance claim.
 */
import { svg, el, path, circle, rect, INK } from './lib.mjs';

const S = { stroke: INK, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
const line = (d, extra = {}) => path(d, 'none', { ...S, ...extra });
const mk = (id, name, tags, body) => ({ id, name, category: 'shipping-marks', tags: tags.split(/\s+/), kind: 'mono', svg: svg(64, 64, body) });

const box = (x, y, w, h) => rect(x, y, w, h, 'none', { ...S, rx: 1.5 });
const cross = (cx, cy, r) => line(`M${cx - r} ${cy - r}L${cx + r} ${cy + r}M${cx + r} ${cy - r}L${cx - r} ${cy + r}`, { 'stroke-width': 3.6 });
const noRing = () => circle(32, 32, 28, 'none', S) + line('M12.2 51.8L51.8 12.2');

export const MARKS = [
  mk('mark-fragile', 'Fragile glass', 'fragile glass handle care breakable nazuk',
    line('M20 8h24c0 12-4 20-12 22-8-2-12-10-12-22z') + line('M32 30v20M22 54h20') + line('M30 8l-3 7 5 3-3 7', { 'stroke-width': 2.4 })),
  mk('mark-this-way-up', 'This way up', 'this side up arrows upward direction oopar',
    line('M20 56V12M10 22l10-10 10 10') + line('M44 56V12M34 22l10-10 10 10')),
  mk('mark-keep-dry', 'Keep dry', 'umbrella rain water wet protect sukha',
    line('M8 30C8 16 19 8 32 8s24 8 24 22z') + line('M32 30v18a5 5 0 0 1-10 0') + line('M14 40l-2 6M46 40l-2 6M54 44l-2 6M38 54l-2 6', { 'stroke-width': 2.8 })),
  mk('mark-keep-from-heat', 'Keep away from heat', 'sun hot heat temperature protect garmi',
    circle(32, 32, 10, 'none', S) + line('M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.6 5.6M44.8 44.8l5.6 5.6M13.6 50.4l5.6-5.6M44.8 19.2l5.6-5.6')),
  mk('mark-keep-cool', 'Keep cool', 'snowflake cold chilled temperature thanda',
    line('M32 6v52M9.5 19l45 26M9.5 45l45-26')),
  mk('mark-do-not-stack', 'Do not stack', 'no stack boxes pile limit nahi',
    box(14, 30, 36, 24) + box(18, 12, 28, 16) + noRing()),
  mk('mark-stack-limit', 'Stack limit', 'stack boxes pile maximum limit',
    box(12, 42, 40, 14) + box(12, 27, 40, 14) + box(12, 12, 40, 14) + line('M56 12v44M52 12h4M52 56h4', { 'stroke-width': 2.4 })),
  mk('mark-handle-with-care', 'Handle with care', 'hand box careful gentle sambhal',
    box(20, 10, 24, 20) + line('M8 40c4-4 8-5 12-4l10 3h8c3 0 3 4 0 4h-8M30 39l14-2c4-1 8 1 10 4l4 6c-6 6-16 8-24 4l-10-4') ),
  mk('mark-no-hooks', 'No hooks', 'hook no hooks forbidden',
    line('M38 8v20a8 8 0 0 1-16 0') + line('M22 28h-6') + noRing()),
  mk('mark-centre-of-gravity', 'Centre of gravity', 'balance centre lifting point',
    circle(32, 32, 20, 'none', S) + path('M32 12a20 20 0 0 1 20 20H32zM32 32v20A20 20 0 0 1 12 32z', INK) + line('M32 4v10M32 50v10M4 32h10M50 32h10')),
  mk('mark-open-here', 'Open here', 'open arrow dotted cut tear',
    line('M10 22h44', { 'stroke-dasharray': '4 5' }) + line('M32 54V32M22 42l10 10 10-10')),
  mk('mark-cut-line', 'Cut line', 'dashed line cut tape seam',
    line('M6 32h52', { 'stroke-dasharray': '6 6' }) + line('M12 22l8 10-8 10M20 32h6', { 'stroke-width': 2.6 })),
  mk('mark-arrows-up-pair', 'Up arrows', 'arrows up pair direction upright',
    line('M22 52V14M12 24l10-10 10 10M42 52V14M32 24l10-10 10 10')),
  mk('mark-do-not-drop', 'Do not drop', 'drop fall tumble box careful',
    box(20, 8, 24, 20) + line('M32 34v14M24 42l8 8 8-8') + line('M10 56h44')),
  mk('mark-barcode', 'Barcode lines', 'barcode lines stripes label scan',
    [8, 14, 18, 26, 30, 38, 42, 48, 54].map((x, i) => rect(x, 12, i % 2 ? 2 : 4, 40, INK)).join('')),
  mk('mark-package-box', 'Parcel box', 'box parcel carton package dabba',
    line('M32 6l24 12v28L32 58 8 46V18z') + line('M8 18l24 12 24-12M32 30v28') + line('M20 12l24 12v10', { 'stroke-width': 2.4 })),
  mk('mark-this-side-up-box', 'Box with arrow up', 'box arrow up this side parcel',
    box(10, 30, 44, 26) + line('M32 24V6M24 14l8-8 8 8') + line('M10 40h44', { 'stroke-width': 2.4 })),
  mk('mark-temperature-range', 'Temperature range', 'thermometer temperature range storage',
    line('M26 8a6 6 0 0 1 12 0v28a12 12 0 1 1-12 0z') + circle(32, 48, 6, INK) + line('M32 14v30', { 'stroke-width': 4 })),
  mk('mark-fragile-box', 'Fragile box', 'fragile box glass crack handle',
    box(10, 22, 44, 32) + line('M24 10h16c0 8-3 12-8 13-5-1-8-5-8-13z', { 'stroke-width': 2.8 }) + line('M32 36v10M26 50h12', { 'stroke-width': 2.8 })),
  mk('mark-two-way-arrows', 'Forklift here', 'forklift fork lift pallet slots',
    line('M8 20h48M8 44h48') + rect(10, 26, 44, 12, 'none', { ...S, rx: 1 })),
];
