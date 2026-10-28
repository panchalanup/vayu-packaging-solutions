/**
 * Loads TypeScript modules from src/ in plain Node through Vite's SSR loader (so the "@/" alias, TS, JSX and asset
 * imports behave exactly as in the app). Used by the SEO build scripts only.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function withViteModules(fn) {
  const server = await createServer({
    root,
    mode: 'production',
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    return await fn((id) => server.ssrLoadModule(id));
  } finally {
    await server.close();
  }
}
