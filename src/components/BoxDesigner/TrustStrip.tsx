/**
 * Trust strip (#17). Every number comes from FACTS (src/content/facts.ts); nothing is invented here.
 */

import { BadgeCheck, Clock, Factory, MessageCircle, Package, Truck } from 'lucide-react';
import { FACTS } from '@/content/facts';
import { cn } from '@/lib/utils';

const ITEMS = [
  { icon: Factory, value: `${FACTS.yearsInBusiness.value}${FACTS.yearsInBusiness.suffix}`, label: FACTS.yearsInBusiness.label },
  { icon: BadgeCheck, value: `${FACTS.clients.value}${FACTS.clients.suffix}`, label: FACTS.clients.label },
  { icon: Package, value: `${FACTS.boxesDelivered.value}${FACTS.boxesDelivered.suffix}`, label: FACTS.boxesDelivered.label },
  { icon: Truck, value: `${FACTS.dispatchHours} hrs*`, label: 'stock dispatch' },
  { icon: MessageCircle, value: FACTS.replySla, label: 'reply time' },
  { icon: Clock, value: `${FACTS.moqBoxes}`, label: 'boxes minimum order' },
];

export default function TrustStrip({ compact = false, className }: { compact?: boolean; className?: string }) {
  const items = compact ? ITEMS.slice(0, 4) : ITEMS;
  return (
    <div className={cn(className)}>
      <ul
        aria-label="About Vayu Packaging"
        className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6')}
      >
        {items.map(({ icon: Icon, value, label }) => (
          <li key={label} className="flex items-center gap-2.5 rounded-lg border border-foreground/10 bg-white/60 px-3 py-2">
            <Icon className="h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-foreground">{value}</span>
              <span className="block truncate text-[11px] leading-tight text-muted-foreground">{label}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        *{FACTS.dispatchFootnote} {FACTS.samplePolicy}. {FACTS.legalName}, {FACTS.addressShort}.
      </p>
    </div>
  );
}
