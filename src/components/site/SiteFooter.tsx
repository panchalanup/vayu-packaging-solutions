/** Mega footer (§6.10), ink-950 */

import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Instagram } from 'lucide-react';
import { CONTACT_INFO, INDUSTRIES, SOCIAL_LINKS } from '@/constants';
import { FACTS } from '@/content/facts';
import { mailHref, telHref, whatsappHref } from '@/lib/contactLinks';
import { useEventTracker } from '@/hooks/useAnalytics';
import { Cta } from './Cta';
import { SectionNameProvider } from './Section';

const PRODUCTS = [
  { label: '3-ply boxes', to: '/products' },
  { label: '5-ply boxes', to: '/products' },
  { label: '7-ply boxes', to: '/products' },
  { label: 'Die-cut boxes', to: '/products' },
  { label: 'Printed boxes', to: '/products' },
  { label: 'Packaging supplies', to: '/products' },
];

const COLOUR_BAR = ['bg-paper-50', 'bg-kraft-400', 'bg-green-500', 'bg-cyan-400', 'bg-ink-800'];

// VERIFY-LATER[ASSET-01]: brochure PDF is ~20 MB; compress to ≤ 3 MB and update the size shown here.
const BROCHURE = { href: '/brochures/Vayu-Packaging-Solutions-Company-Brochure.pdf', size: 'PDF' };

export default function SiteFooter() {
  const { trackEvent } = useEventTracker();
  const year = new Date().getFullYear();
  const head = 'label-mono mb-4 text-paper-muted';
  const link = 'link-draw text-sm text-paper-100/85 hover:text-paper-50';

  return (
    <SectionNameProvider value="footer">
      <footer data-theme="ink" className="relative overflow-hidden bg-ink-950 pb-8 pt-16 text-paper-100 md:pt-24">
        <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-paper-50/10 pb-10 md:flex-row md:items-end">
            <p className="font-display text-display-l text-paper-50">
              Built flat.
              <br />
              Ships strong.
            </p>
            <Cta id="footer.quote" intent="quote" href="/quote?src=footer.quote" size="lg" arrow>
              Get a quote
            </Cta>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-5">
            <nav aria-label="Products">
              <p className={head}>Products</p>
              <ul className="space-y-2.5">
                {PRODUCTS.map((p) => (
                  <li key={p.label}>
                    <Link to={p.to} className={link}>
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Industries">
              <p className={head}>Industries</p>
              <ul className="space-y-2.5">
                {INDUSTRIES.map((name) => (
                  <li key={name}>
                    <Link to="/services" className={link}>
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Tools">
              <p className={head}>Tools</p>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/compare-quote" className={link}>
                    Packaging Finder
                  </Link>
                </li>
                <li>
                  <Link to="/box-designer" className={link}>
                    3D Box Designer
                  </Link>
                </li>
                <li>
                  <a
                    href={BROCHURE.href}
                    download="Vayu-Packaging-Solutions-Brochure.pdf"
                    className={link}
                    onClick={() => {
                      trackEvent('brochure_download', { location: 'footer' });
                      toast.success('Brochure download started');
                    }}
                  >
                    Brochure ({BROCHURE.size})
                  </a>
                </li>
              </ul>
            </nav>
            <nav aria-label="Company">
              <p className={head}>Company</p>
              <ul className="space-y-2.5">
                <li><Link to="/about" className={link}>About</Link></li>
                <li><Link to="/locations" className={link}>Locations</Link></li>
                <li><Link to="/blogs" className={link}>Blog</Link></li>
                <li><Link to="/contact" className={link}>Contact</Link></li>
                <li><Link to="/image-credits" className={link}>Image credits</Link></li>
              </ul>
            </nav>
            <div className="col-span-2 md:col-span-1">
              <p className={head}>Contact</p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className={link}>
                    WhatsApp<span className="sr-only"> (opens WhatsApp)</span>
                  </a>
                </li>
                <li><a href={telHref} className={`${link} tabular`}>{CONTACT_INFO.phone}</a></li>
                <li><a href={mailHref} className={`${link} break-all`}>{CONTACT_INFO.email}</a></li>
                <li className="text-paper-100/85">{FACTS.addressFull}</li>
                <li className="text-paper-muted">{FACTS.businessHours}</li>
                <li>
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-2`}>
                    <Instagram aria-hidden="true" className="h-4 w-4" /> Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-paper-50/10 pt-6 text-xs text-paper-muted md:flex-row md:items-center md:justify-between">
            <p>
              {FACTS.legalName}
              {FACTS.gstin && <> · GSTIN {FACTS.gstin}</>}
              {FACTS.udyam && <> · Udyam {FACTS.udyam}</>}
            </p>
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="flex">
                {COLOUR_BAR.map((c) => (
                  <span key={c} className={`h-3 w-5 ${c}`} />
                ))}
              </span>
              <p>© {year} {FACTS.legalName}. All rights reserved.</p>
            </div>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="pointer-events-none mt-10 select-none text-center font-display text-[22vw] font-semibold leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgb(169_180_172/0.25)]"
        >
          VAYU
        </p>
      </footer>
    </SectionNameProvider>
  );
}
