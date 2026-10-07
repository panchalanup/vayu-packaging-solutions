/**
 * Analytics consent banner (plan §16.1 S4). Accept and Decline carry equal visual weight (no dark patterns).
 * SECURITY/PRIVACY: nothing optional is collected until "Accept"; the choice is stored locally and can be withdrawn
 * from the privacy page.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getConsent, setConsent } from '@/lib/consent';

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(getConsent() === null);
  }, []);

  // Never cover the quote form, the designer's canvas, or the admin portal
  if (!open || pathname.startsWith('/admin') || pathname === '/box-designer') return null;

  const choose = (choice: 'granted' | 'denied') => {
    setConsent(choice);
    setOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Analytics preferences"
      className="fixed inset-x-3 bottom-[calc(var(--mobile-bar-h)+env(safe-area-inset-bottom)+12px)] z-40 rounded-xl border border-ink-900/15 bg-paper-50 p-4 shadow-paper md:inset-x-auto md:bottom-6 md:left-6 md:w-[380px]"
    >
      <p className="text-sm text-ink-900">
        We count visits to improve this site. With your OK we also note an approximate city and a device ID, never your name or phone number.{' '}
        <Link to="/privacy" className="text-accent underline underline-offset-4">
          Privacy notice
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => choose('denied')}
          className="min-h-11 rounded-lg border border-ink-900/25 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose('granted')}
          className="min-h-11 rounded-lg border border-ink-900/25 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
