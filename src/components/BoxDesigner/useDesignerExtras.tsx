/**
 * Workstream C wiring for the designer page, kept in one hook so the shared page file only needs a few lines:
 * onboarding, guided wizard, templates gallery, print check, brand kit, my designs, the Showcase tab
 * (scenes, shots, video, spec sheet, 3D model, embed, quality), presentation mode, ?template= / ?wizard= links
 * from the landing pages, and privacy-safe 3D error reporting.
 */

import { ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { BoxDesign, BoxFace } from '@/types/boxDesigner';
import type { DesignerTab } from './IconSidebar';
import type { CanvasStudioProps } from './Canvas3D';
import type { StudioApi } from './StudioStage';
import type { CartonRig } from '@/lib/boxDesigner/rig/panelRig';
import Onboarding from './Onboarding';
import GuidedWizard from './GuidedWizard';
import TemplateGallery from './TemplateGallery';
import QuickStart from './QuickStart';
import PrintCheck from './PrintCheck';
import BrandKit from './BrandKit';
import MyDesigns from './MyDesigns';
import StudioPanel from './StudioPanel';
import PresentationMode from './PresentationMode';
import { DEFAULT_STUDIO, QualityPref, StudioSettings, loadQualityPref, saveQualityPref } from '@/lib/boxDesigner/studio';
import { designFromTemplate, findTemplate, type DesignTemplate } from '@/lib/boxDesigner/templates';
import { wizardStickers } from '@/lib/boxDesigner/wizard';
import { hasStyleModel } from '@/lib/boxDesigner/styleAvailability';
import { designFromPresetParams } from '@/lib/boxDesigner/landingPreset';
import { getStyle } from '@/lib/boxDesigner/styles/registry';
import { DIMENSION_LIMITS } from '@/lib/boxDesigner/constants';
import { loadBrandKit } from '@/lib/boxDesigner/brandKit';
import { removeKey } from '@/lib/boxDesigner/localStore';
import { ONBOARDING_KEY } from '@/lib/boxDesigner/onboarding';
import { DESIGNER_EVENTS, useDesignerTracker } from '@/lib/boxDesigner/funnel';
import { useEventTracker } from '@/hooks/useAnalytics';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface ExtrasInput {
  design: BoxDesign;
  update: Update;
  replace: (design: BoxDesign) => void;
  selectedFace: BoxFace | null;
  setSelectedFace: (face: BoxFace | null) => void;
  autoRotate: boolean;
  setAutoRotate: (value: boolean | ((v: boolean) => boolean)) => void;
  foldPercentage: number;
  setFoldPercentage: (value: number) => void;
  faceSizes: Partial<Record<BoxFace, { widthCm: number; heightCm: number }>>;
  toolContainerRef: RefObject<HTMLElement>;
  setActiveTab: (tab: DesignerTab) => void;
  /** Shown in the page as the first visit (no shared/restored design) */
  firstVisit: boolean;
  webglSupported: boolean;
}

const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
    step(n);
  });

export function useDesignerExtras(input: ExtrasInput) {
  const {
    design,
    update,
    replace,
    selectedFace,
    setSelectedFace,
    autoRotate,
    setAutoRotate,
    foldPercentage,
    setFoldPercentage,
    faceSizes,
    toolContainerRef,
    setActiveTab,
    firstVisit,
    webglSupported,
  } = input;
  const { trackEvent } = useEventTracker();
  const trackFunnel = useDesignerTracker();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [studio, setStudio] = useState<StudioSettings>(() => {
    const kit = loadBrandKit();
    return { ...DEFAULT_STUDIO, brandHex: kit.colours[0] ?? DEFAULT_STUDIO.brandHex };
  });
  const [quality, setQuality] = useState<QualityPref>(() => loadQualityPref());
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<StudioApi | null>(null);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // Landing pages open the designer with ?template=<id> or ?wizard=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const template = findTemplate(params.get('template'));
    if (template && hasStyleModel(template.style)) {
      const next = designFromTemplate(template, { unit: design.unit, quantity: design.quantity });
      // Optional size from a landing-page size link (numbers only, range-checked)
      const num = (key: string) => {
        const v = Number(params.get(key));
        return Number.isFinite(v) && v >= DIMENSION_LIMITS.min && v <= DIMENSION_LIMITS.max ? Math.round(v * 10) / 10 : null;
      };
      const [l, w, h] = [num('l'), num('w'), num('h')];
      if (l && w && h) next.dimensions = { length: l, width: w, height: h };
      replace(next);
      trackFunnel(DESIGNER_EVENTS.templateUsed, { template: template.id, style: template.style, ply: template.ply, source: 'link' });
      toast.success(`${template.name} template loaded`, { description: 'Change anything you like. Ctrl+Z undoes.' });
    }
    // Style landing pages without a template carry a preset (?style=&l=&w=&h=&ply=&fl=&opt=&col=)
    const preset = template ? null : designFromPresetParams(params, design);
    if (preset) {
      replace({ ...preset, name: preset.name || getStyle(preset.template).shortName });
      toast.success(`${getStyle(preset.template).name} loaded`, { description: 'Change anything you like. Ctrl+Z undoes.' });
    }
    if (params.get('wizard') === '1') setWizardOpen(true);
    if (params.has('template') || params.has('wizard') || preset) {
      ['template', 'wizard', 'l', 'w', 'h', 'style', 'ply', 'fl', 'opt', 'col', 'wr'].forEach((key) => params.delete(key));
      const query = params.toString();
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    }
    // once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rigRef = useRef<CartonRig | null>(null);
  const onRigReady = useCallback((rig: CartonRig | null) => {
    rigRef.current = rig;
  }, []);
  const getRig = useCallback(() => rigRef.current, []);

  const handleStudioReady = useCallback((api: StudioApi) => {
    apiRef.current = api;
  }, []);

  const handleDiagnostic = useCallback<NonNullable<CanvasStudioProps['onDiagnostic']>>(
    (kind, tier) => trackEvent('designer_3d_error', { kind, tier }),
    [trackEvent]
  );

  /** Privacy-safe: only the error class name (e.g. "TypeError"), never the message or stack */
  const report3dError = useCallback(
    (error: Error) => trackEvent('designer_3d_error', { kind: 'render_error', name: (error?.name || 'Error').replace(/[^a-z]/gi, '').slice(0, 30) }),
    [trackEvent]
  );

  const changeQuality = useCallback((next: QualityPref) => {
    setQuality(next);
    saveQualityPref(next);
  }, []);

  const cloneKey = useMemo(
    () => JSON.stringify([design.template, design.dimensions, design.ply, design.flutes, design.lidDepth, foldPercentage]),
    [design.template, design.dimensions, design.ply, design.flutes, design.lidDepth, foldPercentage]
  );

  const studioProps: CanvasStudioProps = useMemo(
    () => ({ settings: studio, quality, cloneKey, colorHex: design.colorHex, onReady: handleStudioReady, onDiagnostic: handleDiagnostic, getRig }),
    [studio, quality, cloneKey, design.colorHex, handleStudioReady, handleDiagnostic, getRig]
  );

  const prepareCapture = useCallback(async () => {
    const was = autoRotateRef.current;
    setSelectedFace(null);
    setAutoRotate(false);
    await frames(3);
    return () => setAutoRotate(was);
  }, [setAutoRotate, setSelectedFace]);

  const snapshot = useCallback(async () => {
    const api = apiRef.current;
    if (!api) return null;
    const restore = await prepareCapture();
    try {
      return await api.snapshot({ width: 240, mime: 'image/jpeg', quality: 0.75 });
    } finally {
      restore();
    }
  }, [prepareCapture]);

  // Presentation mode
  const enteredFullscreen = useRef(false);
  const startPresenting = useCallback(async () => {
    setSelectedFace(null);
    setAutoRotate(true);
    setFoldPercentage(100);
    setPresenting(true);
    trackEvent('designer_present', { style: design.template, ply: design.ply });
    try {
      if (!document.fullscreenElement && toolContainerRef.current?.requestFullscreen) {
        await toolContainerRef.current.requestFullscreen();
        enteredFullscreen.current = true;
      }
    } catch {
      /* the fixed full-window layout still works without the Fullscreen API (iPhone) */
    }
  }, [design.template, design.ply, setAutoRotate, setFoldPercentage, setSelectedFace, toolContainerRef, trackEvent]);

  const stopPresenting = useCallback(async () => {
    setPresenting(false);
    if (enteredFullscreen.current && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
    enteredFullscreen.current = false;
  }, []);

  // Leaving browser fullscreen (Esc) also leaves presentation mode
  useEffect(() => {
    if (!presenting) return;
    const onChange = () => {
      if (!document.fullscreenElement && enteredFullscreen.current) {
        enteredFullscreen.current = false;
        setPresenting(false);
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [presenting]);

  const replayTour = useCallback(() => {
    removeKey(ONBOARDING_KEY);
    setTourKey((k) => k + 1);
  }, []);

  const faces = Object.keys(faceSizes) as BoxFace[];
  const selectFace = useCallback(
    (face: BoxFace) => {
      setSelectedFace(face);
      setActiveTab('customize');
    },
    [setSelectedFace, setActiveTab]
  );

  /** Load a template: replace the design (undoable), fold the box up again and say so */
  const applyTemplate = (next: ReturnType<typeof designFromTemplate>, template: DesignTemplate) => {
    replace(next);
    setGalleryOpen(false);
    setFoldPercentage(100);
    setSelectedFace(null);
    toast.success(`${template.name} template loaded`, { description: 'Replace the sample text and cutouts in the Artwork tab. Ctrl+Z undoes.' });
  };

  const slots: Partial<Record<'editTop' | 'customizeTop' | 'customizeBottom' | 'studio' | 'exportBottom', ReactNode>> = {
    editTop: (
      <QuickStart
        onWizard={() => setWizardOpen(true)}
        onTemplates={() => setGalleryOpen(true)}
        style={design.template}
        onTemplate={(template) => {
          trackFunnel(DESIGNER_EVENTS.templateUsed, { template: template.id, style: template.style, ply: template.ply, source: 'quick' });
          applyTemplate(designFromTemplate(template, { unit: design.unit, quantity: design.quantity }), template);
        }}
      />
    ),
    customizeTop: <PrintCheck design={design} faceSizes={faceSizes} onSelectFace={selectFace} />,
    customizeBottom: <BrandKit design={design} update={update} selectedFace={selectedFace} faces={faces} onSelectFace={selectFace} />,
    studio: (
      <StudioPanel
        design={design}
        studio={studio}
        onStudioChange={setStudio}
        quality={quality}
        onQualityChange={changeQuality}
        getApi={() => apiRef.current}
        prepareCapture={prepareCapture}
        onPresent={startPresenting}
        onFold={setFoldPercentage}
      />
    ),
    exportBottom: <MyDesigns design={design} onOpen={replace} snapshot={webglSupported ? snapshot : undefined} />,
  };

  const sheets = (
    <>
      <GuidedWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        current={design}
        onApply={(rec) => {
          // the recommendation also sets the cut-outs and adds a sample cutout; cutouts the user already placed stay
          // wherever the new style still has that surface
          const faces = getStyle(rec.template).faces;
          const kept = design.stickers.filter((s) => faces.includes(s.face));
          update({
            template: rec.template,
            dimensions: rec.dimensions,
            ply: rec.ply,
            flutes: rec.flutes,
            lidDepth: null,
            options: { ...design.options, ...rec.options },
            stickers: design.stickers.length ? kept : wizardStickers(rec),
          });
          setFoldPercentage(100);
          toast.success('Box updated from your answers', { description: 'Press Ctrl+Z to undo.' });
        }}
      />
      <TemplateGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        current={design}
        onApply={applyTemplate}
      />
    </>
  );

  const canvasOverlay = presenting ? (
    <PresentationMode
      design={design}
      fold={foldPercentage}
      onFold={setFoldPercentage}
      autoRotate={autoRotate}
      onToggleRotate={() => setAutoRotate((v) => !v)}
      onReplace={replace}
      onColour={(hex) => update({ colorHex: hex }, 'present-variant')}
      onExit={stopPresenting}
    />
  ) : (
    <Onboarding key={tourKey} enabled={webglSupported && (firstVisit || tourKey > 0)} canvasRef={canvasRef} faceSelected={!!selectedFace} />
  );

  return { studioProps, onRigReady, slots, sheets, canvasOverlay, canvasRef, presenting, startPresenting, stopPresenting, replayTour, report3dError };
}
