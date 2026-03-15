/**
 * Canvas Capture Utility
 * Captures Three.js canvas as image for sharing/download
 */

import * as THREE from 'three';

/**
 * Capture the Three.js canvas as a data URL
 * @param gl - WebGL renderer from Three.js
 * @param format - Image format ('png' or 'jpeg')
 * @param quality - Image quality for JPEG (0-1)
 * @returns Data URL of the captured image
 */
export function captureCanvas(
  gl: THREE.WebGLRenderer,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): string {
  const canvas = gl.domElement;
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Capture canvas and trigger download
 * @param gl - WebGL renderer from Three.js
 * @param filename - Name for the downloaded file
 */
export function downloadCanvasImage(
  gl: THREE.WebGLRenderer,
  filename: string = `box-design-${Date.now()}.png`
): void {
  const dataUrl = captureCanvas(gl, 'png');
  
  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert data URL to Blob
 * @param dataUrl - Data URL string
 * @returns Blob object
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}
