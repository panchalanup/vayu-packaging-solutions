import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  /** Markdown source; used only as a change signal. Headings are read from the rendered article so ids always match. */
  content: string;
  /** CSS selector of the rendered article(s) */
  articleSelector?: string;
  className?: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'section';

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * Article navigation (§9.7).
 * - Desktop: sticky list with the active section highlighted (lg+).
 * - Mobile: a collapsible "On this page" disclosure (a real <button> with aria-expanded: works by tap and keyboard,
 *   no hover-only behaviour).
 * Headings are discovered in the DOM after render, so the ids can never drift from the markdown output.
 * SECURITY: ids are generated from heading text with a strict [a-z0-9-] slug; text is rendered as text.
 */
const TableOfContents = ({ content, articleSelector = '.medium-article', className }: TableOfContentsProps) => {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [open, setOpen] = useState(false);
  const panelId = 'toc-mobile-panel';
  const itemsRef = useRef<TOCItem[]>([]);

  // Collect headings and give each a unique id
  useEffect(() => {
    const all = Array.from(document.querySelectorAll<HTMLHeadingElement>(`${articleSelector} h2, ${articleSelector} h3`));
    // Every heading gets an id (for deep links), but the list shows sections (h2) only; long guides have 40+ sub-headings.
    // Articles with fewer than 3 sections list their sub-headings too.
    const sections = all.filter((h) => h.tagName === 'H2');
    const headings = sections.length >= 3 ? sections : all;
    // Ids are always regenerated from the text, so re-running this effect gives the same ids
    const used = new Set<string>();
    all.forEach((heading) => {
      const base = slugify(heading.textContent ?? '');
      let id = base;
      let n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      heading.id = id;
      heading.tabIndex = -1; // lets us move focus here after a ToC jump
    });
    const found: TOCItem[] = headings.map((heading) => ({
      id: heading.id,
      text: (heading.textContent ?? '').trim(),
      level: heading.tagName === 'H3' ? 3 : 2,
    }));
    itemsRef.current = found;
    setItems(found);
    setActiveId(found[0]?.id ?? '');
  }, [content, articleSelector]);

  // Active section: the last heading whose top has passed just under the sticky nav
  useEffect(() => {
    if (items.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      // A section counts as current once its heading is in the upper third of the viewport
      const line = Math.max(navH + 32, window.innerHeight * 0.3);
      let current = itemsRef.current[0]?.id ?? '';
      for (const item of itemsRef.current) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  const jumpTo = useCallback((event: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    // html { scroll-padding-top } already offsets the sticky nav
    el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
    setActiveId(id);
    setOpen(false);
  }, []);

  if (items.length < 2) return null;

  const list = (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const current = activeId === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => jumpTo(event, item.id)}
              aria-current={current ? 'location' : undefined}
              className={cn(
                'block rounded-md border-l-2 py-2 pr-2 text-sm leading-snug transition-colors duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                item.level === 3 ? 'pl-6' : 'pl-3',
                current
                  ? 'border-green-600 font-semibold text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={cn('lg:h-full', className)}>
      {/* Mobile and tablet: collapsible disclosure */}
      <div className="rounded-lg border border-border bg-card lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-12 w-full items-center gap-2 px-4 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <List aria-hidden="true" className="h-4 w-4" />
          On this page
          <span className="tabular ml-1 text-xs font-normal text-muted-foreground">{items.length} sections</span>
          <ChevronDown aria-hidden="true" className={cn('ml-auto h-4 w-4 transition-transform duration-quick motion-reduce:transition-none', open && 'rotate-180')} />
        </button>
        {open && (
          <nav id={panelId} aria-label="On this page" className="max-h-[60vh] overflow-y-auto border-t border-border px-2 py-2">
            {list}
          </nav>
        )}
      </div>

      {/* Desktop: sticky with active highlight */}
      <nav
        aria-label="On this page"
        className="sticky top-[calc(var(--nav-h)+24px)] hidden max-h-[calc(100vh-var(--nav-h)-48px)] overflow-y-auto lg:block"
      >
        <p className="label-mono mb-3 flex items-center gap-2 text-muted-foreground">
          <List aria-hidden="true" className="h-3.5 w-3.5" />
          On this page
        </p>
        {list}
      </nav>
    </div>
  );
};

export default TableOfContents;
