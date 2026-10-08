/**
 * Visible credit for a third-party photo. Attribution is a licence condition for CC BY / CC BY-SA files,
 * so the badge sits on the image itself and links to the original source.
 * SECURITY: external link uses rel="noopener noreferrer"; all text comes from the static registry.
 */

import { cn } from '@/lib/utils';
import type { ImageCreditData } from '@/content/imageCredits';

interface ImageCreditProps {
  credit: ImageCreditData;
  /** 'overlay' sits in a corner of a positioned parent; 'inline' is a caption line under an image */
  variant?: 'overlay' | 'inline';
  /** Render as plain text (use inside another link, since links cannot nest) */
  asText?: boolean;
  className?: string;
}

export function ImageCredit({ credit, variant = 'overlay', asText, className }: ImageCreditProps) {
  const label = `Photo: ${credit.author} · ${credit.license}`;
  const classes = cn(
    variant === 'overlay'
      ? 'absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)] truncate rounded-full bg-ink-950/75 px-2.5 py-1 text-[11px] font-medium leading-none text-paper-50 backdrop-blur-sm'
      : 'text-sm text-muted-foreground',
    !asText && 'hover:bg-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    className,
  );

  if (asText) {
    return (
      <span className={classes} title={`${credit.title} by ${credit.author}, ${credit.license}`}>
        {label}
      </span>
    );
  }
  return (
    <a
      href={credit.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      title={`${credit.title} by ${credit.author}, ${credit.license}. View the original on ${credit.sourceName}.`}
      aria-label={`Image credit: ${credit.author}, ${credit.license}. Opens the original on ${credit.sourceName} in a new tab.`}
    >
      {label}
    </a>
  );
}
