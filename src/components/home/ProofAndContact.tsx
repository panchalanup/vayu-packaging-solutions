/** S8 Proof + S9 "Talk to us" (quote form, contact rows, visible FAQ with FAQPage schema) */

import { motion } from 'framer-motion';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import QuoteForm from '@/components/quote/QuoteForm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StructuredData } from '@/seo';
import { getFAQSchema } from '@/seo/schema';
import { HOME_FAQ, TESTIMONIALS } from '@/content/home';
import { FACTS } from '@/content/facts';
import { CONTACT_INFO } from '@/constants';
import { mailHref, telHref, whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

export function Proof() {
  return (
    <Section name="proof" theme="kraft" aria-labelledby="proof-heading" className="section-y">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <p className="label-mono text-muted-foreground">07 — Proof</p>
        <h2 id="proof-heading" className="mt-4 font-display text-h2">
          What buyers say.
        </h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.name} className="flex flex-col rounded-[14px] bg-paper-50 p-6">
              <svg aria-hidden="true" viewBox="0 0 32 24" className="h-6 w-8 text-green-600">
                <motion.path
                  d="M2 22V12C2 6 5 2 12 2M18 22V12c0-6 3-10 10-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                />
              </svg>
              <blockquote className="mt-4 flex-1 text-body-l">{t.text}</blockquote>
              <div className="mt-6 flex items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-kraft-300 text-sm font-semibold text-ink-900">
                  {initials(t.name)}
                </span>
                <p className="text-sm">
                  <span className="block font-semibold">{t.name}</span>
                  <span className="text-muted-foreground">{t.role}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-[68ch] border-t border-ink-900/15 pt-6 text-sm">
          <span className="label-mono mr-3 text-kraft-700">Recyclable by design</span>
          Corrugated board is paper-based and widely recyclable.
          {/* VERIFY-LATER[FACT-23]: add recycled fibre % or FSC only if verified */}
        </p>
      </div>
    </Section>
  );
}

export function TalkToUs() {
  const row = 'flex min-h-14 items-center justify-between gap-4 border-b border-border py-3';
  return (
    <Section name="contact" theme="ink" id="talk" aria-labelledby="talk-heading" className="section-y">
      <StructuredData type="FAQPage" data={getFAQSchema(HOME_FAQ)} />
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <header className="grid gap-4 lg:grid-cols-12 lg:gap-10">
          <p className="label-mono text-paper-muted lg:col-span-4">08 — Talk to us</p>
          <h2 id="talk-heading" className="font-display text-display-l lg:col-span-8">
            Tell us what you ship.
            <br />
            We&apos;ll spec it and price it.
          </h2>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-7" data-hide-fab>
            <QuoteForm idPrefix="home-quote" prefill={{ src: 'home.contact.form' }} className="bg-ink-900" />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5">
            <ul className="border-t border-border">
              <li>
                <Cta id="home.contact.whatsapp" intent="whatsapp" variant="link" href={whatsappHref(pageWhatsAppMessage('/'))} className={`${row} w-full text-paper-50`}>
                  WhatsApp · Chat now
                </Cta>
              </li>
              <li>
                <Cta id="home.contact.call" intent="call" variant="link" href={telHref} className={`${row} w-full text-paper-50`}>
                  {CONTACT_INFO.phone} · {FACTS.businessHours}
                </Cta>
              </li>
              <li>
                <Cta id="home.contact.email" intent="email" variant="link" href={mailHref} className={`${row} w-full break-all text-paper-50`}>
                  {CONTACT_INFO.email}
                </Cta>
              </li>
            </ul>
            <p className="mt-6 text-sm text-paper-muted">Office: {FACTS.addressShort}</p>
            <p className="mt-2 text-sm text-paper-muted">
              Delivering to Surat, Vadodara, Rajkot &amp; more.{' '}
              <Cta id="home.contact.locations" intent="navigate" variant="link" href="/locations">
                All locations
              </Cta>
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="label-mono text-paper-muted">FAQ</h3>
          <Accordion type="single" collapsible className="mt-4 grid gap-x-10 md:grid-cols-2">
            {HOME_FAQ.map((f, i) => (
              <AccordionItem key={f.question} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base hover:no-underline">{f.question}</AccordionTrigger>
                <AccordionContent className="text-paper-muted">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Section>
  );
}
