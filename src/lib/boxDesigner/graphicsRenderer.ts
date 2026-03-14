/**
 * Graphics Renderer Utility
 * Renders images and text onto box face textures
 */

import { CanvasTexture } from 'three';
import { FaceImage, TextElement, BoxFace } from '@/types/boxDesigner';

/**
 * Load image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Create a composite texture for a box face with base texture, images, and text
 */
export async function createFaceTexture(
  baseTexture: CanvasTexture,
  faceImage?: FaceImage,
  textElements: TextElement[] = [],
  faceWidth: number = 512,
  faceHeight: number = 512
): Promise<CanvasTexture> {
  const canvas = document.createElement('canvas');
  canvas.width = faceWidth;
  canvas.height = faceHeight;
  const ctx = canvas.getContext('2d')!;

  // Draw base kraft texture
  if (baseTexture.image) {
    ctx.drawImage(baseTexture.image, 0, 0, faceWidth, faceHeight);
  }

  // Draw uploaded image if exists
  if (faceImage) {
    try {
      const img = await loadImage(faceImage.imageUrl);
      
      const scale = faceImage.scale || 0.8;
      const rotation = (faceImage.rotation || 0) * Math.PI / 180;
      const posX = faceImage.position.x * faceWidth;
      const posY = faceImage.position.y * faceHeight;
      
      const imgWidth = faceWidth * scale;
      const imgHeight = (img.height / img.width) * imgWidth;

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate(rotation);
      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      ctx.restore();
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }

  // Draw text elements
  for (const textEl of textElements) {
    const posX = textEl.position.x * faceWidth;
    const posY = textEl.position.y * faceHeight;
    const rotation = (textEl.rotation || 0) * Math.PI / 180;

    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate(rotation);
    
    ctx.font = `${textEl.size}px ${textEl.font}`;
    ctx.fillStyle = textEl.color;
    ctx.textAlign = textEl.align;
    ctx.textBaseline = 'middle';
    
    // Add text outline for better visibility
    ctx.strokeStyle = textEl.color === '#FFFFFF' ? '#000000' : '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeText(textEl.text, 0, 0);
    ctx.fillText(textEl.text, 0, 0);
    
    ctx.restore();
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}

/**
 * Get face dimensions based on box dimensions (in texture pixels)
 */
export function getFaceDimensions(
  face: BoxFace,
  length: number,
  width: number,
  height: number,
  resolution: number = 512
): { width: number; height: number } {
  // Calculate aspect ratio and scale to resolution
  switch (face) {
    case 'front':
    case 'back':
      return {
        width: Math.floor(resolution * (width / Math.max(width, height))),
        height: Math.floor(resolution * (height / Math.max(width, height))),
      };
    case 'left':
    case 'right':
      return {
        width: Math.floor(resolution * (length / Math.max(length, height))),
        height: Math.floor(resolution * (height / Math.max(length, height))),
      };
    case 'top-front':
    case 'top-back':
      // Width flaps - same width as front/back, but flap depth is ~half of height
      return {
        width: Math.floor(resolution * (width / Math.max(width, height))),
        height: Math.floor(resolution * 0.5), // Flap is typically half the box height
      };
    case 'top-left':
    case 'top-right':
      // Length flaps - same length as left/right, but flap depth is ~half of height
      return {
        width: Math.floor(resolution * (length / Math.max(length, height))),
        height: Math.floor(resolution * 0.5), // Flap is typically half the box height
      };
    case 'bottom':
      return {
        width: Math.floor(resolution * (width / Math.max(width, length))),
        height: Math.floor(resolution * (length / Math.max(width, length))),
      };
    default:
      return { width: resolution, height: resolution };
  }
}
