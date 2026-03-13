/**
 * Texture Loader Utility
 * Generates procedural textures for corrugated materials
 */

import { CanvasTexture, RepeatWrapping } from 'three';

/**
 * Creates a kraft paper texture procedurally
 */
export function createKraftPaperTexture(color: string, variant: 'brown' | 'white' = 'brown'): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add paper texture noise
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Add random noise for paper texture
    const noise = (Math.random() - 0.5) * 15;
    data[i] += noise;     // R
    data[i + 1] += noise; // G
    data[i + 2] += noise; // B
  }

  ctx.putImageData(imageData, 0, 0);

  // Add subtle fibers
  ctx.strokeStyle = variant === 'brown' ? 'rgba(90, 70, 50, 0.1)' : 'rgba(220, 220, 220, 0.2)';
  ctx.lineWidth = 1;

  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = Math.random() * 30 + 10;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 2);

  return texture;
}

/**
 * Creates a corrugated flute normal map
 */
export function createFlutedNormalMap(fluteType: 'A' | 'B' | 'C' | 'E'): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Flute specifications
  const fluteSpecs = {
    A: { height: 24, spacing: 40 },  // Scaled for texture
    B: { height: 12, spacing: 32 },
    C: { height: 18, spacing: 40 },
    E: { height: 6, spacing: 16 },
  };

  const spec = fluteSpecs[fluteType];

  // Base color (flat normal - pointing up)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw flutes as waves
  const gradient = ctx.createLinearGradient(0, 0, spec.spacing, 0);
  gradient.addColorStop(0, 'rgb(128, 128, 255)');
  gradient.addColorStop(0.25, 'rgb(180, 180, 255)');
  gradient.addColorStop(0.5, 'rgb(128, 128, 255)');
  gradient.addColorStop(0.75, 'rgb(80, 80, 255)');
  gradient.addColorStop(1, 'rgb(128, 128, 255)');

  for (let x = 0; x < canvas.width; x += spec.spacing) {
    ctx.fillStyle = gradient;
    ctx.fillRect(x, 0, spec.spacing, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(4, 4);

  return texture;
}

/**
 * Creates a roughness map for material
 */
export function createRoughnessMap(baseRoughness: number): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const baseValue = Math.floor(baseRoughness * 255);
  ctx.fillStyle = `rgb(${baseValue}, ${baseValue}, ${baseValue})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add variation
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const variation = (Math.random() - 0.5) * 20;
    const value = Math.max(0, Math.min(255, data[i] + variation));
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  return texture;
}

/**
 * Cache for generated textures
 */
class TextureCache {
  private cache = new Map<string, CanvasTexture>();

  get(key: string): CanvasTexture | undefined {
    return this.cache.get(key);
  }

  set(key: string, texture: CanvasTexture): void {
    this.cache.set(key, texture);
  }

  clear(): void {
    this.cache.forEach(texture => texture.dispose());
    this.cache.clear();
  }
}

export const textureCache = new TextureCache();

/**
 * Get or create kraft paper texture
 */
export function getKraftTexture(plyId: string, color: string): CanvasTexture {
  const key = `kraft-${plyId}-${color}`;
  let texture = textureCache.get(key);
  
  if (!texture) {
    const variant = color.includes('F5F5') ? 'white' : 'brown';
    texture = createKraftPaperTexture(color, variant);
    textureCache.set(key, texture);
  }
  
  return texture;
}

/**
 * Get or create flute normal map
 */
export function getFluteNormalMap(fluteType: 'A' | 'B' | 'C' | 'E'): CanvasTexture {
  const key = `flute-${fluteType}`;
  let texture = textureCache.get(key);
  
  if (!texture) {
    texture = createFlutedNormalMap(fluteType);
    textureCache.set(key, texture);
  }
  
  return texture;
}

/**
 * Get or create roughness map
 */
export function getRoughnessMap(roughness: number): CanvasTexture {
  const key = `roughness-${roughness}`;
  let texture = textureCache.get(key);
  
  if (!texture) {
    texture = createRoughnessMap(roughness);
    textureCache.set(key, texture);
  }
  
  return texture;
}
