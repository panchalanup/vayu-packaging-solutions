/**
 * Showcase tab: everything for showing the box to someone else.
 *  - Present mode (chrome-free full screen for meetings)
 *  - Scene (single / stack / pallet / size check) and background (studio, wood, concrete, brand colour)
 *  - Camera angles, product shots (2x / 4x PNG, optional watermark) and turntable / fold video
 *  - Spec sheet / proof PDF, 3D model (GLB, USDZ + AR Quick Look on iPhone/iPad), embed snippet
 *  - 3D quality: auto / high / battery saver
 * Analytics carry style, ply and the chosen option only.
 */

import { useMemo, useState } from 'react';
import {
  Box,
  Camera,
  Check,
  Clapperboard,
  Code2,
  FileText,
  Gauge,
  Image as ImageIcon,
  Layers,
  MonitorPlay,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BoxDesign } from '@/types/boxDesigner';
import type { StudioApi } from './StudioStage';
import {
  ANGLE_PRESETS,
  BACKGROUNDS,
  QualityPref,
  SCENES,
  StudioSettings,
  VIDEO_SECONDS,
  backgroundColours,
  embedSnippet,
} from '@/lib/boxDesigner/studio';
import { loadBrandKit, parseColourInput } from '@/lib/boxDesigner/brandKit';
import { downloadBlob, getDesignFilename } from '@/lib/boxDesigner/shareUtils';
import { buildSpecSheetData, renderSpecSheetPdf } from '@/lib/boxDesigner/specSheet';
import { dielineForDesign } from '@/lib/boxDesigner/styles';
import { useEventTracker } from '@/hooks/useAnalytics';

interface StudioPanelProps {
  design: BoxDesign;
  studio: StudioSettings;
  onStudioChange: (next: StudioSettings) => void;
  quality: QualityPref;
  onQualityChange: (next: QualityPref) => void;
  getApi: () => StudioApi | null;
  /** Clears selection and pauses the turntable; returns a function that restores them */
  prepareCapture: () => Promise<() => void>;
  onPresent: () => void;
  onFold: (percent: number) => void;
}

const isAppleMobile = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

function Chip({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active ? 'border-primary bg-primary/10 text-foreground' : 'border-border hover:border-foreground/40'
      }`}
    >
      {children}
    </button>
  );
}

export default function StudioPanel({
  design,
  studio,
  onStudioChange,
  quality,
  onQualityChange,
  getApi,
  prepareCapture,
  onPresent,
  onFold,
}: StudioPanelProps) {
  const { trackEvent } = useEventTracker();
  const base = { style: design.template, ply: design.ply };
  const brand = useMemo(() => loadBrandKit(), []);
  const [scale, setScale] = useState<2 | 4>(2);
  const [watermark, setWatermark] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoKind, setVideoKind] = useState<'spin' | 'fold'>('spin');
  const [copied, setCopied] = useState(false);
  const canRecord = getApi()?.canRecord() ?? false;
  const brandSwatches = Array.from(new Set([...brand.colours, design.colorHex.toUpperCase(), '#23803A', '#17231C']));

  const withApi = async (label: string, task: (api: StudioApi) => Promise<void>) => {
    const api = getApi();
    if (!api) {
      toast.error('The 3D view is still loading. Try again in a moment.');
      return;
    }
    setBusy(label);
    const restore = await prepareCapture();
    try {
      await task(api);
    } catch (error) {
      console.error(error);
      toast.error(`${label} failed. Please try again.`);
    } finally {
      restore();
      setBusy(null);
      setProgress(0);
    }
  };

  const takeShot = () =>
    withApi('Product shot', async (api) => {
      const mark = watermark ? brand.name.trim() || 'Vayu Packaging' : null;
      const blob = await api.shot({ scale, watermark: mark });
      if (!blob) throw new Error('no image');
      downloadBlob(blob, getDesignFilename(design, `${studio.background}-${scale}x.png`));
      trackEvent('designer_export', { ...base, format: `png${scale}x`, background: studio.background, scene: studio.scene });
      toast.success(`${scale}x product shot downloaded`);
    });

  const recordVideo = () =>
    withApi('Video', async (api) => {
      if (videoKind === 'fold') onFold(100);
      const result = await api.record({
        kind: videoKind,
        seconds: VIDEO_SECONDS[videoKind],
        onFold,
        onProgress: setProgress,
      });
      if (!result) throw new Error('recording unavailable');
      downloadBlob(result.blob, getDesignFilename(design, `${videoKind}.${result.ext}`));
      trackEvent('designer_export', { ...base, format: result.ext, kind: videoKind });
      toast.success(`${videoKind === 'spin' ? '360° spin' : 'Fold'} video downloaded (${result.ext.toUpperCase()})`);
    });

  const specSheet = () =>
    withApi('Spec sheet', async (api) => {
      onFold(100);
      await new Promise((r) => setTimeout(r, 400));
      const views: { label: string; dataUrl: string }[] = [];
      for (const [preset, label] of [
        ['hero', '3/4 view'],
        ['front', 'Front'],
        ['top', 'Top'],
      ] as const) {
        api.view(preset, { instant: true });
        await new Promise((r) => setTimeout(r, 120));
        const url = await api.snapshot({ width: 900, mime: 'image/jpeg', quality: 0.9 });
        if (url) views.push({ label, dataUrl: url });
      }
      api.view('hero');
      let dieline = null;
      try {
        dieline = dielineForDesign(design);
      } catch {
        dieline = null;
      }
      const blob = await renderSpecSheetPdf(buildSpecSheetData(design), { views }, dieline);
      downloadBlob(blob, getDesignFilename(design, 'spec-sheet.pdf'));
      trackEvent('designer_export', { ...base, format: 'spec_pdf' });
      toast.success('Spec sheet downloaded', { description: 'One page with views, specification and an approval block.' });
    });

  const model = (format: 'glb' | 'usdz', ar = false) =>
    withApi('3D model', async (api) => {
      onFold(100);
      await new Promise((r) => setTimeout(r, 300));
      const blob = await api.exportModel(format);
      trackEvent('designer_export', { ...base, format, ar });
      if (ar) {
        // AR Quick Look: an <a rel="ar"> wrapping an <img> opens the model in AR on iPhone/iPad
        // VERIFY-LATER[DSG-64]: test AR Quick Look with a blob: USDZ on current iOS Safari on a real device
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.rel = 'ar';
        a.href = url;
        a.appendChild(document.createElement('img'));
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        downloadBlob(blob, getDesignFilename(design, format));
        toast.success(`3D model (${format.toUpperCase()}) downloaded`, { description: 'Real size, in metres.' });
      }
    });

  const snippet = embedSnippet(window.location.origin, {
    style: design.template,
    l: design.dimensions.length,
    w: design.dimensions.width,
    h: design.dimensions.height,
  });

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      trackEvent('designer_embed_copy', base);
    } catch {
      window.prompt('Copy this code', snippet);
    }
  };

  const sky = backgroundColours(studio).sky;

  return (
    <div className="space-y-4">
      {/* Present */}
      <button
        type="button"
        onClick={onPresent}
        className="group flex w-full items-center gap-3 rounded-xl bg-ink-900 p-4 text-left text-paper-50 shadow-md transition-transform duration-quick hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-400/20 text-green-400">
          <MonitorPlay className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Present to a customer</span>
          <span className="block text-xs text-paper-muted">Clean full screen, slow turntable, big spec. Arrow keys step through.</span>
        </span>
      </button>

      {/* Scene + background */}
      <Card className="space-y-3 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-primary" aria-hidden="true" /> Scene
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={studio.scene === s.id}
              onClick={() => {
                onStudioChange({ ...studio, scene: s.id });
                if (s.id !== 'single') onFold(100);
                trackEvent('designer_scene', { ...base, scene: s.id });
              }}
              className={`rounded-lg border p-2 text-left transition-colors duration-quick ${studio.scene === s.id ? 'border-primary bg-primary/10' : 'border-border hover:border-foreground/40'}`}
            >
              <span className="block text-xs font-semibold">{s.label}</span>
              <span className="block text-[11px] leading-tight text-muted-foreground">{s.hint}</span>
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Background</Label>
          <div className="flex flex-wrap gap-2">
            {BACKGROUNDS.map((b) => {
              const colours = backgroundColours({ background: b.id, brandHex: studio.brandHex });
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={studio.background === b.id}
                  onClick={() => onStudioChange({ ...studio, background: b.id })}
                  className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs transition-colors duration-quick ${studio.background === b.id ? 'border-primary bg-primary/10' : 'border-border hover:border-foreground/40'}`}
                >
                  <span className="h-5 w-5 rounded-full border border-black/10" style={{ background: `linear-gradient(180deg, ${colours.sky} 50%, ${colours.floor} 50%)` }} />
                  {b.label}
                </button>
              );
            })}
          </div>
          {studio.background === 'brand' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {brandSwatches.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Background colour ${c}`}
                  onClick={() => onStudioChange({ ...studio, brandHex: c })}
                  className={`h-7 w-7 rounded-full border border-black/10 ${studio.brandHex.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={studio.brandHex}
                onChange={(e) => {
                  const c = parseColourInput(e.target.value);
                  if (c) onStudioChange({ ...studio, brandHex: c });
                }}
                className="h-7 w-7 cursor-pointer rounded"
                aria-label="Custom background colour"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Angles + product shot */}
      <Card className="space-y-3 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Camera className="h-4 w-4 text-primary" aria-hidden="true" /> Product shot
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {ANGLE_PRESETS.map((a) => (
            <Chip key={a.id} active={false} onClick={() => getApi()?.view(a.id)}>
              {a.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Image size">
            {([2, 4] as const).map((s) => (
              <Chip key={s} active={scale === s} onClick={() => setScale(s)} label={`${s} times screen size`}>
                {s}x
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="shot-watermark" checked={watermark} onCheckedChange={setWatermark} />
            <Label htmlFor="shot-watermark" className="text-xs">
              Watermark
            </Label>
          </div>
        </div>
        <Button className="w-full" onClick={takeShot} disabled={!!busy}>
          <ImageIcon className="mr-2 h-4 w-4" /> {busy === 'Product shot' ? 'Rendering…' : 'Download PNG'}
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Uses the current view and the <span className="inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: sky }} /> background. Drag to frame it first.
        </p>
      </Card>

      <Accordion type="multiple" className="rounded-lg border border-border bg-card px-4">
        <AccordionItem value="video">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Clapperboard className="h-4 w-4 text-primary" aria-hidden="true" /> Video (spin or fold)
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {canRecord ? (
              <>
                <div className="flex gap-1.5">
                  <Chip active={videoKind === 'spin'} onClick={() => setVideoKind('spin')}>
                    360° spin · {VIDEO_SECONDS.spin}s
                  </Chip>
                  <Chip active={videoKind === 'fold'} onClick={() => setVideoKind('fold')}>
                    Fold up · {VIDEO_SECONDS.fold}s
                  </Chip>
                </div>
                {busy === 'Video' ? (
                  <div className="space-y-1">
                    <Progress value={progress * 100} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">Recording… keep this tab open.</p>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={recordVideo} disabled={!!busy}>
                    Record video
                  </Button>
                )}
                <p className="text-[11px] text-muted-foreground">MP4 where your browser supports it, otherwise WebM.</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">This browser cannot record video. Try Chrome, Edge or Safari on a computer.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="proof">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" /> Spec sheet / proof PDF
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <p className="text-xs text-muted-foreground">One A4 page: three views, size in {design.unit}, board, finish, quantity, dieline and a customer approval block.</p>
            <Button variant="outline" className="w-full" onClick={specSheet} disabled={!!busy}>
              {busy === 'Spec sheet' ? 'Preparing…' : 'Download spec sheet'}
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="model">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Box className="h-4 w-4 text-primary" aria-hidden="true" /> 3D model & AR
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            {isAppleMobile() && (
              <Button className="w-full" onClick={() => model('usdz', true)} disabled={!!busy}>
                <Smartphone className="mr-2 h-4 w-4" /> View in your room (AR)
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => model('glb')} disabled={!!busy}>
                GLB
              </Button>
              <Button variant="outline" size="sm" onClick={() => model('usdz')} disabled={!!busy}>
                USDZ
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Real-size model of the closed box. GLB opens in Windows 3D Viewer, Blender and Android; USDZ in iPhone and iPad AR.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="embed">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" aria-hidden="true" /> Embed on your website
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Paste this code into your website to show this box in 3D. Visitors can change size and colour.</p>
            <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-all rounded-md bg-ink-900 p-2.5 text-[10.5px] leading-snug text-paper-100">{snippet}</pre>
            <Button variant="outline" size="sm" className="w-full" onClick={copySnippet}>
              {copied ? <Check className="mr-1.5 h-4 w-4" /> : null}
              {copied ? 'Copied' : 'Copy code'}
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="quality" className="border-b-0">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" aria-hidden="true" /> 3D quality
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="3D quality">
              {(
                [
                  ['auto', 'Auto', 'Best for this device'],
                  ['high', 'High', 'Sharpest, soft shadows'],
                  ['saver', 'Battery saver', 'Lighter on old phones'],
                ] as const
              ).map(([id, label, hint]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={quality === id}
                  onClick={() => {
                    onQualityChange(id);
                    trackEvent('designer_quality', { quality: id });
                  }}
                  className={`rounded-lg border p-2 text-left ${quality === id ? 'border-primary bg-primary/10' : 'border-border hover:border-foreground/40'}`}
                >
                  <span className="block text-xs font-semibold">{label}</span>
                  <span className="block text-[10.5px] leading-tight text-muted-foreground">{hint}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
