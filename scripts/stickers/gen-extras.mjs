/** Extra original flat drawings: plain leaf stickers (the emoji leaf carries wind lines we do not want). */
import { svg, path } from './lib.mjs';

const mk = (id, name, category, tags, body) => ({ id, name, category, tags: tags.split(/\s+/), kind: 'colour', svg: svg(32, 32, body) });

const leafBody = (a, b, rot = 0) =>
  `<g transform="rotate(${rot} 16 16)">` +
  path('M16 29C7 25 5 13 16 3c11 10 9 22 0 26z', a) +
  path('M16 3c11 10 9 22 0 26z', b) +
  path('M16 6v22', 'none', { stroke: '#ffffff', 'stroke-opacity': 0.5, 'stroke-width': 1.2, 'stroke-linecap': 'round' }) +
  '</g>';

export const EXTRAS = [
  mk('leaf', 'Leaf', 'fruits-veg', 'patta paan green nature leaf', leafBody('#4caf50', '#3a9a44', 35)),
  mk('leaf-light', 'Light green leaf', 'flowers-plants', 'patta green nature leaf fresh', leafBody('#8bc34a', '#76ad3a', -30)),
  mk('leaf-dark', 'Dark green leaf', 'flowers-plants', 'patta green nature leaf', leafBody('#2e7d4f', '#256b43', 20)),
  mk('leaf-sprig', 'Leaf sprig', 'flowers-plants', 'patta green nature branch twig',
    path('M8 28C13 22 18 15 24 5', 'none', { stroke: '#6b4a2a', 'stroke-width': 1.6, 'stroke-linecap': 'round' }) +
      [[11.5, 24, -70], [14.5, 19.6, 60], [17, 15.6, -65], [19.8, 11.4, 62], [22.6, 7.4, -50]]
        .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(.42)">${path('M0 9C-8 4-8-4 0-10 8-4 8 4 0 9z', '#4caf50')}</g>`).join('') +
      `<g transform="translate(24 4.6) rotate(20) scale(.4)">${path('M0 9C-8 4-8-4 0-10 8-4 8 4 0 9z', '#3a9a44')}</g>`),
];
