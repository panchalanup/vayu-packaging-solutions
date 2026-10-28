import fs from 'node:fs';
// Every template: front 3/4 and back 3/4 side by side, six templates per sheet. RANGE=0-24 limits the run.
export default async ({ d, page, Q, log, step, sleep }) => {
  const src = fs.readFileSync('src/lib/boxDesigner/templates.ts', 'utf8');
  const ids = [...src.matchAll(/id: '([a-z0-9-]+)',\s*\n\s*name: '/g)].map((m) => m[1]);
  const [a, b] = (process.env.RANGE ?? `0-${ids.length}`).split('-').map(Number);
  let tiles = [];
  let names = [];
  const flush = async (n) => {
    if (!tiles.length) return;
    log(await Q.sheet(`tpl-${String(n).padStart(3, '0')}`, tiles, 4));
    tiles = [];
  };
  for (let i = a; i < Math.min(b, ids.length); i++) {
    const id = ids[i];
    step(`template ${id}`);
    let pair = null;
    for (let attempt = 0; attempt < 3 && !pair; attempt++) {
      try {
        await d.open({ url: `/box-designer?template=${id}` });
        await d.stopSpin();
        await page.settle(800);
        const front = { ...(await Q.stage(0.45)), label: `${i} ${id}` };
        await d.angle('Back 3/4');
        pair = [front, { ...(await Q.stage(0.45)), label: 'back' }];
      } catch (e) {
        log(`retry ${id}: ${e.message.slice(0, 80)}`);
        await sleep(3000);
      }
    }
    if (pair) tiles.push(...pair);
    if (tiles.length >= 12) await flush(i);
  }
  await flush(900 + a);
};
