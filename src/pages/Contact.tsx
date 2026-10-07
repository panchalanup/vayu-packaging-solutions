/**
 * /contact (§9.5): channel rows with real links, the shared QuoteForm (call back by default), and a static map card.
 * Mobile order: channels, form, map. Desktop: channels + map on the left, form on the right.
 * SECURITY: contact links come only from src/lib/contactLinks.ts (allow-listed schemes); the map link is built from a
 * constant address and URL-encoded; no third-party scripts, iframes or cookies are loaded; analytics carry no personal data.
 */

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight, Clock, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Layout from '@/components/Layout';
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getLocalBusinessSchema, getBreadcrumbSchema, PAGE_BREADCRUMBS } from '@/seo/schema';
import { CONTACT_INFO, SOCIAL_LINKS } from '@/constants';
import { FACTS } from '@/content/facts';
import { mailHref, pageWhatsAppMessage, telHref, whatsappHref } from '@/lib/contactLinks';
import { cn } from '@/lib/utils';
import { reveal } from '@/lib/motion/tokens';
import { useSiteTier } from '@/lib/motion/siteTier';
import { useEventTracker } from '@/hooks/useAnalytics';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { SectionHeader } from '@/components/site/Blocks';
import { WhatsAppIcon } from '@/components/site/Decor';
import QuoteForm from '@/components/quote/QuoteForm';

type FormIntent = 'callback' | 'quote';

const FORM_MODES: { id: FormIntent; label: string; hint: string }[] = [
  { id: 'callback', label: 'Call me back', hint: 'Name and mobile is enough. We call you.' },
  { id: 'quote', label: 'Get a full quote', hint: 'Add size and quantity so we can price it.' },
];

// SECURITY: constant address, encoded once; opens in a new tab with noopener, no embed and no tracking pixels
const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FACTS.addressFull)}`;

interface ChannelRowProps {
  id: string;
  intent: 'whatsapp' | 'call' | 'email';
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
  breakAll?: boolean;
}

function ChannelRow({ id, intent, href, icon, label, value, note, breakAll }: ChannelRowProps) {
  return (
    <li>
      <Cta
        id={id}
        intent={intent}
        variant="link"
        href={href}
        className="group/row !bg-none [&>svg]:hidden [&>span]:min-w-0 [&>span]:flex-1 h-auto min-h-[5.5rem] w-full justify-start gap-4 whitespace-normal border-b border-border py-5 text-left text-foreground transition-colors duration-quick hover:bg-foreground/[0.03]"
      >
        <span className="flex w-full items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-foreground/15 text-foreground"
          >
            {icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="label-mono block text-muted-foreground">{label}</span>
            <span className={cn('block font-display leading-tight', breakAll ? 'break-words text-lg md:text-xl' : 'text-xl md:text-2xl')}>
              {breakAll && value.includes('@') ? (
                <>
                  {value.split('@')[0]}
                  <wbr />@{value.split('@')[1]}
                </>
              ) : (
                value
              )}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">{note}</span>
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-quick ease-paper group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5"
          />
        </span>
      </Cta>
    </li>
  );
}

/** Static map card. No iframe or tile requests: a drawn locator that links out to Google Maps. */
function MapCard() {
  const { pathname } = useLocation();
  const { trackEvent } = useEventTracker();
  const track = (idSuffix: string) =>
    trackEvent('cta_click', { id: `contact.map.${idSuffix}`, intent: 'navigate', section: 'map', page: pathname });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <a
        href={MAPS_HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('open')}
        aria-label={`Open ${FACTS.addressShort} in Google Maps (opens in a new tab)`}
        className="group relative block aspect-[16/10] w-full bg-paper-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* VERIFY-LATER[MAP-01]: abstract locator drawing; swap for a self-hosted static map image of the exact pin once supplied */}
        <svg aria-hidden="true" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-ink-900">
          <defs>
            <pattern id="contact-map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="320" height="200" fill="url(#contact-map-grid)" />
          <path d="M-10 150 C70 130 150 120 330 70" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="14" strokeLinecap="round" />
          <path d="M-10 150 C70 130 150 120 330 70" fill="none" stroke="#FBF8F3" strokeWidth="10" strokeLinecap="round" />
          <path d="M-10 150 C70 130 150 120 330 70" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="6 8" />
          <path d="M120 -10 L150 210" fill="none" stroke="#FBF8F3" strokeWidth="6" />
          <path d="M240 -10 L215 210" fill="none" stroke="#FBF8F3" strokeWidth="5" />
          <rect x="168" y="112" width="30" height="20" rx="2" fill="currentColor" fillOpacity="0.1" />
          <rect x="60" y="40" width="40" height="26" rx="2" fill="currentColor" fillOpacity="0.08" />
          <rect x="250" y="120" width="36" height="28" rx="2" fill="currentColor" fillOpacity="0.08" />
          <g transform="translate(160 98)">
            <circle r="22" fill="#23803A" fillOpacity="0.18" />
            <path d="M0 18 C-12 4 -12 -4 -12 -8 a12 12 0 1 1 24 0 c0 4 0 12 -12 26Z" fill="#23803A" />
            <circle cy="-8" r="4.5" fill="#FBF8F3" />
          </g>
          <text x="196" y="86" fontSize="9" fill="currentColor" fillOpacity="0.55" fontFamily="ui-monospace, monospace" letterSpacing="1">
            SG HIGHWAY
          </text>
        </svg>
        <span className="label-mono absolute left-3 top-3 rounded-md bg-background/90 px-2 py-1 text-ink-900">Map</span>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-ink-900 px-3 py-2 text-sm font-semibold text-paper-50 transition-colors duration-quick group-hover:bg-ink-800">
          Open in Google Maps
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </span>
      </a>
      <div className="flex items-start gap-3 p-4 md:p-5">
        <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{FACTS.legalName}</p>
          <address className="mt-1 not-italic text-muted-foreground">{FACTS.addressFull}</address>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(FACTS.addressFull)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('directions')}
            className="link-draw mt-2 inline-block font-semibold text-accent"
          >
            Get directions
          </a>
        </div>
      </div>
    </div>
  );
}

const Contact = () => {
  const [mode, setMode] = useState<FormIntent>('callback');
  const site = useSiteTier();
  const animate = !site.reducedMotion && site.tier !== 'low';
  const rise = animate ? reveal : {};
  const activeMode = FORM_MODES.find((m) => m.id === mode)!;

  return (
    <Layout>
      <MetaTags {...PAGE_METADATA.contact} />
      <StructuredData type="LocalBusiness" data={getLocalBusinessSchema()} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.contact)} />

      <Section name="contact-hero" className="paper-grain">
        <div className="mx-auto max-w-content px-4 pb-8 pt-12 md:px-6 md:pb-12 md:pt-20 lg:px-10">
          <p className="label-mono mb-4 text-muted-foreground">Contact</p>
          <h1 className="max-w-3xl text-balance font-display text-display-l">Talk to a packaging person.</h1>
          <p className="mt-4 max-w-[60ch] text-body-l text-muted-foreground">
            Pick the channel you like. WhatsApp, call and email reach the same team, and we reply within {FACTS.replySla}.
          </p>
        </div>
      </Section>

      <Section name="contact-body" className="pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="mx-auto grid max-w-content gap-x-12 gap-y-12 px-4 md:px-6 lg:grid-cols-12 lg:px-10">
          {/* 1. Channels (first on mobile) */}
          <motion.div {...rise} className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <h2 className="sr-only">Contact channels</h2>
            <ul className="border-t border-border">
              <ChannelRow
                id="contact.whatsapp"
                intent="whatsapp"
                href={whatsappHref(pageWhatsAppMessage('/contact'))}
                icon={<WhatsAppIcon className="h-6 w-6 text-[#25D366]" />}
                label="WhatsApp · fastest"
                value="Chat now"
                note={`Send size, quantity or a photo. Reply within ${FACTS.replySla}.`}
              />
              <ChannelRow
                id="contact.call"
                intent="call"
                href={telHref}
                icon={<Phone className="h-6 w-6" />}
                label="Call"
                value={CONTACT_INFO.phone}
                note={FACTS.businessHours}
              />
              <ChannelRow
                id="contact.email"
                intent="email"
                href={mailHref}
                icon={<Mail className="h-6 w-6" />}
                label="Email"
                value={CONTACT_INFO.email}
                note="Best for drawings, specs and purchase orders."
                breakAll
              />
            </ul>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="label-mono text-muted-foreground">Hours</dt>
                  <dd className="mt-1 font-semibold">{FACTS.businessHours}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="label-mono text-muted-foreground">Reply time</dt>
                  <dd className="mt-1 font-semibold">Within {FACTS.replySla}</dd>
                </div>
              </div>
            </dl>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Instagram aria-hidden="true" className="h-4 w-4" />
              {/* SECURITY: constant URL from src/constants, external link opens with noopener */}
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="link-draw">
                @vayu_packaging_solutions on Instagram
              </a>
            </p>
          </motion.div>

          {/* 2. Form (second on mobile, right column on desktop) */}
          <motion.div {...rise} className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1" data-hide-fab>
            <SectionHeader
              id="contact-form-heading"
              index="Prefer a form?"
              title="Leave your number, we call you."
              className="mb-6"
            />
            <div role="group" aria-label="What would you like?" className="mb-2 inline-flex rounded-lg border border-border p-1">
              {FORM_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    'min-h-10 rounded-md px-4 text-sm font-semibold transition-colors duration-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    mode === m.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-foreground/5'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
              {activeMode.hint}
            </p>
            {/* key remounts the form with the chosen intent; the session draft keeps what was typed */}
            <QuoteForm
              key={mode}
              idPrefix="contact-form"
              prefill={{ intent: mode, src: 'contact.form' }}
              defaultIntent={mode}
              className="bg-background"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              No obligation · No spam · GST invoice. MOQ {FACTS.moqBoxes} · {FACTS.samplePolicy}.
            </p>
          </motion.div>

          {/* 3. Map (last on mobile, under the channels on desktop) */}
          <motion.div {...rise} className="lg:col-span-5 lg:col-start-1 lg:row-start-2">
            <h2 className="label-mono mb-3 text-muted-foreground">Visit us</h2>
            <MapCard />
          </motion.div>
        </div>
      </Section>
    </Layout>
  );
};

export default Contact;
