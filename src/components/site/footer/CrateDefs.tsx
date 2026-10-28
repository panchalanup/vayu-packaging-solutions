/** Shared SVG defs and the floor for the crate wordmark. Colours mirror the kraft and ink tokens in src/index.css. */

import { FLOOR_H, type PlaygroundLayout } from '@/lib/footerPlayground/layout';

export const CRATE = {
  light: '#E2C79F',
  mid: '#C9A173',
  deep: '#B58A5C',
  side: '#7A5634',
  edge: '#5A3F27',
  tape: '#F2E8CF',
} as const;

/** The visible floor line sits a hair below the physics floor so the board thickness reads as standing on it */
export const FLOOR_VISUAL_OFFSET = 1.5;

export function CrateDefs() {
  return (
    <defs>
      <linearGradient id="fp-flute" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={CRATE.light} />
        <stop offset="0.5" stopColor={CRATE.mid} />
        <stop offset="1" stopColor={CRATE.deep} />
      </linearGradient>
      {/* corrugation: one flute ridge every 5.2 letter units */}
      <pattern id="fp-flutes" width="120" height="5.2" patternUnits="userSpaceOnUse">
        <rect width="120" height="5.2" fill="url(#fp-flute)" />
      </pattern>
      <pattern id="fp-flutes-box" width="120" height="4" patternUnits="userSpaceOnUse">
        <rect width="120" height="4" fill="url(#fp-flute)" />
      </pattern>
      <linearGradient id="fp-sheen" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="35" y2="100">
        <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#2a1808" stopOpacity="0.22" />
      </linearGradient>
      <linearGradient id="fp-sheen-box" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#2a1808" stopOpacity="0.22" />
      </linearGradient>
      <linearGradient id="fp-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#17231C" />
        <stop offset="1" stopColor="#0A120D" />
      </linearGradient>
      <radialGradient id="fp-shadow">
        <stop offset="0" stopColor="#000" stopOpacity="0.6" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Zero-size SVG that only hosts the shared defs, for stages that draw letters and boxes as separate elements */
export function DefsHost() {
  return (
    <svg width={0} height={0} aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <CrateDefs />
    </svg>
  );
}

/** Floor band and its top edge */
export function Floor({ layout }: { layout: PlaygroundLayout }) {
  const y = layout.floorY + FLOOR_VISUAL_OFFSET;
  return (
    <g aria-hidden="true" pointerEvents="none">
      <rect x={0} y={y} width={layout.width} height={FLOOR_H + 40} fill="url(#fp-floor)" />
      <line x1={0} x2={layout.width} y1={y} y2={y} stroke="#FBF8F3" strokeOpacity={0.16} strokeWidth={1} />
    </g>
  );
}

export function ShadowEllipse({ shadowRef }: { shadowRef?: (el: SVGEllipseElement | null) => void }) {
  return <ellipse ref={shadowRef} cx={-999} cy={-999} rx={1} ry={1} fill="url(#fp-shadow)" opacity={0} pointerEvents="none" />;
}
