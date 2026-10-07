import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/lib/motion/tokens';

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

/** Counts up once (≤1.2 s). The final value is always in the DOM for screen readers and no-JS. */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [shown, setShown] = useState(value);
  const animate = useRef(false);

  // Reset while still off-screen so the count-up never flashes the final value first
  useEffect(() => {
    if (prefersReducedMotion() || inView) return;
    animate.current = true;
    setShown(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inView || !animate.current) return;
    let frame = 0;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular">
      <span aria-hidden="true">
        {shown.toLocaleString('en-IN')}
        {suffix}
      </span>
      <span className="sr-only">
        {value.toLocaleString('en-IN')}
        {suffix}
      </span>
    </span>
  );
}

export function StatLedger({ stats, className }: { stats: readonly Stat[]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-2 border-t border-foreground/15 lg:grid-cols-4', className)}>
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            'flex flex-col-reverse gap-1 border-b border-foreground/15 py-6 pr-4 lg:border-b-0 lg:py-8',
            i % 2 === 1 && 'border-l pl-4 lg:pl-6',
            i > 0 && 'lg:border-l lg:pl-6'
          )}
        >
          <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          <dd className="font-display text-h2 font-semibold">
            <CountUp value={stat.value} suffix={stat.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
