/**
 * Hand-over from the prerendered HTML to the React app.
 *
 * The build (scripts/seo/postbuild.mjs) writes a static content shell, <div id="prerender-shell">, in front of the
 * empty <div id="root">, and hides #root until it is marked data-ready. The shell is what crawlers and slow
 * connections see. Once the app has rendered the real page, dismissPrerender() removes the shell and reveals #root in
 * one step, so there is no flash of both. Pages that load content after mount (blog articles) hold the hand-over with
 * usePrerenderHold() until their content is on screen.
 * On routes that were not prerendered (admin, embed) the shell does not exist and all of this is a no-op.
 */

import { useEffect, useLayoutEffect } from 'react';

let holds = 0;

/** Removes the shell and shows the app. `force` ignores holds (the safety timer in main.tsx uses it). */
export function dismissPrerender(force = false): void {
  if (typeof document === 'undefined') return;
  if (holds > 0 && !force) return;
  document.getElementById('prerender-shell')?.remove();
  document.getElementById('root')?.setAttribute('data-ready', '1');
}

/** While `hold` is true the shell stays up; when it turns false the hand-over happens */
export function usePrerenderHold(hold: boolean): void {
  useLayoutEffect(() => {
    if (!hold) return undefined;
    holds += 1;
    return () => {
      holds -= 1;
    };
  }, [hold]);
  useEffect(() => {
    if (!hold) dismissPrerender();
  }, [hold]);
}
