/** Cost of pinning the body (the scroll lock) on a long page, and of opening the menu, measured in the browser. */
import * as H from '../screenshots/capture.mjs';
const { Cdp, Page, withTimeout, sleep, log, ensureDevServer, launchEdge, cleanupAll, cleanups, PORT, BASE } = H;
const PATH = process.argv[2] ?? '/products';
try {
  await ensureDevServer();
  await launchEdge();
  const target = await (await withTimeout(fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }), 8000, 'tab')).json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  cleanups.push(() => cdp.close());
  const page = new Page(cdp);
  for (const m of ['Page.enable', 'Runtime.enable']) await page.send(m);
  await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await page.navigate(`${BASE}/robots.txt`, 30000);
  await page.eval(`localStorage.setItem('vayu_analytics_consent_v1','denied')`);
  await page.navigate(`${BASE}${PATH}`, 90000);
  await sleep(3000);
  await page.eval(`window.scrollTo({ top: 1500, behavior: 'instant' })`);
  await sleep(800);
  const r = await page.eval(`(async () => {
    const out = {};
    const time = (fn) => { const t = performance.now(); fn(); void document.body.offsetHeight; return Math.round(performance.now() - t); };
    out.docHeight = document.documentElement.scrollHeight;
    out.domNodes = document.getElementsByTagName('*').length;
    const y = scrollY;
    out.pinBodyMs = time(() => { const b = document.body; b.style.position = 'fixed'; b.style.top = '-' + y + 'px'; b.style.left = '0'; b.style.right = '0'; b.style.width = '100%'; });
    out.unpinMs = time(() => { const b = document.body; b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = ''; b.style.width = ''; window.scrollTo(0, y); });
    // the real thing: click the menu button and measure until the next frames
    const t0 = performance.now();
    document.querySelector('button[aria-controls="mobile-menu"]').click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    out.openToSecondFrameMs = Math.round(performance.now() - t0);
    return out;
  })()`, 60000);
  log(JSON.stringify(r));
} catch (e) { console.error('failed', e.message); } finally { cleanupAll(); }
