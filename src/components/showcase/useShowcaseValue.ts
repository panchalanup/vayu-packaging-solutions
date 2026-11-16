/**
 * The shared state of the showcase pages: the design shaped in the hero (it lives in the stage store) plus the choices
 * made in later scenes (board, quantity). Every scene reads one `boxDesign`, so the size picked in "Size it" changes the
 * strength test, the price, the container load and the recap without any scene knowing about the others.
 */

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { DEFAULT_DESIGN } from '@/lib/boxDesigner/designCodec';
import type { StageDesign, StageStore } from '@/lib/showcase/stage';
import { flutesFor } from './cinema/sceneLogic';
import type { ShowcaseDesign, ShowcaseSpec } from './stageContext';

export function useShowcaseValue(store: StageStore): ShowcaseDesign {
  const design = useSyncExternalStore(store.subscribe, () => store.get().design);
  const [spec, setSpecState] = useState<ShowcaseSpec>({ ply: '5-ply', quantity: 500 });
  const setSpec = useCallback((next: Partial<ShowcaseSpec>) => setSpecState((s) => ({ ...s, ...next })), []);
  const setDesign = useCallback((next: Partial<StageDesign>) => store.setDesign(next), [store]);
  return useMemo(
    () => ({
      design,
      boxDesign: {
        ...DEFAULT_DESIGN,
        template: design.template,
        dimensions: design.dims,
        colorHex: design.colorHex,
        ply: spec.ply,
        flutes: flutesFor(spec.ply),
        quantity: spec.quantity,
      },
      setDesign,
      spec,
      setSpec,
    }),
    [design, spec, setDesign, setSpec]
  );
}
