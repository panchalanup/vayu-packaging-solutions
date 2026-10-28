export default async ({ d, page, log, sleep, grab }) => {
  await d.open({ url: '/box-designer?style=produce' });
  await d.stopSpin();
  await d.tab('customize');
  await page.click({ sel: 'button[role="radio"]', within: '[aria-label="Box surface"]', text: 'Front' });
  for (const wait of [500, 3000, 6000]) {
    await sleep(wait);
    log(wait + ' ' + JSON.stringify(await page.eval(`(() => { const b = document.querySelector('[role="list"][aria-label="Cutouts"] button'); const i = b.querySelector('img'); const r = b.getBoundingClientRect(); const ir = i.getBoundingClientRect(); return { btn: [r.width, r.height], img: [ir.width, ir.height], complete: i.complete, nw: i.naturalWidth, src: i.src.slice(0, 100), vis: [...document.querySelectorAll('[role="list"][aria-label="Cutouts"] img')].filter(x => x.complete && x.naturalWidth > 0).length }; })()`)));
  }
  await page.eval(`document.querySelector('[role="list"][aria-label="Cutouts"]').scrollIntoView({block:'center'})`);
  await sleep(2500);
  await grab('probe-thumbs');
};
