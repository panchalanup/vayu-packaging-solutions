/**
 * ImageSlot (§10): every marketing image goes through here.
 * kind:
 *  - 'illustration': original vector artwork made for this site (never captioned as a real facility)
 *  - 'photo-credited': third-party licensed photo; `credit` is required and shown as an on-image badge
 *  - 'photo': a real Vayu photo (caption allowed)
 *  - 'illustrative': legacy AI / stock stand-in (kept only so old data still type-checks)
 * SECURITY: images are public assets; alt text is plain text, never HTML.
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { ImageCreditData } from '@/content/imageCredits';
import { ImageCredit } from './ImageCredit';

export interface ImageSlotData {
  id: string;
  src: string;
  alt: string;
  kind: 'illustration' | 'photo-credited' | 'photo' | 'illustrative';
  /** object-position focus, 0..1 */
  focal?: { x: number; y: number };
  /** Required when kind === 'photo-credited' */
  credit?: ImageCreditData;
  /** Intrinsic size, so the browser can reserve space (prevents layout shift) */
  width?: number;
  height?: number;
}

interface ImageSlotProps {
  slot: ImageSlotData;
  /** CSS aspect-ratio, e.g. "4 / 5" */
  aspect?: string;
  caption?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  sizes?: string;
}

export function ImageSlot({ slot, aspect, caption, priority, className, imgClassName, sizes }: ImageSlotProps) {
  const style: CSSProperties = {
    objectPosition: slot.focal ? `${slot.focal.x * 100}% ${slot.focal.y * 100}%` : undefined,
  };
  const showCaption = caption && slot.kind === 'photo';
  return (
    <figure className={cn('relative overflow-hidden', className)} style={aspect ? { aspectRatio: aspect } : undefined}>
      <img
        src={slot.src}
        alt={slot.alt}
        width={slot.width}
        height={slot.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        {...(priority ? { fetchpriority: 'high' } : {})}
        className={cn('h-full w-full object-cover', imgClassName)}
        style={style}
        data-slot={slot.id}
      />
      {slot.credit && <ImageCredit credit={slot.credit} />}
      {showCaption && <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
