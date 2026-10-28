/** Still crate wordmark: reduced motion, low tier, Save-Data, or while the physics cannot load. Hover lifts a letter. */

import { LETTERS } from './stencilLetters';
import { CrateDefs, Floor } from './CrateDefs';
import { CrateLetter } from './CrateLetter';
import type { PlaygroundLayout } from '@/lib/footerPlayground/layout';

export default function StaticWordmark({ layout }: { layout: PlaygroundLayout }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${layout.width} ${layout.stageH}`}
      width={layout.width}
      height={layout.stageH}
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
    >
      <CrateDefs />
      <Floor layout={layout} />
      {LETTERS.map((letter, i) => (
        <g key={letter.char} transform={`translate(${layout.homes[i].x} ${layout.homes[i].y}) scale(${layout.k})`}>
          <g className="pointer-events-auto transition-transform duration-base ease-paper motion-safe:hover:-translate-y-1">
            <CrateLetter letter={letter} />
          </g>
        </g>
      ))}
    </svg>
  );
}
