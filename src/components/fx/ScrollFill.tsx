/**
 * A statement whose words fill from faint to full colour as it scrolls through the screen (the Apple "highlight" line).
 * Pure CSS on a scroll timeline (see .scroll-fill in index.css): no JavaScript per frame. Where animation-timeline is
 * not supported, or with reduced motion, the text is just fully filled. One per page.
 */

import { createElement } from 'react';
import { cn } from '@/lib/utils';

interface ScrollFillProps {
  text: string;
  as?: 'p' | 'h2' | 'h3';
  className?: string;
  id?: string;
}

export function ScrollFill({ text, as = 'p', className, id }: ScrollFillProps) {
  const words = text.split(' ');
  return createElement(
    as,
    { id, className: cn('scroll-fill', className) },
    words.map((w, i) => (
      <span key={`${w}-${i}`}>
        <span className="sf-w" style={{ ['--i' as string]: i }}>
          {w}
        </span>
        {i < words.length - 1 ? ' ' : null}
      </span>
    ))
  );
}
