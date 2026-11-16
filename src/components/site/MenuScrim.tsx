/**
 * The blurred, dimmed page behind the open mobile menu. A fixed layer in a portal on <body> (not inside the navbar:
 * the navbar has a transform, which would make "fixed" mean "relative to the navbar").
 *
 * Smoothness: it mounts only while the menu is open or closing, then a double animation frame later flips one data
 * attribute, so the CSS transition has a real starting state and runs from no blur to full blur (and back) in 300 ms.
 * The blur stays moderate (12 px) because backdrop blur is paid per pixel, and both the standard and the -webkit-
 * property are transitioned for older Safari. Where backdrop-filter is not supported it falls back to a plain darker
 * scrim (see .menu-scrim in index.css). Tapping it closes the menu. z-index sits under the navbar (50) and over the
 * page, the WhatsApp button, the action bar and the consent banner (40), so all of them are blurred too.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const DURATION_MS = 320;

export default function MenuScrim({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setShown(false);
    const timer = window.setTimeout(() => setMounted(false), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;
  return createPortal(
    <div aria-hidden="true" data-shown={shown} onClick={onClose} className="menu-scrim fixed inset-0 z-[45] touch-none md:hidden" />,
    document.body
  );
}
