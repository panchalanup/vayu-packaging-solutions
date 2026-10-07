/** Desktop floating WhatsApp button and mobile WhatsApp · Call · Get quote bar (§7.4) */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { whatsappHref, pageWhatsAppMessage, telHref } from '@/lib/contactLinks';
import { useEventTracker } from '@/hooks/useAnalytics';
import { DUR, EASE } from '@/lib/motion/tokens';
import { WhatsAppIcon } from './Decor';

const HIDDEN_ON = ['/quote', '/box-designer'];

/** True while an element marked data-hide-fab (e.g. the inline quote form) is on screen */
function useHideZoneVisible(pathname: string) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const zones = document.querySelectorAll<HTMLElement>('[data-hide-fab]');
      let any = false;
      zones.forEach((zone) => {
        const r = zone.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.2) any = true;
      });
      setVisible(any);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);
  return visible;
}

function useScrollFraction(pathname: string) {
  const [fraction, setFraction] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setFraction(max > 0 ? window.scrollY / max : 0);
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
  }, [pathname]);
  return fraction;
}

/** Virtual keyboard heuristic: a text field has focus and the visual viewport shrank */
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    const update = () => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      const shrunk = vv ? vv.height < window.innerHeight * 0.8 : false;
      setOpen(typing && (shrunk || !vv));
    };
    let timer = 0;
    const onFocusOut = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(update, 50);
    };
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', onFocusOut);
    vv?.addEventListener('resize', update);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', onFocusOut);
      vv?.removeEventListener('resize', update);
    };
  }, []);
  return open;
}

export function useMobileBarVisible() {
  const { pathname } = useLocation();
  return !HIDDEN_ON.includes(pathname);
}

export function WhatsAppFab() {
  const { pathname } = useLocation();
  const { trackEvent } = useEventTracker();
  const fraction = useScrollFraction(pathname);
  const inZone = useHideZoneVisible(pathname);
  const show = !HIDDEN_ON.includes(pathname) && !inZone && (pathname !== '/' || fraction > 0.3);

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          key="fab"
          href={whatsappHref(pageWhatsAppMessage(pathname))}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Vayu on WhatsApp (opens WhatsApp)"
          title="Chat on WhatsApp"
          onClick={() => trackEvent('whatsapp_click', { id: 'global.fab.whatsapp', page: pathname })}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: DUR.quick * 0.7, ease: EASE.exit } }}
          transition={{ duration: DUR.quick, ease: EASE.paper }}
          className="shadow-paper fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2 md:flex"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}

export function MobileActionBar() {
  const { pathname } = useLocation();
  const { trackEvent } = useEventTracker();
  const keyboardOpen = useKeyboardOpen();
  const inZone = useHideZoneVisible(pathname);
  if (HIDDEN_ON.includes(pathname)) return null;
  const hidden = keyboardOpen || inZone;

  const item = 'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold';
  return (
    <motion.nav
      aria-label="Quick contact"
      initial={{ y: '100%' }}
      animate={{ y: hidden ? '100%' : 0 }}
      transition={{ duration: DUR.base, ease: EASE.paper }}
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-paper-50/95 backdrop-blur md:hidden"
      aria-hidden={hidden}
    >
      <div className="flex gap-2 px-3 py-2">
        <a
          href={whatsappHref(pageWhatsAppMessage(pathname))}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={hidden ? -1 : undefined}
          onClick={() => trackEvent('whatsapp_click', { id: 'global.bar.whatsapp', page: pathname })}
          className={`${item} border border-foreground/15 text-ink-900`}
        >
          <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
          WhatsApp<span className="sr-only"> (opens WhatsApp)</span>
        </a>
        <a
          href={telHref}
          tabIndex={hidden ? -1 : undefined}
          onClick={() => trackEvent('call_click', { id: 'global.bar.call', page: pathname })}
          className={`${item} border border-foreground/15 text-ink-900`}
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call
        </a>
        <Link
          to="/quote?src=global.bar.quote"
          tabIndex={hidden ? -1 : undefined}
          onClick={() =>
            trackEvent('cta_click', { id: 'global.bar.quote', intent: 'quote', section: 'mobile-bar', page: pathname })
          }
          className={`${item} flex-[2] bg-green-600 text-white`}
        >
          Get quote
        </Link>
      </div>
    </motion.nav>
  );
}
