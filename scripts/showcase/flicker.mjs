/**
 * Flicker measurement for the hero box. Rotates the box in tiny steps by dragging, captures a frame at each step,
 * and writes them to a folder; analyse them with scripts/showcase/flicker.py (frame-to-neighbour residual).
 *   node scripts/showcase/flicker.mjs <outDir> "<query>"
 */
import fs from 'node:fs';
import path from 'node:path';
import * as H from '../screenshots/capture.mjs';

const { Cdp, Page, withTimeout, sleep, log, ensureDevServer, launchEdge, cleanupAll, cleanups, PORT, BASE } = H;
const OUT = path.resolve(process.argv[2]);
const QUERY = process.argv[3] ?? '?quality=medium';
fs.mkdirSync(OUT, { recursive: true });

try {
  await ensureDevServer();
  await launchEdge();
  const target = await (await withTimeout(fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }), 8000, 'new tab')).json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  cleanups.push(() => cdp.close());
  const page = new Page(cdp);
  for (const m of ['Page.enable', 'Runtime.enable']) await page.send(m);
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: Number(process.env.DSF ?? 1), mobile: false });
  await page.navigate(`${BASE}/robots.txt`, 30_000);
  await page.eval(`localStorage.setItem('vayu_analytics_consent_v1', 'denied')`);
  const URLPATH = process.argv[4] ?? '/3d-box-designer/experience';
  await page.navigate(`${BASE}${URLPATH}${QUERY}`, 120_000);
  // wait for the 3D layer, then for the intro fold to finish
  const t0 = Date.now();
  while (Date.now() - t0 < 120_000) {
    const ok = await page.eval(URLPATH.includes('box-designer') && !URLPATH.includes('3d-') ? `!!document.querySelector('canvas') && !document.body.innerText.includes('Loading 3D studio')` : `(() => { const c = document.querySelector('[data-stage] canvas'); if (!c) return false; const w = c.closest('div[style*="opacity"]'); return !!w && parseFloat(getComputedStyle(w).opacity) > 0.9; })()`).catch(() => false);
    if (ok) break;
    await sleep(500);
  }
  await sleep(7000);
  const x = 900;
  const y = 450;
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
  for (let i = 0; i < 14; i++) {
    await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + (i + 1), y, button: 'left', buttons: 1 });
    await sleep(900);
    const res = await page.send('Page.captureScreenshot', { format: 'png', fromSurface: true, clip: { x: 640, y: 150, width: 700, height: 560, scale: 1 / Number(process.env.DSF ?? 1) } }, 45_000);
    fs.writeFileSync(path.join(OUT, `f${String(i).padStart(2, '0')}.png`), Buffer.from(res.data, 'base64'));
  }
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + 14, y, button: 'left', buttons: 0, clickCount: 1 });
  log('captured 14 frames to', OUT);
} catch (e) {
  console.error('flicker capture failed:', e.message);
} finally {
  cleanupAll();
}
