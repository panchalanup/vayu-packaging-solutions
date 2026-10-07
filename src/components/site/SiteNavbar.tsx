/**
 * Navbar (§7.1): sticky, shrinking, theme-aware (paper / ink), hides on scroll-down on mobile.
 * Tools opens on hover, click and keyboard (Radix). The skip link is the first focusable element.
 */

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, ChevronDown, Menu, Phone, Sparkles, X } from 'lucide-react';
import { LOGO_IMAGES } from '@/constants/images';
import { CONTACT_INFO, TOOLS_MENU } from '@/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { telHref, whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';
import { DUR, EASE } from '@/lib/motion/tokens';
import { Cta } from '@/components/site/Cta';
import { SectionNameProvider } from '@/components/site/Section';

const LINKS = [
  { label: 'Products', path: '/products' },
  { label: 'Industries', path: '/services' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blogs' },
] as const;

type NavTheme = 'paper' | 'ink';

/** Reads data-theme of whatever section sits under the nav bar */
function useThemeUnderNav(navRef: React.RefObject<HTMLElement>, pathname: string): NavTheme {
  const [theme, setTheme] = useState<NavTheme>('paper');
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const nav = navRef.current;
      const y = nav ? nav.getBoundingClientRect().height / 2 : 30;
      const stack = document.elementsFromPoint(window.innerWidth / 2, y);
      const under = stack.find((el) => !nav?.contains(el));
      const themed = under?.closest<HTMLElement>('[data-theme]');
      setTheme(themed?.dataset.theme === 'ink' ? 'ink' : 'paper');
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const initial = window.setTimeout(check, 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.clearTimeout(initial);
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [navRef, pathname]);
  return theme;
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  // Tools menu: opens on hover (mouse only), click and keyboard; a short close delay lets the pointer cross the gap
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsTimer = useRef<number>();
  const hoverCapable = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const openTools = () => {
    window.clearTimeout(toolsTimer.current);
    if (hoverCapable()) setToolsOpen(true);
  };
  const closeTools = () => {
    window.clearTimeout(toolsTimer.current);
    if (hoverCapable()) toolsTimer.current = window.setTimeout(() => setToolsOpen(false), 140);
  };
  useEffect(() => () => window.clearTimeout(toolsTimer.current), []);
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const theme = useThemeUnderNav(navRef, pathname);
  const ink = theme === 'ink' && !open;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setCondensed(y > 24);
      const mobile = window.innerWidth < 768;
      if (mobile && Math.abs(y - last) > 6) setHidden(y > last && y > 120);
      if (!mobile) setHidden(false);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--nav-h', condensed ? '56px' : '72px');
  }, [condensed]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-quick',
      ink ? 'text-paper-100/80 hover:text-paper-50' : 'text-ink-500 hover:text-ink-900',
      isActive && (ink ? 'text-paper-50' : 'text-ink-900'),
      'after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-quick',
      isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
    );

  const toolsActive = TOOLS_MENU.some((tool) => tool.path === pathname);

  return (
    <SectionNameProvider value="nav">
      <a
        href="#main"
        className="fixed left-3 top-3 z-[60] -translate-y-24 rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50 transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        ref={navRef}
        data-nav
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,height] duration-quick ease-paper',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
          condensed || open
            ? cn('border-b backdrop-blur-md', ink ? 'border-paper-50/10 bg-ink-900/85' : 'border-ink-900/10 bg-paper-50/85')
            : 'border-b border-transparent bg-transparent'
        )}
        style={{ height: open ? undefined : 'var(--nav-h)' }}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-full max-w-content items-center justify-between gap-4 px-4 md:px-6 lg:px-10"
          style={{ minHeight: 'var(--nav-h)' }}
        >
          <Link to="/" aria-label="Vayu Packaging Solutions, home" className="flex shrink-0 items-center">
            <img
              src={ink ? LOGO_IMAGES.horizontalLight : LOGO_IMAGES.horizontal}
              alt="Vayu Packaging Solutions"
              width={160}
              height={48}
              className={cn(
                'w-auto object-contain transition-[height] duration-quick ease-paper',
                condensed ? 'h-9' : 'h-10 md:h-12'
              )}
            />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.slice(0, 2).map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            <DropdownMenu modal={false} open={toolsOpen} onOpenChange={setToolsOpen}>
              <DropdownMenuTrigger
                onMouseEnter={openTools}
                onMouseLeave={closeTools}
                // A click on a hover-opened menu would toggle it shut; keep it open instead
                onPointerDown={(e) => {
                  if (toolsOpen && hoverCapable()) e.preventDefault();
                }}
                className={cn(
                  linkClass({ isActive: toolsActive }),
                  'inline-flex items-center gap-1 data-[state=open]:after:scale-x-100'
                )}
              >
                Tools
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-quick [[data-state=open]_&]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} onMouseEnter={openTools} onMouseLeave={closeTools} className="w-72 rounded-lg p-1">
                {TOOLS_MENU.map((tool) => {
                  const Icon = tool.icon === 'Box' ? Box : Sparkles;
                  const label = tool.path === '/compare-quote' ? 'Packaging Finder' : tool.name;
                  return (
                    <DropdownMenuItem key={tool.path} asChild className="cursor-pointer rounded-md p-3 text-ink-900 focus:bg-paper-200 focus:text-ink-900 data-[highlighted]:bg-paper-200 data-[highlighted]:text-ink-900">
                      <Link to={tool.path} className="flex items-start gap-3">
                        <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 text-green-600" />
                        <span>
                          <span className="block font-semibold text-ink-900">{label}</span>
                          <span className="block text-xs text-ink-500">{tool.description}</span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            {LINKS.slice(2).map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={telHref}
              className={cn(
                'hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium xl:inline-flex',
                ink ? 'text-paper-100' : 'text-ink-900'
              )}
            >
              <Phone aria-hidden="true" className="h-4 w-4" />
              <span className="tabular">{CONTACT_INFO.phone}</span>
            </a>
            <Cta id="nav.quote" intent="quote" href="/quote?src=nav.quote" size="md" className="min-h-10 px-4">
              Get a quote
            </Cta>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-lg md:hidden',
                ink ? 'text-paper-50' : 'text-ink-900'
              )}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: DUR.quick * 0.7, ease: EASE.exit } }}
              transition={{ duration: DUR.base, ease: EASE.paper }}
              className="max-h-[calc(100svh-64px)] overflow-y-auto border-t border-ink-900/10 px-4 pb-6 pt-2 md:hidden"
            >
              <ul className="divide-y divide-ink-900/10">
                {[{ label: 'Home', path: '/' }, ...LINKS, ...TOOLS_MENU.map((t) => ({ label: t.path === '/compare-quote' ? 'Packaging Finder' : t.name, path: t.path })), { label: 'Contact', path: '/contact' }].map(
                  (link) => (
                    <li key={link.path}>
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          cn('flex min-h-12 items-center text-lg font-medium', isActive ? 'text-green-700' : 'text-ink-900')
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  )
                )}
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Cta id="nav.mobile.whatsapp" intent="whatsapp" variant="whatsapp" href={whatsappHref(pageWhatsAppMessage(pathname))}>
                  WhatsApp
                </Cta>
                <Cta id="nav.mobile.call" intent="call" variant="call" href={telHref}>
                  Call
                </Cta>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </SectionNameProvider>
  );
}
