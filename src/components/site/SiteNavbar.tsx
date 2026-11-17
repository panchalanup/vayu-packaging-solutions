/**
 * Navbar (§7.1): sticky, shrinking, theme-aware (paper / ink), hides on scroll-down on mobile.
 * Tools opens on hover, click and keyboard (Radix). The skip link is the first focusable element.
 */

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import { LOGO_IMAGES } from '@/constants/images';
import { CONTACT_INFO } from '@/constants';
import { isToolsPath } from '@/content/toolsMenu';
import { cn } from '@/lib/utils';
import { telHref, whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';
import { DUR, EASE } from '@/lib/motion/tokens';
import { Cta } from '@/components/site/Cta';
import { SectionNameProvider } from '@/components/site/Section';
import ToolsMegaMenu from '@/components/site/ToolsMegaMenu';
import { ToolsMobilePanel, ToolsMobileRow } from '@/components/site/ToolsMobileMenu';
import MenuScrim from '@/components/site/MenuScrim';
import { useScrollLock } from '@/hooks/useScrollLock';
import { GlassPane } from '@/components/fx/GlassPane';

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
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileView, setMobileView] = useState<'main' | 'tools'>('main');
  const theme = useThemeUnderNav(navRef, pathname);
  const ink = theme === 'ink' && !open;

  useEffect(() => setOpen(false), [pathname]);

  // While the mobile menu is open the page behind it does not scroll (the body is pinned in place), and the navbar
  // ignores the scroll events that pinning causes, so it does not resize or hide under the menu.
  const openRef = useRef(false);
  openRef.current = open;
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);
  useEffect(() => {
    if (!open) setMobileView('main');
  }, [open]);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (openRef.current) return;
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

  const toolsActive = isToolsPath(pathname);

  return (
    <SectionNameProvider value="nav">
      <MenuScrim open={open} onClose={() => setOpen(false)} />
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
          open
            ? 'border-b border-ink-900/10 bg-paper-50'
            : condensed
            ? 'border-b border-transparent'
            : 'border-b border-transparent bg-transparent'
        )}
        style={{ height: open ? undefined : 'var(--nav-h)' }}
      >
        <GlassPane tone={ink ? 'ink' : 'paper'} on={condensed && !open} hidden={hidden && !open} edge="bottom" />
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
            <ToolsMegaMenu active={toolsActive} triggerClass={linkClass({ isActive: toolsActive })} />
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
              className="max-h-[calc(100svh-64px)] overflow-y-auto overscroll-contain border-t border-ink-900/10 px-4 pb-6 pt-2 md:hidden"
            >
              {mobileView === 'tools' ? (
                <ToolsMobilePanel onBack={() => setMobileView('main')} />
              ) : (
                <ul className="divide-y divide-ink-900/10">
                  {[{ label: 'Home', path: '/' }, ...LINKS].map((link) => (
                    <li key={link.path}>
                      <NavLink
                        to={link.path}
                        className={({ isActive }) => cn('flex min-h-12 items-center text-lg font-medium', isActive ? 'text-green-700' : 'text-ink-900')}
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                  <li>
                    <ToolsMobileRow onOpen={() => setMobileView('tools')} />
                  </li>
                  <li>
                    <NavLink
                      to="/contact"
                      className={({ isActive }) => cn('flex min-h-12 items-center text-lg font-medium', isActive ? 'text-green-700' : 'text-ink-900')}
                    >
                      Contact
                    </NavLink>
                  </li>
                </ul>
              )}
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
