/**
 * Real-browser capture + smoke test for the 3D Box Designer.
 *
 *   node scripts/screenshots/capture.mjs                 capture every entry of shots.json into public/blog-images/designer
 *   node scripts/screenshots/capture.mjs --only a.png,b.png
 *   node scripts/screenshots/capture.mjs --explore       QA tour (all 8 styles, tabs, mobile, landing, embed ...) into the scratch folder
 *   node scripts/screenshots/capture.mjs --list
 *
 * How it works: starts (or reuses) `npm run dev`, launches headless Edge with software WebGL (SwiftShader) and drives
 * it over the Chrome DevTools Protocol using only Node built-ins (global WebSocket and fetch). Every step has a hard
 * timeout, and Edge plus the dev server are always killed on exit. Screenshots use Page.captureScreenshot (a
 * `--screenshot` flag run hangs because the 3D render loop never goes idle).
 * The only artwork used is an original logo defined below. Nothing is submitted to the real API.
 * Console errors and warnings seen while driving the UI are printed at the end.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const OUT_DIR = path.join(ROOT, 'public', 'blog-images', 'designer');
const SCRATCH = path.join(os.tmpdir(), 'vayu-designer-shots');
const BASE = 'http://localhost:8080';
const PORT = 9333;
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const MAX_BYTES = 400 * 1024;
const GLOBAL_TIMEOUT_MS = 25 * 60 * 1000;

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);

/** Reject if `promise` does not settle within `ms` */
function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timed out after ${ms} ms: ${label}`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

// ---------------------------------------------------------------------------------------------------------------
// Original artwork (no third-party logos)
// ---------------------------------------------------------------------------------------------------------------

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">
  <circle cx="150" cy="150" r="120" fill="#1F7A3A"/>
  <path d="M150 58 C226 90 236 172 150 244 C64 172 74 90 150 58Z" fill="#F4F2EC"/>
  <path d="M150 92 L150 214" stroke="#1F7A3A" stroke-width="9" stroke-linecap="round"/>
  <path d="M150 140 L186 112 M150 172 L118 148" stroke="#1F7A3A" stroke-width="7" stroke-linecap="round"/>
  <text x="300" y="164" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="700" fill="#1B2A22">Sunleaf</text>
  <text x="303" y="212" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="7" fill="#1F7A3A">ORGANIC TEA</text>
</svg>`;
const svgDataUrl = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const LOGO_URL = svgDataUrl(LOGO_SVG);
// light wordmark for dark boards
const LOGO_LIGHT_URL = svgDataUrl(LOGO_SVG.replace('#1B2A22', '#F4F2EC').replace('letter-spacing="7" fill="#1F7A3A"', 'letter-spacing="7" fill="#8FD3A0"'));

// ---------------------------------------------------------------------------------------------------------------
// Design seeds (same shape as src/lib/boxDesigner/designCodec.ts, v2)
// ---------------------------------------------------------------------------------------------------------------

const STORAGE_KEY = 'vayu-box-designer:v1';
const BASE_DESIGN = {
  v: 2,
  template: 'rsc',
  dimensions: { length: 30, width: 20, height: 15 },
  ply: '5-ply',
  flutes: ['B', 'C'],
  colorHex: '#C9A87C',
  showIcons: true,
  faceImages: [],
  textElements: [],
  unit: 'cm',
  quantity: 500,
  finish: 'matte',
  insideColorHex: null,
  lidDepth: null,
  name: '',
};
const design = (patch = {}) => ({ ...BASE_DESIGN, ...patch });
const image = (face, x, y, scale, url = LOGO_URL) => ({ face, imageUrl: url, position: { x, y }, scale, rotation: 0 });
const text = (id, face, t, size, x, y, color = '#1B2A22', align = 'center') => ({
  id,
  face,
  text: t,
  font: 'Inter',
  size,
  color,
  position: { x, y },
  rotation: 0,
  align,
});

// ---------------------------------------------------------------------------------------------------------------
// Chrome DevTools Protocol client
// ---------------------------------------------------------------------------------------------------------------

class Cdp {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
  }

  async open() {
    this.ws = new WebSocket(this.url);
    await withTimeout(
      new Promise((resolve, reject) => {
        this.ws.onopen = resolve;
        this.ws.onerror = () => reject(new Error('DevTools WebSocket error'));
      }),
      10_000,
      'open DevTools socket'
    );
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id) {
        const entry = this.pending.get(msg.id);
        if (!entry) return;
        this.pending.delete(msg.id);
        if (msg.error) entry.reject(new Error(`${entry.method}: ${msg.error.message}`));
        else entry.resolve(msg.result);
      } else if (msg.method) {
        (this.handlers.get(msg.method) ?? []).forEach((fn) => fn(msg.params));
      }
    };
    this.ws.onclose = () => this.pending.forEach((entry) => entry.reject(new Error('DevTools socket closed')));
  }

  send(method, params = {}, ms = 20_000) {
    if (this.ws.readyState !== 1) return Promise.reject(new Error('DevTools socket closed'));
    const id = this.nextId++;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
    return withTimeout(promise, ms, method).catch((error) => {
      this.pending.delete(id);
      throw error;
    });
  }

  on(method, fn) {
    this.handlers.set(method, [...(this.handlers.get(method) ?? []), fn]);
  }

  waitFor(method, ms, label = method) {
    return withTimeout(
      new Promise((resolve) => {
        const fn = (params) => {
          this.handlers.set(method, (this.handlers.get(method) ?? []).filter((h) => h !== fn));
          resolve(params);
        };
        this.on(method, fn);
      }),
      ms,
      label
    );
  }

  close() {
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Process management (Edge + dev server), always cleaned up
// ---------------------------------------------------------------------------------------------------------------

const cleanups = [];
let cleaned = false;
function cleanupAll() {
  if (cleaned) return;
  cleaned = true;
  for (const fn of cleanups.reverse()) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
}
process.on('exit', cleanupAll);
process.on('SIGINT', () => {
  cleanupAll();
  process.exit(130);
});
process.on('SIGTERM', () => {
  cleanupAll();
  process.exit(143);
});

const killTree = (pid) => {
  if (!pid) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
  else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      /* gone */
    }
  }
};

async function serverUp() {
  try {
    const res = await withTimeout(fetch(`${BASE}/`), 4000, 'probe dev server');
    return res.ok;
  } catch {
    return false;
  }
}

/** Stop Windows sleeping mid-run (a sleeping laptop closes the DevTools socket and stalls every timer) */
function keepAwake() {
  if (process.platform !== 'win32') return;
  const script = "Add-Type -Namespace W -Name K -MemberDefinition '[DllImport(\"kernel32.dll\")] public static extern uint SetThreadExecutionState(uint f);'; [W.K]::SetThreadExecutionState(0x80000003) | Out-Null; Start-Sleep -Seconds 3000";
  const child = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], { stdio: 'ignore', windowsHide: true });
  cleanups.push(() => killTree(child.pid));
}

async function ensureDevServer() {
  if (await serverUp()) {
    log('dev server already running, reusing it');
    return;
  }
  log('starting npm run dev');
  const child = spawn('npm run dev', { cwd: ROOT, shell: true, stdio: 'ignore', windowsHide: true });
  cleanups.push(() => killTree(child.pid));
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (await serverUp()) {
      log('dev server is up');
      return;
    }
    await sleep(1000);
  }
  throw new Error('dev server did not start within 90 s');
}

let edgeChild = null;
let edgeUserDir = null;
function killEdge() {
  if (edgeChild) killTree(edgeChild.pid);
  edgeChild = null;
}

async function launchEdge() {
  killEdge();
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vayu-edge-'));
  const child = spawn(
    EDGE,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userDir}`,
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
      '--enable-webgl',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--hide-scrollbars',
      '--mute-audio',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--window-size=1440,900',
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true }
  );
  edgeChild = child;
  cleanups.push(() => {
    killTree(child.pid);
    try {
      fs.rmSync(userDir, { recursive: true, force: true, maxRetries: 3 });
    } catch {
      /* Edge may still hold a lock; the temp folder is harmless */
    }
  });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await withTimeout(fetch(`http://127.0.0.1:${PORT}/json/version`), 2000, 'probe Edge');
      if (res.ok) return;
    } catch {
      /* not yet */
    }
    await sleep(400);
  }
  throw new Error('Edge did not expose the debugging port');
}

// ---------------------------------------------------------------------------------------------------------------
// Page driver
// ---------------------------------------------------------------------------------------------------------------

/** Console problems seen, tagged with the step that was running */
const consoleIssues = [];
let currentStep = 'startup';
const NOISE = [
  /GPU stall due to ReadPixels/i,
  /Automatic fallback to software WebGL/i,
  /\[vite\]/i,
  /Download the React DevTools/i,
  /React Router Future Flag/i,
  /lovable/i,
];

const NORM = `const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim();`;

const FIND_SRC = `
(spec) => {
  ${NORM}
  const visible = (e) => {
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = getComputedStyle(e);
    return s.visibility !== 'hidden' && s.display !== 'none';
  };
  const roots = spec.within ? [...document.querySelectorAll(spec.within)] : [document];
  let els = roots.flatMap((root) => [...root.querySelectorAll(spec.sel || '*')]).filter(visible);
  if (spec.label !== undefined) els = els.filter((e) => norm(e.getAttribute('aria-label')) === spec.label);
  if (spec.labelStarts !== undefined) els = els.filter((e) => norm(e.getAttribute('aria-label')).startsWith(spec.labelStarts));
  if (spec.text !== undefined) {
    els = els.filter((e) => {
      const t = norm(e.textContent);
      return spec.exact ? t === spec.text : t.includes(spec.text);
    });
    els.sort((a, b) => norm(a.textContent).length - norm(b.textContent).length);
  }
  if (spec.attr) els = els.filter((e) => e.getAttribute(spec.attr[0]) === spec.attr[1]);
  return els;
}`;

class Page {
  constructor(cdp) {
    this.cdp = cdp;
  }

  send(method, params, ms) {
    return this.cdp.send(method, params, ms);
  }

  /** Evaluate an expression in the page and return its value */
  async eval(expression, ms = 20_000) {
    const res = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, ms);
    if (res.exceptionDetails) throw new Error(`page error: ${res.exceptionDetails.exception?.description ?? res.exceptionDetails.text}`);
    return res.result.value;
  }

  /** Run `fn(...args)` in the page; fn is source text of an arrow function */
  call(fnSource, ...fnArgs) {
    return this.eval(`(${fnSource})(...${JSON.stringify(fnArgs)})`);
  }

  rect(spec) {
    return this.call(
      `(spec) => {
        const find = ${FIND_SRC};
        const els = find(spec);
        const el = els[spec.nth ?? 0];
        if (!el) return null;
        // Scroll inner containers (the side panel) only; never move the page itself unless the element is off screen
        const block = spec.block ?? 'center';
        for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
          const st = getComputedStyle(a);
          if (!/(auto|scroll)/.test(st.overflowY) || a.scrollHeight <= a.clientHeight + 1) continue;
          const ar = a.getBoundingClientRect();
          const er = el.getBoundingClientRect();
          const target = block === 'start' ? ar.top + 12 : block === 'nearest'
            ? (er.top < ar.top ? ar.top + 12 : er.bottom > ar.bottom ? ar.bottom - er.height - 12 : er.top)
            : ar.top + (ar.height - er.height) / 2;
          a.scrollTop += er.top - target;
        }
        let r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) {
          el.scrollIntoView({ block: block === 'start' ? 'start' : 'center', inline: 'nearest' });
          r = el.getBoundingClientRect();
        }
        return { x: r.x, y: r.y, w: r.width, h: r.height, count: els.length };
      }`,
      spec
    );
  }

  async exists(spec) {
    return (await this.call(`(spec) => { const find = ${FIND_SRC}; return find(spec).length; }`, spec)) > 0;
  }

  async waitForSel(spec, ms = 15_000, label = JSON.stringify(spec)) {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      if (await this.exists(spec)) return;
      await sleep(250);
    }
    throw new Error(`Timed out waiting for ${label}`);
  }

  async mouse(type, x, y, extra = {}) {
    await this.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra });
  }

  /** Real mouse click on the element matching `spec` (scrolled into view first) */
  async click(spec) {
    await this.waitForSel(spec, spec.timeout ?? 12_000);
    const r = await this.rect(spec);
    if (!r) throw new Error(`click: nothing matches ${JSON.stringify(spec)}`);
    await sleep(120);
    const r2 = (await this.rect({ ...spec, block: 'nearest' })) ?? r;
    const x = r2.x + r2.w / 2;
    const y = r2.y + Math.min(r2.h / 2, 40);
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await this.mouse('mousePressed', x, y);
    await this.mouse('mouseReleased', x, y);
    await sleep(spec.after ?? 350);
  }

  async hover(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  }

  async key(key, code = key, vk = 0, modifiers = 0) {
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, modifiers });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, modifiers });
  }

  /** Focus the element and type into it (replacing the current value) */
  async type(spec, textToType, { enter = false } = {}) {
    await this.waitForSel(spec);
    await this.rect(spec);
    await this.call(
      `(spec) => {
        const find = ${FIND_SRC};
        const el = find(spec)[spec.nth ?? 0];
        el.focus();
        if (el.select) el.select();
      }`,
      spec
    );
    await this.send('Input.insertText', { text: textToType });
    if (enter) await this.key('Enter', 'Enter', 13);
    else await this.call(`() => document.activeElement && document.activeElement.blur()`);
    await sleep(300);
  }

  /** The input that belongs to a <label> with this text (inside `within`, default whole page) */
  inputByLabel(labelText, within, nth = 0) {
    return this.call(
      `(labelText, within, nth) => {
        let seen = 0;
        ${NORM}
        const roots = within ? [...document.querySelectorAll(within)] : [document];
        for (const root of roots) {
          for (const l of root.querySelectorAll('label')) {
            if (norm(l.textContent).startsWith(labelText) && l.htmlFor) {
              const input = document.getElementById(l.htmlFor);
              if (input && seen++ === nth) { input.setAttribute('data-shot-field', labelText); return true; }
            }
          }
        }
        return false;
      }`,
      labelText,
      within,
      nth
    );
  }

  async setField(labelText, v, within, nth = 0) {
    // clear markers from earlier calls so the selector is unique
    await this.eval(`document.querySelectorAll('[data-shot-field]').forEach((e) => e.removeAttribute('data-shot-field'))`);
    const ok = await this.inputByLabel(labelText, within, nth);
    if (!ok) throw new Error(`no field labelled "${labelText}"`);
    await this.type({ sel: `[data-shot-field="${labelText}"]` }, String(v));
  }

  async navigate(url, ms = 60_000) {
    const loaded = this.cdp.waitFor('Page.loadEventFired', ms, `load ${url}`);
    loaded.catch(() => undefined); // handled below; avoids an unhandled rejection if navigate itself fails first
    const nav = await this.send('Page.navigate', { url }, ms);
    if (nav.errorText) throw new Error(`navigate ${url}: ${nav.errorText}`);
    await loaded;
  }

  async viewport(kind) {
    const mobile = kind === 'mobile';
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: mobile ? 390 : 1440,
      height: mobile ? 844 : 900,
      deviceScaleFactor: mobile ? 2 : 1,
      mobile,
    });
    await this.send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
    this.mobileView = mobile;
  }

  /** True once the designer's 3D canvas is mounted and the Suspense fallback is gone */
  async waitCanvas(ms = 120_000) {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      const state = await this.eval(`(() => {
        const c = document.querySelector('canvas');
        const loading = document.body.innerText.includes('Loading 3D studio');
        const fallback = /3D preview isn.t available|could not start|not supported/i.test(document.body.innerText);
        return { canvas: !!c && c.width > 10 && c.height > 10, loading, fallback };
      })()`);
      if (state.fallback) throw new Error('WebGL fallback is showing instead of the 3D view');
      if (state.canvas && !state.loading) return;
      await sleep(400);
    }
    throw new Error('3D canvas did not appear');
  }

  /** Wait for animations (fold, camera fit, autorotate) to settle in the software renderer */
  settle(ms = 2200) {
    return sleep(ms);
  }

  async screenshot(file, { scale } = {}) {
    // park the pointer on dead space so no hover state leaks into the picture
    if (!this.keepPointer) await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1100, y: 28 });
    await sleep(300);
    const metrics = await this.send('Page.getLayoutMetrics');
    const vw = metrics.cssVisualViewport?.clientWidth ?? metrics.layoutViewport.clientWidth;
    const vh = metrics.cssVisualViewport?.clientHeight ?? metrics.layoutViewport.clientHeight;
    // clip is in page coordinates, so start at the current scroll position
    const px = metrics.cssVisualViewport?.pageX ?? 0;
    const py = metrics.cssVisualViewport?.pageY ?? 0;
    const shotWith = async (s) => {
      // keep presentation-style auto-hiding controls awake on every attempt
      if (this.keepPointer) await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1000 + Math.random() * 30, y: 150 });
      else if (this.mobileView !== true) await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1100, y: 28 });
      const res = await this.send(
        'Page.captureScreenshot',
        { format: 'png', fromSurface: true, captureBeyondViewport: false, clip: { x: px, y: py, width: vw, height: vh, scale: s } },
        45_000
      );
      return Buffer.from(res.data, 'base64');
    };
    let s = scale ?? 1;
    let buf = await shotWith(s);
    return { buf, vw, vh, scale: s, retry: shotWith };
  }
}

/** Fold a screenshot into the size budget by lowering the capture scale (no image libraries available) */
async function fitBudget(page, file, destDir, { scale = 1, maxWidth = 1600 } = {}) {
  const first = await page.screenshot(file, { scale });
  const physicalWidth = first.vw * (await page.eval('window.devicePixelRatio')) * first.scale;
  let s = first.scale;
  if (physicalWidth > maxWidth) s = (s * maxWidth) / physicalWidth;
  let buf = s === first.scale ? first.buf : await first.retry(s);
  let tries = 0;
  while (buf.length > MAX_BYTES && tries < 4) {
    // PNG size is roughly proportional to pixel count: jump straight to a scale that should fit
    s *= Math.min(0.92, Math.sqrt((MAX_BYTES * 0.93) / buf.length));
    buf = await first.retry(s);
    tries++;
  }
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, file);
  fs.writeFileSync(dest, buf);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { dest, bytes: buf.length, w, h, over: buf.length > MAX_BYTES };
}

// ---------------------------------------------------------------------------------------------------------------
// Designer helpers (all clicks go through the real UI)
// ---------------------------------------------------------------------------------------------------------------

const TAB_LABEL = { edit: 'Edit Box', customize: 'Customize', studio: 'Showcase', price: 'Price & order', export: 'Actions' };
const MOBILE_TAB_TEXT = { edit: 'Edit', customize: 'Artwork', studio: 'Showcase', price: 'Price', export: 'Share' };

class Designer {
  constructor(page) {
    this.p = page;
    this.mobile = false;
  }

  /** Reset browser storage on the app origin, optionally seeding a design, then open `url` */
  async open({ url = '/box-designer', seed, viewport = 'desktop', onboarding = false, extraStorage = {}, canvas = true } = {}) {
    this.mobile = viewport === 'mobile';
    this.p.keepPointer = false;
    await this.p.viewport(viewport);
    await this.p.navigate(`${BASE}/robots.txt`, 30_000);
    await this.p.call(
      `(seed, key, onboarding, extra) => {
        localStorage.clear(); sessionStorage.clear();
        localStorage.setItem('vayu_analytics_consent_v1', 'denied');
        if (!onboarding) localStorage.setItem('vayu-box-designer:onboarded', 'done');
        if (seed) localStorage.setItem(key, JSON.stringify(seed));
        for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, v);
      }`,
      seed ?? null,
      STORAGE_KEY,
      onboarding,
      extraStorage
    );
    await this.p.navigate(`${BASE}${url}`);
    await this.hideNoise();
    if (canvas) {
      await this.p.waitCanvas();
      await this.p.settle(2500);
      await this.scrollToTool();
    }
  }

  /** Cookie banner, toasts and dev overlays never belong in a screenshot */
  async hideNoise() {
    await this.p.eval(`(() => {
      if (document.getElementById('shot-hide')) return;
      const s = document.createElement('style');
      s.id = 'shot-hide';
      s.textContent = '[data-sonner-toaster], [aria-label="Analytics preferences"], vite-error-overlay { display: none !important; }';
      document.head.appendChild(s);
    })()`);
  }

  async scrollToTool() {
    await this.p.eval(`(() => { const t = document.getElementById('designer-tool'); if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 56); })()`);
    await sleep(300);
  }

  async tab(name) {
    if (this.mobile) {
      const open = await this.p.exists({ sel: '[role="dialog"]' });
      if (!open) await this.p.click({ sel: 'button', within: 'nav[aria-label="Designer sections"]', text: MOBILE_TAB_TEXT[name] });
      else await this.p.click({ sel: 'button', within: '[role="dialog"]', text: MOBILE_TAB_TEXT[name], exact: true });
    } else {
      await this.p.click({ sel: 'button', label: TAB_LABEL[name] });
    }
    await sleep(500);
  }

  async stopSpin() {
    if (await this.p.exists({ sel: 'button', label: 'Stop auto-rotate' })) await this.p.click({ sel: 'button', label: 'Stop auto-rotate', after: 600 });
  }

  /** Scroll the side panel so the element is at the top of the panel */
  async panelTo(spec) {
    await this.p.rect({ ...spec, block: 'start' });
    await sleep(250);
  }

  async openAssembly() {
    const expanded = await this.p.exists({ sel: 'button', label: 'Assembly', attr: ['aria-expanded', 'true'] });
    if (!expanded) await this.p.click({ sel: 'button', label: 'Assembly' });
  }

  /** Move the assembly slider: a number (0..100) or the label of a named stop */
  async fold(target, { keepOpen = false } = {}) {
    await this.openAssembly();
    if (typeof target === 'string') {
      await this.p.click({ sel: 'button', within: '[aria-label="Assembly stops"]', text: target, exact: true });
    } else {
      await this.p.call(`() => { const t = document.querySelector('[role="slider"]'); t && t.focus(); }`);
      await this.p.key('Home', 'Home', 36);
      for (let i = 0; i < Math.round(target / 10); i++) await this.p.key('PageUp', 'PageUp', 33);
    }
    await this.p.settle(2800);
    if (!keepOpen) await this.closeDock();
    await this.p.settle(500);
  }

  async closeDock() {
    if (await this.p.exists({ sel: 'button', label: 'Assembly', attr: ['aria-expanded', 'true'] })) await this.p.click({ sel: 'button', label: 'Assembly' });
  }

  async style(shortName) {
    await this.p.click({ sel: 'button[role="radio"]', within: '[aria-label="Box style"]', text: shortName });
    await this.p.settle(2000);
  }

  /** Landing page -> "open in designer" link, like a visitor would */
  async viaLanding(slug, { shot } = {}) {
    await this.p.viewport('desktop');
    await this.p.navigate(`${BASE}/robots.txt`, 30_000);
    await this.p.call(`() => { localStorage.clear(); localStorage.setItem('vayu_analytics_consent_v1','denied'); localStorage.setItem('vayu-box-designer:onboarded','done'); }`);
    await this.p.navigate(`${BASE}/box-designer/${slug}`);
    await this.hideNoise();
    await this.p.waitForSel({ sel: 'h1' }, 30_000);
    await sleep(1200);
    if (shot) {
      const r = await fitBudget(this.p, `landing-${slug}.png`, SCRATCH);
      log(`   landing ${slug}: ${r.dest}`);
    }
    await this.p.click({ sel: 'a[href*="/box-designer?template="]', nth: 0, after: 800 });
    await this.hideNoise();
    await this.p.waitCanvas();
    await this.p.settle(2500);
    await this.scrollToTool();
  }

  /** Change the stored design (autosave) and reload, for tweaks that have no single click */
  async patch(fn) {
    await sleep(900);
    await this.p.call(
      `(key, fnSrc) => {
        const d = JSON.parse(localStorage.getItem(key));
        const out = (new Function('d', fnSrc))(d) || d;
        localStorage.setItem(key, JSON.stringify(out));
      }`,
      STORAGE_KEY,
      fn
    );
    await this.p.navigate(`${BASE}/box-designer`);
    await this.hideNoise();
    await this.p.waitCanvas();
    await this.p.settle(2500);
    await this.scrollToTool();
  }

  async angle(label) {
    await this.tab('studio');
    await this.p.click({ sel: 'button', text: label, exact: true });
    await this.p.settle(1800);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The 33 shots
// ---------------------------------------------------------------------------------------------------------------

const lowResLogo = (page) =>
  page.eval(`(async () => {
    const img = new Image();
    img.src = ${JSON.stringify(LOGO_URL)};
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 64; c.height = 32;
    c.getContext('2d').drawImage(img, 0, 0, 64, 32);
    return c.toDataURL('image/png');
  })()`);

const brandedRsc = () =>
  design({
    colorHex: '#C9A87C',
    showIcons: false,
    faceImages: [image('front', 0.5, 0.42, 0.62)],
    textElements: [text('t1', 'front', 'Single-estate green tea', 30, 0.5, 0.82, '#1B2A22')],
    name: 'Sunleaf tea carton',
  });

/** shot handlers: (ctx) => Promise<{ file?: string } | void>; they leave the page ready to screenshot */
const HANDLERS = {
  async 'designer-style-picker.png'(d) {
    await d.open({});
    await d.stopSpin();
    await d.style('Mailer');
    await d.style('RSC');
    await d.p.rect({ sel: '[aria-label="Box style"]', block: 'start' });
  },

  async 'designer-fit-checker.png'(d) {
    await d.open({});
    await d.stopSpin();
    await d.p.click({ sel: 'button', text: 'Will my product fit?' });
    await d.p.setField('Length', 24, 'main', 1);
    await d.p.setField('Width', 16, 'main', 1);
    await d.p.setField('Height', 6, 'main', 1);
    await d.p.setField('Weight (optional)', 2, 'main');
    await d.p.click({ sel: '#fit-fragile' });
    await d.p.rect({ sel: 'button', text: 'Will my product fit?', block: 'start' });
    await sleep(500);
  },

  async 'designer-estimate-tiers.png'(d) {
    await d.open({ seed: brandedRsc() });
    await d.stopSpin();
    await d.tab('price');
    await d.p.settle(800);
  },

  async 'designer-print-checks.png'(d) {
    const raster = await lowResLogo(d.p);
    await d.open({
      seed: design({
        faceImages: [image('front', 0.5, 0.45, 0.5, raster)],
        textElements: [
          text('t1', 'right', 'Handle with care', 12, 0.02, 0.5, '#1B2A22', 'left'),
          text('t2', 'back', 'Packed in India', 7, 0.5, 0.8),
        ],
      }),
    });
    await d.stopSpin();
    await d.tab('customize');
    await d.p.click({ sel: 'button', text: 'Print check:' });
    await d.p.rect({ sel: 'button', text: 'Print check:', block: 'start' });
  },

  async 'designer-presentation-mode.png'(d) {
    await d.open({ seed: brandedRsc() });
    await d.tab('studio');
    await d.p.click({ sel: 'button', text: 'Present to a customer', after: 1500 });
    await d.p.settle(2500);
    await d.p.hover(1000, 150);
    d.p.keepPointer = true; // reset at the next open()
  },

  async 'designer-spec-sheet-pdf.png'(d) {
    // A PDF cannot be shown in headless Edge, so this captures the panel that produces it
    await d.open({ seed: brandedRsc() });
    await d.stopSpin();
    await d.tab('studio');
    await d.p.click({ sel: 'button', text: 'Spec sheet / proof PDF' });
    await d.p.rect({ sel: 'button', text: 'Spec sheet / proof PDF', block: 'start' });
    await sleep(500);
  },

  async 'designer-shot-studio.png'(d) {
    await d.open({ seed: brandedRsc() });
    await d.stopSpin();
    await d.tab('studio');
    await d.p.click({ sel: 'button', text: 'Warm wood', exact: false });
    await d.p.click({ sel: 'button', text: '3/4 hero', exact: true });
    await d.p.settle(1500);
    await d.p.rect({ sel: 'h3', text: 'Scene', block: 'start' });
    await sleep(400);
  },

  async 'designer-embed-snippet.png'(d) {
    await d.open({ seed: brandedRsc() });
    await d.stopSpin();
    await d.tab('studio');
    await d.p.click({ sel: 'button', text: 'Embed on your website' });
    // the snippet uses the page origin; show the production one, as a visitor on the live site would see
    await d.p.eval(`document.querySelectorAll('pre').forEach((pre) => { pre.textContent = pre.textContent.replaceAll(location.origin, 'https://vayupackaging.vercel.app'); })`);
    await sleep(900); // accordion animation
    // scroll the panel to its end so the whole snippet and the copy button are in view
    await d.p.call(`() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Embed on your website')); for (let a = b.parentElement; a; a = a.parentElement) { if (a.scrollHeight > a.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(a).overflowY)) { a.scrollTop = a.scrollHeight; break; } } }`);
    await sleep(500);
  },

  async 'designer-share-link.png'(d) {
    await d.open({ seed: brandedRsc() });
    await d.stopSpin();
    await d.tab('export');
    await d.p.rect({ sel: 'h3', text: 'Save & share', block: 'start' });
    await sleep(400);
  },

  async 'designer-compare-quote-prefill.png'(d) {
    await d.open({ seed: design({ dimensions: { length: 40, width: 30, height: 30 }, ply: '5-ply', quantity: 1000 }) });
    await d.tab('price');
    await d.p.click({ sel: 'a', text: 'Compare options', after: 1000 });
    await d.p.waitForSel({ sel: 'h1' }, 30_000);
    await sleep(1500);
    await d.hideNoise();
    await d.p.type({ sel: '#finder-product' }, 'Tea gift pack');
    await d.p.click({ sel: 'button', text: 'Next', exact: false });
    await sleep(900);
    await d.p.eval(`(() => { const t = document.querySelector('[data-hide-fab]'); if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 150); })()`);
    await sleep(500);
  },

  async 'designer-mailer-printed-inside.png'(d) {
    await d.viaLanding('mailer-box', { shot: true });
    await d.patch(`d.colorHex = '#C9A87C'; d.insideColorHex = '#1F7A3A'; d.name = 'Sunleaf mailer';
      d.faceImages = [{ face: 'lid', imageUrl: ${JSON.stringify(LOGO_URL)}, position: { x: 0.5, y: 0.5 }, scale: 0.6, rotation: 0 }];`);
    await d.stopSpin();
    await d.angle('Back 3/4');
    await d.tab('edit');
    await d.fold(60);
  },

  async 'designer-pizza-box.png'(d) {
    await d.viaLanding('pizza-box', { shot: true });
    await d.patch(`d.faceImages = [{ face: 'lid', imageUrl: ${JSON.stringify(LOGO_URL)}, position: { x: 0.5, y: 0.5 }, scale: 0.55, rotation: 0 }]; d.textElements = [];`);
    await d.stopSpin();
    await d.fold('Open lid');
    await d.angle('Back 3/4');
    await d.tab('edit');
  },

  async 'designer-bakery-tray.png'(d) {
    await d.viaLanding('bakery-box', { shot: true });
    await d.stopSpin();
    await d.angle('3/4 hero');
    await d.tab('edit');
  },

  async 'designer-apparel-mailer.png'(d) {
    await d.open({});
    await d.stopSpin();
    await d.p.click({ sel: 'button', text: 'Templates' });
    await d.p.waitForSel({ sel: '[role="dialog"]' });
    await sleep(900);
    await d.p.click({ sel: 'button', text: 'Apparel mailer', within: '[role="dialog"]' });
    await sleep(1200);
    await d.stopSpin();
    await d.fold('Open lid');
  },

  async 'designer-shoe-box.png'(d) {
    await d.viaLanding('shoe-box', { shot: true });
    await d.patch(`d.colorHex = '#2B2B2D'; d.insideColorHex = '#F4F2EC';
      d.faceImages = [{ face: 'lid', imageUrl: ${JSON.stringify(LOGO_LIGHT_URL)}, position: { x: 0.5, y: 0.5 }, scale: 0.6, rotation: 0 }];`);
    await d.stopSpin();
    await d.fold(76);
    await d.p.click({ sel: 'button', label: 'Fit view', after: 400 });
    await d.p.settle(2000);
  },

  async 'designer-gift-box-lid.png'(d) {
    await d.viaLanding('gift-box', { shot: true });
    await d.tab('edit');
    await d.p.click({ sel: 'button[role="radio"]', label: 'Brick Red' });
    await d.patch(`d.faceImages = [{ face: 'lid', imageUrl: ${JSON.stringify(LOGO_LIGHT_URL)}, position: { x: 0.5, y: 0.5 }, scale: 0.55, rotation: 0 }];`);
    await d.stopSpin();
    await d.fold(76);
    await d.p.click({ sel: 'button', label: 'Fit view', after: 400 });
    await d.p.settle(2000);
  },

  async 'designer-brand-colours.png'(d) {
    await d.open({});
    await d.stopSpin();
    await d.tab('customize');
    await d.p.click({ sel: 'button', text: 'Brand kit & colours' });
    for (const hex of ['#1F7A3A', '#2E4F7F', '#A8352E']) {
      await d.p.type({ sel: 'input[aria-label="Colour as hex or RGB"]' }, hex);
      await d.p.click({ sel: 'button', text: 'Use on box' });
      await d.p.click({ sel: 'button', text: 'Save to kit' });
    }
    await d.p.type({ sel: 'input[aria-label="Colour as hex or RGB"]' }, '#C9A87C');
    await d.p.click({ sel: 'button', text: 'Use on box' });
    await d.p.type({ sel: 'input[aria-label="Colour as hex or RGB"]' }, '#1F7A3A');
    await d.p.click({ sel: 'button', text: 'Use on box' });
    await d.p.rect({ sel: 'button', text: 'Brand kit & colours', block: 'start' });
    await d.p.settle(1500);
  },

  async 'designer-pallet-view.png'(d) {
    await d.viaLanding('shipping-carton', { shot: true });
    await d.stopSpin();
    await d.tab('studio');
    await d.p.click({ sel: 'button', text: 'On a pallet' });
    await d.p.settle(3500);
    await d.p.rect({ sel: 'h3', text: 'Scene', block: 'start' });
  },

  async 'designer-strength-guidance.png'(d) {
    await d.viaLanding('shipping-carton');
    await d.stopSpin();
    await d.tab('edit');
    await d.p.click({ sel: 'button[role="radio"]', within: '[aria-label="Board ply"]', text: '7-Ply' });
    await d.tab('price');
    await d.p.rect({ sel: 'h3', text: 'How strong is it?', block: 'start' });
    await sleep(500);
  },

  async 'designer-guided-wizard.png'(d) {
    await d.open({ viewport: 'mobile' });
    await d.tab('edit');
    await d.p.click({ sel: 'button', text: 'Find my box' });
    await d.p.waitForSel({ sel: '[role="dialog"]', text: 'Step 1 of 5' });
    await sleep(600);
    await d.p.click({ sel: 'button[role="radio"]', text: 'Shoes' });
    await d.p.click({ sel: 'button', text: 'Next' });
    await d.p.click({ sel: 'button[role="radio"]', text: 'Courier' });
    await d.p.click({ sel: 'button', text: 'See my box' });
    await d.p.waitForSel({ sel: 'p', text: 'We recommend' });
    await sleep(1200);
  },

  async 'designer-size-units.png'(d) {
    await d.open({});
    await d.stopSpin();
    await d.p.click({ sel: 'button', text: 'mm', exact: true });
    await d.p.rect({ sel: 'h3', text: 'Inside dimensions', block: 'start' });
    await sleep(500);
  },

  async 'designer-fold-slider.png'(d) {
    await d.viaLanding('mailer-box');
    await d.patch(`d.colorHex = '#C9A87C'; d.insideColorHex = null; d.textElements = [];
      d.faceImages = [{ face: 'lid', imageUrl: ${JSON.stringify(LOGO_URL)}, position: { x: 0.5, y: 0.5 }, scale: 0.6, rotation: 0 }];`);
    await d.stopSpin();
    await d.angle('Back 3/4');
    await d.tab('edit');
    await d.fold(50, { keepOpen: true });
  },

  async 'designer-artwork-panel.png'(d, ctx) {
    // Real flow: upload the logo file, add a text line, shrink the text so the print check warns about it
    await d.open({});
    await d.stopSpin();
    await d.tab('customize');
    await d.p.click({ sel: 'button[role="radio"]', within: '[aria-label="Box surface"]', text: 'Front' });
    const logoFile = path.join(os.tmpdir(), 'sunleaf-logo.svg');
    fs.writeFileSync(logoFile, LOGO_SVG);
    const { root } = await d.p.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await d.p.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'input[type="file"]' });
    if (!nodeId) throw new Error('no file input in the artwork panel');
    await d.p.send('DOM.setFileInputFiles', { files: [logoFile], nodeId });
    await d.p.waitForSel({ sel: 'button', text: 'Image', within: 'main' }, 15_000).catch(() => undefined);
    await sleep(1500);
    await d.p.click({ sel: 'button', text: 'Add text' });
    await d.p.type({ sel: 'textarea[aria-label="Text content"], input[aria-label="Text content"]' }, 'Single-estate green tea');
    // move the line below the logo with the keyboard (Shift+Arrow moves 5%), then make it small
    await d.p.call(`() => document.querySelector('[role="application"][aria-label^="Artwork layout"]').focus()`);
    for (let i = 0; i < 6; i++) await d.p.key('ArrowDown', 'ArrowDown', 40, 8);
    await d.p.call(`() => {
      const label = [...document.querySelectorAll('label')].find((l) => l.textContent.trim().startsWith('Size:'));
      label.parentElement.querySelector('[role="slider"]').focus();
    }`);
    await d.p.key('Home', 'Home', 36);
    await d.p.settle(1500);
    ctx.note = 'uploaded SVG logo through the file input';
    await d.p.rect({ sel: 'button', text: 'Print check:', block: 'start' });
    await d.p.click({ sel: 'button', text: 'Print check:' });
    await d.scrollToTool();
    await sleep(500);
  },

  async 'designer-telescope-lid.png'(d) {
    await d.open({});
    await d.stopSpin();
    await d.style('Telescope');
    await d.p.rect({ sel: 'input#lid-depth', block: 'center' });
    await d.p.call(`() => { const el = document.getElementById('lid-depth'); el.focus(); }`);
    await d.p.key('ArrowRight', 'ArrowRight', 39);
    await d.p.key('ArrowRight', 'ArrowRight', 39);
    await d.stopSpin();
    await d.fold(76);
    await d.p.click({ sel: 'button', label: 'Fit view', after: 400 });
    await d.p.settle(2000);
  },

  async 'designer-mailer-fold.png'(d) {
    await d.open({ seed: design({ template: 'mailer', dimensions: { length: 30, width: 23, height: 6 }, ply: '3-ply', flutes: ['E'] }) });
    await d.stopSpin();
    await d.fold(30);
  },

  async 'designer-units-inch.png'(d) {
    await d.open({});
    await d.stopSpin();
    await d.p.click({ sel: 'button', text: 'in', exact: true });
    await d.p.rect({ sel: 'h3', text: 'Inside dimensions', block: 'start' });
    await sleep(500);
  },

  async 'designer-artwork-logo.png'(d) {
    await d.open({
      seed: design({
        showIcons: false,
        faceImages: [image('front', 0.27, 0.36, 0.45)],
        textElements: [text('t1', 'front', 'Single-estate green tea', 26, 0.27, 0.78, '#1B2A22')],
      }),
    });
    await d.stopSpin();
    await d.tab('customize');
    await d.p.click({ sel: 'button[role="radio"]', within: '[aria-label="Box surface"]', text: 'Front' });
    await d.p.settle(1500);
  },

  async 'designer-finish-gloss.png'(d, ctx) {
    const base = design({ showIcons: false, colorHex: '#F5F5F0', faceImages: [image('front', 0.5, 0.42, 0.62)], textElements: [text('t1', 'front', 'Single-estate green tea', 30, 0.5, 0.82)] });
    const clips = [];
    for (const finish of ['matte', 'gloss']) {
      await d.open({ seed: { ...base, finish } });
      await d.stopSpin();
      // crop shows only the box: hide the floating toolbar and the dock
      await d.p.eval(`(() => { const s = document.createElement('style'); s.textContent = '#designer-tool .absolute.z-20, #designer-tool .absolute.z-30 { display: none !important; }'; document.head.appendChild(s); })()`);
      await d.p.settle(1500);
      const rect = await d.p.eval(`(() => { const r = document.querySelector('#designer-tool canvas').getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })()`);
      const res = await d.p.send('Page.captureScreenshot', { format: 'png', clip: { ...rect, scale: 1 } }, 45_000);
      clips.push({ data: res.data, w: rect.width, h: rect.height });
    }
    // Compose side by side in the page (canvas), labelled
    const w = 520;
    const composed = await d.p.eval(`(async () => {
      const clips = ${JSON.stringify(clips.map((c) => ({ data: c.data, w: c.w, h: c.h })))};
      const w = ${w};
      const h = Math.round(clips[0].h * w / clips[0].w);
      const c = document.createElement('canvas');
      c.width = w * 2; c.height = h + 44;
      const g = c.getContext('2d');
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
      const names = ['Matte', 'Gloss'];
      for (let i = 0; i < 2; i++) {
        const img = new Image();
        img.src = 'data:image/png;base64,' + clips[i].data;
        await img.decode();
        g.drawImage(img, i * w, 0, w, h);
        g.fillStyle = '#17231C'; g.font = '600 22px Arial'; g.textAlign = 'center';
        g.fillText(names[i], i * w + w / 2, h + 31);
      }
      return c.toDataURL('image/png').split(',')[1];
    })()`);
    ctx.composed = Buffer.from(composed, 'base64');
  },

  async 'designer-dieline-export.png'(d, ctx) {
    await d.open({ seed: design({ ply: '3-ply', flutes: ['B'] }) });
    await d.stopSpin();
    await d.tab('export');
    const dir = path.join(os.tmpdir(), 'vayu-downloads');
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    await d.p.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir }).catch(() => d.p.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dir }));
    await d.p.click({ sel: 'button', text: 'Dieline (SVG, 1:1)' });
    const deadline = Date.now() + 15_000;
    let file;
    while (Date.now() < deadline && !file) {
      file = fs.readdirSync(dir).find((f) => f.endsWith('.svg'));
      await sleep(300);
    }
    if (!file) throw new Error('dieline SVG was not downloaded');
    const svgPath = path.join(dir, file);
    // Show the downloaded file at a readable size, as a browser tab would
    await d.p.navigate(`file:///${svgPath.replace(/\\/g, '/')}`, 20_000);
    // the file is 1:1 mm (over a metre wide); scale the standalone SVG document to the window so the whole blank shows
    await d.p.eval(`(() => { const svg = document.documentElement; const [, , w, h] = svg.getAttribute('viewBox').split(' ').map(Number); svg.setAttribute('width', '1440'); svg.setAttribute('height', String(Math.round(1440 * h / w))); })()`);
    await sleep(800);
    ctx.note = `opened downloaded ${file}`;
  },

  async 'designer-fold-flat.png'(d) {
    await d.open({ seed: brandedRsc() });
    await d.stopSpin();
    await d.tab('export');
    await d.p.rect({ sel: 'h3', text: 'Download', block: 'start' });
    await d.fold('Flat');
    await d.p.settle(1500);
  },

  async 'designer-turntable-video.png'(d, ctx) {
    await d.open({ seed: brandedRsc() });
    await d.tab('studio');
    await d.p.click({ sel: 'button', text: 'Video (spin or fold)' });
    if (!(await d.p.exists({ sel: 'button', text: '360° spin' }))) {
      ctx.note = 'this browser cannot record video; captured the recorder panel';
      return;
    }
    await d.p.click({ sel: 'button', text: '360° spin' });
    await d.p.click({ sel: 'button', text: 'Record video', after: 250 });
    await d.p.rect({ sel: 'button', text: 'Video (spin or fold)', block: 'start' });
    ctx.note = 'captured while recording';
  },

  async 'designer-strength-panel.png'(d) {
    await d.viaLanding('shipping-carton');
    await d.stopSpin();
    await d.tab('edit');
    await d.p.setField('Length', 40, 'main');
    await d.p.setField('Width', 30, 'main');
    await d.p.setField('Height', 30, 'main');
    await d.tab('price');
    await d.p.type({ sel: 'input[aria-label="Weight of one packed box in kg"]' }, '15');
    await d.p.rect({ sel: 'h3', text: 'How strong is it?', block: 'start' });
    await sleep(500);
  },

  async 'designer-mobile-overview.png'(d) {
    await d.open({
      viewport: 'mobile',
      seed: design({
        template: 'mailer',
        dimensions: { length: 30, width: 23, height: 6 },
        ply: '3-ply',
        flutes: ['E'],
        showIcons: false,
        colorHex: '#C9A87C',
        insideColorHex: '#1F7A3A',
        faceImages: [image('lid', 0.5, 0.5, 0.62)],
      }),
    });
    await d.stopSpin();
    await d.p.settle(1500);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// QA tour (--explore)
// ---------------------------------------------------------------------------------------------------------------

async function explore(d, page) {
  const out = (name) => `explore-${name}.png`;
  const grab = async (name) => {
    const r = await fitBudget(page, out(name), SCRATCH);
    log(`   ${r.dest} (${Math.round(r.bytes / 1024)} KB)`);
  };
  const dimsText = () =>
    page.eval(`(() => [...document.querySelectorAll('main p')].map((p) => p.textContent).find((t) => /Outside is about/.test(t)) || '')()`);

  // First visit: onboarding, then every style
  currentStep = 'explore: first visit';
  await d.open({ onboarding: true });
  await grab('00-first-visit');
  const styles = ['RSC', 'HSC', 'FOL', 'Sleeve', 'Telescope', 'Mailer', 'Pizza', 'Tray'];
  // dismiss coach marks if present
  if (await page.exists({ sel: 'button', text: 'Skip' })) await page.click({ sel: 'button', text: 'Skip' });
  await d.stopSpin();
  for (const s of styles) {
    currentStep = `explore: style ${s}`;
    await d.style(s);
    await grab(`style-${s.toLowerCase()}`);
    const dims = await page.eval(`(() => [...document.querySelectorAll('input[inputmode="decimal"]')].slice(0, 3).map((i) => i.value).join(' x '))()`);
    log(`   style ${s}: inside ${dims}; ${await dimsText()}`);
    for (const stop of ['Flat']) {
      await d.fold(stop);
      await grab(`style-${s.toLowerCase()}-flat`);
      await d.fold(s === 'RSC' ? 'Sealed' : s === 'Mailer' || s === 'Pizza' || s === 'Tray' ? 'Closed' : s === 'Telescope' ? 'Closed' : 'Assembled').catch(async () => d.fold(100));
    }
    await d.closeDock();
  }

  currentStep = 'explore: telescope fold sweep';
  await d.style('Telescope');
  for (const v of [20, 40, 75, 85, 92]) {
    await d.fold(v);
    await grab(`telescope-fold-${v}`);
  }
  await d.fold('Closed');

  currentStep = 'explore: tabs desktop';
  await d.style('RSC');
  for (const t of ['customize', 'studio', 'price', 'export', 'edit']) {
    await d.tab(t);
    await page.settle(700);
    await grab(`tab-${t}`);
  }

  currentStep = 'explore: lead form';
  await d.tab('price');
  await page.click({ sel: 'button', text: 'Send my design to Vayu' });
  await page.waitForSel({ sel: '[role="dialog"]' });
  await sleep(800);
  await page.setField('Your name', 'Test Person', '[role="dialog"]');
  await page.setField('Mobile', '9876543210', '[role="dialog"]');
  await page.setField('City or pincode', '395003', '[role="dialog"]');
  await grab('lead-form-filled');
  await page.key('Escape', 'Escape', 27);
  await sleep(500);

  currentStep = 'explore: wizard + templates (desktop)';
  await d.tab('edit');
  await page.click({ sel: 'button', text: 'Find my box' });
  await sleep(700);
  await grab('wizard-step1');
  await page.key('Escape', 'Escape', 27);
  await sleep(600);
  await page.click({ sel: 'button', text: 'Templates' });
  await sleep(1200);
  await grab('templates');
  await page.key('Escape', 'Escape', 27);
  await sleep(600);

  currentStep = 'explore: cutaway';
  await page.click({ sel: 'button', label: 'Cut-away view' });
  await page.settle(1500);
  await grab('cutaway');

  currentStep = 'explore: landing + embed';
  await d.open({ url: '/embed/box-designer?style=mailer&l=30&w=23&h=6' });
  await grab('embed');
  await d.open({ url: '/box-designer/mailer-box', canvas: false });
  await sleep(1500);
  await grab('landing-mailer-box');

  currentStep = 'explore: mobile';
  await d.open({ viewport: 'mobile' });
  await d.stopSpin();
  await grab('mobile-00-default');
  for (const t of ['edit', 'customize', 'studio', 'price', 'export']) {
    currentStep = `explore: mobile tab ${t}`;
    await d.tab(t);
    await sleep(900);
    await grab(`mobile-tab-${t}`);
    await page.key('Escape', 'Escape', 27);
    await sleep(600);
    if (await page.exists({ sel: '[role="dialog"]' })) await page.eval(`document.querySelector('[data-vaul-overlay]')?.click()`);
    await sleep(500);
  }
  currentStep = 'explore: mobile styles';
  await d.tab('edit');
  for (const s of ['Pizza', 'Telescope']) {
    await d.style(s);
  }
  await grab('mobile-style-picker');
}

// ---------------------------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------------------------

async function main() {
  const shots = JSON.parse(fs.readFileSync(path.join(HERE, 'shots.json'), 'utf8'));
  if (flag('list')) {
    shots.forEach((s) => console.log(`${s.file}  ${s.viewport}  ${s.path}`));
    return;
  }
  const only = value('only')?.split(',');
  const todo = flag('explore') || flag('probe') ? [] : shots.filter((s) => !only || only.includes(s.file));
  const missing = todo.filter((s) => !HANDLERS[s.file]);
  if (missing.length) log('WARNING no handler for', missing.map((s) => s.file).join(', '));

  const hard = setTimeout(() => {
    console.error('Global timeout reached, stopping.');
    cleanupAll();
    process.exit(2);
  }, GLOBAL_TIMEOUT_MS);

  keepAwake();
  await ensureDevServer();
  const connect = async () => {
  await launchEdge();
  const target = await (await withTimeout(fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }), 8000, 'new tab')).json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  cleanups.push(() => cdp.close());
  const page = new Page(cdp);
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Log.enable');
  await page.send('Network.enable');
  await page.send('DOM.enable');

  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type !== 'error' && p.type !== 'warning') return;
    const msg = p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300);
    if (NOISE.some((r) => r.test(msg))) return;
    consoleIssues.push({ step: currentStep, kind: `console.${p.type}`, msg });
  });
  cdp.on('Runtime.exceptionThrown', (p) => {
    consoleIssues.push({ step: currentStep, kind: 'exception', msg: (p.exceptionDetails.exception?.description ?? p.exceptionDetails.text).slice(0, 400) });
  });
  cdp.on('Log.entryAdded', (p) => {
    if (p.entry.level !== 'error') return;
    const msg = `${p.entry.text} ${p.entry.url ?? ''}`.slice(0, 300);
    if (NOISE.some((r) => r.test(msg))) return;
    consoleIssues.push({ step: currentStep, kind: 'log.error', msg });
  });
  cdp.on('Network.loadingFailed', (p) => {
    if (p.canceled) return;
    consoleIssues.push({ step: currentStep, kind: 'network', msg: `${p.errorText} (${p.type})` });
  });
  return page;
  };

  let page = await connect();
  const designer = new Designer(page);
  const results = [];
  try {
    if (flag('probe')) {
      await designer.open({ viewport: value('viewport') ?? 'desktop' });
      console.log(JSON.stringify(await page.eval(value('probe')), null, 1));
    }
    if (flag('explore')) {
      fs.mkdirSync(SCRATCH, { recursive: true });
      await withTimeout(explore(designer, page), 12 * 60_000, 'explore tour');
    }
    for (const shot of todo) {
      const handler = HANDLERS[shot.file];
      if (!handler) {
        results.push({ file: shot.file, ok: false, note: 'no handler' });
        continue;
      }
      currentStep = shot.file;
      log(`-> ${shot.file}`);
      let ctx = {};
      try {
        const runOnce = async () => {
          ctx = {};
          await withTimeout(handler(designer, ctx), 150_000, shot.file);
        };
        try {
          await runOnce();
        } catch (error) {
          if (!/socket closed|Timed out|ECONN/i.test(error.message)) throw error;
          log(`   browser problem (${error.message}); restarting Edge and retrying once`);
          page = await connect();
          designer.p = page;
          await runOnce();
        }
        let info;
        if (ctx.composed) {
          fs.mkdirSync(OUT_DIR, { recursive: true });
          const dest = path.join(OUT_DIR, shot.file);
          fs.writeFileSync(dest, ctx.composed);
          info = { dest, bytes: ctx.composed.length, w: ctx.composed.readUInt32BE(16), h: ctx.composed.readUInt32BE(20) };
        } else {
          // mobile is already at DPR 2, so width is capped by scaling
          info = await withTimeout(fitBudget(page, shot.file, OUT_DIR), 90_000, `screenshot ${shot.file}`);
        }
        log(`   saved ${info.dest} ${info.w}x${info.h} ${Math.round(info.bytes / 1024)} KB${info.bytes > MAX_BYTES ? ' (OVER BUDGET)' : ''}${ctx.note ? ' | ' + ctx.note : ''}`);
        results.push({ file: shot.file, ok: true, bytes: info.bytes, note: ctx.note });
      } catch (error) {
        log(`   FAILED ${shot.file}: ${error.message}`);
        results.push({ file: shot.file, ok: false, note: error.message });
        // best-effort evidence for debugging
        try {
          const r = await withTimeout(fitBudget(page, `FAIL-${shot.file}`, SCRATCH), 30_000, 'failure screenshot');
          log(`   failure screenshot ${r.dest}`);
        } catch {
          /* ignore */
        }
      }
    }
  } finally {
    clearTimeout(hard);
    cleanupAll();
  }

  console.log('\n=== Summary ===');
  const ok = results.filter((r) => r.ok);
  console.log(`${ok.length}/${results.length} captured`);
  results.filter((r) => !r.ok).forEach((r) => console.log(`  FAILED ${r.file}: ${r.note}`));
  console.log(`\n=== Console problems (${consoleIssues.length}) ===`);
  const seen = new Set();
  for (const issue of consoleIssues) {
    const key = `${issue.kind}|${issue.msg}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  [${issue.step}] ${issue.kind}: ${issue.msg}`);
  }
}

// qa.mjs imports the harness pieces below; run main() only when this file is the entry point
export { Cdp, Page, Designer, withTimeout, sleep, log, fitBudget, ensureDevServer, launchEdge, keepAwake, cleanupAll, cleanups, killTree, consoleIssues, NOISE, design, image, text, LOGO_URL, LOGO_LIGHT_URL, LOGO_SVG, BASE, PORT, SCRATCH, OUT_DIR, STORAGE_KEY, MAX_BYTES, svgDataUrl };
export const setStep = (name) => {
  currentStep = name;
};
export const getEdgeStatus = () => ({ edgeChild });
export const getStep = () => currentStep;

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().then(
    () => process.exit(0),
    (error) => {
      console.error('capture failed:', error);
      cleanupAll();
      process.exit(1);
    }
  );
}
