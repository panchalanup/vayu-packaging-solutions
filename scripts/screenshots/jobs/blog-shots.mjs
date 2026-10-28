// Phase 2 blog screenshots: captures every shots.json entry whose file is missing from public/blog-images/designer.
//   node scripts/screenshots/qa.mjs scripts/screenshots/jobs/blog-shots.mjs            (all missing)
//   ONLY=a.png,b.png node scripts/screenshots/qa.mjs scripts/screenshots/jobs/blog-shots.mjs
//   FORCE=1 recaptures even when the file exists (use with ONLY)
// Real UI interaction only; the design is set through ?template=, the landing "open in designer" link and clicks.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export default async ({ d, page, Q, log, sleep, step, H }) => {
  const { OUT_DIR, fitBudget, BASE } = H;
  const shots = JSON.parse(fs.readFileSync('scripts/screenshots/shots.json', 'utf8'));
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const todo = shots.filter((s) => (only ? only.includes(s.file) : !fs.existsSync(path.join(OUT_DIR, s.file)) || process.env.FORCE));

  const jsClick = (t, within = 'body') =>
    page.eval(`(() => { const root = document.querySelector(${JSON.stringify(within)}); const b = [...root.querySelectorAll('button')].find((x) => x.textContent.replace(/\\s+/g,' ').trim().startsWith(${JSON.stringify(t)}) || x.getAttribute('aria-label') === ${JSON.stringify(t)}); if (!b) throw new Error('no button ' + ${JSON.stringify(t)}); b.scrollIntoView({block:'nearest'}); b.click(); })()`);
  const tpl = async (id) => {
    await d.open({ url: `/box-designer?template=${id}` });
    await d.stopSpin();
    await d.angle('3/4 hero');
    await d.tab('edit');
  };
  const stopNamed = async (re) => {
    const names = await Q.stops();
    const n = names.find((x) => re.test(x));
    if (!n) throw new Error(`no stop matching ${re} in ${names}`);
    return n;
  };
  const scrollPanelTo = async (text, sel = '*') => {
    await page.rect({ sel, text, block: 'start' });
    await sleep(400);
  };
  const fit = async () => {
    await page.click({ sel: 'button', label: 'Fit view', after: 400 });
    await page.settle(2000);
  };
  const openPicker = async () => {
    await d.tab('edit');
    await page.click({ sel: 'button', text: 'Change style' });
    await page.waitForSel({ sel: '[role="dialog"]' });
    await sleep(1400);
  };
  const pickerGroup = async (g) => {
    await page.click({ sel: '[role="tab"]', text: g, exact: true });
    await sleep(900);
  };
  const addCutout = async (query, nth = 0) => {
    await page.type({ sel: 'input[aria-label="Search cutouts"]' }, query);
    await sleep(900);
    await page.click({ sel: 'button', labelStarts: 'Add ', within: '[role="list"][aria-label="Cutouts"]', nth });
    await sleep(900);
  };
  const parkInCorner = async () => {
    // a new cutout lands mid-wall, on the vent row: nudge it (Shift+arrows = 5%) into the top-left corner strip
    await page.call(`() => document.querySelector('[role="application"][aria-label^="Artwork layout"]').focus()`);
    await page.eval(`document.querySelector('[data-sticker-id]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0, pointerId: 1 }))`);
    await page.call(`() => document.querySelector('[role="application"][aria-label^="Artwork layout"]').focus()`);
    for (let i = 0; i < 5; i++) await page.key('ArrowLeft', 'ArrowLeft', 37, 8);
    for (let i = 0; i < 5; i++) await page.key('ArrowUp', 'ArrowUp', 38, 8);
    await sleep(800);
  };
  const faceRadio = async (name) => {
    await page.click({ sel: 'button[role="radio"]', within: '[aria-label="Box surface"]', text: name });
    await sleep(500);
  };
  const dielineShot = async () => {
    await d.tab('export');
    const dir = path.join(os.tmpdir(), 'vayu-downloads2');
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    await page.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir }).catch(() => page.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dir }));
    await page.click({ sel: 'button', text: 'Dieline (SVG, 1:1)' });
    const deadline = Date.now() + 15000;
    let file;
    while (Date.now() < deadline && !file) {
      file = fs.readdirSync(dir).find((f) => f.endsWith('.svg'));
      await sleep(300);
    }
    if (!file) throw new Error('dieline SVG was not downloaded');
    await page.navigate(`file:///${path.join(dir, file).replace(/\\/g, '/')}`, 20000);
    await page.eval(`(() => { const svg = document.documentElement; const [, , w, h] = svg.getAttribute('viewBox').split(' ').map(Number); svg.setAttribute('width', '1440'); svg.setAttribute('height', String(Math.round(1440 * h / w))); })()`);
    await sleep(800);
  };
  const strengthShot = async (kg) => {
    await d.tab('price');
    await page.type({ sel: 'input[aria-label="Weight of one packed box in kg"]' }, String(kg));
    await page.rect({ sel: 'h3', text: 'How strong is it?', block: 'start' });
    await sleep(600);
  };
  const cutoutsInEdit = async () => {
    await d.tab('edit');
    await scrollPanelTo('Cut-outs', 'p');
  };

  const HANDLERS = {
    async 'designer-cutouts-panel.png'() {
      await d.viaLanding('fruit-box');
      await d.stopSpin();
      await d.tab('customize');
      await faceRadio('Front');
      await scrollPanelTo('Cutouts', 'h3');
    },
    async 'designer-cutout-controls.png'() {
      await d.viaLanding('fruit-box');
      await d.stopSpin();
      await d.tab('customize');
      await faceRadio('Front');
      await addCutout('mango');
      await parkInCorner();
      await page.type({ sel: 'input[aria-label="Search cutouts"]' }, '');
      await scrollPanelTo('Cutout: Mango', 'h3');
    },
    async 'designer-cutouts-brand-colour.png'() {
      await d.viaLanding('cake-box');
      await d.stopSpin();
      await d.tab('customize');
      await faceRadio('Front');
      // spread a varied set with Surprise me (a few cutouts at once), then recolour it with Match brand colour
      await jsClick('Surprise me');
      await sleep(1500);
      await jsClick('Match brand colour');
      await sleep(500);
      const green = await page.eval(`(() => { const b = [...document.querySelectorAll('button[aria-label^="Use #"]')].find((x) => { const h = x.getAttribute('aria-label').slice(4); const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), bl = parseInt(h.slice(5,7),16); return g > r + 25 && g > bl + 25; }); if (!b) return null; b.scrollIntoView({block:'center'}); b.click(); return b.getAttribute('aria-label'); })()`);
      log('brand colour used: ' + green);
      await sleep(1500);
      await jsClick('Match brand colour').catch(() => undefined);
      await sleep(400);
      await d.angle('3/4 hero');
      await d.tab('customize');
      await scrollPanelTo('Cutouts', 'h3');
    },
    async 'designer-cutouts-pattern.png'() {
      await d.viaLanding('fruit-box');
      await d.stopSpin();
      await d.tab('customize');
      await faceRadio('Front');
      await addCutout('mango');
      await parkInCorner();
      await faceRadio('Right');
      await page.type({ sel: 'input[aria-label="Search cutouts"]' }, 'leaf sprig');
      await sleep(900);
      await page.click({ sel: 'button', labelStarts: 'Add ', within: '[role="list"][aria-label="Cutouts"]', nth: 0 });
      await sleep(800);
      await page.click({ sel: 'button[role="switch"]', nth: 0 });
      await sleep(500);
      await page.click({ sel: 'button[role="switch"]', nth: 1 }).catch(() => undefined); // offset every other row
      // low opacity with the keyboard on the opacity slider
      await page.call(`() => { const l = [...document.querySelectorAll('label')].find((x) => x.textContent.trim().startsWith('Opacity:')); l.parentElement.querySelector('[role="slider"]').focus(); }`);
      for (let i = 0; i < 4; i++) await page.key('PageDown', 'PageDown', 34);
      await sleep(1200);
      await d.angle('3/4 hero');
      await d.tab('customize');
      await scrollPanelTo('Repeat as a pattern', 'label');
    },
    async 'designer-cutouts-surprise-me.png'() {
      await d.viaLanding('cake-box');
      await d.stopSpin();
      await d.tab('customize');
      await faceRadio('Lid');
      await page.eval(`document.getElementById('shot-hide')?.remove()`);
      await jsClick('Surprise me');
      await sleep(1700);
      await scrollPanelTo('Cutouts', 'h3');
    },
    async 'designer-template-gallery.png'() {
      await d.open({});
      await d.stopSpin();
      await page.click({ sel: 'button', text: 'Templates' });
      await page.waitForSel({ sel: '[role="dialog"]' });
      await sleep(1200);
      await page.click({ sel: '[role="tab"]', text: 'Fruit & produce', exact: true });
      await sleep(1500);
    },
    async 'designer-template-mango-carton.png'() {
      await tpl('mango-carton');
    },
    async 'designer-template-cake-box.png'() {
      await tpl('cake-window-box');
      await d.fold(88);
    },
    async 'designer-template-tshirt-mailer.png'() {
      await tpl('tshirt-mailer');
      await d.fold(60);
    },
    async 'designer-template-festive-gift.png'() {
      await tpl('festive-gift-box');
      await d.fold(90);
    },
    async 'designer-style-picker-groups.png'() {
      await d.open({});
      await d.stopSpin();
      await openPicker();
    },
    async 'designer-style-picker-search.png'() {
      await d.open({});
      await d.stopSpin();
      await openPicker();
      await page.type({ sel: 'input[aria-label="Search box styles"]' }, 'fruit');
      await sleep(900);
    },
    async 'designer-slide-box.png'() {
      await tpl('skincare-set');
      await d.fold(55);
      await fit();
    },
    async 'designer-idea-honey-jar-box.png'() {
      await tpl('honey-jar-box');
    },
    async 'designer-idea-kidswear-window.png'() {
      await tpl('kidswear-box');
      await d.fold(88);
    },
    async 'designer-idea-snack-counter-display.png'() {
      await tpl('snack-counter-tray');
    },
    async 'designer-openings-vents.png'() {
      await d.viaLanding('fruit-box');
      await d.stopSpin();
      await cutoutsInEdit();
    },
    async 'designer-openings-hand-holes.png'() {
      await d.viaLanding('carry-box');
      await d.stopSpin();
      await d.angle('3/4 hero');
      await d.tab('edit');
    },
    async 'designer-openings-window.png'() {
      await d.viaLanding('cake-box');
      await d.stopSpin();
      await d.angle('3/4 hero');
      await cutoutsInEdit();
    },
    async 'designer-openings-strength-warning.png'() {
      await d.viaLanding('fruit-box');
      await d.stopSpin();
      await strengthShot(10);
    },
    async 'designer-openings-dieline.png'() {
      await d.viaLanding('fruit-box');
      await d.stopSpin();
      await dielineShot();
    },
    async 'designer-produce-picker.png'() {
      await d.open({});
      await d.stopSpin();
      await openPicker();
      await page.click({ sel: 'button[aria-pressed]', text: 'Fruits and veg', exact: true });
      await sleep(900);
    },
    async 'designer-produce-vents.png'() {
      await d.viaLanding('fruit-box');
      await d.stopSpin();
      await d.angle('3/4 hero');
      await cutoutsInEdit();
    },
    async 'designer-produce-strength-warning.png'() {
      await d.viaLanding('fruit-box');
      await d.stopSpin();
      await strengthShot(10);
    },
    async 'designer-mango-carton.png'() {
      await tpl('mango-carton');
    },
    async 'designer-apple-tray.png'() {
      await tpl('apple-tray');
    },
    async 'designer-grape-box.png'() {
      await tpl('grape-box');
    },
    async 'designer-clothing-styles.png'() {
      await d.open({});
      await d.stopSpin();
      await openPicker();
      await pickerGroup('Retail & gifts');
    },
    async 'designer-window-mailer-garment.png'() {
      await d.viaLanding('window-mailer-box');
      await d.stopSpin();
      await d.angle('3/4 hero');
      await d.tab('edit');
      await d.fold(50);
      await scrollPanelTo('Cut-outs', 'p');
    },
    async 'designer-saree-box.png'() {
      await tpl('saree-box');
      await d.fold(82);
    },
    async 'designer-shoe-box-lid.png'() {
      await tpl('shoe-box');
      await d.fold(76);
      await fit();
    },
    async 'designer-saree-box.png'() {
      await tpl('saree-box');
      await d.fold(76);
      await fit();
    },
    async 'designer-saree-showcase.png'() {
      await tpl('saree-box');
      await d.tab('studio');
      await page.click({ sel: 'button', text: 'Warm wood' });
      await page.settle(1500);
    },
    async 'designer-bakery-styles.png'() {
      await d.open({});
      await d.stopSpin();
      await openPicker();
      await pickerGroup('Food & bakery');
    },
    async 'designer-cake-window-box.png'() {
      await d.viaLanding('cake-box');
      await d.stopSpin();
      await d.angle('3/4 hero');
      await cutoutsInEdit();
    },
    async 'designer-mithai-box.png'() {
      await tpl('mithai-box');
      await d.fold(76);
      await fit();
    },
    async 'designer-takeaway-styles.png'() {
      await d.open({});
      await d.stopSpin();
      await openPicker();
      await pickerGroup('Food & bakery');
      await page.eval(`(() => { const p = document.querySelector('[role="tabpanel"]'); p.scrollTop = p.scrollHeight; })()`);
      await sleep(500);
    },
    async 'designer-takeaway-clamshell.png'() {
      await tpl('burger-takeaway');
      await d.fold(50);
    },
    async 'designer-pizza-box-lid.png'() {
      await tpl('pizza-box');
      await d.fold('Open lid');
      await d.angle('Back 3/4');
      await d.tab('edit');
    },
  };

  const results = [];
  for (const shot of todo) {
    const handler = HANDLERS[shot.file];
    if (!handler) {
      results.push([shot.file, 'NO HANDLER']);
      continue;
    }
    step(shot.file);
    log(`-> ${shot.file} (${shot.viewport})`);
    let ok = false;
    for (let attempt = 0; attempt < 2 && !ok; attempt++) {
      try {
        if (shot.viewport === 'mobile') d.mobile = true;
        await handler();
        await d.scrollToTool().catch(() => undefined);
        const r = await fitBudget(page, shot.file, OUT_DIR);
        log(`   saved ${r.w}x${r.h} ${Math.round(r.bytes / 1024)} KB${r.over ? ' OVER BUDGET' : ''}`);
        results.push([shot.file, 'ok']);
        ok = true;
      } catch (e) {
        log(`   attempt ${attempt + 1} failed: ${e.message.slice(0, 160)}`);
      }
    }
    if (!ok) results.push([shot.file, 'FAILED']);
  }
  console.log('\nRESULTS\n' + results.map((r) => r.join('  ')).join('\n'));
};
