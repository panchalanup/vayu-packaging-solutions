/**
 * Shipping Icon Generator
 * Creates procedural shipping symbols for cardboard boxes
 */

import { CanvasTexture } from 'three';

export type ShippingIconType = 'fragile' | 'this-side-up' | 'keep-dry';

export interface IconOptions {
  size?: number;
  color?: string;
  lineWidth?: number;
}

/**
 * Draws a fragile (wine glass) icon
 */
function drawFragileIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  lineWidth: number
): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Wine glass shape
  const glassWidth = size * 0.4;
  const glassHeight = size * 0.5;
  const stemHeight = size * 0.25;
  const baseWidth = size * 0.5;

  // Cup/bowl of the glass
  ctx.beginPath();
  ctx.moveTo(x - glassWidth / 2, y);
  ctx.lineTo(x - glassWidth / 4, y + glassHeight);
  ctx.lineTo(x + glassWidth / 4, y + glassHeight);
  ctx.lineTo(x + glassWidth / 2, y);
  ctx.closePath();
  ctx.stroke();

  // Stem
  ctx.beginPath();
  ctx.moveTo(x, y + glassHeight);
  ctx.lineTo(x, y + glassHeight + stemHeight);
  ctx.stroke();

  // Base
  ctx.beginPath();
  ctx.moveTo(x - baseWidth / 2, y + glassHeight + stemHeight);
  ctx.lineTo(x + baseWidth / 2, y + glassHeight + stemHeight);
  ctx.stroke();

  // Optional: Add "FRAGILE" text below
  ctx.font = `${size * 0.12}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('FRAGILE', x, y + glassHeight + stemHeight + size * 0.08);
}

/**
 * Draws a this-side-up (arrow pointing up) icon
 */
function drawThisSideUpIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  lineWidth: number
): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const arrowHeight = size * 0.6;
  const arrowWidth = size * 0.5;
  const shaftWidth = size * 0.15;

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - arrowWidth / 2, y + arrowHeight * 0.4);
  ctx.lineTo(x - shaftWidth / 2, y + arrowHeight * 0.4);
  ctx.lineTo(x - shaftWidth / 2, y + arrowHeight);
  ctx.lineTo(x + shaftWidth / 2, y + arrowHeight);
  ctx.lineTo(x + shaftWidth / 2, y + arrowHeight * 0.4);
  ctx.lineTo(x + arrowWidth / 2, y + arrowHeight * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // "THIS SIDE UP" text
  ctx.font = `${size * 0.1}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('THIS SIDE UP', x, y + arrowHeight + size * 0.05);
}

/**
 * Draws a keep-dry (umbrella) icon
 */
function drawKeepDryIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  lineWidth: number
): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const umbrellaWidth = size * 0.6;
  const umbrellaHeight = size * 0.3;
  const handleLength = size * 0.4;

  // Umbrella canopy (arc shape)
  ctx.beginPath();
  ctx.arc(x, y + umbrellaHeight, umbrellaWidth / 2, Math.PI, 0, true);
  ctx.stroke();

  // Umbrella segments (ribs)
  const segments = 5;
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI - (i * Math.PI) / segments;
    const px = x + Math.cos(angle) * (umbrellaWidth / 2);
    const py = y + umbrellaHeight + Math.sin(angle) * (umbrellaWidth / 2);
    ctx.beginPath();
    ctx.moveTo(x, y + umbrellaHeight);
    ctx.lineTo(px, py);
    ctx.stroke();
  }

  // Handle (vertical then curved)
  ctx.beginPath();
  ctx.moveTo(x, y + umbrellaHeight);
  ctx.lineTo(x, y + umbrellaHeight + handleLength);
  ctx.arc(
    x - size * 0.1,
    y + umbrellaHeight + handleLength,
    size * 0.1,
    0,
    Math.PI / 2
  );
  ctx.stroke();

  // "KEEP DRY" text
  ctx.font = `${size * 0.1}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('KEEP DRY', x, y + umbrellaHeight + handleLength + size * 0.15);
}

/**
 * Creates a single shipping icon on canvas
 */
export function createShippingIcon(
  type: ShippingIconType,
  options: IconOptions = {}
): HTMLCanvasElement {
  const size = options.size || 200;
  const color = options.color || '#000000';
  const lineWidth = options.lineWidth || 3;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Clear background (transparent)
  ctx.clearRect(0, 0, size, size);

  // Draw border box (optional - comment out if not needed)
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(lineWidth / 2, lineWidth / 2, size - lineWidth, size - lineWidth);

  // Draw the icon centered
  const centerX = size / 2;
  const centerY = size / 2;
  const iconSize = size * 0.7;

  switch (type) {
    case 'fragile':
      drawFragileIcon(ctx, centerX, centerY - iconSize * 0.15, iconSize, color, lineWidth);
      break;
    case 'this-side-up':
      drawThisSideUpIcon(ctx, centerX, centerY - iconSize * 0.15, iconSize, color, lineWidth);
      break;
    case 'keep-dry':
      drawKeepDryIcon(ctx, centerX, centerY - iconSize * 0.2, iconSize, color, lineWidth);
      break;
  }

  return canvas;
}

/**
 * Creates a composite texture with all three shipping icons in a row
 */
export function createShippingIconsTexture(
  backgroundColor: string = '#C9A87C',
  iconColor: string = '#000000',
  iconSize: number = 180
): CanvasTexture {
  const padding = 30;
  const iconSpacing = 20;
  const canvas = document.createElement('canvas');
  
  // Calculate canvas size for 3 icons in a row
  const canvasWidth = (iconSize * 3) + (iconSpacing * 2) + (padding * 2);
  const canvasHeight = iconSize + (padding * 2);
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // Fill with kraft paper background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create and draw each icon
  const icons: ShippingIconType[] = ['fragile', 'this-side-up', 'keep-dry'];
  
  icons.forEach((iconType, index) => {
    const iconCanvas = createShippingIcon(iconType, {
      size: iconSize,
      color: iconColor,
      lineWidth: 3,
    });
    
    const x = padding + (index * (iconSize + iconSpacing));
    const y = padding;
    
    ctx.drawImage(iconCanvas, x, y);
  });

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}

/**
 * Creates a composite canvas with shipping icons and kraft texture background
 */
export function createIconOverlayCanvas(
  baseTexture: CanvasTexture,
  textureWidth: number,
  textureHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = textureWidth;
  canvas.height = textureHeight;
  const ctx = canvas.getContext('2d')!;

  // Draw base kraft texture
  ctx.drawImage(baseTexture.image, 0, 0, textureWidth, textureHeight);

  // Calculate icon placement (bottom-right area like in screenshot)
  const iconRowWidth = textureWidth * 0.35; // Icons take ~35% of width
  const iconRowHeight = iconRowWidth * 0.35; // Maintain aspect ratio
  const iconX = textureWidth * 0.6; // Position from right
  const iconY = textureHeight * 0.65; // Position from bottom

  // Create icons texture
  const iconsTexture = createShippingIconsTexture('#C9A87C', '#000000', 120);
  
  // Draw icons on the base texture
  ctx.drawImage(iconsTexture.image, iconX, iconY, iconRowWidth, iconRowHeight);

  return canvas;
}
