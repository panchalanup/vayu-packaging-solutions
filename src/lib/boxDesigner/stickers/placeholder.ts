/**
 * Placeholder pack: a dozen original SVGs so the editor works before the real library lands.
 * Only used when ./library has no manifest modules.
 */

import type { StickerDef } from './types';

const urls = import.meta.glob('/src/assets/stickers/_placeholder/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const url = (name: string) => urls[`/src/assets/stickers/_placeholder/${name}.svg`] ?? '';

const def = (id: string, name: string, kind: StickerDef['kind'], tags: string[]): StickerDef => ({ id: `ph-${id}`, name, category: 'starter', tags, kind, src: url(id) });

export const PLACEHOLDER_STICKERS: StickerDef[] = [
  def('fruit-apple', 'Apple', 'colour', ['fruit', 'seb', 'red']),
  def('fruit-mango', 'Mango', 'colour', ['fruit', 'aam', 'mango', 'summer']),
  def('leaf', 'Leaf', 'colour', ['plant', 'green', 'patta', 'nature']),
  def('star', 'Star', 'colour', ['shape', 'gold', 'rating']),
  def('heart', 'Heart', 'colour', ['love', 'shape', 'gift']),
  def('badge-seal', 'Seal', 'colour', ['badge', 'quality', 'premium']),
  def('cup', 'Cup', 'colour', ['tea', 'chai', 'coffee', 'drink']),
  def('gift', 'Gift', 'colour', ['present', 'festive', 'box']),
  def('phone', 'Phone', 'mono', ['call', 'contact', 'icon']),
  def('mail', 'Mail', 'mono', ['email', 'contact', 'icon']),
  def('pattern-dots', 'Dots', 'pattern', ['pattern', 'polka', 'dot']),
  def('pattern-stripes', 'Stripes', 'pattern', ['pattern', 'lines']),
  def('pattern-leaves', 'Leaf pattern', 'pattern', ['pattern', 'leaves', 'nature']),
].filter((s) => s.src);
