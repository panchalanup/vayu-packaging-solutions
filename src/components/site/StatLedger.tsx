import { cn } from '@/lib/utils';
import { RollingNumber } from '@/components/fx/RollingNumber';

interface Stat {
  value: number;
  suffix?: string;
  label: string;
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
            <RollingNumber value={stat.value} suffix={stat.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
