/**
 * Reproduce a dieline PDF failure in the real browser (dev server) and print the actual error.
 *   node scripts/showcase/pdfdebug.mjs
 */
import * as H from '../screenshots/capture.mjs';

const { Cdp, Page, withTimeout, sleep, log, ensureDevServer, launchEdge, cleanupAll, cleanups, PORT, BASE } = H;

try {
  await ensureDevServer();
  await launchEdge();
  const target = await (await withTimeout(fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }), 8000, 'new tab')).json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  cleanups.push(() => cdp.close());
  const page = new Page(cdp);
  for (const m of ['Page.enable', 'Runtime.enable']) await page.send(m);
  const errors = [];
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') errors.push(p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 400));
  });
  await page.navigate(`${BASE}/3d-box-designer`, 90_000);
  await sleep(2500);
  const result = await page.eval(
    `(async () => {
      try {
        const d = await import('/src/lib/boxDesigner/dieline.ts');
        const l = await import('/src/lib/boxDesigner/styles/designLayout.ts');
        const c = await import('/src/lib/boxDesigner/designCodec.ts');
        const reg = await import('/src/lib/boxDesigner/styles/registry.ts');
        const out = {};
        for (const id of ['rsc', 'mailer', 'telescope']) {
          const design = { ...c.DEFAULT_DESIGN, template: id, dimensions: { ...reg.getStyle(id).defaultDims } };
          try {
            const blob = await d.dielineToPdf(l.dielineForDesign(design));
            out[id] = 'ok ' + blob.size;
          } catch (e) {
            out[id] = 'FAILED: ' + (e && (e.stack || e.message || String(e))).slice(0, 600);
          }
        }
        return JSON.stringify(out, null, 1);
      } catch (e) {
        return 'import failed: ' + (e && (e.stack || e.message || String(e))).slice(0, 800);
      }
    })()`,
    90_000
  );
  log(result);
  if (errors.length) log('console errors:', errors.join(' | '));
} catch (e) {
  console.error('debug failed:', e.message);
} finally {
  cleanupAll();
}
