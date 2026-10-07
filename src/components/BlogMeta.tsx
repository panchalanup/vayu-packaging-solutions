/**
 * Shared blog UI bits: category styling (kraft / ink / green / cyan + lucide icons, replacing the rainbow
 * chips) and en-IN date formatting. Colour is never the only signal: every chip carries an icon and its name.
 */

import { BadgeCheck, Compass, LayoutGrid, Lightbulb, Ruler, type LucideIcon } from 'lucide-react';
import type { BlogCategory } from '@/constants/blogs';
import { cn } from '@/lib/utils';

interface CategoryMeta {
  icon: LucideIcon;
  /** Tailwind classes for a static (non-interactive) chip on a paper or card surface */
  chip: string;
}

export const CATEGORY_META: Record<BlogCategory, CategoryMeta> = {
  All: { icon: LayoutGrid, chip: 'border-foreground/20 text-foreground' },
  'Buying Guide': { icon: Compass, chip: 'border-kraft-400/60 bg-kraft-300/25 text-kraft-700' },
  'Technical Guide': { icon: Ruler, chip: 'border-ink-900/25 bg-ink-900/[0.06] text-ink-900' },
  'Quality Standards': { icon: BadgeCheck, chip: 'border-green-600/35 bg-green-600/10 text-green-700' },
  'Industry Insights': { icon: Lightbulb, chip: 'border-cyan-700/35 bg-cyan-700/10 text-cyan-700' },
};

export function CategoryChip({ category, className }: { category: BlogCategory; className?: string }) {
  const { icon: Icon, chip } = CATEGORY_META[category] ?? CATEGORY_META.All;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', chip, className)}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {category}
    </span>
  );
}

/** "15 Jan 2025" (en-IN). Falls back to the raw string if the date is invalid. */
export function formatBlogDate(date: string, long = false): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric' });
}
