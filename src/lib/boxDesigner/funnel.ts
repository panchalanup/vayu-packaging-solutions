/**
 * Designer funnel analytics (#35).
 * PRIVACY: props carry style / ply / step / method / format / face only, never artwork, text or personal data.
 * Other workstreams (templates gallery, guided wizard) call trackDesignerEvent with the same names.
 */

import { useEffect, useRef } from 'react';
import { useEventTracker } from '@/hooks/useAnalytics';
import type { BoxDesign } from '@/types/boxDesigner';

export const DESIGNER_EVENTS = {
  styleChange: 'designer_style_change',
  artworkAdded: 'designer_artwork_added',
  estimateView: 'designer_estimate_view',
  leadOpen: 'designer_lead_open',
  leadSubmit: 'designer_lead_submit',
  export: 'designer_export',
  templateUsed: 'designer_template_used',
  wizardDone: 'designer_wizard_done',
} as const;

export type DesignerEvent = (typeof DESIGNER_EVENTS)[keyof typeof DESIGNER_EVENTS];
type SafeValue = string | number | boolean;

/** Base props every designer event carries */
export const designProps = (design: Pick<BoxDesign, 'template' | 'ply'>) => ({ style: design.template, ply: design.ply });

/** Typed wrapper so callers cannot attach free text by accident (strings are capped and slug-like) */
export function useDesignerTracker() {
  const { trackEvent } = useEventTracker();
  return (name: DesignerEvent, props: Record<string, SafeValue> = {}) => {
    const safe = Object.fromEntries(
      Object.entries(props).map(([k, v]) => [k, typeof v === 'string' ? v.replace(/[^a-z0-9_.-]/gi, '').slice(0, 40) : v])
    );
    trackEvent(name, safe);
  };
}

/** Watches the design for style changes and newly added artwork (one line in the page) */
export function useDesignerFunnel(design: BoxDesign) {
  const track = useDesignerTracker();
  const prev = useRef({ template: design.template, images: design.faceImages.length, texts: design.textElements.length });

  useEffect(() => {
    const p = prev.current;
    if (design.template !== p.template) {
      track(DESIGNER_EVENTS.styleChange, { ...designProps(design), from: p.template });
    }
    if (design.faceImages.length > p.images) {
      track(DESIGNER_EVENTS.artworkAdded, { ...designProps(design), kind: 'image', face: design.faceImages[design.faceImages.length - 1]?.face ?? '' });
    }
    if (design.textElements.length > p.texts) {
      track(DESIGNER_EVENTS.artworkAdded, { ...designProps(design), kind: 'text', face: design.textElements[design.textElements.length - 1]?.face ?? '' });
    }
    prev.current = { template: design.template, images: design.faceImages.length, texts: design.textElements.length };
    // track is recreated each render but stable in behaviour
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.template, design.faceImages, design.textElements]);
}
