/**
 * Home "story" section: screenshots of every scene, to tune the camera and judge the timing.
 * Desktop scrolls the sticky track to each scene's hold point (and a few mid-motion points); phone taps "Next scene".
 *
 *   MSYS_NO_PATHCONV=1 node scripts/screenshots/qa.mjs scripts/screenshots/jobs/story-beats.mjs
 *   STORY_VIEWS=desktop STORY_PTS=0.092,0.39 STORY_OUT=C:/tmp/story node scripts/screenshots/qa.mjs ...
 *
 * Headless Edge uses a software renderer, which the site tiers as "low" (stills), so the URL forces ?quality=high.
 * ?story-debug adds a small "p · scene" label to every shot. Keep these points in step with SCENES in
 * src/components/home/story/beats.ts (each scene's hold point is from + 0.92 * length).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OUT = process.env.STORY_OUT || path.join(os.tmpdir(), 'vayu-story-shots');
const VIEWS = (process.env.STORY_VIEWS || 'desktop,mobile').split(',');
// hold point of each of the nine scenes, then a few moments inside the moving parts
const HOLDS = [0.092, 0.192, 0.274, 0.39, 0.474, 0.609, 0.749, 0.87, 0.99];
const MID = [0.04, 0.15, 0.225, 0.33, 0.36, 0.44, 0.55, 0.68, 0.81, 0.93];
const POINTS = (process.env.STORY_PTS ? process.env.STORY_PTS.split(',').map(Number) : [...HOLDS, ...MID]).sort((a, b) => a - b);

export default async ({ d, page, grab, log, sleep, step }) => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const view of VIEWS) {
    step?.(`story-${view}`);
    await d.open({ url: '/?quality=high&story-debug=1', viewport: view, canvas: false });
    await sleep(2500);

    const geom = await page.eval(`(() => {
      const t = document.querySelector('[data-story-track]'), s = document.querySelector('[data-story-stage]');
      if (!t || !s) return null;
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      return { top: t.getBoundingClientRect().top + scrollY, run: t.offsetHeight - s.offsetHeight, stage: s.offsetHeight, nav };
    })()`);
    if (!geom) {
      log(`${view}: story section not found (stills mode?)`);
      continue;
    }
    log(view, JSON.stringify(geom));

    if (view === 'desktop') {
      // arrive from above so the lazy canvas mounts, then give it time to load its chunk and render
      await page.eval(`scrollTo(0, ${Math.max(0, Math.round(geom.top - geom.nav - 900))})`);
      await sleep(3500);
      for (const p of POINTS) {
        const y = Math.round(geom.top - geom.nav + p * geom.run);
        await page.eval(`scrollTo(0, ${y})`);
        await sleep(1900);
        await grab(`story-${view}-${String(Math.round(p * 1000)).padStart(3, '0')}`, { dir: OUT, maxWidth: 1200 });
      }
    } else {
      await page.eval(`document.querySelector('[data-story-stage]').scrollIntoView({ block: 'center' })`);
      await sleep(3500);
      for (let i = 0; i < 9; i++) {
        await grab(`story-${view}-scene${i + 1}`, { dir: OUT, maxWidth: 600 });
        await page.eval(`document.querySelector('[aria-label="Next scene"]')?.click()`);
        await sleep(2400);
      }
    }
  }
};
