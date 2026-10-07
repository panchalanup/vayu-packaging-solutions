/**
 * ImageSlot (§10): every marketing image goes through here.
 * Illustrative (AI / stock) images can never carry a caption that implies a real Vayu photo.
 * SECURITY: images are public assets; alt text is plain text, never HTML.
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface ImageSlotData {
  id: string;
  src: string;
  alt: string;
  kind: 'illustrative' | 'photo';
  /** object-position focus, 0..1 */
  focal?: { x: number; y: number };
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
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        {...(priority ? { fetchpriority: 'high' } : {})}
        className={cn('h-full w-full object-cover', imgClassName)}
        style={style}
        data-slot={slot.id}
      />
      {showCaption && <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
