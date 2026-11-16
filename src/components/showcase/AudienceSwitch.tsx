/**
 * "I buy boxes | I make boxes": a radio group (arrow keys move, Enter / Space choose). It never hides content: it
 * only swaps copy and call-to-action wording, with a short cross-fade handled by the chapters.
 */

import { useRef } from 'react';
import { AUDIENCES, type Audience } from '@/content/designerShowcase';
import { cn } from '@/lib/utils';
import { useAudience } from './audienceContext';

interface AudienceSwitchProps {
  className?: string;
  /** Tighter size for floating placement */
  compact?: boolean;
  tone?: 'paper' | 'ink';
}

export default function AudienceSwitch({ className, compact = false, tone = 'paper' }: AudienceSwitchProps) {
  const { audience, setAudience } = useAudience();
  const refs = useRef<Record<Audience, HTMLButtonElement | null>>({ buyer: null, maker: null });

  const move = (from: Audience, dir: 1 | -1) => {
    const i = AUDIENCES.findIndex((a) => a.id === from);
    const next = AUDIENCES[(i + dir + AUDIENCES.length) % AUDIENCES.length].id;
    setAudience(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Who is this page for?"
      className={cn(
        'inline-flex rounded-full border p-0.5 text-sm font-medium shadow-paper',
        tone === 'ink' ? 'border-paper-50/20 bg-ink-800' : 'border-foreground/15 bg-paper-50',
        className
      )}
    >
      {AUDIENCES.map((a) => {
        const active = a.id === audience;
        return (
          <button
            key={a.id}
            ref={(el) => {
              refs.current[a.id] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => setAudience(a.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                move(a.id, 1);
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                move(a.id, -1);
              }
            }}
            className={cn(
              'min-h-9 rounded-full px-4 transition-[background-color,color] duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              compact ? 'px-3 text-xs' : 'sm:px-5',
              active
                ? tone === 'ink'
                  ? 'bg-green-400 text-ink-900'
                  : 'bg-primary text-primary-foreground'
                : tone === 'ink'
                  ? 'text-paper-100/80 hover:text-paper-50'
                  : 'text-ink-500 hover:text-ink-900'
            )}
          >
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
