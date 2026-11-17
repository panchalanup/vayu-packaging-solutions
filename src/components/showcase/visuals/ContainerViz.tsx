/**
 * A shipping container drawn in isometric with representative blocks of your cartons filling it, deepest first, the
 * way it is really loaded. The number of blocks lit is the container's computed fill (the CBM tool's estimate), so a
 * 40 ft container visibly holds twice as much as a 20 ft one. Blocks drop in one after another (a keyed CSS animation,
 * transform and opacity only); the container outline is see-through and drawn over them.
 */

import { useMemo } from 'react';
import type { LoadingView } from '../cinema/sceneLogic';
import { filledCells } from '../cinema/sceneLogic';
import { fitScale, isoBounds, prismFaces } from '@/components/fx/iso';

const W = 640;
const H = 380;
const GAP = 0.07; // share of a block left empty around it, so blocks read as separate

export default function ContainerViz({ view, label }: { view: LoadingView; label: string }) {
  const { internalCm: dims } = view.container;
  const geometry = useMemo(() => {
    const { length: L, width: Wd, height: Ht } = dims;
    const b = isoBounds(L, Wd, Ht);
    const s = fitScale(b, W, H, 0.1);
    const ox = W / 2 - ((b.minX + b.maxX) / 2) * s;
    const oy = H / 2 - ((b.minY + b.maxY) / 2) * s + 4;
    const { nx, ny, nz } = view.grid;
    const cx = L / nx;
    const cy = Wd / ny;
    const cz = Ht / nz;
    const cells = filledCells(view.grid, view.filledCubes).map((c, i) => ({
      i,
      faces: prismFaces(cx * (1 - GAP), cy * (1 - GAP), cz * (1 - GAP), s, ox, oy, c.x * cx + (cx * GAP) / 2, c.y * cy + (cy * GAP) / 2, c.z * cz + (cz * GAP) / 2),
    }));
    return { shell: prismFaces(L, Wd, Ht, s, ox, oy), cells };
  }, [dims, view.grid, view.filledCubes]);

  return (
    <svg key={view.container.id} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full overflow-visible">
      <g>
        {geometry.cells.map((c) => (
          <g key={c.i} className="cu-cube" style={{ ['--d' as string]: `${Math.min(c.i, 140) * 9}ms` }}>
            <polygon points={c.faces.left} fill="#B98F5C" />
            <polygon points={c.faces.right} fill="#C9A87C" />
            <polygon points={c.faces.top} fill="#E2C79B" />
          </g>
        ))}
      </g>
      {/* the container: see-through walls over the cargo */}
      <polygon points={geometry.shell.left} fill="#A9B4AC" fillOpacity="0.07" stroke="#A9B4AC" strokeOpacity="0.7" strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points={geometry.shell.right} fill="#A9B4AC" fillOpacity="0.1" stroke="#A9B4AC" strokeOpacity="0.7" strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points={geometry.shell.top} fill="#A9B4AC" fillOpacity="0.05" stroke="#A9B4AC" strokeOpacity="0.7" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
