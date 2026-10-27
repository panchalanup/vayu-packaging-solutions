/** Shared QA helpers built on the Designer driver (see qa.mjs). */
import fs from 'node:fs';
import path from 'node:path';
import { sleep, SCRATCH, LOGO_URL } from './capture.mjs';

export const QA_HELPERS = (d, page, grab) => ({
  /** Names of the buttons inside the assembly dock stops */
  async stops() {
    await d.openAssembly();
    const names = await page.eval(`[...document.querySelectorAll('[aria-label="Assembly stops"] button')].map(b => b.textContent.trim())`);
    await d.closeDock();
    return names;
  },
  async texts(sel) {
    return page.eval(`[...document.querySelectorAll(${JSON.stringify(sel)})].map(b => (b.getAttribute('aria-label')||'') + '|' + b.textContent.trim().slice(0,40))`);
  },
  /** PNG buffer of just the 3D stage (the canvas box) */
  async stage(scale = 0.6) {
    if (!d.mobile) await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1100, y: 28 });
    await sleep(250);
    const rect = await page.eval(`(() => { const r = document.querySelector('#designer-tool canvas').getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })()`);
    const res = await page.send('Page.captureScreenshot', { format: 'png', fromSurface: true, clip: { ...rect, scale } }, 45_000);
    return { data: res.data, w: Math.round(rect.width * scale), h: Math.round(rect.height * scale) };
  },
  /** Compose labelled tiles into one image in the page, save to scratch, return the path */
  async sheet(name, tiles, cols = 3) {
    const tw = tiles[0].w;
    const th = tiles[0].h;
    const rows = Math.ceil(tiles.length / cols);
    const out = await page.eval(`(async () => {
      const tiles = ${JSON.stringify(tiles.map((t) => ({ data: t.data, label: t.label ?? '' })))};
      const tw = ${tw}, th = ${th}, cols = ${cols}, rows = ${rows};
      const c = document.createElement('canvas');
      c.width = tw * cols; c.height = (th + 22) * rows;
      const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < tiles.length; i++) {
        const img = new Image(); img.src = 'data:image/png;base64,' + tiles[i].data; await img.decode();
        const x = (i % cols) * tw, y = Math.floor(i / cols) * (th + 22);
        g.drawImage(img, x, y + 22, tw, th);
        g.fillStyle = '#111'; g.font = 'bold 15px Arial'; g.fillText(tiles[i].label, x + 6, y + 16);
        g.strokeStyle = '#999'; g.strokeRect(x, y, tw, th + 22);
      }
      return c.toDataURL('image/png').split(',')[1];
    })()`, 60_000);
    const file = path.join(SCRATCH, `${name}.png`);
    fs.writeFileSync(file, Buffer.from(out, 'base64'));
    return file;
  },
  /** design patch that puts a logo and the face name on every face id */
  faceLabelPatch(scale = 0.3) {
    const faces = ['front', 'back', 'left', 'right', 'top-front', 'top-back', 'top-left', 'top-right', 'bottom', 'lid', 'lid-front', 'lid-back', 'lid-left', 'lid-right'];
    return `d.showIcons = false;
      d.faceImages = ${JSON.stringify(faces)}.map((f) => ({ face: f, imageUrl: ${JSON.stringify(LOGO_URL)}, position: { x: 0.5, y: 0.35 }, scale: ${scale}, rotation: 0 }));
      d.textElements = ${JSON.stringify(faces)}.map((f, i) => ({ id: 'tt' + i, face: f, text: f, font: 'Inter', size: 30, color: '#1B2A22', position: { x: 0.5, y: 0.78 }, rotation: 0, align: 'center' }));`;
  },
});
