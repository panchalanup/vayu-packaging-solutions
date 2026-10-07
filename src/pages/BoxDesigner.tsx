/**
 * 3D Box Designer Page (§9.9)
 * Viewport-first layout under a slim page header ("← Vayu", design name, always-visible [Quote this design]).
 * All design data lives in one undoable store (useDesignStore) that the 3D view, side panels, export and share
 * features read from.
 * SECURITY: the /quote link is built with quoteHref (allow-listed, numeric values only); analytics events carry
 * the box style, ply and share method only, never artwork, text or personal data.
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pencil, Palette, Share2, ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import SiteFooter from '@/components/site/SiteFooter';
import { Section } from '@/components/site/Section';
import { FactStrip } from '@/components/site/Blocks';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import MetaTags from '@/components/SEO/MetaTags';
import { StructuredData } from '@/components/SEO/StructuredData';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import {
  getBoxDesignerSchema,
  getBoxDesignerFAQSchema,
  getBoxDesignerBreadcrumbSchema,
  getBoxDesignerHowToSchema,
  BOX_DESIGNER_FAQS,
} from '@/seo/schema/boxDesigner';
import IconSidebar, { DesignerTab } from '@/components/BoxDesigner/IconSidebar';
import DesignerSidePanel from '@/components/BoxDesigner/DesignerSidePanel';
import DesignerHeader from '@/components/BoxDesigner/DesignerHeader';
import BottomStatusBar from '@/components/BoxDesigner/BottomStatusBar';
import FloatingCanvasToolbar from '@/components/BoxDesigner/FloatingCanvasToolbar';
import BottomFloatingControls from '@/components/BoxDesigner/BottomFloatingControls';
import MobileInfoBanner from '@/components/BoxDesigner/MobileInfoBanner';
import CanvasErrorBoundary from '@/components/BoxDesigner/CanvasErrorBoundary';
import WebGLFallback from '@/components/BoxDesigner/WebGLFallback';
import { BOX_TEMPLATES, FACE_LABELS } from '@/lib/boxDesigner/constants';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import type { BoxDesign, BoxFace } from '@/types/boxDesigner';
import { isWebGLAvailable } from '@/lib/boxDesigner/webglSupport';
import { getInitialDesignOrigin, useDesignStore } from '@/lib/boxDesigner/designStore';
import { getBoardSpec, getBoardThicknessCm } from '@/lib/boxDesigner/boardSpecs';
import { computeRscLayout, getFaceSizes } from '@/lib/boxDesigner/rig/rscLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEventTracker } from '@/hooks/useAnalytics';
import { quoteHref } from '@/lib/quotePrefill';
import { prefersReducedMotion } from '@/lib/motion/tokens';

// The whole three.js stack loads on demand so it stays out of every other route's bundle
const BoxDesigner3D = lazy(() => import('@/components/BoxDesigner/BoxDesigner3D'));

type ControlMode = 'rotate' | 'pan';

const MOBILE_TABS: { id: DesignerTab; label: string; icon: typeof Pencil }[] = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'customize', label: 'Artwork', icon: Palette },
  { id: 'export', label: 'Quote & share', icon: Share2 },
];

export default function BoxDesigner() {
  const isMobile = useIsMobile();
  const { trackEvent } = useEventTracker();
  const toolContainerRef = useRef<HTMLDivElement | null>(null);
  const webglSupported = useMemo(() => isWebGLAvailable(), []);
  const { design, update, undo, redo, replace, reset, canUndo, canRedo } = useDesignStore();

  // UI state
  const [activeTab, setActiveTab] = useState<DesignerTab>('edit');
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [selectedFace, setSelectedFace] = useState<BoxFace | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [controlMode, setControlMode] = useState<ControlMode>('rotate');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitSignal, setFitSignal] = useState(0);
  // 0 = flat blank, 72 = open top, 100 = sealed (the 3D view animates toward it in its own render loop)
  const [foldPercentage, setFoldPercentage] = useState(100);

  // Clean high-resolution capture is provided by the 3D scene once it has loaded
  const captureRef = useRef<() => Promise<Blob | null>>(async () => null);
  const handleCaptureReady = useCallback((capture: () => Promise<Blob | null>) => {
    captureRef.current = capture;
  }, []);
  const capture = useCallback(() => captureRef.current(), []);

  // Real surface sizes for the artwork editor (same layout as the 3D model)
  const faceSizes = useMemo(() => {
    const board = getBoardSpec(design.ply, design.flutes);
    const layout = computeRscLayout(design.dimensions, getBoardThicknessCm(board, design.dimensions), {
      topFlaps: design.template !== 'hsc',
    });
    return getFaceSizes(layout);
  }, [design.ply, design.flutes, design.dimensions, design.template]);

  // A selected top flap disappears when switching to an open-top (HSC) box
  useEffect(() => {
    if (selectedFace && !faceSizes[selectedFace]) setSelectedFace(null);
  }, [faceSizes, selectedFace]);

  useEffect(() => {
    const origin = getInitialDesignOrigin();
    trackEvent('designer_open', { style: design.template, ply: design.ply, origin });
    if (origin === 'shared') toast.success('Shared design loaded', { description: 'Images are not included in share links.' });
    else if (origin === 'restored') toast('Welcome back! Your last design was restored.');
    // Runs once on mount: the design at open time is what we report
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fullscreen state
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (toolContainerRef.current?.requestFullscreen) await toolContainerRef.current.requestFullscreen();
      else toast.info('Fullscreen is not supported in this browser');
    } catch {
      toast.error('Could not toggle fullscreen');
    }
  }, []);

  // Keyboard shortcuts (ignored while typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], [role="application"]')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (!mod && e.key.toLowerCase() === 'f') {
        setFitSignal((n) => n + 1);
      } else if (!mod && e.code === 'Space' && !target.closest('button')) {
        e.preventDefault();
        setAutoRotate((v) => !v);
      } else if (!mod && e.key.toLowerCase() === 'w') {
        setControlMode((m) => (m === 'rotate' ? 'pan' : 'rotate'));
      } else if (e.key === 'Escape') {
        setSelectedFace(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const handleFaceSelect = useCallback(
    (face: BoxFace | null) => {
      setSelectedFace(face);
      if (face) {
        setActiveTab('customize');
        setIsLeftPanelCollapsed(false);
      }
    },
    []
  );
  const handleBackgroundClick = useCallback(() => setSelectedFace(null), []);

  // The designer works in cm; /quote takes mm. quoteHref drops anything outside the allow-lists and ranges.
  const quoteLink = useMemo(() => {
    const { length, width, height } = design.dimensions;
    const mm = (cm: number) => Math.round(cm * 10);
    return quoteHref({ l: mm(length), w: mm(width), h: mm(height), product: design.ply, src: 'designer.quote' });
  }, [design.dimensions, design.ply]);

  const handleQuote = useCallback(() => {
    trackEvent('designer_request_quote', { style: design.template, ply: design.ply });
  }, [trackEvent, design.template, design.ply]);

  const handleShare = useCallback(
    (method: 'link' | 'whatsapp' | 'email') => {
      trackEvent('designer_share', { style: design.template, ply: design.ply, method });
    },
    [trackEvent, design.template, design.ply]
  );

  const designName = useMemo(() => {
    const { length, width, height } = design.dimensions;
    const style = BOX_TEMPLATES.find((t) => t.id === design.template)?.shortName ?? design.template.toUpperCase();
    return `${style} · ${length} × ${width} × ${height} cm · ${design.ply}`;
  }, [design.dimensions, design.template, design.ply]);

  const scrollToTool = useCallback(() => {
    toolContainerRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const handleImport = useCallback((next: BoxDesign) => replace(next), [replace]);
  const handleReset = useCallback(() => {
    reset();
    setSelectedFace(null);
    setFoldPercentage(100);
    toast.success('New design started', { description: 'Press Ctrl+Z to undo.' });
  }, [reset]);

  const handleTabChange = (tab: DesignerTab) => {
    setActiveTab(tab);
    setIsLeftPanelCollapsed(false);
  };

  const panel = (embedded: boolean) => (
    <DesignerSidePanel
      activeTab={activeTab}
      design={design}
      update={update}
      selectedFace={selectedFace}
      onSelectFace={setSelectedFace}
      faceSizes={faceSizes}
      capture={capture}
      onImport={handleImport}
      onReset={handleReset}
      quoteHref={quoteLink}
      onQuote={handleQuote}
      onShare={handleShare}
      onFoldReset={() => setFoldPercentage(100)}
      embedded={embedded}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <MetaTags {...PAGE_METADATA.boxDesigner} />
      <StructuredData type="SoftwareApplication" data={getBoxDesignerSchema()} />
      {/* FAQPage schema stays because the same questions are visible in the FAQ section below the tool */}
      <StructuredData type="FAQPage" data={getBoxDesignerFAQSchema()} />
      <StructuredData type="BreadcrumbList" data={getBoxDesignerBreadcrumbSchema()} />
      <StructuredData type="HowTo" data={getBoxDesignerHowToSchema()} />

      <a
        href="#designer-tool"
        onClick={(e) => {
          e.preventDefault();
          scrollToTool();
          toolContainerRef.current?.focus({ preventScroll: true });
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to the designer
      </a>

      <DesignerHeader designName={designName} quoteHref={quoteLink} onQuote={handleQuote} onExport={() => handleTabChange('export')} />

      <main id="main" tabIndex={-1} className="outline-none">
        {/* Hero: short, scrolls away */}
        <Section name="designer-hero" className="paper-grain border-b border-border">
          <div className="mx-auto max-w-content px-4 py-10 md:px-6 md:py-14 lg:px-10">
            <p className="label-mono mb-3 text-muted-foreground">3D Box Designer · Free · no sign-up</p>
            <h1 className="max-w-3xl text-balance font-display text-display-l">Design your box in 3D. Take the dieline to print.</h1>
            <p className="mt-4 max-w-[60ch] text-body-l text-muted-foreground">
              Set the size, pick 3, 5 or 7-ply board and colour, add your logo and watch it fold. Then send it to us for a quote.
            </p>
            <FactStrip
              className="mt-6"
              facts={[
                { label: 'Price', value: 'Free' },
                { label: 'Sign-up', value: 'None' },
                { label: 'Output', value: 'Dieline PDF' },
              ]}
            />
            <button
              type="button"
              onClick={scrollToTool}
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg border border-foreground/20 px-5 text-sm font-semibold transition-colors duration-quick hover:border-foreground/40 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start designing
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </Section>

        {/* Tool */}
        <Section name="designer-tool" className="block">
          <div
            id="designer-tool"
            ref={toolContainerRef}
            tabIndex={-1}
            aria-label="3D box designer"
            className="grid w-full scroll-mt-14 outline-none"
            style={{
              height: 'calc(100dvh - 3.5rem)',
              gridTemplateColumns: isMobile ? '1fr' : isLeftPanelCollapsed ? '72px minmax(0, 1fr)' : '72px 340px minmax(0, 1fr)',
              gridTemplateRows: isMobile ? 'auto minmax(0, 1fr) auto' : 'minmax(0, 1fr) 44px',
              background: 'var(--mac-bg)',
              overflow: 'hidden',
            }}
          >
            {isMobile && (
              <div className="col-span-full">
                <MobileInfoBanner />
              </div>
            )}

            {!isMobile && (
              <div className="row-start-1">
                <IconSidebar activeTab={activeTab} onTabChange={handleTabChange} />
              </div>
            )}

            {!isMobile && !isLeftPanelCollapsed && (
              <div className="row-start-1 relative min-h-0">
                {panel(false)}
                <button
                  onClick={() => setIsLeftPanelCollapsed(true)}
                  className="absolute top-4 -right-3 w-6 h-12 bg-card border border-border rounded-r-lg shadow-sm hover:bg-foreground/5 flex items-center justify-center z-10"
                  aria-label="Collapse panel"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}

            {!isMobile && isLeftPanelCollapsed && (
              <button
                onClick={() => setIsLeftPanelCollapsed(false)}
                className="absolute left-[72px] top-4 w-6 h-12 bg-card border border-border rounded-r-lg shadow-sm hover:bg-foreground/5 flex items-center justify-center z-10"
                aria-label="Expand panel"
              >
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}

            {/* Canvas */}
            <div className={isMobile ? 'relative min-w-0 min-h-0' : 'row-start-1 relative p-4 min-w-0 min-h-0'}>
              <div className={`w-full h-full relative ${isMobile ? '' : 'rounded-lg'} overflow-hidden shadow-xl`}>
                {webglSupported && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                    <FloatingCanvasToolbar
                      controlMode={controlMode}
                      autoRotate={autoRotate}
                      isFullscreen={isFullscreen}
                      onControlModeChange={setControlMode}
                      onAutoRotateToggle={() => setAutoRotate((v) => !v)}
                      onFitView={() => setFitSignal((n) => n + 1)}
                      onFullscreenToggle={handleFullscreenToggle}
                    />
                  </div>
                )}

                {selectedFace && (
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                    <button
                      onClick={() => setSelectedFace(null)}
                      className="px-3 py-1.5 flex items-center gap-2 rounded-lg shadow text-xs font-medium text-white bg-cyan-700"
                      aria-label="Clear selected surface"
                    >
                      <span className="w-2 h-2 bg-white rounded-full" />
                      Selected: {FACE_LABELS[selectedFace]} ✕
                    </button>
                  </div>
                )}

                {webglSupported ? (
                  <CanvasErrorBoundary
                    fallback={({ reset: retry }) => (
                      <WebGLFallback reason="error" dimensions={design.dimensions} onRetry={retry} quoteHref={quoteLink} onQuote={handleQuote} />
                    )}
                  >
                    <Suspense
                      fallback={
                        <div role="status" aria-live="polite" className="w-full h-full flex items-center justify-center bg-paper-100 text-sm text-muted-foreground">
                          Loading 3D studio…
                        </div>
                      }
                    >
                      <BoxDesigner3D
                        design={design}
                        foldTarget={foldPercentage / 100}
                        selectedFace={selectedFace}
                        controlMode={controlMode}
                        autoRotate={autoRotate}
                        fitSignal={fitSignal}
                        onFaceSelect={handleFaceSelect}
                        onBackgroundClick={handleBackgroundClick}
                        onCaptureReady={handleCaptureReady}
                      />
                    </Suspense>
                  </CanvasErrorBoundary>
                ) : (
                  <WebGLFallback reason="unsupported" dimensions={design.dimensions} quoteHref={quoteLink} onQuote={handleQuote} />
                )}

                <BottomFloatingControls
                  dimensions={design.dimensions}
                  foldPercentage={foldPercentage}
                  onDimensionsChange={(dimensions) => update({ dimensions }, 'dock-dimensions')}
                  onFoldChange={setFoldPercentage}
                />
              </div>
            </div>

            {/* Mobile: bottom tab bar opening a sheet with the full panels */}
            {isMobile && (
              <nav className="grid grid-cols-3 border-t border-border bg-card" aria-label="Designer sections" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id);
                      setMobileSheetOpen(true);
                    }}
                    className={`py-2.5 flex flex-col items-center gap-0.5 text-xs ${activeTab === id && mobileSheetOpen ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </nav>
            )}

            {!isMobile && (
              <div className="col-span-full">
                <BottomStatusBar
                  dimensions={design.dimensions}
                  ply={design.ply}
                  template={design.template}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </div>
            )}
          </div>
        </Section>

        {isMobile && (
          <Drawer open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <DrawerContent className="max-h-[80dvh]">
              <DrawerTitle className="sr-only">Box designer options</DrawerTitle>
              <DrawerDescription className="sr-only">Edit the box, add artwork, or get a quote and share</DrawerDescription>
              <div className="flex gap-2 px-4 pt-2">
                {MOBILE_TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 text-xs py-1.5 rounded-full border ${activeTab === id ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 px-4 pt-2">
                <button disabled={!canUndo} onClick={undo} className="text-xs text-primary disabled:text-muted-foreground/60">Undo</button>
                <button disabled={!canRedo} onClick={redo} className="text-xs text-primary disabled:text-muted-foreground/60">Redo</button>
              </div>
              <div className="overflow-y-auto">{panel(true)}</div>
            </DrawerContent>
          </Drawer>
        )}

        <Section name="designer-faq" className="section-y" aria-labelledby="designer-faq-heading">
          <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
            <h2 id="designer-faq-heading" className="label-mono text-muted-foreground">
              Questions
            </h2>
            <Accordion type="single" collapsible className="mt-4 grid gap-x-10 md:grid-cols-2">
              {BOX_DESIGNER_FAQS.map((faq, i) => (
                <AccordionItem key={faq.question} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
