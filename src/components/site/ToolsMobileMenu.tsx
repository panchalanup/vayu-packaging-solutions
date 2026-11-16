/**
 * Tools menu (mobile): a drill-down, not a long accordion. The main menu has a "Tools" row; tapping it slides in one
 * Tools screen (back button, a featured 3D Designer card, a two-column grid of calculators, the Finder). One level
 * deep, large tap targets, click only (there is no hover on touch). Same data as the desktop panel.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import BoxThumbnail from '@/components/BoxDesigner/BoxThumbnail';
import { TOOLS_CATEGORIES } from '@/content/toolsMenu';

/** The "Tools" row of the main mobile menu */
export function ToolsMobileRow({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="flex min-h-12 w-full items-center justify-between text-lg font-medium text-ink-900">
      Tools
      <ChevronRight aria-hidden="true" className="h-5 w-5 text-ink-500" />
    </button>
  );
}

export function ToolsMobilePanel({ onBack }: { onBack: () => void }) {
  const designer = TOOLS_CATEGORIES.find((c) => c.id === 'designer')!;
  const calculators = TOOLS_CATEGORIES.find((c) => c.id === 'calculators')!;
  const finder = TOOLS_CATEGORIES.find((c) => c.id === 'finder')!;
  const [open, ...others] = designer.items;
  const allCalculators = calculators.items.find((i) => i.primary);
  const calculatorList = calculators.items.filter((i) => !i.primary);

  return (
    <div className="animate-in fade-in slide-in-from-right-6 duration-200">
      <button type="button" onClick={onBack} className="-ml-2 flex min-h-12 items-center gap-1 rounded-md px-2 text-base font-medium text-ink-500 hover:text-ink-900">
        <ChevronLeft aria-hidden="true" className="h-5 w-5" /> Menu
      </button>
      <h2 className="font-display text-h2 text-ink-900">Tools</h2>

      {/* the designer: the one thing most visitors want */}
      <section aria-label={designer.label} className="mt-4 overflow-hidden rounded-3xl bg-ink-900 p-4 text-paper-50">
        <div className="flex items-center gap-4">
          <div aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-ink-800">
            <BoxThumbnail style="mailer" dimensions={{ length: 25, width: 18, height: 8 }} colorHex="#C9A87C" className="h-16 w-16" title="" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-xl leading-tight">{designer.label}</h3>
            <p className="mt-1 text-sm text-paper-100/80">{designer.blurb}</p>
          </div>
        </div>
        <Link to={open.path} className="mt-4 flex min-h-12 items-center justify-between rounded-xl bg-green-400 px-4 font-semibold text-ink-900">
          {open.label}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <ul className="mt-2 grid list-none grid-cols-3 gap-2 p-0">
          {others.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="flex min-h-14 items-center justify-center rounded-xl border border-paper-50/20 px-1.5 text-center text-[13px] font-medium leading-tight text-paper-50">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={calculators.label} className="mt-6">
        <h3 className="label-mono mb-2 text-ink-500">{calculators.label}</h3>
        <ul className="grid list-none grid-cols-2 gap-2 p-0">
          {calculatorList.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex min-h-14 items-center rounded-xl border border-ink-900/15 bg-white px-3 text-sm font-medium leading-tight text-ink-900 active:bg-paper-100"
              >
                {item.short ?? item.label}
              </Link>
            </li>
          ))}
        </ul>
        {allCalculators && (
          <Link to={allCalculators.path} className="mt-2 flex min-h-12 items-center justify-between rounded-xl px-1 text-sm font-semibold text-green-700">
            {allCalculators.label}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </section>

      <section aria-label={finder.label} className="mt-4 pb-2">
        <Link to={finder.items[0].path} className="flex min-h-16 items-center gap-3 rounded-2xl border border-ink-900/15 bg-paper-100 px-4">
          <Sparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-green-700" />
          <span className="min-w-0">
            <span className="block font-semibold text-ink-900">{finder.label}</span>
            <span className="block text-xs text-ink-500">{finder.items[0].hint}</span>
          </span>
        </Link>
      </section>
    </div>
  );
}
