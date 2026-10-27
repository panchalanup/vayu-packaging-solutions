/**
 * Box thumbnail: a small isometric SVG drawing of a box style in its colour (templates gallery, wizard result,
 * landing pages). Pure SVG, no images or WebGL, so it is instant and works everywhere.
 */

import { useId } from 'react';
import type { BoxDimensions, BoxFace, BoxTemplate } from '@/types/boxDesigner';
import { mix } from '@/lib/boxDesigner/studio';

/** A sticker drawn on the thumbnail (only the top, front and right surfaces are visible in the drawing) */
export interface ThumbMark {
  src: string;
  face: BoxFace;
  /** Centre, 0-1 of the surface */
  x: number;
  y: number;
  /** Longest side as a fraction of the surface's shorter side (like StickerPlacement.scale) */
  scale: number;
  flip?: boolean;
  rotation?: number;
}

interface BoxThumbnailProps {
  style: BoxTemplate;
  dimensions: BoxDimensions;
  colorHex: string;
  /** Optional sample art (data:image URL) shown on the top / lid */
  artUrl?: string | null;
  /** Optional sticker composition, drawn on the lid or top, the front and the right wall */
  marks?: ThumbMark[];
  className?: string;
  title?: string;
}

const COS = Math.cos(Math.PI / 6);

export default function BoxThumbnail({ style, dimensions, colorHex, artUrl, marks, className, title }: BoxThumbnailProps) {
  const clipId = useId().replace(/:/g, '');
  const hex = /^#[0-9a-f]{6}$/i.test(colorHex) ? colorHex : '#C9A87C';
  const top = mix(hex, '#ffffff', 0.18);
  const left = hex;
  const right = mix(hex, '#000000', 0.16);
  const inside = mix(hex, '#000000', 0.32);
  const stroke = mix(hex, '#000000', 0.45);

  // Normalise so the drawing always fills the frame
  const { length, width, height } = dimensions;
  const scale = 100 / Math.max(length + width, (length + width) * 0.5 + height);
  const L = length * scale;
  const W = width * scale;
  const H = height * scale;
  const P = (x: number, y: number, z: number): [number, number] => [(x - y) * COS, (x + y) * 0.5 - z];
  const pts = (arr: [number, number, number][]) => arr.map((v) => P(...v).map((n) => n.toFixed(1)).join(',')).join(' ');

  const openTop = style === 'hsc' || style === 'tray' || style === 'sleeve' || style === 'shelf-tray' || style === 'produce-tray';
  const lidLine = style === 'telescope' ? H * 0.62 : ['mailer', 'pizza', 'window-mailer', 'cake-box', 'clamshell', 'book-box', 'slide-box'].includes(style) ? H * 0.82 : null;

  // Bounds for the viewBox
  const xs = [P(0, W, 0)[0], P(L, 0, 0)[0]];
  const ys = [P(0, 0, H)[1], P(L, W, 0)[1]];
  const pad = 8;
  const vb = `${(xs[0] - pad).toFixed(1)} ${(ys[0] - pad).toFixed(1)} ${(xs[1] - xs[0] + 2 * pad).toFixed(1)} ${(ys[1] - ys[0] + 2 * pad).toFixed(1)}`;

  const topFace = pts([[0, 0, H], [L, 0, H], [L, W, H], [0, W, H]]);
  const [ax, ay] = P(L / 2, W / 2, H);
  const artSize = Math.min(L, W) * 0.55;

  // Stickers: surface the mark sits on -> the plane it is drawn on (image x/y axes in drawing units)
  const surfaceOf = (face: BoxFace): 'top' | 'front' | 'right' | null =>
    face === 'front' ? 'front' : face === 'right' ? 'right' : face === 'lid' || face === 'top-front' ? (openTop ? null : 'top') : null;
  const markSvg = (mark: ThumbMark, i: number) => {
    const plane = surfaceOf(mark.face);
    if (!plane) return null;
    const [sw, sh] = plane === 'top' ? [L, W] : plane === 'front' ? [L, H] : [W, H];
    const size = mark.scale * Math.min(sw, sh);
    const u = mark.x;
    const v = mark.y;
    let origin: [number, number];
    let matrix: string;
    if (plane === 'top') {
      origin = P(u * L, v * W, H);
      matrix = `${COS} 0.5 ${-COS} 0.5`;
    } else if (plane === 'front') {
      origin = P(u * L, W, (1 - v) * H);
      matrix = `${COS} 0.5 0 1`;
    } else {
      origin = P(L, (1 - u) * W, (1 - v) * H);
      matrix = `${COS} -0.5 0 1`;
    }
    const flip = mark.flip ? ' scale(-1 1)' : '';
    const turn = mark.rotation ? ` rotate(${mark.rotation})` : '';
    return (
      <image
        key={i}
        href={mark.src}
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        transform={`translate(${origin[0].toFixed(2)} ${origin[1].toFixed(2)}) matrix(${matrix} 0 0)${turn}${flip}`}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  };
  const frontMarks = (marks ?? []).filter((m) => surfaceOf(m.face) === 'front');
  const rightMarks = (marks ?? []).filter((m) => surfaceOf(m.face) === 'right');
  const topMarks = (marks ?? []).filter((m) => surfaceOf(m.face) === 'top');

  return (
    <svg viewBox={vb} className={className} role="img" aria-label={title ?? `${style} box`}>
      {/* left (front) and right (side) walls */}
      <polygon points={pts([[0, W, 0], [L, W, 0], [L, W, H], [0, W, H]])} fill={left} stroke={stroke} strokeWidth={0.8} strokeLinejoin="round" />
      <polygon points={pts([[L, 0, 0], [L, W, 0], [L, W, H], [L, 0, H]])} fill={right} stroke={stroke} strokeWidth={0.8} strokeLinejoin="round" />
      {frontMarks.map(markSvg)}
      {rightMarks.map(markSvg)}
      {openTop ? (
        <>
          <polygon points={topFace} fill={inside} stroke={stroke} strokeWidth={0.8} />
          {style === 'sleeve' && <polygon points={pts([[L, 0, H * 0.15], [L, W, H * 0.15], [L, W, H * 0.85], [L, 0, H * 0.85]])} fill={inside} opacity={0.6} />}
        </>
      ) : (
        <polygon points={topFace} fill={top} stroke={stroke} strokeWidth={0.8} strokeLinejoin="round" />
      )}
      {style === 'rsc' || style === 'fol' ? (
        <line x1={P(0, W / 2, H)[0]} y1={P(0, W / 2, H)[1]} x2={P(L, W / 2, H)[0]} y2={P(L, W / 2, H)[1]} stroke={stroke} strokeWidth={0.7} opacity={0.7} />
      ) : null}
      {lidLine !== null && (
        <polyline points={pts([[0, W, lidLine], [L, W, lidLine], [L, 0, lidLine]])} fill="none" stroke={stroke} strokeWidth={0.8} opacity={0.75} />
      )}
      {artUrl && !openTop && (
        <>
          <clipPath id={clipId}>
            <polygon points={topFace} />
          </clipPath>
          {/* art drawn flat, then sheared onto the top face */}
          <g clipPath={`url(#${clipId})`}>
            <image
              href={artUrl}
              x={-artSize / 2}
              y={-artSize / 2}
              width={artSize}
              height={artSize}
              transform={`translate(${ax} ${ay}) matrix(${COS} 0.5 ${-COS} 0.5 0 0)`}
            />
          </g>
        </>
      )}
      {topMarks.length > 0 && (
        <>
          <clipPath id={`${clipId}-m`}>
            <polygon points={topFace} />
          </clipPath>
          <g clipPath={`url(#${clipId}-m)`}>{topMarks.map(markSvg)}</g>
        </>
      )}
    </svg>
  );
}
