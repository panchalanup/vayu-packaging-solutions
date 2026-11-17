/**
 * Procedural textures for the story world, drawn on canvases at build time: no image downloads and nothing
 * AI-generated (image policy). Surfaces get seeded noise so they never look like flat colour; printed things
 * (labels, the sticky note, the monitor UI, the truck livery) are drawn with the site's own fonts.
 */

import * as THREE from 'three';
import { deskNote } from '@/content/story';
import { MINI, SWATCH_COUNT, type MiniState } from './beats';

export const INK = { ink: '#0F1A14', ink8: '#17231C', paper: '#FBF8F3', paper1: '#F4EFE6', kraft: '#C49A6C', green: '#23803A', green4: '#3DBA5A', green5: '#2E9B47' } as const;
/** The six swatches on the mini designer, in the order beats.ts clicks them: kraft, white, black, red, blue, brand green */
export const SWATCHES = ['#C9A87C', '#F5F5F0', '#2B2B2D', '#A8352E', '#2E4F7F', INK.green] as const;

const FONT = { display: '"Clash Display", Satoshi, system-ui, sans-serif', body: 'Satoshi, system-ui, sans-serif', mono: '"Geist Mono", ui-monospace, monospace' };

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d canvas unavailable');
  return [c, ctx];
}

function texture(c: HTMLCanvasElement, repeat?: [number, number], srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  t.anisotropy = 4;
  return t;
}

/** Small deterministic RNG so the noise looks the same on every visit */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, base: string, amount: number, seed = 1) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amount;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

// --- Surfaces ------------------------------------------------------------------------------------------------------

export function woodTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(1024, 256);
  noise(ctx, 1024, 256, '#6B4A2E', 18, 3);
  const r = rng(7);
  for (let i = 0; i < 70; i++) {
    const y = r() * 256;
    ctx.strokeStyle = `rgba(${r() < 0.5 ? '40,24,12' : '150,110,70'},${0.08 + r() * 0.14})`;
    ctx.lineWidth = 1 + r() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 32) ctx.lineTo(x, y + Math.sin(x / (60 + r() * 80) + i) * (2 + r() * 5));
    ctx.stroke();
  }
  return texture(c, [1, 1]);
}

export function concreteTexture(tone = '#3A3B36', seed = 11): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 256);
  noise(ctx, 256, 256, tone, 26, seed);
  return texture(c, [12, 12]);
}

export function plasterTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 256);
  noise(ctx, 256, 256, '#CBBFA8', 16, 21);
  return texture(c, [6, 4]);
}

export function tileTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(512, 512);
  noise(ctx, 512, 512, '#8E8476', 22, 31);
  ctx.strokeStyle = 'rgba(40,34,28,0.55)';
  ctx.lineWidth = 4;
  for (let i = 0; i <= 512; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }
  return texture(c, [4, 4]);
}

export function asphaltTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 256);
  noise(ctx, 256, 256, '#2B2C2B', 40, 41);
  return texture(c, [40, 4]);
}

/** Road markings: white edge lines and a dashed centre line, on transparent */
export function roadLinesTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(512, 128);
  ctx.fillStyle = 'rgba(235,235,225,0.85)';
  ctx.fillRect(0, 6, 512, 5);
  ctx.fillRect(0, 117, 512, 5);
  for (let x = 0; x < 512; x += 128) ctx.fillRect(x + 20, 61, 72, 6);
  return texture(c, [24, 1]);
}

export function doorTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(512, 1024);
  noise(ctx, 512, 1024, '#5B3B26', 20, 51);
  const panel = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,220,180,0.18)';
    ctx.lineWidth = 6;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.strokeRect(x + 12, y + 12, w - 24, h - 24);
  };
  panel(60, 70, 170, 380);
  panel(282, 70, 170, 380);
  panel(60, 560, 170, 390);
  panel(282, 560, 170, 390);
  return texture(c);
}

export function matTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(512, 320);
  noise(ctx, 512, 320, '#8A6A3E', 60, 61);
  ctx.strokeStyle = 'rgba(40,26,12,0.6)';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 484, 292);
  ctx.fillStyle = 'rgba(38,24,12,0.82)';
  ctx.font = `600 64px ${FONT.display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WELCOME', 256, 165);
  return texture(c);
}

/** Soft round glow for sprites (warm light spilling out of the open box) */
export function glowTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,214,140,0.95)');
  g.addColorStop(0.35, 'rgba(255,190,100,0.35)');
  g.addColorStop(1, 'rgba(255,170,80,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return texture(c);
}

// --- Printed things ------------------------------------------------------------------------------------------------

/** The customer's brand mark in the story (a fictional honey brand): hexagon with a drop, and the name under it */
function madhuMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, withName = true) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.07;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    const x = cx + Math.cos(a) * size * 0.42;
    const y = cy - size * 0.18 + Math.sin(a) * size * 0.42;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  const dy = cy - size * 0.18;
  ctx.moveTo(cx, dy - size * 0.2);
  ctx.bezierCurveTo(cx + size * 0.16, dy + size * 0.02, cx + size * 0.12, dy + size * 0.16, cx, dy + size * 0.16);
  ctx.bezierCurveTo(cx - size * 0.12, dy + size * 0.16, cx - size * 0.16, dy + size * 0.02, cx, dy - size * 0.2);
  ctx.fill();
  if (withName) {
    ctx.font = `600 ${size * 0.3}px ${FONT.display}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MADHU', cx, cy + size * 0.48);
  }
  ctx.restore();
}

/** One-colour print for a carton face (transparent, matches the face's aspect), as the designer prints a logo */
export function boxPrintTexture(widthCm: number, heightCm: number, color: string = INK.paper): THREE.CanvasTexture {
  const scale = 32;
  const [c, ctx] = canvas(Math.max(64, Math.round(widthCm * scale)), Math.max(64, Math.round(heightCm * scale)));
  madhuMark(ctx, c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.62, color);
  return texture(c);
}

/** Face texture for the 500 pallet boxes (one texture for all faces): brand colour, print, a hint of board edge */
export function palletBoxTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(256, 256);
  noise(ctx, 256, 256, INK.green, 14, 71);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, 256, 256);
  madhuMark(ctx, 128, 122, 150, 'rgba(251,248,243,0.92)');
  return texture(c);
}

/** Wrap-around jar label: the brand twice, so it reads from any side */
export function jarLabelTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(1024, 256);
  noise(ctx, 1024, 256, '#F3E9D2', 10, 81);
  ctx.fillStyle = '#7A4A12';
  ctx.fillRect(0, 0, 1024, 10);
  ctx.fillRect(0, 246, 1024, 10);
  for (const cx of [256, 768]) {
    madhuMark(ctx, cx - 120, 128, 120, '#7A4A12', false);
    ctx.fillStyle = '#5A340C';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `600 66px ${FONT.display}`;
    ctx.fillText('MADHU', cx - 52, 136);
    ctx.font = `500 22px ${FONT.mono}`;
    ctx.fillText('RAW HONEY · 500 g', cx - 50, 176);
  }
  return texture(c);
}

export function stickyNoteTexture(): THREE.CanvasTexture {
  const [line1, line2] = deskNote();
  const [c, ctx] = canvas(256, 256);
  noise(ctx, 256, 256, '#F2D46B', 10, 91);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(0, 0, 256, 34);
  ctx.fillStyle = '#4A3C0E';
  ctx.font = `700 34px ${FONT.body}`;
  ctx.fillText(line1, 18, 110, 222);
  ctx.font = `500 34px ${FONT.body}`;
  ctx.fillText(line2, 18, 160, 222);
  return texture(c);
}

/** Side livery of the delivery truck */
export function truckLiveryTexture(): THREE.CanvasTexture {
  const [c, ctx] = canvas(1024, 512);
  noise(ctx, 1024, 512, INK.green, 10, 101);
  ctx.fillStyle = INK.paper;
  ctx.font = `600 150px ${FONT.display}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Vayu', 120, 270);
  ctx.font = `500 46px ${FONT.body}`;
  ctx.fillText('Packaging Solutions', 126, 340);
  ctx.fillStyle = INK.green4;
  ctx.beginPath();
  ctx.moveTo(60, 200);
  ctx.bezierCurveTo(70, 130, 130, 120, 160, 140);
  ctx.bezierCurveTo(110, 145, 85, 170, 80, 230);
  ctx.closePath();
  ctx.fill();
  return texture(c);
}

// --- The mini designer on the monitor --------------------------------------------------------------------------------

/** Canvas space follows the real designer layout: 570 x 320 design units, drawn at 1280 x 720 */
export const SCREEN_PX = { w: 1280, h: 720 } as const;
const DU = { w: 570, h: 320 } as const;

function isoBox(ctx: CanvasRenderingContext2D, cx: number, baseY: number, s: number, color: string, logo: boolean, ghost: boolean) {
  const c30 = Math.cos(Math.PI / 6);
  const L = 1.25, W = 1.25, H = 1.65;
  const P = (x: number, y: number, z: number): [number, number] => [cx + (x - y) * c30 * s, baseY + (x + y) * 0.5 * s - z * s];
  const poly = (pts: [number, number][], fill?: string, stroke?: string) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) ctx.stroke();
  };
  const x0 = -L / 2, y0 = -W / 2;
  const top: [number, number][] = [P(x0, y0, H), P(x0 + L, y0, H), P(x0 + L, y0 + W, H), P(x0, y0 + W, H)];
  const right: [number, number][] = [P(x0 + L, y0, 0), P(x0 + L, y0 + W, 0), P(x0 + L, y0 + W, H), P(x0 + L, y0, H)];
  const left: [number, number][] = [P(x0, y0 + W, 0), P(x0 + L, y0 + W, 0), P(x0 + L, y0 + W, H), P(x0, y0 + W, H)];
  if (ghost) {
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = INK.green;
    ctx.lineWidth = 1.2;
    [top, right, left].forEach((f) => poly(f, undefined, INK.green));
    ctx.restore();
    return;
  }
  // contact shadow
  const sh = ctx.createRadialGradient(cx, baseY + s * 0.55, 0, cx, baseY + s * 0.55, s * 1.6);
  sh.addColorStop(0, 'rgba(0,0,0,0.22)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(cx - s * 2, baseY - s * 0.5, s * 4, s * 2);
  const shade = (k: number) => {
    const n = parseInt(color.slice(1), 16);
    const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  };
  poly(right, shade(0.86));
  poly(left, shade(0.72));
  poly(top, shade(1.06));
  ctx.strokeStyle = shade(0.66);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  const a = P(x0, y0 + W / 2, H), b = P(x0 + L, y0 + W / 2, H);
  ctx.moveTo(...a);
  ctx.lineTo(...b);
  ctx.stroke();
  if (logo) {
    const [lx, ly] = P(x0 + L / 2, y0 + W, H * 0.55);
    ctx.save();
    ctx.translate(lx, ly);
    ctx.transform(1, -0.5, 0, 1, 0, 0);
    const dark = color === '#F5F5F0' || color === '#C9A87C';
    madhuMark(ctx, 0, 0, s * 0.9, dark ? INK.ink : INK.paper);
    ctx.restore();
  }
}

export interface ScreenUI {
  texture: THREE.CanvasTexture;
  /** Redraws only when what is visible actually changed */
  draw(state: MiniState): void;
  /** Redraw everything (after the web fonts arrive) */
  refresh(): void;
}

export function createScreenUI(spec: string): ScreenUI {
  const [c, ctx] = canvas(SCREEN_PX.w, SCREEN_PX.h);
  const tex = texture(c);
  let last = '';
  let lastState: MiniState | null = null;

  const paint = (s: MiniState) => {
    ctx.setTransform(SCREEN_PX.w / DU.w, 0, 0, SCREEN_PX.h / DU.h, 0, 0);
    // canvas area: soft paper with a perspective grid floor
    ctx.fillStyle = '#F4EFE6';
    ctx.fillRect(0, 0, DU.w, DU.h);
    ctx.strokeStyle = 'rgba(15,26,20,0.08)';
    ctx.lineWidth = 0.5;
    for (let k = 0; k <= 10; k++) {
      const y = 150 + Math.pow(k / 10, 1.6) * 170;
      ctx.beginPath();
      ctx.moveTo(174, y);
      ctx.lineTo(DU.w, y);
      ctx.stroke();
    }
    for (let k = -9; k <= 9; k++) {
      ctx.beginPath();
      ctx.moveTo(372 + k * 6, 150);
      ctx.lineTo(372 + k * 62, DU.h);
      ctx.stroke();
    }
    isoBox(ctx, 372, 250, 42, SWATCHES[s.colorIndex], s.logo, s.exit >= 0.05);
    // floating view toolbar
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E2DACB';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.roundRect(462, 36, 96, 18, 9);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === 3 ? INK.green : '#B9B2A4';
      ctx.beginPath();
      ctx.roundRect(472 + i * 21, 41, 9, 8, 2);
      ctx.fill();
    }

    // top bar
    ctx.fillStyle = INK.ink;
    ctx.fillRect(0, 0, DU.w, 26);
    ctx.fillStyle = INK.green4;
    ctx.beginPath();
    ctx.moveTo(9, 16);
    ctx.bezierCurveTo(11, 8, 17, 7, 21, 9);
    ctx.bezierCurveTo(16, 10, 13, 12, 12, 17);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `600 9px ${FONT.display}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('Vayu', 24, 13.5);
    ctx.globalAlpha = 0.5;
    ctx.font = `500 5.6px ${FONT.mono}`;
    ctx.fillText('YOUR DESIGN', 58, 13.5);
    ctx.globalAlpha = 1;
    ctx.font = `700 7.4px ${FONT.body}`;
    ctx.fillText(`RSC · ${spec} · ${['3', '5', '7'][s.ply]}-ply`, 100, 13.5);
    ctx.globalAlpha = 0.8;
    ctx.font = `500 7px ${FONT.body}`;
    ctx.fillText('Export', 430, 13.5);
    ctx.globalAlpha = 1;
    ctx.fillStyle = s.quoteHot ? INK.green4 : INK.green5;
    ctx.beginPath();
    ctx.roundRect(466, 5, 96, 16, 4);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 7.2px ${FONT.body}`;
    ctx.textAlign = 'center';
    ctx.fillText('Quote this design', 514, 13.5);
    ctx.textAlign = 'left';

    // icon rail
    ctx.fillStyle = INK.ink8;
    ctx.fillRect(0, 26, 24, DU.h - 26);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i === 1 ? INK.green5 : 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      ctx.roundRect(6, 36 + i * 24, 12, 12, 3);
      ctx.fill();
    }

    // Edit Box panel
    ctx.fillStyle = '#FBF8F3';
    ctx.fillRect(24, 26, 150, DU.h - 26);
    ctx.fillStyle = '#E2DACB';
    ctx.fillRect(173.5, 26, 0.6, DU.h - 26);
    ctx.fillStyle = INK.ink;
    ctx.font = `600 11px ${FONT.display}`;
    ctx.fillText('Edit Box', 34, 44);
    ctx.fillStyle = '#4A5A50';
    ctx.font = `400 5.6px ${FONT.body}`;
    ctx.fillText('Style, size, board strength and colour', 34, 54);
    const label = (t: string, y: number) => {
      ctx.fillStyle = '#4A5A50';
      ctx.font = `500 5.2px ${FONT.mono}`;
      ctx.fillText(t, 34, y);
    };
    label('COLOUR', 68);
    for (let i = 0; i < SWATCH_COUNT; i++) {
      const [u, v] = MINI.swatch(i);
      ctx.beginPath();
      ctx.arc(u * DU.w, v * DU.h, 7, 0, Math.PI * 2);
      ctx.fillStyle = SWATCHES[i];
      ctx.fill();
      ctx.lineWidth = i === s.colorIndex ? 1.6 : 0.5;
      ctx.strokeStyle = i === s.colorIndex ? INK.ink : 'rgba(0,0,0,0.18)';
      ctx.stroke();
      if (i === s.colorIndex) {
        ctx.beginPath();
        ctx.arc(u * DU.w, v * DU.h, 9.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(15,26,20,0.35)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    label('LOGO', 102);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CFC6B5';
    ctx.lineWidth = 0.7;
    ctx.setLineDash(s.logo ? [] : [3, 2]);
    ctx.beginPath();
    ctx.roundRect(34, 110, 130, 38, 5);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    if (s.logo) {
      madhuMark(ctx, 52, 128, 22, '#7A4A12', false);
      ctx.fillStyle = '#4A5A50';
      ctx.font = `500 6.4px ${FONT.body}`;
      ctx.fillText('madhu-logo.png  ✓', 68, 130);
    } else {
      ctx.fillStyle = '#8C938F';
      ctx.font = `500 6.4px ${FONT.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('Drop your logo', 99, 130);
      ctx.textAlign = 'left';
    }
    label('BOARD', 166);
    ['3-ply', '5-ply', '7-ply'].forEach((t, i) => {
      const on = i === s.ply;
      ctx.fillStyle = on ? INK.green : '#FFFFFF';
      ctx.strokeStyle = '#CFC6B5';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.roundRect(34 + i * 44, 172, 41, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = on ? '#FFFFFF' : INK.ink;
      ctx.font = `600 6.6px ${FONT.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(t, 54.5 + i * 44, 180.5);
      ctx.textAlign = 'left';
    });
    label('SIZE (CM)', 206);
    spec.split(' × ').forEach((t, i) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#CFC6B5';
      ctx.beginPath();
      ctx.roundRect(34 + i * 44, 212, 41, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK.ink;
      ctx.font = `500 6.6px ${FONT.body}`;
      ctx.fillText(t.replace(' cm', ''), 40 + i * 44, 220.5);
    });

    // cursor and click ripple
    const [cx, cy] = [s.cursor[0] * DU.w, s.cursor[1] * DU.h];
    if (s.click > 0.01) {
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + (1 - s.click) * 12, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(61,186,90,${s.click})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 13);
    ctx.lineTo(3.4, 9.8);
    ctx.lineTo(6.2, 15.6);
    ctx.lineTo(8.4, 14.6);
    ctx.lineTo(5.6, 8.9);
    ctx.lineTo(10, 8.9);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = INK.ink;
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();
    tex.needsUpdate = true;
  };

  return {
    texture: tex,
    draw(s) {
      const key = [s.colorIndex, s.logo, s.ply, s.quoteHot, s.exit >= 0.05, s.cursor[0].toFixed(3), s.cursor[1].toFixed(3), s.click.toFixed(2)].join('|');
      lastState = s;
      if (key === last) return;
      last = key;
      paint(s);
    },
    refresh() {
      if (lastState) paint(lastState);
    },
  };
}
