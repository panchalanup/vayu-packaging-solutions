/**
 * Visual check of the footer playground (headless Edge over CDP, same harness as capture.mjs).
 *
 *   node scripts/screenshots/footerPlayground.mjs [outDir]
 *
 * For 1440 and 390 wide: landed state, a letter drag, 9 dropped boxes (designer CTA line), tidy up, and the
 * reduced-motion static state, plus a rAF frame-rate sample while boxes fall. Hard timeout 6 minutes; Edge (and the
 * dev server when started here) are always killed.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as H from './capture.mjs';

const { Cdp, Page, withTimeout, sleep, log, ensureDevServer, launchEdge, cleanupAll, cleanups, BASE, PORT, NOISE } = H;
const OUT = path.resolve(process.argv[2] ?? path.join(process.env.TEMP ?? '.', 'vayu-footer-shots'));
fs.mkdirSync(OUT, { recursive: true });

const hard = setTimeout(() => {
  console.error('timeout');
  cleanupAll();
  process.exit(2);
}, 6 * 60 * 1000);

const issues = [];
async function connect() {
  await launchEdge();
  const target = await (await withTimeout(fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }), 8000, 'new tab')).json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  cleanups.push(() => cdp.close());
  const page = new Page(cdp);
  for (const m of ['Page.enable', 'Runtime.enable', 'Log.enable']) await page.send(m);
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type !== 'error' && p.type !== 'warning') return;
    const msg = p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300);
    if (!NOISE.some((r) => r.test(msg))) issues.push(`console.${p.type}: ${msg}`);
  });
  cdp.on('Runtime.exceptionThrown', (p) => issues.push(`exception: ${(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text).slice(0, 300)}`));
  return page;
}

const mouse = (page, type, x, y) => page.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 });

async function open(page, w, h, mobile, reduced) {
  await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await page.send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
  await page.navigate(`${BASE}/robots.txt`, 30_000);
  await page.eval(`localStorage.clear(); sessionStorage.clear(); localStorage.setItem('vayu_analytics_consent_v1', 'denied');`);
  await page.navigate(`${BASE}/`, 60_000);
  await page.eval(`(() => { const s = document.createElement('style'); s.textContent = '[data-sonner-toaster], [aria-label="Analytics preferences"], vite-error-overlay { display: none !important; }'; document.head.appendChild(s); })()`);
  await sleep(1500);
}

async function scrollToFooterBottom(page) {
  // walk down in steps so lazy sections and the IntersectionObservers see a normal scroll
  const total = await page.eval('document.documentElement.scrollHeight');
  for (let y = 0; y < total; y += 1800) {
    await page.eval(`window.scrollTo({ top: ${y}, behavior: 'instant' })`);
    await sleep(120);
  }
  await page.eval(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })`);
}

async function shot(page, name, clipToGroup = false) {
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
  await sleep(250);
  let params = { format: 'png', fromSurface: true };
  if (clipToGroup) {
    const r = await page.eval(`(() => { const r = document.querySelector('[aria-label="Vayu Packaging Solutions wordmark"]').getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })()`);
    params = { ...params, captureBeyondViewport: true, clip: { ...r, scale: 1 } };
  }
  const res = await page.send('Page.captureScreenshot', params, 45_000);
  const file = path.join(OUT, name);
  fs.writeFileSync(file, Buffer.from(res.data, 'base64'));
  log('saved', file);
  return file;
}

const letterRects = (page) =>
  page.eval(`[...document.querySelectorAll('[data-fp-letter]')].map((g) => { const r = g.getBoundingClientRect(); return { c: g.dataset.fpLetter, x: r.x, y: r.y, w: r.width, h: r.height }; })`);

async function clickByText(page, text) {
  const r = await page.eval(`(() => { const b = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)}); if (!b) return null; b.scrollIntoView({ block: 'nearest' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, disabled: b.disabled }; })()`);
  if (!r) throw new Error(`no button ${text}`);
  await mouse(page, 'mouseMoved', r.x, r.y);
  await mouse(page, 'mousePressed', r.x, r.y);
  await mouse(page, 'mouseReleased', r.x, r.y);
}

async function fps(page, ms = 2500) {
  return page.eval(`new Promise((resolve) => { let n = 0; const t0 = performance.now(); const tick = (t) => { n++; if (t - t0 < ${ms}) requestAnimationFrame(tick); else resolve(Math.round((n * 1000) / (t - t0))); }; requestAnimationFrame(tick); })`, ms + 5000);
}

async function run(page, w, h, mobile) {
  log(`--- ${w}px`);
  await open(page, w, h, mobile, false);
  await scrollToFooterBottom(page);
  await sleep(4500);
  const letters1 = await letterRects(page);
  log('letters', JSON.stringify(letters1.map((l) => `${l.c}@${Math.round(l.x)},${Math.round(l.y)} ${Math.round(l.w)}x${Math.round(l.h)}`)));
  const f0 = await page.eval('window.__fp||0');
  log('fps idle (landed, nothing moving):', await fps(page, 1500), 'playground frames meanwhile:', (await page.eval('window.__fp||0')) - f0);
  await shot(page, `landed-${w}.png`);
  await shot(page, `landed-group-${w}.png`, true);

  if (mobile) {
    // touch: dragging a letter moves it; swiping over empty stage still scrolls the page
    const u = letters1.find((l) => l.c === 'U');
    const tf = () => page.eval(`getComputedStyle(document.querySelector('[data-fp-letter="U"]')).transform`);
    const before = await tf();
    const tx = u.x + u.w * 0.2;
    const ty = u.y + u.h * 0.6;
    await page.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] });
    for (let i = 1; i <= 8; i++) {
      await page.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx - i * 6, y: ty - i * 14 }] });
      await sleep(25);
    }
    await page.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(600);
    log('touch drag moved the U:', before !== (await tf()));
    const swipe = async (label, y) => {
      const s0 = await page.eval('scrollY');
      await page.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: w / 2, y }] });
      for (let i = 1; i <= 10; i++) {
        await page.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: w / 2, y: y + i * 20 }] });
        await sleep(30);
      }
      await page.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await sleep(700);
      log(label, '(y=' + Math.round(y) + ') scrolled the page by', s0 - (await page.eval('scrollY')), 'px');
      await page.eval('window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })');
      await sleep(300);
    };
    const stageTop = await page.eval(`document.querySelector('[aria-label="Vayu Packaging Solutions wordmark"]').getBoundingClientRect().top`);
    await swipe('swipe on footer links', 300);
    await swipe('swipe over empty stage', stageTop + 40);
    await swipe('swipe over a letter-free corner of the floor', stageTop + 150);
    await page.eval(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })`);
    await sleep(300);
  }

  if (!mobile) {
    // cursor proximity: the V leans away from a pointer parked next to it
    const v = letters1.find((l) => l.c === 'V');
    const vt = () => page.eval(`document.querySelector('[data-fp-letter="V"]').style.transform`);
    const rest = await vt();
    await mouse(page, 'mouseMoved', v.x + v.w + 25, v.y + v.h * 0.5);
    await sleep(700);
    const leaning = await vt();
    log('cursor lean: transform changed =', rest !== leaning, '| leading translate pair present =', /^translate\(.*\) rotate\(-?[\d.]+deg\) translate\(/.test(leaning));
    await shot(page, `lean-group-${w}.png`, true);
    // keyboard: the buttons show a focus ring
    await page.eval(`document.querySelector('[aria-label="Vayu Packaging Solutions wordmark"] button').focus()`);
    await page.key('Tab', 'Tab', 9);
    await page.key('Tab', 'Tab', 9, 8);
    await sleep(300);
    const ring = await page.eval(`getComputedStyle(document.activeElement).boxShadow`);
    log('focused control:', await page.eval('document.activeElement.textContent'), '| ring:', ring.slice(0, 80));
    await shot(page, `focus-group-${w}.png`, true);
    await page.eval('document.activeElement.blur()');
  }

  // drag the Y up and to the left, then let go
  const y = letters1.find((l) => l.c === 'Y');
  const sx = y.x + y.w / 2;
  const sy = y.y + y.h * 0.8;
  await mouse(page, 'mouseMoved', sx, sy);
  await mouse(page, 'mousePressed', sx, sy);
  for (let i = 1; i <= 12; i++) {
    await mouse(page, 'mouseMoved', sx - i * (w * 0.03), sy - i * (h * 0.02));
    await sleep(25);
  }
  await shot(page, `dragging-${w}.png`);
  await mouse(page, 'mouseReleased', sx - 12 * (w * 0.03), sy - 12 * (h * 0.02));
  await sleep(1800);

  // drop boxes while measuring the frame rate
  const fpsPromise = fps(page, 3200);
  for (let i = 0; i < 9; i++) {
    await clickByText(page, 'Drop a box');
    await sleep(280);
  }
  log('fps while 9 boxes fall:', await fpsPromise);
  await sleep(3500);
  await shot(page, `pile-${w}.png`);
  await shot(page, `pile-group-${w}.png`, true);
  const cta = await page.eval(`(() => { const a = [...document.querySelectorAll('a')].find((a) => /Design your own box/.test(a.textContent)); return a ? a.getAttribute('href') : null; })()`);
  log('CTA href:', cta);
  log('boxes in DOM:', await page.eval(`document.querySelectorAll('[data-fp-box]').length`));

  // page scroll must still work with the pointer over the stage (wheel is never intercepted)
  const before = await page.eval('scrollY');
  await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: w / 2, y: h - 120, deltaX: 0, deltaY: -240 });
  await sleep(600);
  log('wheel moved the page by', before - (await page.eval('scrollY')), 'px');

  await clickByText(page, 'Tidy up');
  await sleep(2600);
  await shot(page, `tidied-group-${w}.png`, true);

  // reduced motion: static wordmark
  await open(page, w, h, mobile, true);
  await scrollToFooterBottom(page);
  await sleep(1500);
  log('reduced motion: buttons', await page.eval(`document.querySelectorAll('[aria-label="Vayu Packaging Solutions wordmark"] button').length`), 'letters', await page.eval(`document.querySelectorAll('[data-fp-letter]').length`));
  log('fps idle (static wordmark):', await fps(page, 1500));
  await shot(page, `static-${w}.png`);
}

/** Social-share picture: letters landed plus five boxes, stage only. Written next to the plan in docs/Design-Improvement. */
async function share(page, w, h, mobile) {
  await open(page, w, h, mobile, false);
  await scrollToFooterBottom(page);
  await sleep(4500);
  for (let i = 0; i < 5; i++) {
    await clickByText(page, 'Drop a box');
    await sleep(320);
  }
  await sleep(3800);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
  await page.eval(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })`);
  await sleep(300);
  // fixed UI (WhatsApp button, contact dock) does not belong in a share picture
  await page.eval(`[...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed').forEach((e) => { e.style.display = 'none'; })`);
  const r = await page.eval(`(() => { const r = document.querySelector('[aria-label="Vayu Packaging Solutions wordmark"]').getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY + 60 + (r.height - 60) * 0.2, width: r.width, height: (r.height - 60) * 0.8 }; })()`);
  const res = await page.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true, clip: { ...r, scale: mobile ? 2 : 1 } }, 45_000);
  const file = path.join(process.env.DOCS ?? OUT, `footer-playground-${w}.png`);
  fs.writeFileSync(file, Buffer.from(res.data, 'base64'));
  log('share picture', file);
}

async function resizeCheck(page) {
  log('--- resize 1440 -> 900 -> 500');
  await open(page, 1440, 900, false, false);
  await scrollToFooterBottom(page);
  await sleep(4500);
  for (const w of [900, 500]) {
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: 800, deviceScaleFactor: 1, mobile: false });
    await sleep(1200);
    await page.eval(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })`);
    await sleep(400);
    await shot(page, `resized-${w}.png`, true);
  }
}

async function main() {
  H.keepAwake();
  await ensureDevServer();
  const page = await connect();
  try {
    const only = process.env.ONLY;
    if (only === 'share') {
      await share(page, 1440, 900, false);
      await share(page, 390, 844, true);
      return;
    }
    if (only === 'resize') {
      await resizeCheck(page);
      return;
    }
    if (!only || only === '1440') await run(page, 1440, 900, false);
    if (!only || only === '390') await run(page, 390, 844, true);
  } finally {
    clearTimeout(hard);
    cleanupAll();
  }
  console.log(`\nconsole problems (${issues.length})`);
  [...new Set(issues)].forEach((i) => console.log('  ', i));
}

main().then(() => process.exit(0), (e) => {
  console.error('failed:', e);
  cleanupAll();
  process.exit(1);
});
