/**
 * Real-browser QA for /3d-box-designer (headless Edge over CDP, same harness as scripts/screenshots).
 *
 *   node scripts/showcase/qa.mjs --mode visual  [--base http://localhost:8080] [--out <dir>]
 *   node scripts/showcase/qa.mjs --mode layout    no horizontal scroll at 320..1440, tap-target and console check
 *   node scripts/showcase/qa.mjs --mode perf      frame pacing while scrolling the whole page, 3D on and off
 *   node scripts/showcase/qa.mjs --mode network   Slow 3G / Fast 3G: first content, bytes, interactivity (use a production build)
 *   node scripts/showcase/qa.mjs --mode interact  typing a size, style chips, audience switch, hotspots, downloads
 *
 * Without --base it starts (or reuses) `npm run dev` on :8080. For size and network numbers pass --base to a
 * `vite preview` of a production build (dev mode serves unbundled modules and says nothing about real weight).
 * Hard timeout 15 minutes; Edge and any server started here are always killed.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as H from '../screenshots/capture.mjs';

const { Cdp, Page, withTimeout, sleep, log, ensureDevServer, launchEdge, cleanupAll, cleanups, PORT, NOISE } = H;
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const MODE = opt('mode', 'visual');
const BASE = opt('base', H.BASE);
const OUT = path.resolve(opt('out', path.join(os.tmpdir(), 'vayu-showcase-qa')));
fs.mkdirSync(OUT, { recursive: true });
const PATH = opt('path', '/3d-box-designer');
const EXPERIENCE = PATH.includes('experience');

const hard = setTimeout(() => {
  console.error('hard timeout');
  cleanupAll();
  process.exit(2);
}, 15 * 60 * 1000);

const issues = [];
let netBytes = 0;
const netLog = [];

async function connect() {
  await launchEdge();
  const target = await (await withTimeout(fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }), 8000, 'new tab')).json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  cleanups.push(() => cdp.close());
  const page = new Page(cdp);
  for (const m of ['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable']) await page.send(m);
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type !== 'error' && p.type !== 'warning') return;
    const msg = p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300);
    if (!NOISE.some((r) => r.test(msg)) && !/Content Security Policy/i.test(msg)) issues.push(`console.${p.type}: ${msg}`);
  });
  cdp.on('Runtime.exceptionThrown', (p) => issues.push(`exception: ${(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text).slice(0, 300)}`));
  const urls = new Map();
  cdp.on('Network.requestWillBeSent', (p) => urls.set(p.requestId, p.request.url));
  cdp.on('Network.loadingFinished', (p) => {
    netBytes += p.encodedDataLength;
    netLog.push({ url: urls.get(p.requestId) ?? '?', bytes: p.encodedDataLength, t: Date.now() });
  });
  return page;
}

async function open(page, { w, h, mobile, reduced = false, query = '', throttle = null, cache = false }) {
  await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
  await page.send('Network.setCacheDisabled', { cacheDisabled: !cache });
  await page.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await page.navigate(`${BASE}/robots.txt`, 30_000);
  await page.eval(`localStorage.clear(); sessionStorage.clear(); localStorage.setItem('vayu_analytics_consent_v1', 'denied');`);
  netBytes = 0;
  netLog.length = 0;
  if (throttle) await page.send('Network.emulateNetworkConditions', { offline: false, ...throttle });
  const t0 = Date.now();
  await page.navigate(`${BASE}${PATH}${query}`, 180_000);
  const loadMs = Date.now() - t0;
  await page.eval(`(() => { const s = document.createElement('style'); s.textContent = '[data-sonner-toaster], [aria-label="Analytics preferences"], vite-error-overlay { display: none !important; }'; document.head.appendChild(s); })()`);
  return loadMs;
}

const waitFor = async (page, expr, ms = 60_000, label = expr) => {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await page.eval(expr).catch(() => false)) return true;
    await sleep(250);
  }
  throw new Error(`timed out waiting for ${label}`);
};

const stageReady3d = (page, ms = 90_000) =>
  waitFor(page, `(() => { const s = document.querySelector('[data-stage]'); const c = s && s.querySelector('canvas'); if (!c) return false; const wrap = c.closest('div[style*="opacity"]'); return !!wrap && parseFloat(getComputedStyle(wrap).opacity) > 0.9; })()`, ms, '3D layer visible');

async function shot(page, name, keepPointer = false) {
  // park the pointer on dead space so no hover state leaks into the picture (unless the picture is of a hover state)
  if (!keepPointer) await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 3, y: 3 });
  await sleep(250);
  const res = await page.send('Page.captureScreenshot', { format: 'png', fromSurface: true }, 45_000);
  const file = path.join(OUT, name);
  fs.writeFileSync(file, Buffer.from(res.data, 'base64'));
  log('saved', file);
  return file;
}

/** Scroll so that the unfold progress p is at the reading line, then let the eased scene settle */
async function atUnfold(page, p, settle = 1500) {
  await page.eval(`(() => {
    const r = document.querySelector('[data-unfold-range]').getBoundingClientRect();
    const target = scrollY + r.top - innerHeight * 0.52 + ${p} * r.height;
    window.scrollTo({ top: target, behavior: 'instant' });
  })()`);
  await sleep(settle);
}
const toId = async (page, id, offset = 0, settle = 1200) => {
  await page.eval(`(() => { const e = document.getElementById(${JSON.stringify(id)}) || document.querySelector(${JSON.stringify(id)}); if (!e) return; const t = e.closest('section') || e; window.scrollTo({ top: scrollY + t.getBoundingClientRect().top - ${offset}, behavior: 'instant' }); })()`);
  await sleep(settle);
};

// ---------------------------------------------------------------------------------------------------------------

async function visual(page) {
  for (const [label, cfg] of [
    ['desktop', { w: 1440, h: 900, mobile: false, query: '?quality=high' }],
    ['mobile', { w: 390, h: 844, mobile: true, query: '?quality=medium' }],
  ].filter(([label]) => !opt('viewport') || opt('viewport') === label)) {
    log(`--- visual ${label}`);
    await open(page, cfg);
    await waitFor(page, `!!document.querySelector('h1')`);
    await sleep(1500);
    await stageReady3d(page).catch(() => log('3D layer did not become visible (software renderer)'));
    await sleep(EXPERIENCE ? 6000 : 1500); // the film opens with a flat sheet folding into the box
    await shot(page, `${label}-01-hero.png`);
    for (const p of [0.1, 0.3, 0.5, 0.62, 0.7, 0.8, 0.95]) {
      await atUnfold(page, p, 1800);
      await shot(page, `${label}-02-unfold-${String(Math.round(p * 100)).padStart(2, '0')}.png`);
    }
    if (EXPERIENCE) {
      await atUnfold(page, 1.0, 1800);
      await shot(page, `${label}-03-print.png`);
    } else {
      await toId(page, 'anatomy', 120, 1800);
      await shot(page, `${label}-03-anatomy.png`);
    }
    const rest = EXPERIENCE
      ? [['#any-h', '04-any'], ['#price-h', '04b-price'], ['#share-h', '05-share'], ['#sides-h', '06-sides'], ['#close-h', '07-close']]
      : [['styles', '04-styles'], ['share', '05-share'], ['exports', '06-take'], ['start', '07-start'], ['faq', '08-faq']];
    for (const [id, name] of rest) {
      await toId(page, id, 80, 900);
      await shot(page, `${label}-${name}.png`);
    }
  }
}

async function layout(page) {
  for (const w of [320, 360, 390, 768, 1024, 1440]) {
    const mobile = w < 768;
    await open(page, { w, h: mobile ? 760 : 900, mobile, query: '?quality=low' });
    await waitFor(page, `!!document.querySelector('h1')`);
    await sleep(800);
    // scroll through so lazy content and reveals mount, then measure
    const total = await page.eval('document.documentElement.scrollHeight');
    for (let y = 0; y < total; y += 700) {
      await page.eval(`window.scrollTo({ top: ${y}, behavior: 'instant' })`);
      await sleep(60);
    }
    const r = await page.eval(`(() => {
      const de = document.documentElement;
      const wide = [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && b.width > 0 && getComputedStyle(e).position !== 'fixed' && !e.closest('[class*="overflow-x-auto"]') && !e.closest('svg'); }).slice(0, 4).map((e) => e.tagName + '.' + String(e.className).slice(0, 60) + ' right=' + Math.round(e.getBoundingClientRect().right));
      const small = [...document.querySelectorAll('main button, main a, main input, main select, main [role=radio]')].filter((e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && (b.height < 32 || b.width < 32) && !e.classList.contains('sr-only') && !e.closest('.sr-only') && !e.matches('input[type=range]'); }).slice(0, 6).map((e) => (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
      return { scrollW: de.scrollWidth, innerW: innerWidth, overflow: de.scrollWidth > innerWidth + 1, wide, small };
    })()`);
    log(`${w}px: scrollWidth ${r.scrollW} / ${r.innerW} ${r.overflow ? 'OVERFLOW' : 'ok'}`, r.wide.length ? `wide: ${r.wide.join(' | ')}` : '', r.small.length ? `small targets: ${r.small.join(' | ')}` : '');
  }
}

/** rAF pacing while "wheel scrolling" top to bottom: p50/p95 frame time, frames over 33 / 50 ms, long main-thread tasks */
async function pacing(page, label) {
  const result = await page.eval(
    `new Promise((resolve) => {
      const frames = []; const longs = []; const slow = [];
      try { new PerformanceObserver((l) => l.getEntries().forEach((e) => longs.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] }); } catch {}
      const total = document.documentElement.scrollHeight - innerHeight;
      let y = 0; let last = performance.now(); const speed = ${label.includes('slow') ? 14 : 26};
      const tick = (t) => {
        const gap = t - last; frames.push(gap); if (gap > 40) slow.push([Math.round(y), Math.round(gap)]); last = t;
        y += speed; window.scrollTo(0, y);
        if (y < total) requestAnimationFrame(tick);
        else { const s = [...frames].sort((a, b) => a - b); const q = (p) => Math.round(s[Math.floor(s.length * p)] * 10) / 10; resolve({ frames: frames.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), over33: frames.filter((f) => f > 33).length, over50: frames.filter((f) => f > 50).length, longTasks: longs.length, longMax: Math.max(0, ...longs), where: (() => { const secs = [...document.querySelectorAll('main section, main [data-chapter]')].map((e) => ({ id: e.getAttribute('aria-labelledby') || e.dataset.chapter || e.getAttribute('aria-label') || e.tagName, top: e.getBoundingClientRect().top + scrollY, h: e.getBoundingClientRect().height })); const hist = {}; for (const [yy] of slow) { const mid = yy + innerHeight / 2; const sec = secs.find((x) => mid >= x.top && mid < x.top + x.h); const k = sec ? sec.id : 'other'; hist[k] = (hist[k] || 0) + 1; } return hist; })() }); }
      };
      requestAnimationFrame(tick);
    })`,
    240_000
  );
  log(`pacing ${label}:`, JSON.stringify(result));
  return result;
}

async function perf(page) {
  for (const [label, cfg] of [
    ['desktop 3D (software GL)', { w: 1440, h: 900, mobile: false, query: '?quality=high' }],
    ['desktop no-3D', { w: 1440, h: 900, mobile: false, query: '?quality=low' }],
    ['mobile no-3D', { w: 390, h: 844, mobile: true, query: '?quality=low' }],
    ['mobile 3D medium (software GL)', { w: 390, h: 844, mobile: true, query: '?quality=medium' }],
  ]) {
    log(`--- perf ${label}`);
    await open(page, cfg);
    await waitFor(page, `!!document.querySelector('h1')`);
    if (!label.includes('no-3D')) await stageReady3d(page).catch(() => log('3D not visible yet'));
    await sleep(1500);
    await pacing(page, label);
  }
}

async function network(page) {
  const profiles = {
    'Slow 3G (400 kbps, 400 ms)': { latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 },
    'Fast 3G (1.6 Mbps, 150 ms)': { latency: 150, downloadThroughput: (1600 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
  };
  for (const [name, profile] of Object.entries(profiles)) {
    for (const [mode, w, h, mobile, query] of [
      ['phone, auto tier', 390, 844, true, ''],
      ['phone, low tier (what Save-Data / 2G-3G reports)', 390, 844, true, '?quality=low'],
    ]) {
      log(`--- ${name} / ${mode}`);
      const t0 = Date.now();
      await page.send('Page.enable');
      const loadMs = await open(page, { w, h, mobile, query, throttle: profile });
      const h1At = await waitFor(page, `!!document.querySelector('h1')`, 240_000).then(() => Date.now() - t0);
      // a usable first screen: heading + size inputs + stage poster
      const usable = await waitFor(page, EXPERIENCE ? `document.querySelectorAll('[role=radio]').length >= 6 && !!document.querySelector('[data-stage] svg')` : `document.querySelectorAll('input[inputmode=decimal]').length === 3 && !!document.querySelector('[data-stage] svg')`, 240_000).then(() => Date.now() - t0);
      const bytesFirst = netBytes;
      // interactivity: type a size and see the stage follow, while anything else is still downloading
      const before = await page.eval(`document.querySelector('[data-stage] svg') ? document.querySelectorAll('[data-stage] .dl svg').length : 0`);
      let typed;
      if (EXPERIENCE) {
        // the film's control: pick the second colour dot and see it become the selected one
        await page.eval(`document.querySelectorAll('[role=radio]')[1].click()`);
        await sleep(400);
        typed = (await page.eval(`document.querySelectorAll('[role=radio]')[1].getAttribute('aria-checked')`)) === 'true' ? '400' : 'no';
      } else {
        await page.eval(`(() => { const i = document.querySelectorAll('input[inputmode=decimal]')[0]; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, '400'); i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
        await sleep(400);
        typed = await page.eval(`document.querySelectorAll('input[inputmode=decimal]')[0].value`);
      }
      await sleep(8000);
      const hasCanvas = await page.eval(`!!document.querySelector('[data-stage] canvas')`);
      const chunks = netLog.filter((n) => /three|ShowcaseCanvas|fiber|drei/i.test(n.url)).reduce((a, n) => a + n.bytes, 0);
      log(
        `load event ${(loadMs / 1000).toFixed(1)} s | heading visible ${(h1At / 1000).toFixed(1)} s | first screen usable ${(usable / 1000).toFixed(1)} s | bytes by then ${(bytesFirst / 1024).toFixed(0)} KB | control responds: ${typed === '400'} | 3D canvas mounted by +8 s: ${hasCanvas} | 3D chunk bytes so far ${(chunks / 1024).toFixed(0)} KB | total ${(netBytes / 1024).toFixed(0)} KB (stage svgs ${before})`
      );
      const top = [...netLog].sort((a, b) => b.bytes - a.bytes).slice(0, 7).map((n) => `${(n.bytes / 1024).toFixed(0)} KB ${n.url.replace(BASE, '').slice(0, 52)}`);
      log('  biggest resources:', top.join(' | '));
      await shot(page, `net-${name.split(' ')[0].toLowerCase()}-${query ? 'low' : 'auto'}.png`);
    }
  }
  await page.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
}

async function menu(page) {
  log('--- tools menu, desktop');
  await open(page, { w: 1440, h: 900, mobile: false, query: '?quality=low' });
  await waitFor(page, `!!document.querySelector('h1')`);
  await sleep(800);
  const trig = await page.eval(`(() => { const b = [...document.querySelectorAll('header button')].find((b) => /^Tools/.test(b.textContent.trim())); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, expanded: b.getAttribute('aria-expanded') }; })()`);
  log('trigger found, aria-expanded before:', trig.expanded);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: trig.x, y: trig.y });
  await sleep(900);
  log('after hover, aria-expanded:', await page.eval(`[...document.querySelectorAll('header button')].find((b) => /^Tools/.test(b.textContent.trim())).getAttribute('aria-expanded')`));
  await shot(page, 'menu-desktop-hover.png', true);
  // move to the second category: the right side must swap in place
  const cat = await page.eval(`(() => { const b = [...document.querySelectorAll('[aria-label="Tool categories"] button')][1]; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cat.x, y: cat.y });
  await sleep(700);
  log('second category items:', await page.eval(`[...document.querySelectorAll('[aria-label="Tool categories"] ~ div a')].length`));
  await shot(page, 'menu-desktop-calculators.png', true);
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(500);
  log('Esc closes:', await page.eval(`[...document.querySelectorAll('header button')].find((b) => /^Tools/.test(b.textContent.trim())).getAttribute('aria-expanded')`));
  log('--- tools menu, mobile');
  await open(page, { w: 390, h: 844, mobile: true, query: '?quality=low' });
  await waitFor(page, `!!document.querySelector('h1')`);
  await page.eval(`document.querySelector('button[aria-controls="mobile-menu"]').click()`);
  await sleep(600);
  await page.eval(`[...document.querySelectorAll('#mobile-menu button')].find((b) => /^Tools/.test(b.textContent.trim())).click()`);
  await sleep(700);
  await shot(page, 'menu-mobile.png');
}


/** Unfold-only pacing with one layer switched off at a time, to find what costs frames (low tier: no WebGL) */
async function bench(page) {
  const variants = {
    baseline: '',
    'no grid': '[data-fx=grid]{display:none!important}',
    'no ghost dieline': '[data-fx=ghost]{display:none!important}',
    'no stage dieline': '[data-fx=dl]{display:none!important}',
    'no spotlight': '[data-fx=spot]{display:none!important}',
    'no words overlay': '[data-stage] > div:last-child{display:none!important}',
  };
  for (const [name, css] of Object.entries(variants)) {
    await open(page, { w: 1440, h: 900, mobile: false, query: '?quality=low' });
    await waitFor(page, `!!document.querySelector('h1')`);
    await sleep(1200);
    await page.eval(`(() => { const s = document.createElement('style'); s.id = 'bench'; s.textContent = ${JSON.stringify(css)}; document.head.appendChild(s); })()`);
    const r = await page.eval(
      `new Promise((resolve) => {
        const rg = document.querySelector('[data-unfold-range]').getBoundingClientRect();
        const start = scrollY + rg.top - innerHeight * 0.52; const end = start + rg.height;
        window.scrollTo(0, start);
        const frames = []; let y = start; let last = performance.now();
        const tick = (t) => { frames.push(t - last); last = t; y += 14; window.scrollTo(0, y); if (y < end) requestAnimationFrame(tick); else { const s = [...frames].sort((a, b) => a - b); resolve({ frames: frames.length, p50: Math.round(s[Math.floor(s.length * 0.5)] * 10) / 10, p95: Math.round(s[Math.floor(s.length * 0.95)] * 10) / 10, over33: frames.filter((f) => f > 33).length, over50: frames.filter((f) => f > 50).length }); } };
        setTimeout(() => requestAnimationFrame(tick), 500);
      })`,
      120_000
    );
    log(`bench ${name.padEnd(18)}`, JSON.stringify(r));
  }
}

async function interact(page) {
  await open(page, { w: 1440, h: 900, mobile: false, query: '?quality=high' });
  await waitFor(page, `!!document.querySelector('h1')`);
  await sleep(1200);
  const svgW = () => page.eval(`(() => { const s = document.querySelector('[data-stage] .dl svg'); return s ? s.getAttribute('viewBox') : null; })()`);
  const vb0 = await svgW();
  await page.eval(`(() => { const i = document.querySelectorAll('input[inputmode=decimal]')[0]; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, '400'); i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await sleep(500);
  const vb1 = await svgW();
  log('size typing changes the dieline sheet:', vb0, '->', vb1, vb0 !== vb1 ? 'OK' : 'FAILED');
  const hrefBefore = await page.eval(`document.querySelector('a[href^="/box-designer?style="]').getAttribute('href')`);
  log('hero CTA carries the size:', hrefBefore);
  await page.eval(`[...document.querySelectorAll('[role=radio]')].find((b) => b.textContent.trim() === 'Shipping').click()`);
  await sleep(500);
  log('style switch -> sheet', await svgW());
  await page.eval(`[...document.querySelectorAll('[role=radio]')].find((b) => b.textContent.trim() === 'I make boxes').click()`);
  await sleep(300);
  log('maker H1:', await page.eval(`document.getElementById('showcase-h1').textContent`));
  await toId(page, 'anatomy', 100, 1500);
  const hotspot = await page.eval(`(() => { const r = [...document.querySelectorAll('#anatomy rect[role=button]')][1]; if (!r) return null; const b = r.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; })()`);
  if (hotspot) {
    await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hotspot.x, y: hotspot.y });
    await sleep(700);
    log('hover a panel -> lit:', await page.eval(`!!document.querySelector('#anatomy .dl-panel-on')`));
    await shot(page, 'interact-anatomy-hover.png', true);
  } else log('no interactive panels found');
  await toId(page, 'exports', 80, 800);
  const dl = await page.eval(`(async () => { const b = [...document.querySelectorAll('#exports button')].find((b) => /Dieline PDF/.test(b.textContent)); window.__dl = 0; const orig = URL.createObjectURL; URL.createObjectURL = (blob) => { window.__dl = blob.size; return orig.call(URL, blob); }; b.click(); for (let i = 0; i < 160 && !window.__dl; i++) await new Promise((r) => setTimeout(r, 250)); return window.__dl; })()`, 60_000);
  log('sample PDF generated, bytes:', dl);
}

try {
  if (!args.includes('--base')) await ensureDevServer();
  const page = await connect();
  const modes = MODE === 'all' ? ['layout', 'interact', 'visual', 'perf'] : [MODE];
  for (const m of modes) {
    await { visual, layout, perf, network, interact, menu, bench }[m](page);
  }
  console.log('\nconsole problems:', issues.length ? '\n  ' + [...new Set(issues)].join('\n  ') : 'none');
  console.log('screenshots in', OUT);
} catch (e) {
  console.error('QA failed:', e.message);
  process.exitCode = 1;
} finally {
  clearTimeout(hard);
  cleanupAll();
}
