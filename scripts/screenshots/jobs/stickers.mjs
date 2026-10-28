// Sticker editor QA (desktop or mobile via VIEWPORT=mobile)
export default async ({ d, page, grab, Q, log, sleep, step }) => {
  const jsClick = (t) => page.eval(`(() => { const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') === ${JSON.stringify(t)}) || x.textContent.trim() === ${JSON.stringify(t)}); if (!b) throw new Error('no button ' + ${JSON.stringify(t)}); b.scrollIntoView({ block: 'center' }); b.click(); })()`);
  const vp = process.env.VIEWPORT === 'mobile' ? 'mobile' : 'desktop';
  const pre = `stk-${vp}`;
  step('stickers open');
  await d.open({ url: '/box-designer?style=produce', viewport: vp });
  await d.stopSpin();
  await d.tab('customize');
  await page.click({ sel: 'button[role="radio"]', within: '[aria-label="Box surface"]', text: 'Front' });
  await sleep(600);
  await grab(`${pre}-01-customize`);
  // search
  step('stickers search');
  await page.type({ sel: 'input[aria-label="Search cutouts"]' }, 'mango');
  await sleep(1200);
  await page.rect({ sel: 'input[aria-label="Search cutouts"]', block: 'start' });
  await grab(`${pre}-02-search-mango`);
  const thumbs = await Q.texts('[role="list"][aria-label="Cutouts"] button');
  log('thumb count ' + thumbs.length + ' ' + thumbs.slice(0, 5).join(','));
  const broken = await page.eval(`[...document.querySelectorAll('[role="list"][aria-label="Cutouts"] img')].filter(i => !i.complete || i.naturalWidth === 0).length`);
  log('broken thumbs: ' + broken);
  step('stickers add');
  await page.click({ sel: 'button', labelStarts: 'Add ', within: '[role="list"][aria-label="Cutouts"]', nth: 0 });
  await sleep(1200);
  await grab(`${pre}-03-added`);
  const stk = () => page.eval(`(() => { const e = document.querySelector('[data-sticker-id]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height, id: e.dataset.stickerId, count: document.querySelectorAll('[data-sticker-id]').length, tf: e.style.transform, left: e.style.left, top: e.style.top, w2: e.style.width }; })()`);
  log('sticker ' + JSON.stringify(await stk()));
  // drag
  step('stickers drag');
  let s = await stk();
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: s.x, y: s.y });
  await page.mouse('mousePressed', s.x, s.y);
  for (let i = 1; i <= 8; i++) await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: s.x + i * 8, y: s.y + i * 4, buttons: 1 });
  await page.mouse('mouseReleased', s.x + 64, s.y + 32);
  await sleep(500);
  log('after drag ' + JSON.stringify(await stk()));
  // resize with corner handle
  step('stickers resize');
  s = await stk();
  const corner = await page.eval(`(() => { const e = document.querySelector('[data-sticker-id]'); const h = [...e.querySelectorAll('span')].filter(x => x.className.includes('h-3.5') && !x.className.includes('rounded-full')); const r = h[3].getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: corner.x, y: corner.y });
  await page.mouse('mousePressed', corner.x, corner.y);
  for (let i = 1; i <= 6; i++) await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: corner.x + i * 6, y: corner.y + i * 6, buttons: 1 });
  await page.mouse('mouseReleased', corner.x + 36, corner.y + 36);
  await sleep(500);
  log('after resize ' + JSON.stringify(await stk()));
  // rotate
  step('stickers rotate');
  const rot = await page.eval(`(() => { const e = document.querySelector('[data-sticker-id]'); const h = e.querySelector('span[title^="Rotate"]'); const r = h.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rot.x, y: rot.y });
  await page.mouse('mousePressed', rot.x, rot.y);
  for (let i = 1; i <= 6; i++) await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rot.x + i * 10, y: rot.y + i * 3, buttons: 1 });
  await page.mouse('mouseReleased', rot.x + 60, rot.y + 18);
  await sleep(500);
  log('after rotate ' + JSON.stringify(await stk()));
  await grab(`${pre}-04-moved-resized-rotated`);
  // controls: flip, tint
  step('stickers controls');
  await page.click({ sel: 'button', text: 'Flip' });
  await page.click({ sel: 'button', labelStarts: 'Tint ', nth: 2 });
  await sleep(800);
  await page.rect({ sel: 'button', text: 'Flip', block: 'start' });
  await grab(`${pre}-05-flip-tint`);
  // duplicate, delete
  await page.click({ sel: 'button', text: 'Duplicate' });
  await sleep(600);
  log('after duplicate count ' + (await stk()).count);
  await page.click({ sel: 'button', text: 'Delete' });
  await sleep(600);
  log('after delete count ' + (await stk())?.count);
  // pattern fill
  step('stickers pattern');
  await page.click({ sel: 'button', text: '✦ Mango', exact: false });
  await sleep(500);
  const sw = await page.exists({ sel: 'button[role="switch"]' });
  log('pattern switch present ' + sw);
  await page.click({ sel: 'button[role="switch"]', nth: 0 });
  await sleep(1200);
  await grab(`${pre}-06-pattern`);
  // undo / redo
  step('stickers undo');
  await page.key('z', 'KeyZ', 90, 2);
  await sleep(500);
  await jsClick('Undo');
  await sleep(500);
  await grab(`${pre}-07-after-undo`);
  await jsClick('Redo');
  await sleep(500);
  // surprise + match brand
  step('stickers surprise');
  await jsClick('Surprise me');
  await sleep(1500);
  await d.p.settle(1500);
  await grab(`${pre}-08-surprise`);
  await jsClick('Match brand colour');
  await sleep(600);
  await grab(`${pre}-09-match-open`);
  await page.eval(`document.querySelectorAll('button[aria-label^="Use "]')[1].click()`);
  await sleep(1200);
  await grab(`${pre}-10-match-done`);
  // reload keeps stickers
  step('stickers reload');
  await sleep(1200);
  const before = await page.eval(`JSON.parse(localStorage.getItem('vayu-box-designer:v1')).stickers.length`);
  await page.navigate((await page.eval('location.href')));
  await page.waitCanvas();
  await sleep(2500);
  const after = await page.eval(`JSON.parse(localStorage.getItem('vayu-box-designer:v1')).stickers.length`);
  log(`stickers before reload ${before}, after ${after}`);
  await d.scrollToTool();
  await grab(`${pre}-11-reloaded`);
};
