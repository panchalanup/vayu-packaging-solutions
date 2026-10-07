/**
 * Lenis smooth scroll (plan §8.4), kept in sync with GSAP ScrollTrigger so the pinned hero/anatomy timelines stay exact.
 * Only on high-tier, fine-pointer desktops with motion allowed. Off on touch, on /box-designer (OrbitControls owns the wheel),
 * on /admin, and whenever a dialog locks body scroll. Loaded lazily so low-tier devices never download it.
 * SECURITY: no network, no user data.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteTier } from './siteTier';

const EXCLUDED = (path: string) => path.startsWith('/box-designer') || path.startsWith('/admin');

export function SmoothScroll() {
  const { pathname } = useLocation();
  const site = useSiteTier();
  const enabled = site.tier === 'high' && site.desktop && !site.reducedMotion && !EXCLUDED(pathname);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let teardown: (() => void) | undefined;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 1.05, easing: (t: number) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Dialogs/sheets (Radix) set body scroll-lock: stop smoothing while one is open
      const observer = new MutationObserver(() => {
        const locked = document.body.hasAttribute('data-scroll-locked') || document.body.style.overflow === 'hidden';
        if (locked) lenis.stop();
        else lenis.start();
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'data-scroll-locked'] });

      teardown = () => {
        observer.disconnect();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [enabled]);

  return null;
}
