// Mobile cutouts header after the wrap fix, then share link keeps stickers (desktop)
export default async ({ d, page, grab, log, sleep, step, H }) => {
  step('mobile cutouts');
  await d.open({ url: '/box-designer?template=mango-carton', viewport: 'mobile' });
  await d.stopSpin();
  await d.tab('customize');
  await page.click({ sel: 'button[role="radio"]', within: '[aria-label="Box surface"]', text: 'Front' });
  await sleep(600);
  await page.eval(`[...document.querySelectorAll('h3')].find(h => h.textContent.trim()==='Cutouts').scrollIntoView({block:'start'})`);
  await sleep(500);
  await grab('final-mobile-cutouts');
  step('share link');
  await d.open({ url: '/box-designer?template=cake-window-box' });
  await d.stopSpin();
  await sleep(1500);
  await page.eval(`window.__copied = null; Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t) => { window.__copied = t; return Promise.resolve(); } }, configurable: true });`);
  await d.tab('export');
  await page.click({ sel: 'button', text: 'Copy share link' });
  await sleep(800);
  const url = await page.eval('window.__copied');
  log('share url length ' + (url ? url.length : null));
  const before = await page.eval(`JSON.parse(localStorage.getItem('vayu-box-designer:v1')).stickers.length`);
  // open the link in a fresh storage context
  await page.navigate(`${H.BASE}/robots.txt`, 30000);
  await page.eval(`localStorage.clear(); localStorage.setItem('vayu_analytics_consent_v1','denied'); localStorage.setItem('vayu-box-designer:onboarded','done')`);
  await page.navigate(url.replace(/^https?:\/\/[^/]+/, H.BASE));
  await d.hideNoise();
  await page.waitCanvas();
  await sleep(3000);
  const after = await page.eval(`JSON.parse(localStorage.getItem('vayu-box-designer:v1') || '{"stickers":[]}').stickers.length`);
  log(`stickers before ${before}, after opening share link ${after}`);
  await d.scrollToTool();
  await grab('final-share-link-open');
};
