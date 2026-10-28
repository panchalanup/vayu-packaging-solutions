/** Human-readable surface names (no imports, so layouts and dielines can use it without cycles) */

import type { BoxFace } from '@/types/boxDesigner';

export const FACE_NAMES: Record<BoxFace, string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left',
  right: 'Right',
  'top-front': 'Top · front flap',
  'top-back': 'Top · back flap',
  'top-left': 'Top · left flap',
  'top-right': 'Top · right flap',
  bottom: 'Bottom',
  lid: 'Lid · top',
  'lid-front': 'Lid · front',
  'lid-back': 'Lid · back',
  'lid-left': 'Lid · left',
  'lid-right': 'Lid · right',
};
