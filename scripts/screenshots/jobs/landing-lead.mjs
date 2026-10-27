// 4 new landing pages (desktop + mobile), then estimate + lead form for new styles
export default async ({ d, page, grab, Q, log, step, sleep, H }) => {
  const { BASE } = H;
  const slugs = ['carry-box', 'tuck-end-box', 'takeaway-box', 'display-tray'];
  const metrics = () => page.eval(`({ h1: document.querySelector('h1')?.textContent, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, imgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length, links: [...document.querySelectorAll('a[href*="/box-designer"]')].map(a => a.getAttribute('href')).slice(0, 4) })`);
  for (const vp of ['desktop', 'mobile']) {
    for (const slug of slugs) {
      step(`landing ${slug} ${vp}`);
      await page.viewport(vp);
      await page.navigate(`${BASE}/robots.txt`, 30000);
      await page.call(`() => { localStorage.clear(); localStorage.setItem('vayu_analytics_consent_v1','denied'); localStorage.setItem('vayu-box-designer:onboarded','done'); }`);
      await page.navigate(`${BASE}/box-designer/${slug}`);
      await d.hideNoise();
      await page.waitForSel({ sel: 'h1' }, 30000);
      await sleep(1500);
      log(`${vp} ${slug}: ${JSON.stringify(await metrics())}`);
      await grab(`landing2-${vp}-${slug}`);
      // full page height shot of the desktop one, scrolled to the middle
      await page.eval(`window.scrollTo(0, document.body.scrollHeight * 0.45)`);
      await sleep(700);
      await grab(`landing2-${vp}-${slug}-mid`);
    }
  }
  // estimate and lead form with new styles
  for (const style of ['cake-box', 'crash-lock']) {
    step(`lead ${style}`);
    await d.open({ url: `/box-designer?style=${style}` });
    await d.stopSpin();
    await d.tab('price');
    await sleep(800);
    await grab(`lead-${style}-estimate`);
    await page.click({ sel: 'button', text: 'Send my design to Vayu' });
    await page.waitForSel({ sel: '[role="dialog"]' });
    await sleep(900);
    await page.setField('Your name', 'Test Person', '[role="dialog"]');
    await page.setField('Mobile', '9876543210', '[role="dialog"]');
    await page.setField('City or pincode', '395003', '[role="dialog"]');
    await grab(`lead-${style}-form`);
    log('dialog text: ' + (await page.eval(`document.querySelector('[role="dialog"]').innerText.replace(/\s+/g,' ').slice(0, 700)`)));
  }
};
