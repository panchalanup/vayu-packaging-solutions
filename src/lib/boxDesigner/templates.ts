/**
 * Templates gallery (#16): ready-made starting points for common jobs, each with sample artwork and a sensible
 * spec. Only templates whose style has a 3D model are offered (availableTemplates). Applying a template keeps the
 * user's unit and quantity, and the sample logo is a placeholder they can replace in one tap.
 */

import type { BoxDesign, BoxDimensions, BoxFace, BoxTemplate, FluteType, PlyType, PrintFinish, TextElement } from '@/types/boxDesigner';
import { DEFAULT_DESIGN } from './designCodec';
import { hasStyleModel } from './styleAvailability';
import { templateArtUrl, TemplateArtId } from './templateArt';

export type TemplateCategory = 'ecommerce' | 'food' | 'retail' | 'industrial';

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
  art: { id: TemplateArtId; face: BoxFace; position: { x: number; y: number }; scale: number } | null;
  texts: Omit<TextElement, 'id'>[];
}

const text = (
  face: BoxFace,
  value: string,
  size: number,
  color: string,
  y: number,
  font = 'Inter',
  x = 0.5
): Omit<TextElement, 'id'> => ({ face, text: value, font, size, color, position: { x, y }, rotation: 0, align: 'center' });

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'food', label: 'Food' },
  { id: 'retail', label: 'Retail & gifts' },
  { id: 'industrial', label: 'Shipping & export' },
];

// VERIFY-LATER[DSG-61]: check template sizes and boards against what customers actually order most
export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'ecommerce-shipper',
    name: 'E-commerce shipper',
    blurb: 'Everyday courier carton with your logo',
    category: 'ecommerce',
    style: 'rsc',
    dimensions: { length: 30, width: 22, height: 15 },
    ply: '5-ply',
    flutes: ['B', 'C'],
    colorHex: '#C9A87C',
    finish: 'matte',
    insideColorHex: null,
    showIcons: true,
    art: { id: 'leaf', face: 'front', position: { x: 0.5, y: 0.4 }, scale: 0.45 },
    texts: [text('front', 'YOUR BRAND', 60, '#17231C', 0.78)],
  },
  {
    id: 'apparel-mailer',
    name: 'Apparel mailer',
    blurb: 'Tuck-top unboxing for clothing brands',
    category: 'ecommerce',
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
  },
  {
    id: 'subscription-box',
    name: 'Subscription box',
    blurb: 'Monthly kit with a coloured outside',
    category: 'ecommerce',
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'gift-box',
    name: 'Gift box',
    blurb: 'Lid-and-base box for festive gifting',
    category: 'retail',
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
  },
  {
    id: 'shoe-box',
    name: 'Shoe box',
    blurb: 'Two-piece box sized for a pair of shoes',
    category: 'retail',
    style: 'telescope',
    dimensions: { length: 33, width: 20, height: 12 },
    ply: '3-ply',
    flutes: ['B'],
    colorHex: '#F5F5F0',
    finish: 'matte',
    insideColorHex: null,
    showIcons: false,
    art: { id: 'shoe', face: 'lid', position: { x: 0.25, y: 0.5 }, scale: 0.75 },
    texts: [text('lid', 'SIZE 9 · UK', 30, '#17231C', 0.5, 'Inter', 0.64)],
  },
  {
    id: 'display-tray',
    name: 'Shelf display tray',
    blurb: 'Open-top carton for counters and shelves',
    category: 'retail',
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
  },
  {
    id: 'export-carton',
    name: 'Export carton',
    blurb: 'Heavy-duty carton for containers',
    category: 'industrial',
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
  },
  {
    id: 'heavy-duty',
    name: 'Heavy-duty overlap',
    blurb: 'Double layer top and bottom for heavy parts',
    category: 'industrial',
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
  },
  {
    id: 'moving-box',
    name: 'Moving box',
    blurb: 'Plain carton with a label area',
    category: 'industrial',
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
  },
  {
    id: 'product-sleeve',
    name: 'Product sleeve',
    blurb: 'Printed band that slides over a tray',
    category: 'retail',
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
  },
];

export function availableTemplates(isAvailable: (s: BoxTemplate) => boolean = hasStyleModel): DesignTemplate[] {
  return DESIGN_TEMPLATES.filter((t) => isAvailable(t.style));
}

export function findTemplate(id: string | null | undefined): DesignTemplate | undefined {
  return id ? DESIGN_TEMPLATES.find((t) => t.id === id) : undefined;
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
  };
}
