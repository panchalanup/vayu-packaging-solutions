import { createContext, useContext } from 'react';
import type { BoxFace, BoxDesign, PlyType } from '@/types/boxDesigner';
import type { Dieline } from '@/lib/boxDesigner/dieline';
import type { Phase, StageDesign, StageStore } from '@/lib/showcase/stage';
import type { SiteTier } from '@/lib/motion/siteTier';

/** What chapters 1-3 share: the stage store plus the design the visitor is shaping in the hero */
export interface StageApi {
  store: StageStore;
  site: SiteTier;
  design: StageDesign;
  boxDesign: BoxDesign;
  dieline: Dieline;
  setDesign: (next: Partial<StageDesign>) => void;
  /** Chapter that currently owns the stage, and the active caption of the unfold */
  phase: Phase;
  beat: number;
  /** Chapter 3 "Flat <-> Folded" slider (0 flat, 1 folded) */
  slider: number;
  setSlider: (value: number) => void;
  highlight: BoxFace | null;
  setHighlight: (face: BoxFace | null) => void;
  /** A live 3D layer is showing (otherwise the illustrated box stands in) */
  has3d: boolean;
  /** Play the flat-to-folded assembly again (hero) */
  replay: () => void;
}

export const StageContext = createContext<StageApi | null>(null);

export function useStage(): StageApi {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error('useStage must be used inside ScrollyShowcase');
  return ctx;
}

/** The design the visitor shaped in the hero, for chapters outside the sticky stage (samples, closing call to action) */
export interface ShowcaseSpec {
  ply: PlyType;
  quantity: number;
}

export interface ShowcaseDesign {
  design: StageDesign;
  /** The design with the chosen board and quantity applied (what the later scenes price, test and send) */
  boxDesign: BoxDesign;
  setDesign: (next: Partial<StageDesign>) => void;
  spec: ShowcaseSpec;
  setSpec: (next: Partial<ShowcaseSpec>) => void;
}

export const ShowcaseDesignContext = createContext<ShowcaseDesign | null>(null);

export function useShowcaseDesign(): ShowcaseDesign {
  const ctx = useContext(ShowcaseDesignContext);
  if (!ctx) throw new Error('useShowcaseDesign must be used inside the showcase page');
  return ctx;
}
