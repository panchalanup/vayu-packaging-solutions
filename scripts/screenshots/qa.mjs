/**
 * QA runner for the 3D Box Designer: loads a job module and runs it against a fresh headless Edge.
 *
 *   node scripts/screenshots/qa.mjs scripts/screenshots/jobs/styles-tour.mjs [--keep-server]
 *
 * A job module default-exports `async (ctx) => {}` where ctx = { d (Designer), page, grab(name, opts), log, sleep, H }.
 * `grab` writes into the scratch folder (os.tmpdir()/vayu-designer-shots) and logs the path. The runner always kills Edge,
 * and kills the dev server only when it started it. Hard timeout per job: 20 minutes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as H from './capture.mjs';
import { QA_HELPERS } from './qaHelpers.mjs';

const { Cdp, Page, Designer, withTimeout, sleep, log, fitBudget, ensureDevServer, launchEdge, keepAwake, cleanupAll, cleanups, consoleIssues, NOISE, PORT, SCRATCH, setStep } = H;

const jobFile = process.argv[2];
if (!jobFile) {
  console.error('usage: node qa.mjs <job.mjs>');
  process.exit(1);
}

const hard = setTimeout(() => {
  console.error('Global QA timeout, stopping.');
  cleanupAll();
  process.exit(2);
}, Number(process.env.QA_MINUTES || 20) * 60 * 1000);

async function connect() {
  await launchEdge();
  const target = await (await withTimeout(fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }), 8000, 'new tab')).json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  cleanups.push(() => cdp.close());
  const page = new Page(cdp);
  for (const m of ['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable', 'DOM.enable']) await page.send(m);
  let step = 'startup';
  const tag = () => H.getStep?.() ?? step;
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type !== 'error' && p.type !== 'warning') return;
    const msg = p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300);
    if (NOISE.some((r) => r.test(msg))) return;
    consoleIssues.push({ step: tag(), kind: `console.${p.type}`, msg });
  });
  cdp.on('Runtime.exceptionThrown', (p) => consoleIssues.push({ step: tag(), kind: 'exception', msg: (p.exceptionDetails.exception?.description ?? p.exceptionDetails.text).slice(0, 400) }));
  cdp.on('Log.entryAdded', (p) => {
    if (p.entry.level !== 'error') return;
    const msg = `${p.entry.text} ${p.entry.url ?? ''}`.slice(0, 300);
    if (NOISE.some((r) => r.test(msg))) return;
    consoleIssues.push({ step: tag(), kind: 'log.error', msg });
  });
  cdp.on('Network.loadingFailed', (p) => {
    if (p.canceled) return;
    consoleIssues.push({ step: tag(), kind: 'network', msg: `${p.errorText} (${p.type})` });
  });
  return page;
}

async function main() {
  keepAwake();
  await ensureDevServer();
  fs.mkdirSync(SCRATCH, { recursive: true });
  const page = await connect();
  const d = new Designer(page);
  const grab = async (name, opts = {}) => {
    const r = await fitBudget(page, `${name}.png`, opts.dir ?? SCRATCH, opts);
    log(`   ${name}: ${r.w}x${r.h} ${Math.round(r.bytes / 1024)} KB`);
    return r;
  };
  const mod = await import(pathToFileURL(path.resolve(jobFile)).href);
  try {
    await withTimeout(mod.default({ d, page, grab, log, sleep, H, Q: QA_HELPERS(d, page, grab), step: setStep }), (Number(process.env.QA_MINUTES || 20) - 1) * 60 * 1000, 'job');
  } catch (e) {
    log('JOB FAILED:', e.message);
    try {
      await fitBudget(page, 'FAIL-qa.png', SCRATCH);
    } catch {
      /* ignore */
    }
    process.exitCode = 1;
  } finally {
    clearTimeout(hard);
    cleanupAll();
  }
  console.log(`\n=== Console problems (${consoleIssues.length}) ===`);
  const seen = new Set();
  for (const i of consoleIssues) {
    const key = `${i.kind}|${i.msg}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`  [${i.step}] ${i.kind}: ${i.msg}`);
  }
}

main().then(() => process.exit(process.exitCode ?? 0), (e) => {
  console.error('qa failed:', e);
  cleanupAll();
  process.exit(1);
});
