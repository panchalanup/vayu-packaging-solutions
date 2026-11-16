/**
 * Chapter 10: closing call to action and FAQ. The closing box is the illustrated one (SVG): the page already spent
 * its single WebGL canvas on chapters 1-3, which is disposed once they are far behind, so there is nothing left here
 * that costs GPU time.
 */

import { Link } from 'react-router-dom';
import { Cta } from '@/components/site/Cta';
import BoxThumbnail from '@/components/BoxDesigner/BoxThumbnail';
import { CropMarks } from '@/components/site/Decor';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SHOWCASE_FAQS } from '@/content/designerShowcase';
import { pageWhatsAppMessage, whatsappHref } from '@/lib/contactLinks';
import { useAudience } from '../audienceContext';
import { useShowcaseDesign } from '../stageContext';

export default function ClosingHero() {
  const { audience, pick } = useAudience();
  const { design } = useShowcaseDesign();
  const href = `/box-designer?${new URLSearchParams({ style: design.template, l: String(design.dims.length), w: String(design.dims.width), h: String(design.dims.height) }).toString()}`;

  return (
    <>
      <section id="start" aria-labelledby="start-h" className="paper-grain scroll-mt-24 border-t border-border py-16 lg:py-28">
        <div className="mx-auto grid max-w-content items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="label-mono mb-4 text-muted-foreground">10 — Start</p>
            <h2 id="start-h" className="font-display text-display-l text-balance">
              Your next box starts flat.
            </h2>
            <p className="mt-4 max-w-[48ch] text-body-l text-muted-foreground">
              {pick({
                buyer: 'Free. No sign-up.',
                maker: 'Free for your next customer meeting. Want it on your site? Ask us.',
              })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {audience === 'buyer' ? (
                <>
                  <Cta id="showcase.close.buyer.open" intent="designer" href={href} size="lg" arrow>
                    Design your box, free
                  </Cta>
                  <Cta id="showcase.close.buyer.whatsapp" intent="whatsapp" variant="whatsapp" size="lg" href={whatsappHref(pageWhatsAppMessage('/box-designer', 'a custom box design'))}>
                    WhatsApp us
                  </Cta>
                </>
              ) : (
                <>
                  {/* VERIFY-LATER[SHW-05]: demo capacity; the existing contact path with a WhatsApp fallback */}
                  <Cta id="showcase.close.maker.demo" intent="navigate" href="/contact" size="lg" arrow meta={{ source: 'showcase-maker' }}>
                    Book a 15-min demo
                  </Cta>
                  <Cta
                    id="showcase.close.maker.whatsapp"
                    intent="whatsapp"
                    variant="whatsapp"
                    size="lg"
                    href={whatsappHref('Hi Vayu, I make boxes and I would like a short demo of the 3D Box Designer for my customers.')}
                  >
                    WhatsApp us
                  </Cta>
                  <Cta id="showcase.close.maker.open" intent="designer" variant="secondary" size="lg" href="/box-designer">
                    Try the designer
                  </Cta>
                </>
              )}
            </div>
          </div>
          <div className="group relative mx-auto aspect-[5/4] w-full max-w-md text-ink-900/40">
            <CropMarks />
            <BoxThumbnail style={design.template} dimensions={design.dims} colorHex={design.colorHex} className="h-full w-full drop-shadow-xl" title={`Illustration of your ${design.template} box`} />
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-h" className="scroll-mt-24 border-t border-border py-16 lg:py-24">
        <div className="mx-auto grid max-w-content gap-8 px-4 md:px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-4">
            <h2 id="faq-h" className="font-display text-h2 text-balance">
              Questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              More answers in the <Link to="/blogs/how-to-use-3d-box-designer" className="link-draw text-accent">step-by-step guide</Link>.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible>
              {SHOWCASE_FAQS.map((f, i) => (
                <AccordionItem key={f.question} value={`q${i}`}>
                  <AccordionTrigger className="text-left font-medium">{f.question}</AccordionTrigger>
                  <AccordionContent className="max-w-[62ch] text-muted-foreground">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
}
