/**
 * 3D Box Designer Page
 * Viewport-first layout. All design data lives in one undoable store (useDesignStore) that the 3D view,
 * side panels, export and share features read from.
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Palette, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import MetaTags from '@/components/SEO/MetaTags';
import { StructuredData } from '@/components/SEO/StructuredData';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import {
  getBoxDesignerSchema,
  getBoxDesignerFAQSchema,
  getBoxDesignerBreadcrumbSchema,
  getBoxDesignerHowToSchema,
} from '@/seo/schema/boxDesigner';
import IconSidebar, { DesignerTab } from '@/components/BoxDesigner/IconSidebar';
import DesignerSidePanel from '@/components/BoxDesigner/DesignerSidePanel';
import MacTopbar from '@/components/BoxDesigner/MacTopbar';
import BottomStatusBar from '@/components/BoxDesigner/BottomStatusBar';
import FloatingCanvasToolbar from '@/components/BoxDesigner/FloatingCanvasToolbar';
import BottomFloatingControls from '@/components/BoxDesigner/BottomFloatingControls';
import MobileInfoBanner from '@/components/BoxDesigner/MobileInfoBanner';
import CanvasErrorBoundary from '@/components/BoxDesigner/CanvasErrorBoundary';
import WebGLFallback from '@/components/BoxDesigner/WebGLFallback';
import { FACE_LABELS } from '@/lib/boxDesigner/constants';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import type { BoxDesign, BoxFace } from '@/types/boxDesigner';
import { isWebGLAvailable } from '@/lib/boxDesigner/webglSupport';
import { getInitialDesignOrigin, useDesignStore } from '@/lib/boxDesigner/designStore';
import { getBoardSpec, getBoardThicknessCm } from '@/lib/boxDesigner/boardSpecs';
import { computeRscLayout, getFaceSizes } from '@/lib/boxDesigner/rig/rscLayout';
import { useIsMobile } from '@/hooks/use-mobile';

// The whole three.js stack loads on demand so it stays out of every other route's bundle
const BoxDesigner3D = lazy(() => import('@/components/BoxDesigner/BoxDesigner3D'));

type ControlMode = 'rotate' | 'pan';

const MOBILE_TABS: { id: DesignerTab; label: string; icon: typeof Pencil }[] = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'customize', label: 'Artwork', icon: Palette },
  { id: 'export', label: 'Quote & share', icon: Share2 },
];

export default function BoxDesigner() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    if (origin === 'shared') toast.success('Shared design loaded', { description: 'Images are not included in share links.' });
    else if (origin === 'restored') toast('Welcome back! Your last design was restored.');
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

  const handleGetQuote = useCallback(() => {
    const { length, width, height } = design.dimensions;
    const params = new URLSearchParams({ l: String(length), w: String(width), h: String(height), ply: design.ply, style: design.template });
    navigate(`/compare-quote?${params.toString()}`, { state: { boxDesign: { ...design, faceImages: [] } } });
  }, [design, navigate]);

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
      onGetQuote={handleGetQuote}
      onFoldReset={() => setFoldPercentage(100)}
      embedded={embedded}
    />
  );

  return (
    <Layout>
      <PageTransition>
        <MetaTags {...PAGE_METADATA.boxDesigner} />
        <StructuredData type="SoftwareApplication" data={getBoxDesignerSchema()} />
        <StructuredData type="FAQPage" data={getBoxDesignerFAQSchema()} />
        <StructuredData type="BreadcrumbList" data={getBoxDesignerBreadcrumbSchema()} />
        <StructuredData type="HowTo" data={getBoxDesignerHowToSchema()} />

        {/* Hero Section - Scrolls away */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-white py-12 md:py-16 border-b border-gray-200 overflow-hidden">
          <div className="free-accent">FREE</div>
          <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="text-2xl" aria-hidden="true">🎨</span>
              Interactive 3D Designer
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Design Your Perfect Box</h1>
            <div className="inline-flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-gray-900">₹0</span>
              <span className="text-sm text-gray-600 border-l-2 border-gray-300 pl-4">No sign-up, no credit card</span>
            </div>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose the size, 3/5/7-ply board and colour, add your logo, see it fold in real 3D and download a print-ready dieline.
            </p>
            <div className="flex items-center justify-center gap-4 md:gap-6 text-sm text-gray-700 flex-wrap">
              {['Real-time 3D', 'Your logo & text', 'Dieline PDF'].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tool */}
        <div
          ref={toolContainerRef}
          className="sticky top-0 w-full grid"
          style={{
            height: '100dvh',
            maxHeight: '100dvh',
            gridTemplateColumns: isMobile ? '1fr' : isLeftPanelCollapsed ? '72px minmax(0, 1fr)' : '72px 340px minmax(0, 1fr)',
            gridTemplateRows: isMobile ? 'auto minmax(0, 1fr) auto' : '56px minmax(0, 1fr) 44px',
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
            <div className="col-span-full">
              <MacTopbar onExport={() => handleTabChange('export')} />
            </div>
          )}

          {!isMobile && (
            <div className="row-start-2">
              <IconSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          )}

          {!isMobile && !isLeftPanelCollapsed && (
            <div className="row-start-2 relative min-h-0">
              {panel(false)}
              <button
                onClick={() => setIsLeftPanelCollapsed(true)}
                className="absolute top-4 -right-3 w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 flex items-center justify-center z-10"
                aria-label="Collapse panel"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          )}

          {!isMobile && isLeftPanelCollapsed && (
            <button
              onClick={() => setIsLeftPanelCollapsed(false)}
              className="absolute left-[72px] top-[72px] w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 flex items-center justify-center z-10"
              aria-label="Expand panel"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </button>
          )}

          {/* Canvas */}
          <div className={isMobile ? 'relative min-w-0 min-h-0' : 'row-start-2 relative p-4 min-w-0 min-h-0'}>
            <div className={`w-full h-full relative ${isMobile ? '' : 'rounded-2xl'} overflow-hidden shadow-xl`}>
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
                    className="px-3 py-1.5 flex items-center gap-2 rounded-lg shadow text-xs font-medium text-white"
                    style={{ background: 'rgba(26, 111, 230, 0.92)' }}
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
                    <WebGLFallback reason="error" dimensions={design.dimensions} onRetry={retry} onGetQuote={handleGetQuote} />
                  )}
                >
                  <Suspense
                    fallback={
                      <div role="status" aria-live="polite" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-sm text-gray-500">
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
                <WebGLFallback reason="unsupported" dimensions={design.dimensions} onGetQuote={handleGetQuote} />
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
            <nav className="grid grid-cols-3 border-t border-gray-200 bg-white" aria-label="Designer sections" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setMobileSheetOpen(true);
                  }}
                  className={`py-2.5 flex flex-col items-center gap-0.5 text-xs ${activeTab === id && mobileSheetOpen ? 'text-primary' : 'text-gray-600'}`}
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
                    className={`flex-1 text-xs py-1.5 rounded-full border ${activeTab === id ? 'bg-primary text-white border-primary' : 'border-gray-200'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 px-4 pt-2">
                <button disabled={!canUndo} onClick={undo} className="text-xs text-primary disabled:text-gray-300">Undo</button>
                <button disabled={!canRedo} onClick={redo} className="text-xs text-primary disabled:text-gray-300">Redo</button>
              </div>
              <div className="overflow-y-auto">{panel(true)}</div>
            </DrawerContent>
          </Drawer>
        )}
      </PageTransition>
    </Layout>
  );
}
