/**
 * A small kraft carton with a strip of tape and a sticker from our own cutout library. Like the letters it is its own
 * little SVG element moved by CSS transform (composited, no repaint of the footer while it falls).
 */

import { memo } from 'react';
import { CRATE } from './CrateDefs';

/** Room around the box (px) for its outline and thickness */
export const BOX_PAD = 3;

interface Props {
  w: number;
  h: number;
  sticker?: string;
  boxRef?: (el: SVGSVGElement | null) => void;
  onPointerDown?: (e: React.PointerEvent<SVGGElement>) => void;
}

function MiniBoxBase({ w, h, sticker, boxRef, onPointerDown }: Props) {
  const hw = w / 2;
  const hh = h / 2;
  const label = Math.min(w, h) * 0.56;
  return (
    <svg
      ref={boxRef}
      data-fp-box=""
      aria-hidden="true"
      focusable="false"
      width={w + BOX_PAD * 2}
      height={h + BOX_PAD * 2}
      viewBox={`${-hw - BOX_PAD} ${-hh - BOX_PAD} ${w + BOX_PAD * 2} ${h + BOX_PAD * 2}`}
      className="absolute left-0 top-0 overflow-visible"
      // parked off-screen until the loop writes the first pose, so a new box never flashes at the corner
      style={{ transform: 'translate(-999px, -999px)', transformOrigin: '0 0', willChange: 'transform', pointerEvents: 'none' }}
    >
      <g pointerEvents="auto" style={{ touchAction: 'none', cursor: 'grab' }} onPointerDown={onPointerDown}>
        <rect x={-hw + 1.2} y={-hh + 1.4} width={w} height={h} rx={3} fill={CRATE.side} stroke={CRATE.edge} strokeWidth={1.2} />
        <rect x={-hw} y={-hh} width={w} height={h} rx={3} fill="url(#fp-flutes-box)" stroke={CRATE.edge} strokeWidth={1.2} />
        <rect x={-hw} y={-hh} width={w} height={h} rx={3} fill="url(#fp-sheen-box)" />
        {/* flap seam */}
        <line x1={-hw} x2={hw} y1={-hh + h * 0.2} y2={-hh + h * 0.2} stroke={CRATE.edge} strokeOpacity={0.45} strokeWidth={1} />
        {/* tape over the seam */}
        <rect x={-w * 0.09} y={-hh} width={w * 0.18} height={h * 0.34} fill={CRATE.tape} opacity={0.92} />
        <rect x={-w * 0.09} y={-hh} width={w * 0.18} height={1.2} fill="#fff" opacity={0.5} />
        {sticker && (
          <>
            <circle cx={0} cy={h * 0.12} r={label * 0.62} fill="#FBF8F3" opacity={0.88} />
            <image href={sticker} x={-label / 2} y={h * 0.12 - label / 2} width={label} height={label} preserveAspectRatio="xMidYMid meet" />
          </>
        )}
      </g>
    </svg>
  );
}

export const MiniBox = memo(MiniBoxBase);
