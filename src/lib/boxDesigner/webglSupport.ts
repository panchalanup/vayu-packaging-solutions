/**
 * WebGL capability check
 * Lets the page show a friendly fallback instead of crashing when WebGL is unavailable or disabled.
 */

let cached: boolean | null = null;

/**
 * Returns true when a WebGL context can be created.
 * The probe context is released immediately. Nothing is sent anywhere; this only touches a detached canvas.
 */
export function isWebGLAvailable(): boolean {
  if (cached !== null) return cached;
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    cached = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }

  return cached;
}

/** Test hook: clear the memoised result */
export function resetWebGLSupportCache(): void {
  cached = null;
}
