/**
 * Embeddable box designer (#37): /embed/box-designer?style=mailer&l=30&w=23&h=6
 * A chrome-free 3D view for other websites (iframe snippet in the Showcase tab). Visitors can change the style,
 * size and colour; "Get a quote" and "Open full designer" open vayu in a new tab.
 * SECURITY: query values are parsed with zod (enum + numeric ranges); nothing is saved on the host page or in
 * the main designer's autosave; links use rel="noopener noreferrer". The /embed/* path is the only one served
 * without X-Frame-Options DENY (vercel.json).
 */

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import MetaTags from '@/components/SEO/MetaTags';
import CanvasErrorBoundary from '@/components/BoxDesigner/CanvasErrorBoundary';
import WebGLFallback from '@/components/BoxDesigner/WebGLFallback';
import UnitDimensionField from '@/components/BoxDesigner/UnitDimensionField';
import type { BoxDesign } from '@/types/boxDesigner';
import { encodeShareHash } from '@/lib/boxDesigner/designCodec';
import { parseEmbedParams } from '@/lib/boxDesigner/embed';
import { BOX_COLOR_OPTIONS, DIMENSION_LIMITS } from '@/lib/boxDesigner/constants';
import { getStyle } from '@/lib/boxDesigner/styles';
import { dimensionsAfterStyleSwitch, optionsAfterStyleSwitch } from '@/lib/boxDesigner/styles/switchStyle';
import { modelledStyles, styleName } from '@/lib/boxDesigner/styleAvailability';
import { isWebGLAvailable } from '@/lib/boxDesigner/webglSupport';
import { quoteHref } from '@/lib/quotePrefill';
import { useEventTracker } from '@/hooks/useAnalytics';
import { COMPANY_INFO } from '@/constants';

const BoxDesigner3D = lazy(() => import('@/components/BoxDesigner/BoxDesigner3D'));

export default function BoxDesignerEmbed() {
  const { trackEvent } = useEventTracker();
  const webgl = useMemo(() => isWebGLAvailable(), []);
  const [design, setDesign] = useState<BoxDesign>(() => parseEmbedParams(window.location.search));
  const [fold, setFold] = useState(100);
  const styles = modelledStyles();

  useEffect(() => {
    trackEvent('designer_embed_open', { style: design.template });
    // once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const origin = window.location.origin;
  const mm = (cm: number) => Math.round(cm * 10);
  const quote = `${origin}${quoteHref({ l: mm(design.dimensions.length), w: mm(design.dimensions.width), h: mm(design.dimensions.height), product: design.ply, src: 'designer.embed' })}`;
  const full = `${origin}/box-designer${encodeShareHash(design)}`;
  const set = (patch: Partial<BoxDesign>) => setDesign((d) => ({ ...d, ...patch }));
  const noop = () => undefined;

  return (
    <div className="flex h-[100dvh] min-h-[420px] flex-col bg-paper-100 text-foreground">
      <MetaTags title="3D Box Designer (embed)" description="Design a corrugated box in 3D." noindex />

      {/* Styles */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-border bg-card px-3 py-2" role="radiogroup" aria-label="Box style">
        {styles.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={design.template === s}
            onClick={() => {
              setDesign((d) => ({
                ...d,
                template: s,
                lidDepth: null,
                dimensions: dimensionsAfterStyleSwitch(d.template, s, d.dimensions),
                options: optionsAfterStyleSwitch(d.template, s, d.options),
              }));
              setFold(100);
            }}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${design.template === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/40'}`}
          >
            {styleName(s)}
          </button>
        ))}
      </div>

      {/* 3D */}
      <div className="relative min-h-0 flex-1">
        {webgl ? (
          <CanvasErrorBoundary fallback={({ reset }) => <WebGLFallback reason="error" dimensions={design.dimensions} onRetry={reset} quoteHref={quote} onQuote={noop} />}>
            <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading 3D…</div>}>
              <BoxDesigner3D
                design={design}
                foldTarget={fold / 100}
                selectedFace={null}
                controlMode="rotate"
                autoRotate
                fitSignal={0}
                onFaceSelect={noop}
                onBackgroundClick={noop}
                onCaptureReady={noop}
              />
            </Suspense>
          </CanvasErrorBoundary>
        ) : (
          <WebGLFallback reason="unsupported" dimensions={design.dimensions} quoteHref={quote} onQuote={noop} />
        )}
        <div className="absolute bottom-3 left-3 flex gap-1 rounded-full bg-card/90 p-1 shadow backdrop-blur">
          {getStyle(design.template).foldStops.map((stop) => (
            <button
              key={stop.label}
              type="button"
              onClick={() => setFold(stop.value)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${fold === stop.value ? 'bg-primary text-primary-foreground' : 'hover:bg-foreground/5'}`}
            >
              {stop.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size, colour, CTAs */}
      <div className="space-y-2 border-t border-border bg-card px-3 py-2.5">
        <div className="grid grid-cols-3 gap-2">
          <UnitDimensionField label="Length (cm)" value={design.dimensions.length} unit="cm" min={DIMENSION_LIMITS.min} max={DIMENSION_LIMITS.max} onCommit={(v) => set({ dimensions: { ...design.dimensions, length: v } })} />
          <UnitDimensionField label="Width (cm)" value={design.dimensions.width} unit="cm" min={DIMENSION_LIMITS.min} max={DIMENSION_LIMITS.max} onCommit={(v) => set({ dimensions: { ...design.dimensions, width: v } })} />
          <UnitDimensionField label="Height (cm)" value={design.dimensions.height} unit="cm" min={DIMENSION_LIMITS.min} max={DIMENSION_LIMITS.max} onCommit={(v) => set({ dimensions: { ...design.dimensions, height: v } })} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Board colour">
            {BOX_COLOR_OPTIONS.slice(0, 6).map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={design.colorHex === c.color}
                aria-label={c.name}
                title={c.name}
                onClick={() => set({ colorHex: c.color })}
                className={`h-6 w-6 rounded-full border border-black/10 ${design.colorHex === c.color ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href={full} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              Full designer <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            <a
              href={quote}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('designer_request_quote', { style: design.template, ply: design.ply, origin: 'embed' })}
              className="inline-flex min-h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Get a quote
            </a>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          3D box designer by{' '}
          <a href={origin} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {COMPANY_INFO.name}
          </a>
        </p>
      </div>
    </div>
  );
}
