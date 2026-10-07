/**
 * Cta: every call to action on the site (§7.6).
 * Internal paths use router <Link> (no full reloads); tel:, mailto: and wa.me use <a>.
 * SECURITY: href must be an internal path or an allow-listed scheme. Never pass user-supplied URLs.
 * Analytics payloads never include personal data.
 */

import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEventTracker } from '@/hooks/useAnalytics';
import { useSectionName } from './Section';
import { WhatsAppIcon } from './Decor';

export type CtaIntent = 'quote' | 'sample' | 'whatsapp' | 'call' | 'email' | 'finder' | 'designer' | 'navigate' | 'download';

const ctaVariants = cva(
  'group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg font-semibold transition-[background-color,color,border-color,transform] duration-quick ease-paper active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border border-foreground/20 bg-transparent text-foreground hover:border-foreground/40 hover:bg-foreground/5',
        whatsapp: 'border border-foreground/20 bg-transparent text-foreground hover:border-foreground/40 hover:bg-foreground/5',
        call: 'border border-foreground/20 bg-transparent text-foreground hover:border-foreground/40 hover:bg-foreground/5',
        link: 'h-auto px-0 text-accent underline-offset-4 link-draw rounded-none',
      },
      size: {
        md: 'min-h-11 px-5 text-sm',
        lg: 'min-h-12 px-6 text-base',
      },
    },
    compoundVariants: [{ variant: 'link', size: ['md', 'lg'], className: 'min-h-0 px-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

const SAFE_EXTERNAL = /^(tel:\+?[0-9]+|mailto:[^\s<>"]+|https:\/\/wa\.me\/[0-9]+(\?text=[^\s<>"]*)?)$/;
const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

export interface CtaProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'id'>,
    VariantProps<typeof ctaVariants> {
  /** Stable analytics id, e.g. "home.hero.quote" */
  id: string;
  intent: CtaIntent;
  href: string;
  /** Extra non-personal analytics fields (e.g. ply, product) */
  meta?: Record<string, string | number>;
  /** Trailing arrow on primary/link CTAs */
  arrow?: boolean;
  children: ReactNode;
}

const ICONS: Partial<Record<CtaIntent, ReactNode>> = {
  whatsapp: <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />,
  call: <Phone className="h-4 w-4" aria-hidden="true" />,
  email: <Mail className="h-4 w-4" aria-hidden="true" />,
};

export const Cta = forwardRef<HTMLAnchorElement, CtaProps>(function Cta(
  { id, intent, href, meta, variant, size, arrow, className, children, onClick, ...rest },
  ref
) {
  const section = useSectionName();
  const { pathname } = useLocation();
  const { trackEvent } = useEventTracker();

  const internal = isInternal(href);
  const safe = internal || SAFE_EXTERNAL.test(href);
  if (!safe && import.meta.env.DEV) console.warn(`[Cta] blocked unsafe href for ${id}`);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const payload = { id, intent, section, page: pathname, ...meta };
    trackEvent('cta_click', payload, { type: 'cta', text: id });
    if (intent === 'whatsapp' || intent === 'call' || intent === 'email') {
      trackEvent(`${intent}_click`, { id, page: pathname });
    }
    onClick?.(event);
  };

  const content = (
    <>
      {variant === 'primary' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-3 w-3 -translate-y-full translate-x-full bg-background/70 transition-transform duration-quick ease-paper [clip-path:polygon(0_0,100%_100%,0_100%)] group-hover:translate-x-0 group-hover:translate-y-0"
        />
      )}
      {ICONS[intent]}
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-quick ease-paper group-hover:translate-x-0.5"
        />
      )}
      {intent === 'whatsapp' && <span className="sr-only"> (opens WhatsApp)</span>}
    </>
  );

  const classes = cn(ctaVariants({ variant, size }), className);

  if (internal) {
    return (
      <Link ref={ref} to={href} className={classes} onClick={handleClick} {...rest}>
        {content}
      </Link>
    );
  }

  const external = href.startsWith('https://');
  return (
    <a
      ref={ref}
      href={safe ? href : undefined}
      className={classes}
      onClick={handleClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {content}
    </a>
  );
});
