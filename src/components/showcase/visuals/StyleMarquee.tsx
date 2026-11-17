/**
 * Every box style as a moving wall of illustrations: two rows drifting in opposite directions, speeding up and
 * leaning with the page's scroll speed (VelocityMarquee). Pure SVG tiles (BoxThumbnail), transform only, paused off
 * screen, still with reduced motion. A name under each tile; no paragraphs.
 */

import { useMemo } from 'react';
import BoxThumbnail from '@/components/BoxDesigner/BoxThumbnail';
import { STYLES } from '@/lib/boxDesigner/styles';
import { cn } from '@/lib/utils';
import VelocityMarquee from '@/components/fx/VelocityMarquee';

const BOARD = ['#C9A87C', '#F1ECE2', '#33403A', '#23803A', '#D9BB91', '#E4B69C'];

interface StyleMarqueeProps {
  tone?: 'paper' | 'ink';
  className?: string;
}

function Tiles({ list, tone, offset }: { list: typeof STYLES; tone: 'paper' | 'ink'; offset: number }) {
  return (
    <>
      {list.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            'flex w-40 shrink-0 flex-col items-center rounded-2xl border p-4 transition-[transform,border-color] duration-base ease-paper hover:-translate-y-1.5 sm:w-52',
            tone === 'ink' ? 'border-paper-50/10 bg-ink-800 hover:border-green-400/50' : 'border-foreground/10 bg-paper-50 hover:border-green-600/40'
          )}
        >
          <BoxThumbnail style={s.id} dimensions={s.defaultDims} colorHex={BOARD[(i + offset) % BOARD.length]} className="h-24 w-24 sm:h-32 sm:w-32" title="" />
          <span className={cn('label-mono mt-3 text-center', tone === 'ink' ? 'text-paper-muted' : 'text-muted-foreground')}>{s.shortName}</span>
        </div>
      ))}
    </>
  );
}

export default function StyleMarquee({ tone = 'paper', className }: StyleMarqueeProps) {
  const rows = useMemo(() => {
    const half = Math.ceil(STYLES.length / 2);
    return [STYLES.slice(0, half), STYLES.slice(half)];
  }, []);

  // Each row clips sideways, so it gets py-2 of headroom for the hover lift (8px > 6px); -my-2 keeps the outer layout
  return (
    <div className={cn('-my-2', className)}>
      <VelocityMarquee speed={46} fade={tone === 'ink' ? 'ink' : 'paper'} className="py-2">
        <Tiles list={rows[0]} tone={tone} offset={0} />
      </VelocityMarquee>
      <VelocityMarquee speed={38} reverse fade={tone === 'ink' ? 'ink' : 'paper'} className="py-2">
        <Tiles list={rows[1]} tone={tone} offset={3} />
      </VelocityMarquee>
    </div>
  );
}
