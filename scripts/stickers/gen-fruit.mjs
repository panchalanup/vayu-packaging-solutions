/**
 * Original flat fruit and vegetable drawings for items the open emoji sets do not cover
 * (pomegranate, papaya, guava, chikoo, plum and a few more). Drawn for this site, 32x32 grid, flat fills.
 */
import { svg, circle, ellipse, path, el } from './lib.mjs';

const item = (id, name, tags, body) => ({ id, name, category: 'fruits-veg', tags, kind: 'colour', svg: svg(32, 32, body) });

const star = (cx, cy, r, fill) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return el('polygon', { points: pts.join(' '), fill });
};

export const FRUIT_ORIGINALS = [
  item(
    'pomegranate',
    'Pomegranate',
    'anar dadam fruit red',
    circle(16, 18.5, 11.5, '#a81d36') +
      circle(14.8, 17.4, 10.6, '#d92d44') +
      path('M10.6 8.6 11.8 4.4l2.3 2.4L16 3.6l1.9 3.2 2.3-2.4 1.2 4.2z', '#8a1b2e') +
      ellipse(11.2, 14, 1.9, 3.3, '#fff', { opacity: 0.32, transform: 'rotate(25 11.2 14)' }),
  ),
  item(
    'pomegranate-half',
    'Pomegranate half',
    'anar dadam fruit seeds red',
    circle(16, 17, 12, '#a81d36') +
      circle(16, 17, 10.4, '#f6e3c0') +
      [
        [16, 11], [12, 12.4], [20, 12.4], [9.6, 16], [22.4, 16], [13.4, 15.6], [18.6, 15.6], [16, 19],
        [11, 20.2], [21, 20.2], [13.8, 23], [18.2, 23], [16, 14.6],
      ]
        .map(([x, y]) => circle(x, y, 2, '#d92d44') + circle(x - 0.5, y - 0.6, 0.6, '#ff8d9c'))
        .join('') +
      path('M10.8 6.6 12 3l2.3 2.2L16 2.4l1.8 2.8L20 3l1.2 3.6z', '#8a1b2e'),
  ),
  item(
    'papaya',
    'Papaya',
    'papita papaya fruit tropical',
    path('M16 3.5c5.6 0 9.6 7.4 9.2 15.2-.4 6.2-4.2 10.2-9.2 10.2s-8.8-4-9.2-10.2C6.4 10.9 10.4 3.5 16 3.5z', '#e8a52e') +
      path('M16 3.5c5.6 0 9.6 7.4 9.2 15.2-.3 4.2-2 7.4-4.6 9 2.3-2.4 3.5-6.2 3-11C22.9 10.9 20.2 5.4 16 3.5z', '#d98b1f') +
      ellipse(11.4, 14, 1.6, 5, '#fff', { opacity: 0.3, transform: 'rotate(8 11.4 14)' }) +
      path('M14.6 3.9c.2-1.4.8-2.2 1.4-2.2s1.2.8 1.4 2.2z', '#5d8a2f'),
  ),
  item(
    'papaya-half',
    'Papaya half',
    'papita papaya fruit seeds tropical',
    path('M16 3c5.8 0 10 7.6 9.6 15.6C25.2 25 21 29.5 16 29.5S6.8 25 6.4 18.6C6 10.6 10.2 3 16 3z', '#9ebf3a') +
      path('M16 4.6c4.8 0 8.4 6.8 8 14-.3 5.6-3.9 9.3-8 9.3s-7.7-3.7-8-9.3c-.4-7.2 3.2-14 8-14z', '#ff9b3d') +
      ellipse(16, 18.4, 4.2, 6.8, '#f0702a') +
      [[16, 13], [14, 16], [18, 16], [13.6, 19.4], [18.4, 19.4], [16, 20.4], [14.6, 23], [17.4, 23]]
        .map(([x, y]) => circle(x, y, 1.15, '#2b2420'))
        .join(''),
  ),
  item(
    'guava',
    'Guava',
    'amrud jamphal peru fruit green',
    path('M16 5.2c6.6 0 11 4.6 11 10.6 0 7.4-5 12.2-11 12.2S5 23.2 5 15.8C5 9.8 9.4 5.2 16 5.2z', '#8fbe3a') +
      path('M16 5.2c4 0 7.4 1.8 9.2 4.8-2.2-1.4-5-2-8-1.6-4.4.6-7.2 3.4-8.4 7.4C8.2 9.4 11.4 5.2 16 5.2z', '#b4de5a') +
      ellipse(20.4, 22, 4, 2.4, '#7aa62d', { opacity: 0.7, transform: 'rotate(-30 20.4 22)' }) +
      circle(11.6, 16.5, 0.7, '#6f9a28') + circle(19.6, 14.2, 0.7, '#6f9a28') + circle(15.6, 21, 0.7, '#6f9a28') +
      star(16, 6.4, 3, '#4f7a22'),
  ),
  item(
    'guava-half',
    'Guava half',
    'amrud jamphal peru fruit seeds pink',
    circle(16, 17, 12, '#8fbe3a') +
      circle(16, 17, 10.8, '#eef5c4') +
      circle(16, 17, 8.4, '#f58d9c') +
      circle(16, 17, 4.6, '#fbd0d6') +
      [[16, 14.6], [18.2, 16], [17.4, 18.6], [14.6, 18.6], [13.8, 16]].map(([x, y]) => circle(x, y, 0.9, '#e9c25a')).join('') +
      path('M13.2 4.2c.6-1.2 1.6-1.8 2.8-1.8s2.2.6 2.8 1.8c-1.6.8-4 .8-5.6 0z', '#4f7a22'),
  ),
  item(
    'chikoo',
    'Chikoo',
    'chiku chikoo sapota sapodilla fruit brown',
    ellipse(16, 18.4, 11.5, 9.8, '#a8703c') +
      path('M16 8.6c6.2 0 11.5 4.2 11.5 9.8 0 .8-.1 1.5-.3 2.2-2-4.6-6.4-7.2-11.2-7.2S6.8 18 4.8 20.6c-.2-.7-.3-1.4-.3-2.2 0-5.6 5.3-9.8 11.5-9.8z', '#c68b52') +
      ellipse(10.6, 14.4, 1.6, 2.6, '#fff', { opacity: 0.28, transform: 'rotate(40 10.6 14.4)' }) +
      [[12, 20], [18, 22.4], [22, 18.4], [15, 16.8], [20, 15.4]].map(([x, y]) => circle(x, y, 0.6, '#8a5a2c')).join('') +
      path('M16 8.8V5.6', '', { stroke: '#6b4a2a', 'stroke-width': 1.6, 'stroke-linecap': 'round', fill: 'none' }) +
      path('M16 6.2c1.2-2.4 4-3 6-2.2-.6 2.4-3.4 3.4-6 2.2z', '#5d8a2f'),
  ),
  item(
    'chikoo-half',
    'Chikoo half',
    'chiku chikoo sapota sapodilla fruit seeds brown',
    ellipse(16, 17.4, 12, 10.4, '#a8703c') +
      ellipse(16, 17.4, 10.6, 9, '#e4bc7a') +
      ellipse(16, 17.4, 5.4, 4.2, '#d4a560', { opacity: 0.8 }) +
      [[12.8, 17.4, -20], [16, 16.2, 0], [19.2, 17.4, 20]]
        .map(([x, y, a]) => ellipse(x, y, 1.5, 3.1, '#2e2320', { transform: `rotate(${a} ${x} ${y})` }) + ellipse(x - 0.4, y - 1, 0.4, 1.1, '#fff', { opacity: 0.4, transform: `rotate(${a} ${x} ${y})` }))
        .join(''),
  ),
  item(
    'plum',
    'Plum',
    'aloo bukhara plum fruit purple',
    circle(16, 18.4, 11, '#5a2f87') +
      path('M16 7.8c-3 1.2-4.6 4.6-4.4 8.4.2 4.6 2.2 8.2 4.4 12.4-6 0-11-4.8-11-10.4 0-5 4.2-9.6 11-10.4z', '#6f3da0') +
      ellipse(21.4, 14.4, 1.4, 3.2, '#fff', { opacity: 0.24, transform: 'rotate(-20 21.4 14.4)' }) +
      path('M16 8.2c.2-2 .8-3.6 1.8-4.6', '', { stroke: '#6b4a2a', 'stroke-width': 1.5, 'stroke-linecap': 'round', fill: 'none' }) +
      path('M17.6 4.4c1.6-1.8 4.4-2 6-.8-1 2.2-4 2.8-6 .8z', '#5d8a2f'),
  ),
  item(
    'dragon-fruit',
    'Dragon fruit',
    'kamalam pitaya fruit pink tropical',
    ellipse(16, 18, 10, 11.4, '#d93b78') +
      ellipse(12.4, 14, 1.8, 4, '#fff', { opacity: 0.22, transform: 'rotate(15 12.4 14)' }) +
      path('M16 6.6c-1.4-1.6-1-3.4-3-4.8 2.2-.2 3.8.8 3 4.8zM16 6.6c1.4-1.6 1-3.4 3-4.8-2.2-.2-3.8.8-3 4.8z', '#3fae5a') +
      path('M6.4 14.4C4.4 13.6 3.4 12 3 10c2.6.6 4.2 1.6 3.4 4.4zM25.6 14.4c2-.8 3-2.4 3.4-4.4-2.6.6-4.2 1.6-3.4 4.4zM6.2 21.4c-2 .6-3.2 2-3.6 3.8 2.6-.4 4.2-1.2 3.6-3.8zM25.8 21.4c2 .6 3.2 2 3.6 3.8-2.6-.4-4.2-1.2-3.6-3.8z', '#3fae5a'),
  ),
  item(
    'dragon-fruit-half',
    'Dragon fruit half',
    'kamalam pitaya fruit seeds white tropical',
    ellipse(16, 17, 11, 12.4, '#d93b78') +
      ellipse(16, 17, 8.8, 10.2, '#fbf3f5') +
      Array.from({ length: 26 }, (_, i) => {
        const x = 16 + ((i * 37) % 15) - 7.5 + ((i % 3) - 1) * 0.4;
        const y = 17 + ((i * 53) % 19) - 9.5;
        const inside = ((x - 16) / 7.8) ** 2 + ((y - 17) / 9.2) ** 2 < 1;
        return inside ? circle(x, y, 0.6, '#2b2420') : '';
      }).join(''),
  ),
  item(
    'beetroot',
    'Beetroot',
    'chukandar beet vegetable red',
    path('M16 11c6 0 10 4 10 9 0 5-4 8-10 8s-10-3-10-8c0-5 4-9 10-9z', '#a3153f') +
      path('M16 11c3 0 6 1.2 7.8 3.4-2.6-.6-5.4-.2-7.8 1.6-2.4-1.8-5.2-2.2-7.8-1.6C10 12.2 13 11 16 11z', '#c21d52') +
      path('M16 28v3', '', { stroke: '#a3153f', 'stroke-width': 1.4, 'stroke-linecap': 'round', fill: 'none' }) +
      path('M16 11C14 8 11 6 8.6 5.6 9.4 8.6 12 10.4 16 11zM16 11c2-3 5-5 7.4-5.4C22.6 8.6 20 10.4 16 11zM16 11V3.6', '#3f9a4a', { stroke: '#2f7a3a', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }),
  ),
  item(
    'pumpkin',
    'Pumpkin',
    'kaddu kolu vegetable orange',
    ellipse(16, 19, 13, 10, '#e8741e') +
      ellipse(10.2, 19, 5.2, 10, '#f08a32') +
      ellipse(21.8, 19, 5.2, 10, '#f08a32') +
      ellipse(16, 19, 3.8, 10.2, '#d96412') +
      path('M16 9.6V6', '', { stroke: '#5d7a2a', 'stroke-width': 2.6, 'stroke-linecap': 'round', fill: 'none' }) +
      path('M17.4 7.4c2-1.6 4.8-1.4 5.8.2-1.6 1.8-4.4 1.6-5.8-.2z', '#5d9a3a'),
  ),
  item(
    'okra',
    'Okra',
    'bhindi bhinda ladyfinger lady finger vegetable green',
    path('M7 24.6C5.6 20 9.4 11.4 14.4 7l2.2 1.8C12.8 13.2 10 20.4 11 25.6z', '#4f9a3a') +
      path('M14.4 7C17 4.6 20 5 21 6.6l-4.4 2.2z', '#3a7a2c') +
      path('M18 28.4c-1-4.4 1-12.2 5.4-17l2.2 1.8c-3.2 4.8-4.6 11-3.6 15.2z', '#5fae48') +
      path('M23.4 11.4c2.4-2 5-1.6 6 0l-3.8 1.8z', '#3a7a2c'),
  ),
  item(
    'custard-apple',
    'Custard apple',
    'sitaphal sitafal seetaphal fruit green',
    circle(16, 18, 11, '#7fb64a') +
      [[10, 12], [16, 10], [22, 12], [7.6, 18], [13, 16], [19, 16], [24.4, 18], [10, 23], [16, 22], [22, 23], [13, 27], [19, 27]]
        .map(([x, y]) => circle(x, y, 3.1, '#9ccc5e') + circle(x + 0.6, y + 0.8, 1.6, '#6aa23a', { opacity: 0.55 }))
        .join('') +
      path('M16 7V4', '', { stroke: '#6b4a2a', 'stroke-width': 1.6, 'stroke-linecap': 'round', fill: 'none' }),
  ),
  item(
    'jamun',
    'Jamun',
    'jambu jamun black plum java plum fruit purple',
    ellipse(12, 19, 6.4, 8.2, '#3a1f5e') +
      ellipse(21, 17, 6, 7.6, '#4b2877') +
      ellipse(10.2, 16, 1.2, 2.4, '#fff', { opacity: 0.26, transform: 'rotate(15 10.2 16)' }) +
      ellipse(19.6, 13.8, 1.2, 2.4, '#fff', { opacity: 0.26, transform: 'rotate(15 19.6 13.8)' }) +
      path('M12 11C12 8 14 6 17 5.4M21 9.6C21 7.6 21.4 6.4 22.4 5.4', '', { stroke: '#6b4a2a', 'stroke-width': 1.4, 'stroke-linecap': 'round', fill: 'none' }) +
      path('M17 5.4c1.4-2.2 4.4-2.6 6.2-1.4-1.2 2.4-4.4 3-6.2 1.4z', '#5d9a3a'),
  ),
];
