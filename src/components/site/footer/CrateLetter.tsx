/** One stencil letter drawn in letter units (100 high): board thickness, corrugated face, sheen, optional tape. */

import { memo } from 'react';
import { CRATE } from './CrateDefs';
import { pointsAttr, type StencilLetter } from './stencilLetters';

function Polys({ letter, fill }: { letter: StencilLetter; fill?: string }) {
  return (
    <>
      {letter.polys.map((p, i) => (
        <polygon key={i} points={pointsAttr(p)} fill={fill} />
      ))}
    </>
  );
}

function CrateLetterBase({ letter }: { letter: StencilLetter }) {
  const { width, tape } = letter;
  return (
    <g>
      {/* board thickness */}
      <g transform="translate(1.6 1.8)" fill={CRATE.side} stroke={CRATE.edge} strokeWidth={1.6} strokeLinejoin="round">
        <Polys letter={letter} />
      </g>
      {/* dark outline; the face below covers the inside half, so only the outside of the shape shows */}
      <g fill={CRATE.deep} stroke={CRATE.edge} strokeWidth={1.8} strokeLinejoin="round">
        <Polys letter={letter} />
      </g>
      {/* face: the pattern lives in letter space, so ridges line up across the polygons without a clip layer */}
      <g stroke="none">
        <Polys letter={letter} fill="url(#fp-flutes)" />
        <Polys letter={letter} fill="url(#fp-sheen)" />
      </g>
      {tape && (
        <g transform={`translate(${tape.x} ${tape.y}) rotate(${tape.rot})`}>
          <rect x={-tape.w / 2} y={-tape.h / 2 + 1} width={tape.w} height={tape.h} fill="#000" opacity={0.18} />
          <rect x={-tape.w / 2} y={-tape.h / 2} width={tape.w} height={tape.h} fill={CRATE.tape} opacity={0.9} />
          <rect x={-tape.w / 2} y={-tape.h / 2} width={tape.w} height={1.4} fill="#fff" opacity={0.55} />
          <rect x={-tape.w / 2} y={tape.h / 2 - 1.4} width={tape.w} height={1.4} fill="#8A6440" opacity={0.22} />
        </g>
      )}
    </g>
  );
}

export const CrateLetter = memo(CrateLetterBase);

/** Room around the letter (units) for its outline, board thickness and tape */
export const LETTER_PAD = 4;

interface LayerProps {
  letter: StencilLetter;
  /** px per letter unit */
  k: number;
  layerRef?: (el: SVGSVGElement | null) => void;
  onPointerDown?: (e: React.PointerEvent<SVGGElement>) => void;
}

/**
 * A letter as its own small SVG element, positioned from the top-left of the stage with a CSS transform. The browser
 * rasterises it once and the compositor moves it, so a moving letter never repaints the rest of the footer.
 * Only the painted shape takes pointer input and touch-action: none.
 */
function CrateLetterLayerBase({ letter, k, layerRef, onPointerDown }: LayerProps) {
  const w = letter.width + LETTER_PAD * 2;
  const h = 100 + LETTER_PAD * 2;
  return (
    <svg
      ref={layerRef}
      data-fp-letter={letter.char}
      aria-hidden="true"
      focusable="false"
      width={w * k}
      height={h * k}
      viewBox={`${-LETTER_PAD} ${-LETTER_PAD} ${w} ${h}`}
      className="absolute left-0 top-0 overflow-visible"
      style={{ visibility: 'hidden', transformOrigin: '0 0', willChange: 'transform', pointerEvents: 'none' }}
    >
      <g pointerEvents="auto" style={{ touchAction: 'none', cursor: 'grab' }} onPointerDown={onPointerDown}>
        <CrateLetterBase letter={letter} />
      </g>
    </svg>
  );
}

export const CrateLetterLayer = memo(CrateLetterLayerBase);
