/**
 * Tools menu (desktop): one panel with two tiers side by side. Categories on the left; hovering, focusing or
 * clicking one swaps the right side in place (items plus a live preview), so there is no flyout to chase and nothing
 * closes under the pointer. Built on Radix NavigationMenu: opens on hover (short intent delay), click and keyboard,
 * closes on Esc, outside click and after choosing a link, and exposes aria-expanded on the trigger.
 * The panel is centred under the navbar (not under the trigger), so it can never run off-screen.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { ArrowUpRight, Box, Calculator, ChevronDown, Sparkles } from 'lucide-react';
import BoxThumbnail from '@/components/BoxDesigner/BoxThumbnail';
import { TOOLS_CATEGORIES, type ToolsCategory, type ToolsCategoryId } from '@/content/toolsMenu';
import { cn } from '@/lib/utils';

const ICONS: Record<ToolsCategoryId, typeof Box> = { designer: Box, calculators: Calculator, finder: Sparkles };

interface ToolsMegaMenuProps {
  /** The current route belongs to the Tools menu */
  active: boolean;
  triggerClass: string;
}

function Preview({ category }: { category: ToolsCategory }) {
  const Icon = ICONS[category.id];
  return (
    <div
      key={category.id}
      aria-hidden="true"
      className="relative hidden h-full min-h-[13rem] flex-col items-center justify-center overflow-hidden rounded-xl bg-paper-100 p-4 animate-in fade-in zoom-in-95 duration-300 lg:flex"
    >
      {category.id === 'designer' ? (
        <>
          <BoxThumbnail style="mailer" dimensions={{ length: 25, width: 18, height: 8 }} colorHex="#C9A87C" className="h-28 w-28 animate-[sc-float_5s_ease-in-out_infinite] drop-shadow-lg" title="" />
          <p className="label-mono mt-3 text-ink-500">Free · no sign-up</p>
        </>
      ) : (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper-50 shadow-paper">
            <Icon className="h-8 w-8 text-green-600" />
          </span>
          <p className="mt-3 text-center text-sm text-ink-500">{category.blurb}</p>
        </>
      )}
    </div>
  );
}

export default function ToolsMegaMenu({ active, triggerClass }: ToolsMegaMenuProps) {
  const [cat, setCat] = useState<ToolsCategoryId>('designer');
  const intent = useRef<number>();
  useEffect(() => () => window.clearTimeout(intent.current), []);

  const current = TOOLS_CATEGORIES.find((c) => c.id === cat) ?? TOOLS_CATEGORIES[0];

  // a pointer passing over a category on its way to the items must not flip the panel: wait a beat
  const hoverCategory = (id: ToolsCategoryId) => (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => setCat(id), 70);
  };

  return (
    <NavigationMenu.Root delayDuration={140} skipDelayDuration={500} aria-label="Tools" className="static">
      <NavigationMenu.List className="m-0 flex list-none p-0">
        <NavigationMenu.Item className="static">
          <NavigationMenu.Trigger
            className={cn(
              triggerClass,
              'group inline-flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'data-[state=open]:after:scale-x-100'
            )}
            aria-label="Tools menu"
          >
            Tools
            <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-quick group-data-[state=open]:rotate-180" />
            {active && <span className="sr-only"> (current section)</span>}
          </NavigationMenu.Trigger>

          <NavigationMenu.Content
            className={cn(
              'absolute left-1/2 top-full z-50 mt-1 w-[min(800px,calc(100vw-32px))] -translate-x-1/2',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-200'
            )}
          >
            <div className="grid gap-2 rounded-2xl border border-ink-900/10 bg-paper-50 p-2 text-ink-900 shadow-[0_24px_60px_-20px_rgb(15_26_20/0.35)] lg:grid-cols-[13rem_minmax(0,1fr)_13rem]">
              {/* tier 1: categories */}
              <ul className="m-0 flex list-none flex-col gap-1 p-1" aria-label="Tool categories">
                {TOOLS_CATEGORIES.map((c) => {
                  const Icon = ICONS[c.id];
                  const on = c.id === cat;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onPointerEnter={hoverCategory(c.id)}
                        onFocus={() => setCat(c.id)}
                        onClick={() => setCat(c.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left outline-none transition-colors duration-quick focus-visible:ring-2 focus-visible:ring-ring',
                          on ? 'bg-paper-200' : 'hover:bg-paper-100'
                        )}
                      >
                        <Icon aria-hidden="true" className={cn('h-5 w-5 shrink-0', on ? 'text-green-700' : 'text-ink-500')} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{c.label}</span>
                        </span>
                        <span aria-hidden="true" className={cn('text-ink-500 transition-transform duration-quick', on && 'translate-x-0.5')}>
                          ›
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* tier 2: the active category, swapped in place */}
              <div key={current.id} className="min-w-0 p-1 animate-in fade-in duration-200">
                <p className="label-mono px-3 pb-2 pt-2 text-ink-500">{current.label}</p>
                <ul className="m-0 grid list-none gap-0.5 p-0">
                  {current.items.map((item) => (
                    <li key={item.path}>
                      <NavigationMenu.Link asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            'group/item flex items-start justify-between gap-3 rounded-lg px-3 py-2 outline-none transition-colors duration-quick hover:bg-paper-100 focus-visible:bg-paper-100 focus-visible:ring-2 focus-visible:ring-ring',
                            item.primary && 'bg-paper-100'
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                            <span className="mt-0.5 block truncate text-xs text-ink-500">{item.hint}</span>
                          </span>
                          <ArrowUpRight
                            aria-hidden="true"
                            className="mt-0.5 h-4 w-4 shrink-0 -translate-x-1 text-green-700 opacity-0 transition-[opacity,transform] duration-quick group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100"
                          />
                        </Link>
                      </NavigationMenu.Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* live preview */}
              <Preview category={current} />
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
