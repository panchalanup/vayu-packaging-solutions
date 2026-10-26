/**
 * Rig factory: the right CartonRig for a layout. Imported only by the 3D scene (it pulls in three.js).
 * Reuse a rig while getRigKey(layout) stays the same; it updates in place for any size.
 */

import type { CartonLayout } from '../styles/registry';
import { BoxRig } from './boxRig';
import { DieCutRig } from './dieCutRig';
import type { CartonRig } from './panelRig';
import { TelescopeRig } from './telescopeRig';

export function createCartonRig(layout: CartonLayout): CartonRig {
  switch (layout.kind) {
    case 'rsc':
      return new BoxRig();
    case 'telescope':
      return new TelescopeRig();
    case 'diecut':
      return new DieCutRig(layout);
  }
}

export type { CartonRig } from './panelRig';
