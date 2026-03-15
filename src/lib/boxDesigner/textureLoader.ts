/**
 * Texture Loader Utility
 * Generates procedural textures for corrugated materials
 */

import { CanvasTexture, RepeatWrapping } from 'three';

/**
 * Creates a kraft paper texture procedurally - Enhanced for photorealism
 */
export function createKraftPaperTexture(color: string, variant: 'brown' | 'white' = 'brown'): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;  // Increased resolution for better detail
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Enhanced paper texture noise with natural variation
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Multi-scale noise for more realistic paper texture
    const noise1 = (Math.random() - 0.5) * 15;  // Fine grain
    const noise2 = (Math.random() - 0.5) * 8;   // Medium grain
    const totalNoise = noise1 + noise2;
    
    data[i] += totalNoise;     // R
    data[i + 1] += totalNoise; // G
    data[i + 2] += totalNoise; // B
  }

  ctx.putImageData(imageData, 0, 0);

  // Add realistic paper fibers - more subtle and natural
  ctx.strokeStyle = variant === 'brown' ? 'rgba(90, 75, 60, 0.1)' : 'rgba(220, 220, 220, 0.12)';
  ctx.lineWidth = 0.8;

  for (let i = 0; i < 300; i++) {
    ctx.beginPath();
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = Math.random() * 30 + 10;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  // Add color variation patches for authenticity
  ctx.fillStyle = variant === 'brown' ? 'rgba(80, 65, 50, 0.05)' : 'rgba(210, 210, 210, 0.06)';
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 40 + 15;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, variant === 'brown' ? 'rgba(80, 65, 50, 0.06)' : 'rgba(210, 210, 210, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add subtle streaks for paper grain direction
  ctx.strokeStyle = variant === 'brown' ? 'rgba(70, 60, 50, 0.03)' : 'rgba(200, 200, 200, 0.04)';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    const x = Math.random() * canvas.width;
    const y = 0;
    const endY = canvas.height;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 100, endY);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1.5, 1.5);  // Adjusted for better tiling

  return texture;
}

/**
 * Creates a corrugated flute normal map
 */
export function createFlutedNormalMap(fluteType: 'A' | 'B' | 'C' | 'E' | 'F'): CanvasTexture {
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
    F: { height: 4, spacing: 12 },   // Ultra-fine micro-flute
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
export function getFluteNormalMap(fluteType: 'A' | 'B' | 'C' | 'E' | 'F'): CanvasTexture {
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

/**
 * Creates an ambient occlusion map for cardboard
 * Adds depth to corners, edges, and fold areas
 */
export function createAmbientOcclusionMap(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base - fully lit
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add corner occlusion (darker corners)
  const corners = [
    { x: 0, y: 0 },
    { x: canvas.width, y: 0 },
    { x: 0, y: canvas.height },
    { x: canvas.width, y: canvas.height }
  ];

  corners.forEach(corner => {
    const gradient = ctx.createRadialGradient(corner.x, corner.y, 0, corner.x, corner.y, 300);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  // Add edge darkening
  const edgeGradient = ctx.createLinearGradient(0, 0, 0, 80);
  edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
  edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = edgeGradient;
  ctx.fillRect(0, 0, canvas.width, 80);
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  return texture;
}

/**
 * Creates an edge wear map for realistic cardboard damage
 * Simulates wear on corners and edges
 */
export function createEdgeWearMap(intensity: number = 0.5): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base - no wear
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Edge wear - concentrated at borders
  const wearWidth = 60 * intensity;
  
  // Top and bottom edges
  for (let i = 0; i < wearWidth; i++) {
    const alpha = (wearWidth - i) / wearWidth * 0.4 * intensity;
    ctx.strokeStyle = `rgba(200, 180, 160, ${alpha})`;
    ctx.lineWidth = 1;
    
    // Add random wear marks
    for (let x = 0; x < canvas.width; x += 5) {
      if (Math.random() > 0.7) {
        ctx.beginPath();
        ctx.moveTo(x, i);
        ctx.lineTo(x + Math.random() * 3, i + Math.random() * 3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - i);
        ctx.lineTo(x + Math.random() * 3, canvas.height - i - Math.random() * 3);
        ctx.stroke();
      }
    }
  }

  // Corner wear - more concentrated
  const corners = [
    { x: 0, y: 0 },
    { x: canvas.width, y: 0 },
    { x: 0, y: canvas.height },
    { x: canvas.width, y: canvas.height }
  ];
  
  const cornerSize = 100 * intensity;
  corners.forEach(corner => {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * cornerSize;
      const x = corner.x + Math.cos(angle) * distance;
      const y = corner.y + Math.sin(angle) * distance;
      
      ctx.fillStyle = `rgba(180, 160, 140, ${0.3 * intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;

  return texture;
}

/**
 * Get or create AO map
 */
export function getAOMap(): CanvasTexture {
  const key = 'ao-map';
  let texture = textureCache.get(key);
  
  if (!texture) {
    texture = createAmbientOcclusionMap();
    textureCache.set(key, texture);
  }
  
  return texture;
}

/**
 * Get or create edge wear map
 */
export function getEdgeWearMap(intensity: number = 0.5): CanvasTexture {
  const key = `edge-wear-${intensity}`;
  let texture = textureCache.get(key);
  
  if (!texture) {
    texture = createEdgeWearMap(intensity);
    textureCache.set(key, texture);
  }
  
  return texture;
}
