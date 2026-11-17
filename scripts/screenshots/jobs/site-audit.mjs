/**
 * Site-wide UI audit: every public route at desktop (1440) and phone (390) width. Walks each page so reveals run,
 * records DOM checks (sideways overflow, broken images, missing alt, hover lifts inside clipping boxes, clipped text,
 * small tap targets) and saves 7 screenshots per page from top to bottom, plus report.json.
 *
 *   node scripts/screenshots/qa.mjs scripts/screenshots/jobs/site-audit.mjs
 *   AUDIT_ROUTES=/,/products AUDIT_VIEWS=mobile AUDIT_SHOTS=4 QA_MINUTES=60 node scripts/screenshots/qa.mjs ...
 *
 * textClip also lists sr-only text (e.g. "(opens WhatsApp)"); ignore those. Images lifted inside image frames are intended.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OUT = process.env.AUDIT_OUT || path.join(os.tmpdir(), 'vayu-site-audit');
const ROUTES = (process.env.AUDIT_ROUTES || [
  '/', '/about', '/services', '/locations', '/products', '/products/3-ply', '/industries/e-commerce', '/quote', '/contact',
  '/compare-quote', '/tools', '/tools/box-size-calculator', '/blogs', '/blogs/box-measurements-guide', '/3d-box-designer',
  '/3d-box-designer/experience', '/box-designer/mailer-box', '/privacy', '/image-credits', '/does-not-exist',
].join(',')).split(',');
const VIEWS = (process.env.AUDIT_VIEWS || 'desktop,mobile').split(',');
const SHOTS = Number(process.env.AUDIT_SHOTS || 7);

const CHECK = `(() => {
  const vw = innerWidth, out = {};
  const clipAnc = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (s.overflowX !== 'visible' || s.overflowY !== 'visible') return a; } return null; };
  out.docOverflow = document.documentElement.scrollWidth - vw;
  out.wide = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); if (!r.width || getComputedStyle(el).position === 'fixed') return false; return (r.right > vw + 1 || r.left < -1) && !clipAnc(el); }).slice(0, 8).map((el) => el.tagName + '.' + String(el.className).slice(0, 80));
  out.brokenImg = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src.slice(-80));
  out.noAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).length;
  out.liftClip = [...document.querySelectorAll('[class*="hover:-translate-y"],[class*="hover:scale-1"]')].map((el) => { const a = clipAnc(el); if (!a) return null; const r = el.getBoundingClientRect(), ar = a.getBoundingClientRect(); return r.top - ar.top < 6 || ar.bottom - r.bottom < 0 ? el.tagName + '.' + String(el.className).slice(0, 70) : null; }).filter(Boolean).slice(0, 6);
  out.textClip = [...document.querySelectorAll('h1,h2,h3,h4,p,a,button,span,label')].filter((el) => { const s = getComputedStyle(el); if (s.textOverflow === 'ellipsis' || s.webkitLineClamp !== 'none' && s.webkitLineClamp) return false; if (!el.textContent.trim() || el.children.length > 2) return false; return (s.overflowX !== 'visible' || s.overflowY !== 'visible') && (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 3); }).slice(0, 8).map((el) => el.tagName + ':' + el.textContent.trim().slice(0, 40));
  out.tinyTargets = [...document.querySelectorAll('a[href],button')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.width < 24 || r.height < 24) && getComputedStyle(el).visibility !== 'hidden'; }).length;
  out.height = document.documentElement.scrollHeight;
  return out;
})()`;

export default async ({ d, page, grab, log, sleep, step }) => {
  fs.mkdirSync(OUT, { recursive: true });
  const report = [];
  for (const view of VIEWS) {
    for (const route of ROUTES) {
      const slug = (route === '/' ? 'home' : route.slice(1).replace(/\//g, '_')) + '-' + view;
      step?.(slug);
      try {
        await d.open({ url: route, viewport: view, canvas: false });
        await sleep(2500);
        // walk down so reveals, lazy images and counters run
        let h = await page.eval('document.documentElement.scrollHeight');
        const vh = await page.eval('innerHeight');
        for (let y = 0; y < h; y += Math.round(vh * 0.7)) {
          await page.eval(`scrollTo(0, ${y})`);
          await sleep(220);
          h = await page.eval('document.documentElement.scrollHeight');
        }
        await sleep(800);
        const res = await page.eval(CHECK);
        report.push({ route, view, ...res });
        log(slug, JSON.stringify(res));
        const max = Math.max(0, res.height - vh);
        for (let i = 0; i < SHOTS; i++) {
          const y = Math.round((max * i) / Math.max(1, SHOTS - 1));
          await page.eval(`scrollTo(0, ${y})`);
          await sleep(900);
          await grab(`${slug}-${i}`, { dir: OUT, maxWidth: view === 'mobile' ? 600 : 1200 });
        }
      } catch (e) {
        log('FAILED', slug, e.message);
        report.push({ route, view, error: e.message });
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
};
