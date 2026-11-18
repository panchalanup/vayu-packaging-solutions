/**
 * Home illustrations in place: the Range (hovering each row swaps the image), Industries (each tab) and the first
 * process card, at desktop and phone width, plus the 3-ply product page. For reviewing the kit v2 artwork.
 *
 *   MSYS_NO_PATHCONV=1 node scripts/screenshots/qa.mjs scripts/screenshots/jobs/home-images.mjs
 *   IMG_OUT=C:/tmp/home-images IMG_VIEWS=desktop node scripts/screenshots/qa.mjs ...
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OUT = process.env.IMG_OUT || path.join(os.tmpdir(), 'vayu-home-images');
const VIEWS = (process.env.IMG_VIEWS || 'desktop,mobile').split(',');

/** Scroll so the element matching `sel` sits `offset` px below the top of the viewport */
const scrollTo = (sel, offset = 90) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; scrollTo(0, el.getBoundingClientRect().top + scrollY - ${offset}); return true; })()`;

export default async ({ d, page, grab, log, sleep, step }) => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const view of VIEWS) {
    step?.(`home-${view}`);
    await d.open({ url: '/', viewport: view, canvas: false });
    await sleep(2500);
    // walk the page once so reveals and lazy images run
    const h = await page.eval('document.documentElement.scrollHeight');
    for (let y = 0; y < h; y += 600) {
      await page.eval(`scrollTo(0, ${y})`);
      await sleep(120);
    }

    if (await page.eval(scrollTo('#range ol'))) {
      await sleep(900);
      const rows = await page.eval(`document.querySelectorAll('#range ol > li').length`);
      for (let i = 0; i < rows; i++) {
        if (view === 'desktop') await page.eval(`document.querySelectorAll('#range ol > li')[${i}].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))`);
        else await page.eval(`(() => { const li = document.querySelectorAll('#range ol > li')[${i}]; li.querySelector('button')?.click(); li.scrollIntoView({ block: 'start' }); scrollBy(0, -80); })()`);
        await sleep(1100);
        await grab(`range-${i}-${view}`, { dir: OUT });
      }
    } else log('range not found');

    if (await page.eval(scrollTo('[data-section="industries"]', 0))) {
      await sleep(800);
      const tabs = await page.eval(`document.querySelectorAll('[role="tab"][id^="industry-tab-"]').length`);
      for (let i = 0; i < tabs; i++) {
        await page.eval(`document.querySelectorAll('[role="tab"][id^="industry-tab-"]')[${i}].click()`);
        if (view === 'mobile') await page.eval(scrollTo('#industry-panel', 70));
        await sleep(900);
        await grab(`industry-${i}-${view}`, { dir: OUT });
      }
    } else log('industries not found');

    if (await page.eval(scrollTo('[data-section="process"] li[data-step="0"], li[data-step="0"]', 80))) {
      await sleep(900);
      await grab(`process-0-${view}`, { dir: OUT });
    } else log('process not found');
  }
  step?.('product');
  await d.open({ url: '/products/3-ply', viewport: 'desktop', canvas: false });
  await sleep(2500);
  await grab('product-3-ply-desktop', { dir: OUT });
  log('saved to', OUT);
};
