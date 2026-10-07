/**
 * Procedural cardboard textures (no image downloads)
 *  - grain:   seamless grayscale kraft grain, tinted by the material colour (colour changes are free)
 *  - normal:  paper fibre relief + the faint vertical "washboard" ridges the flutes leave on the liner
 *  - edges:   board cross-section drawn from the real flute stack (liners, wavy medium, cavities)
 *  - contact: soft radial blob used as a cheap contact shadow
 *
 * Everything is generated once and cached for the lifetime of the page; caches are small and bounded
 * (one grain, one normal map per flute pitch, one edge pair per board construction and colour).
 */

import * as THREE from 'three';
import type { BoardSpec } from '../boardSpecs';

/** Real-world size of one grain/normal tile (cm) */
export const GRAIN_TILE_CM = 20;
/** Real-world length of one edge texture tile along the cut (cm) */
export const EDGE_TILE_CM = 4;

const cache = new Map<string, THREE.Texture>();

/** Small deterministic PRNG so textures look the same on every load */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tileable value noise on a size x size grid with `cells` lattice cells per tile (values 0..1) */
function periodicNoise(size: number, cells: number, rand: () => number): Float32Array {
  const lattice = new Float32Array(cells * cells);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
  const out = new Float32Array(size * size);
  const fade = (k: number) => k * k * (3 - 2 * k);
  for (let y = 0; y < size; y++) {
    const fy = (y / size) * cells;
    const iy = Math.floor(fy);
    const ty = fade(fy - iy);
    const y0 = (iy % cells) * cells;
    const y1 = ((iy + 1) % cells) * cells;
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cells;
      const ix = Math.floor(fx);
      const tx = fade(fx - ix);
      const x0 = ix % cells;
      const x1 = (ix + 1) % cells;
      const top = lattice[y0 + x0] + (lattice[y0 + x1] - lattice[y0 + x0]) * tx;
      const bottom = lattice[y1 + x0] + (lattice[y1 + x1] - lattice[y1 + x0]) * tx;
      out[y * size + x] = top + (bottom - top) * ty;
    }
  }
  return out;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d')! };
}

function finishTexture<T extends THREE.Texture>(
  texture: T,
  colorSpace: THREE.ColorSpace,
  wrapT: THREE.Wrapping = THREE.RepeatWrapping
): T {
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = wrapT;
  texture.anisotropy = currentAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

let currentAnisotropy = 1;

/** Apply the renderer's anisotropic filtering level to every cached surface texture */
export function setSurfaceTextureAnisotropy(level: number): void {
  currentAnisotropy = Math.max(1, Math.min(8, Math.floor(level)));
  cache.forEach((texture) => {
    if (texture.anisotropy !== currentAnisotropy) {
      texture.anisotropy = currentAnisotropy;
      texture.needsUpdate = true;
    }
  });
}

/** Seamless grayscale kraft grain (mean ~0.96 so the tint colour reads true) */
export function getGrainTexture(): THREE.CanvasTexture {
  const cached = cache.get('grain');
  if (cached) return cached as THREE.CanvasTexture;

  // 1024 px over 20 cm (~51 px/cm) stays sharp in close-ups and on small boxes
  const size = 1024;
  const rand = mulberry32(7);
  const broad = periodicNoise(size, 6, rand);
  const mid = periodicNoise(size, 32, rand);
  const fine = periodicNoise(size, 256, rand);
  const { canvas, ctx } = createCanvas(size, size);
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 0.958 + (broad[i] - 0.5) * 0.06 + (mid[i] - 0.5) * 0.045 + (fine[i] - 0.5) * 0.04;
    const g = Math.max(0, Math.min(255, Math.round(v * 255)));
    image.data[i * 4] = g;
    image.data[i * 4 + 1] = g;
    image.data[i * 4 + 2] = Math.max(0, g - 2);
    image.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  // Paper fibres: short soft strokes, drawn with wrap-around copies so the tile stays seamless
  const stroke = (x: number, y: number, length: number, angle: number) => {
    const dx = Math.cos(angle) * length;
    const dy = Math.sin(angle) * length;
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        if (x + ox + Math.abs(dx) < -2 || x + ox - Math.abs(dx) > size + 2) continue;
        if (y + oy + Math.abs(dy) < -2 || y + oy - Math.abs(dy) > size + 2) continue;
        ctx.beginPath();
        ctx.moveTo(x + ox, y + oy);
        ctx.lineTo(x + ox + dx, y + oy + dy);
        ctx.stroke();
      }
    }
  };
  ctx.lineCap = 'round';
  for (let i = 0; i < 6000; i++) {
    const dark = rand() < 0.55;
    ctx.strokeStyle = dark ? `rgba(70,52,34,${0.04 + rand() * 0.07})` : `rgba(255,252,244,${0.05 + rand() * 0.08})`;
    ctx.lineWidth = 0.5 + rand() * 0.9;
    // fibres lean slightly along the machine direction (vertical)
    stroke(rand() * size, rand() * size, 6 + rand() * 30, Math.PI / 2 + (rand() - 0.5) * 1.6);
  }
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = `rgba(60,42,25,${0.08 + rand() * 0.14})`;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 0.6 + rand() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = finishTexture(new THREE.CanvasTexture(canvas), THREE.SRGBColorSpace);
  cache.set('grain', texture);
  return texture;
}

/**
 * Normal map: paper fibre relief plus vertical flute ridges at the board's outer flute pitch.
 * Flutes run along the panel's local Y, so ridges repeat along X.
 */
export function getSurfaceNormalTexture(flutePitchMm: number): THREE.CanvasTexture {
  const ridges = Math.max(1, Math.round((GRAIN_TILE_CM * 10) / Math.max(1, flutePitchMm)));
  const key = `normal:${ridges}`;
  const cached = cache.get(key);
  if (cached) return cached as THREE.CanvasTexture;

  const size = 1024;
  const rand = mulberry32(11);
  const fibre = periodicNoise(size, 256, rand);
  const blotch = periodicNoise(size, 16, rand);
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const ridge = 0.5 - 0.5 * Math.cos((2 * Math.PI * x * ridges) / size);
      height[i] = ridge * 0.55 + fibre[i] * 0.35 + blotch[i] * 0.25;
    }
  }

  const { canvas, ctx } = createCanvas(size, size);
  const image = ctx.createImageData(size, size);
  const strength = 2.2;
  for (let y = 0; y < size; y++) {
    const yu = ((y - 1 + size) % size) * size;
    const yd = ((y + 1) % size) * size;
    for (let x = 0; x < size; x++) {
      const xl = (x - 1 + size) % size;
      const xr = (x + 1) % size;
      const dx = (height[y * size + xr] - height[y * size + xl]) * strength;
      // canvas rows go down while texture V goes up
      const dy = (height[yu + x] - height[yd + x]) * strength;
      let nx = -dx;
      let ny = -dy;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;
      const o = (y * size + x) * 4;
      image.data[o] = Math.round((nx * 0.5 + 0.5) * 255);
      image.data[o + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      image.data[o + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      image.data[o + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = finishTexture(new THREE.CanvasTexture(canvas), THREE.NoColorSpace);
  cache.set(key, texture);
  return texture;
}

const KRAFT_LINER = '#b08b5c';
const KRAFT_MEDIUM = '#c6a06d';
const CAVITY = '#3b2c1d';

/**
 * Board edge textures for a construction and outer-liner colour:
 *  - cross: edge cut across the flutes (wavy medium between liners)
 *  - along: edge cut along the flutes (liner bands with the medium seen edge-on)
 * The canvas top is the outer liner (texture v = 1).
 */
export function getEdgeTextures(
  board: BoardSpec,
  outerColor: string,
  innerColor: string = KRAFT_LINER
): { cross: THREE.CanvasTexture; along: THREE.CanvasTexture } {
  const key = `edge:${board.key}:${outerColor.toLowerCase()}:${innerColor.toLowerCase()}`;
  const cachedCross = cache.get(`${key}:cross`);
  const cachedAlong = cache.get(`${key}:along`);
  if (cachedCross && cachedAlong) {
    return { cross: cachedCross as THREE.CanvasTexture, along: cachedAlong as THREE.CanvasTexture };
  }

  const pxPerMm = 18;
  const tileMm = EDGE_TILE_CM * 10;
  const height = Math.max(8, Math.round(board.caliperMm * pxPerMm));
  const liner = Math.max(2, board.linerMm * pxPerMm);
  const medium = Math.max(1.5, 0.22 * pxPerMm);
  const rand = mulberry32(board.key.length * 97 + 3);

  const drawLiners = (ctx: CanvasRenderingContext2D, width: number) => {
    // inner liner fills the whole strip first (absorbs rounding), then layers are painted over it
    ctx.fillStyle = innerColor;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = outerColor;
    ctx.fillRect(0, 0, width, liner);
  };

  const speckle = (ctx: CanvasRenderingContext2D, width: number) => {
    for (let i = 0; i < width * 0.6; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,240,210,0.07)';
      ctx.fillRect(rand() * width, rand() * height, 1, 1);
    }
  };

  // Cross-section (wavy medium)
  const crossWidth = Math.round(tileMm * pxPerMm);
  const cross = createCanvas(crossWidth, height);
  drawLiners(cross.ctx, crossWidth);
  let y = liner;
  board.layers.forEach((layer, index) => {
    const h = layer.heightMm * pxPerMm;
    const gradient = cross.ctx.createLinearGradient(0, y, 0, y + h);
    gradient.addColorStop(0, '#5a4430');
    gradient.addColorStop(0.5, CAVITY);
    gradient.addColorStop(1, '#5a4430');
    cross.ctx.fillStyle = gradient;
    cross.ctx.fillRect(0, y, crossWidth, h);

    // integer number of waves per tile keeps the texture seamless
    const waves = Math.max(1, Math.round(tileMm / layer.pitchMm));
    const period = crossWidth / waves;
    const amplitude = Math.max(0.5, (h - medium) / 2);
    const centre = y + h / 2;
    const phase = index * 0.37 * period;
    const wave = (x: number) => centre - Math.cos((2 * Math.PI * (x + phase)) / period) * amplitude;

    cross.ctx.lineJoin = 'round';
    cross.ctx.strokeStyle = KRAFT_MEDIUM;
    cross.ctx.lineWidth = medium;
    cross.ctx.beginPath();
    for (let x = -2; x <= crossWidth + 2; x += 2) {
      if (x === -2) cross.ctx.moveTo(x, wave(x));
      else cross.ctx.lineTo(x, wave(x));
    }
    cross.ctx.stroke();
    // light catches the top of the medium
    cross.ctx.strokeStyle = 'rgba(255,236,200,0.45)';
    cross.ctx.lineWidth = Math.max(0.6, medium * 0.35);
    cross.ctx.beginPath();
    for (let x = -2; x <= crossWidth + 2; x += 2) {
      if (x === -2) cross.ctx.moveTo(x, wave(x) - medium * 0.3);
      else cross.ctx.lineTo(x, wave(x) - medium * 0.3);
    }
    cross.ctx.stroke();

    y += h;
    // liner below this flute (the last one is the inner liner, already painted)
    if (index < board.layers.length - 1) {
      cross.ctx.fillStyle = KRAFT_LINER;
      cross.ctx.fillRect(0, y, crossWidth, liner);
    }
    y += liner;
  });
  speckle(cross.ctx, crossWidth);

  // Along the flutes (bands)
  const alongWidth = 240;
  const along = createCanvas(alongWidth, height);
  drawLiners(along.ctx, alongWidth);
  y = liner;
  board.layers.forEach((layer, index) => {
    const h = layer.heightMm * pxPerMm;
    const gradient = along.ctx.createLinearGradient(0, y, 0, y + h);
    gradient.addColorStop(0, '#6b5238');
    gradient.addColorStop(0.5, '#4a3824');
    gradient.addColorStop(1, '#6b5238');
    along.ctx.fillStyle = gradient;
    along.ctx.fillRect(0, y, alongWidth, h);
    // the medium seen edge-on wanders slightly (periodic so it tiles)
    along.ctx.strokeStyle = KRAFT_MEDIUM;
    along.ctx.lineWidth = medium;
    along.ctx.beginPath();
    for (let x = 0; x <= alongWidth; x += 4) {
      const yy = y + h / 2 + Math.sin((2 * Math.PI * x) / alongWidth + index) * h * 0.18;
      if (x === 0) along.ctx.moveTo(x, yy);
      else along.ctx.lineTo(x, yy);
    }
    along.ctx.stroke();
    y += h;
    if (index < board.layers.length - 1) {
      along.ctx.fillStyle = KRAFT_LINER;
      along.ctx.fillRect(0, y, alongWidth, liner);
    }
    y += liner;
  });
  speckle(along.ctx, alongWidth);

  const crossTexture = finishTexture(new THREE.CanvasTexture(cross.canvas), THREE.SRGBColorSpace, THREE.ClampToEdgeWrapping);
  const alongTexture = finishTexture(new THREE.CanvasTexture(along.canvas), THREE.SRGBColorSpace, THREE.ClampToEdgeWrapping);
  cache.set(`${key}:cross`, crossTexture);
  cache.set(`${key}:along`, alongTexture);
  return { cross: crossTexture, along: alongTexture };
}

/**
 * Ambient-occlusion map for the inside of the box (sampled through uv1, see panelGeometry).
 * White in the middle, darkening smoothly towards the border; corners get the product of both edges.
 */
export function getInnerOcclusionTexture(): THREE.CanvasTexture {
  const cached = cache.get('inner-ao');
  if (cached) return cached as THREE.CanvasTexture;
  const size = 128;
  const { canvas, ctx } = createCanvas(size, size);
  const image = ctx.createImageData(size, size);
  const band = 0.12;
  const strength = 0.6;
  const edge = (t: number) => {
    const k = Math.min(1, Math.max(0, t / band));
    return 1 - strength * (1 - k * k * (3 - 2 * k));
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const ao = edge(u) * edge(1 - u) * edge(v) * edge(1 - v);
      const g = Math.round(ao * 255);
      const o = (y * size + x) * 4;
      image.data[o] = g;
      image.data[o + 1] = g;
      image.data[o + 2] = g;
      image.data[o + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = finishTexture(new THREE.CanvasTexture(canvas), THREE.NoColorSpace, THREE.ClampToEdgeWrapping);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.channel = 1;
  cache.set('inner-ao', texture);
  return texture;
}

/** Soft radial blob for the ground contact shadow */
export function getContactShadowTexture(): THREE.CanvasTexture {
  const cached = cache.get('contact');
  if (cached) return cached as THREE.CanvasTexture;
  const size = 128;
  const { canvas, ctx } = createCanvas(size, size);
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(0,0,0,0.55)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.25)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  cache.set('contact', texture);
  return texture;
}
