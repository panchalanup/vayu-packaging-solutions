export default async ({ d, page, Q, log, sleep, grab }) => {
  await d.open({ viewport: 'mobile' });
  await d.stopSpin();
  await d.tab('edit');
  await sleep(500);
  await page.click({ sel: 'button', text: 'Templates' });
  for (let i = 0; i < 6; i++) {
    const t0 = Date.now();
    try {
      const r = await page.eval(`({ n: document.querySelectorAll('[role="dialog"]').length, imgs: document.images.length, t: performance.now() })`, 8000);
      log(`t+${i}: ${JSON.stringify(r)} in ${Date.now() - t0} ms`);
    } catch (e) { log(`t+${i}: ${e.message}`); }
    await sleep(1000);
  }
};
