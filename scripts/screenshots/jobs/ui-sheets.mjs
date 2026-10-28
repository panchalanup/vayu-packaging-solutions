// Style picker, template gallery and wizard on desktop (default) or mobile (VIEWPORT=mobile)
export default async ({ d, page, grab, Q, log, step, sleep }) => {
  const vp = process.env.VIEWPORT === 'mobile' ? 'mobile' : 'desktop';
  const pre = `ui-${vp}`;
  const jsClick = (t, within = 'body') => page.eval(`(() => { const root = document.querySelector(${JSON.stringify(within)}); const b = [...root.querySelectorAll('button')].find((x) => x.textContent.replace(/\s+/g,' ').trim().startsWith(${JSON.stringify(t)}) || x.getAttribute('aria-label') === ${JSON.stringify(t)}); if (!b) throw new Error('no button ' + ${JSON.stringify(t)}); b.click(); })()`);
  step('picker');
  await d.open({ viewport: vp });
  await d.stopSpin();
  await d.tab('edit');
  await grab(`${pre}-01-edit`);
  await page.click({ sel: 'button', text: 'Change style' });
  await page.waitForSel({ sel: '[role="dialog"]' });
  await sleep(1200);
  await grab(`${pre}-02-picker`);
  await page.type({ sel: 'input[aria-label="Search box styles"]' }, 'fruit');
  await sleep(800);
  await grab(`${pre}-03-picker-search-fruit`);
  await page.click({ sel: 'button', label: 'Clear search' });
  await page.click({ sel: '[role=\"tab\"]', text: 'Food & bakery', exact: true });
  await sleep(800);
  await grab(`${pre}-04-picker-food`);
  await page.click({ sel: '[role=\"tab\"]', text: 'Retail & gifts', exact: true });
  await sleep(800);
  await grab(`${pre}-05-picker-retail`);
  await page.click({ sel: '[role="tab"]', text: 'All', exact: true });
  await page.click({ sel: 'button[aria-pressed]', text: 'Fruits and veg', exact: true });
  await sleep(800);
  await grab(`${pre}-06-picker-chip-fruit`);
  // pick the first card: produce carton
  await page.eval(`(() => { const c = [...document.querySelectorAll('[role="dialog"] [role="tabpanel"] button[aria-pressed]')][0]; c.click(); })()`);
  await sleep(2500);
  await grab(`${pre}-07-after-pick`);
  log('style label: ' + (await page.eval(`(document.body.innerText.split('Style:')[1] || '').slice(0, 30)`)));

  step('gallery');
  await d.open({ viewport: vp });
  await d.stopSpin();
  await d.tab('edit');
  await page.click({ sel: 'button', text: 'Templates' });
  await page.waitForSel({ sel: '[role="dialog"]' });
  await sleep(1500);
  await grab(`${pre}-10-gallery`);
  await page.click({ sel: '[role="tab"]', text: 'Fruit & produce', exact: true });
  await sleep(1500);
  await grab(`${pre}-11-gallery-fruit`);
  await page.type({ sel: 'input[aria-label="Search templates"]' }, 'cake');
  await sleep(1200);
  await grab(`${pre}-12-gallery-search-cake`);
  const broken = await page.eval(`[...document.querySelectorAll('[role="dialog"] img')].filter(i => i.complete && i.naturalWidth === 0).length`);
  log('broken gallery images: ' + broken);

  for (const [name, product] of [['fruit', 'Fruit & vegetables'], ['cake', 'Cakes']]) {
    step('wizard ' + name);
    await d.open({ viewport: vp });
    await d.stopSpin();
    await d.tab('edit');
    await page.click({ sel: 'button', text: 'Find my box' });
    await page.waitForSel({ sel: '[role="dialog"]', text: 'Step 1 of 5' });
    await sleep(600);
    await page.click({ sel: 'button[role="radio"]', text: product });
    await sleep(600);
    await grab(`${pre}-20-wizard-${name}-step2`);
    await page.click({ sel: 'button', text: 'Next' });
    await page.click({ sel: 'button[role="radio"]', text: 'Local delivery' });
    await sleep(500);
    await page.click({ sel: 'button', text: 'See my box' });
    await page.waitForSel({ sel: 'p', text: 'We recommend' }, 20000);
    await sleep(1500);
    await grab(`${pre}-21-wizard-${name}-result`);
    log(name + ' buttons: ' + JSON.stringify(await Q.texts('[role="dialog"] button')).slice(0, 600));
  }
};
