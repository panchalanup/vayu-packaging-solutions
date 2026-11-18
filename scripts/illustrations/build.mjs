/**
 * Builds the Vayu illustration set → src/assets/illustrations/*.svg
 * Run: node scripts/illustrations/build.mjs [name-filter]
 * SECURITY: build-time only; output is static, script-free SVG.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteScenes } from './scenes-site.mjs';
import { blogScenes } from './scenes-blog.mjs';
import { blogUseCaseScenes } from './scenes-blog-usecases.mjs';
import { blogPhase2Scenes } from './scenes-blog-phase2.mjs';
import { blogPhase2bScenes } from './scenes-blog-phase2b.mjs';
import { blogN1Scenes } from './scenes-blog-n1.mjs';
import { blogN2Scenes } from './scenes-blog-n2.mjs';
import { blogP1Scenes } from './scenes-blog-p1.mjs';
import { blogP2xScenes } from './scenes-blog-p2x.mjs';
import { v2Scenes } from './scenes-v2.mjs';
import { v2SupplyScenes } from './scenes-v2-supplies.mjs';
import { v2IndustryScenes } from './scenes-v2-industries.mjs';
import { v2ProcessScenes } from './scenes-v2-process.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'src/assets/illustrations');
fs.mkdirSync(outDir, { recursive: true });

const scenes = { ...siteScenes, ...blogScenes, ...blogUseCaseScenes, ...blogPhase2Scenes, ...blogPhase2bScenes, ...blogN1Scenes, ...blogN2Scenes, ...blogP1Scenes, ...blogP2xScenes, ...v2Scenes, ...v2SupplyScenes, ...v2IndustryScenes, ...v2ProcessScenes };
const filter = process.argv[2];
let n = 0;
for (const [name, make] of Object.entries(scenes)) {
  if (filter && !name.includes(filter)) continue;
  fs.writeFileSync(path.join(outDir, `${name}.svg`), make());
  n++;
}
console.log(`wrote ${n} illustrations to ${path.relative(root, outDir)}`);
