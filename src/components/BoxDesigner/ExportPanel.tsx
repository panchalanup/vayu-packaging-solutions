/**
 * Export & share panel (Actions tab)
 * Clean image, dieline (SVG/PDF), share link, WhatsApp/email to Vayu, quote, JSON save/load and reset.
 */

import { useRef, useState } from 'react';
import { Camera, FileDown, Link2, Mail, MessageCircle, RotateCcw, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cta } from '@/components/site/Cta';
import { Separator } from '@/components/ui/separator';
import type { BoxDesign } from '@/types/boxDesigner';
import { BOX_TEMPLATES, PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import { getBoardSpec, getBoardThicknessCm } from '@/lib/boxDesigner/boardSpecs';
import { computeRscLayout } from '@/lib/boxDesigner/rig/rscLayout';
import { buildDieline, dielineToPdf, dielineToSvg } from '@/lib/boxDesigner/dieline';
import { MAX_IMPORT_BYTES, parseDesign, serializeDesign } from '@/lib/boxDesigner/designCodec';
import { describeColour, downloadBlob, getDesignFilename, getShareUrl, shareViaEmail, shareViaWhatsApp } from '@/lib/boxDesigner/shareUtils';

interface ExportPanelProps {
  design: BoxDesign;
  capture: () => Promise<Blob | null>;
  onImport: (design: BoxDesign) => void;
  onReset: () => void;
  /** /quote?... link built from the design by the page (allow-listed values only) */
  quoteHref: string;
  onQuote: () => void;
  /** Analytics hook: which share route was used (no design content is sent) */
  onShare: (method: 'link' | 'whatsapp' | 'email') => void;
}

// SECURITY: share links only carry the design spec (no images, no personal data); imports are validated by parseDesign()
export default function ExportPanel({ design, capture, onImport, onReset, quoteHref, onQuote, onShare }: ExportPanelProps) {
  const [working, setWorking] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const template = BOX_TEMPLATES.find((t) => t.id === design.template)!;
  const ply = PLY_OPTIONS.find((p) => p.id === design.ply)!;
  const board = getBoardSpec(design.ply, design.flutes);

  const run = async (label: string, task: () => Promise<void> | void) => {
    setWorking(label);
    try {
      await task();
    } catch (error) {
      console.error(error);
      toast.error(`${label} failed. Please try again.`);
    } finally {
      setWorking(null);
    }
  };

  const dieline = () => {
    const layout = computeRscLayout(design.dimensions, getBoardThicknessCm(board, design.dimensions), {
      topFlaps: design.template !== 'hsc',
    });
    const { length, width, height } = design.dimensions;
    return buildDieline(layout, {
      title: `${template.name} (FEFCO ${template.fefco}) - inside ${length} x ${width} x ${height} cm`,
      board: `${ply.name} ${ply.wall}, ${board.flutes.join('')} flute, ~${board.caliperMm} mm`,
      topFlaps: design.template !== 'hsc',
    });
  };

  const copyLink = async () => {
    onShare('link');
    const url = getShareUrl(design);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied', {
        description: design.faceImages.length ? 'Images stay on this device; the link includes size, board, colour and text.' : undefined,
      });
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      toast.error('That file is too large to be a design file');
      return;
    }
    const parsed = parseDesign(await file.text());
    if (!parsed) {
      toast.error('This is not a valid box design file');
    } else {
      onImport(parsed);
      toast.success('Design loaded');
    }
    if (importRef.current) importRef.current.value = '';
  };

  const busy = (label: string) => working === label;

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Get your box made</h3>
        <Cta id="designer.panel.quote" intent="designer" href={quoteHref} arrow onClick={onQuote} className="w-full" size="lg">
          Quote this design
        </Cta>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            onShare('whatsapp');
            shareViaWhatsApp(design, getShareUrl(design));
          }}>
            <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp us
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            onShare('email');
            shareViaEmail(design, getShareUrl(design));
          }}>
            <Mail className="w-4 h-4 mr-1" /> Email us
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Sends your size, board, colour and a link to this design to Vayu Packaging.</p>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Download</h3>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={!!working}
          onClick={() =>
            run('Image export', async () => {
              const blob = await capture();
              if (!blob) throw new Error('capture failed');
              downloadBlob(blob, getDesignFilename(design, 'png'));
              toast.success('High-resolution image downloaded');
            })
          }
        >
          <Camera className="w-4 h-4 mr-2" /> {busy('Image export') ? 'Rendering…' : 'Image (PNG, high resolution)'}
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={!!working || design.template === 'mailer'}
          onClick={() =>
            run('Dieline export', () => {
              downloadBlob(new Blob([dielineToSvg(dieline())], { type: 'image/svg+xml' }), getDesignFilename(design, 'dieline.svg'));
              toast.success('Dieline (SVG, 1:1 mm) downloaded');
            })
          }
        >
          <FileDown className="w-4 h-4 mr-2" /> Dieline (SVG, 1:1)
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={!!working || design.template === 'mailer'}
          onClick={() =>
            run('Dieline PDF', async () => {
              downloadBlob(await dielineToPdf(dieline()), getDesignFilename(design, 'dieline.pdf'));
              toast.success('Dieline (PDF, 1:1 mm) downloaded');
            })
          }
        >
          <FileDown className="w-4 h-4 mr-2" /> {busy('Dieline PDF') ? 'Preparing…' : 'Dieline (PDF, 1:1)'}
        </Button>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Save & share</h3>
        <p className="text-xs text-muted-foreground">Your design is saved automatically in this browser.</p>
        <Button variant="outline" className="w-full justify-start" onClick={copyLink}>
          <Link2 className="w-4 h-4 mr-2" /> Copy share link
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadBlob(
                new Blob([serializeDesign(design, { includeImages: true })], { type: 'application/json' }),
                getDesignFilename(design, 'json')
              )
            }
          >
            <Save className="w-4 h-4 mr-1" /> Save file
          </Button>
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1" /> Open file
          </Button>
        </div>
        <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} />
        <Separator />
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => {
            if (window.confirm('Start a new design? You can still undo this.')) onReset();
          }}
        >
          <RotateCcw className="w-4 h-4 mr-1" /> New design
        </Button>
      </Card>

      <Card className="p-4 bg-paper-100 border-border text-xs text-ink-900 space-y-1">
        <div className="font-semibold mb-1">Design summary</div>
        <div className="flex justify-between"><span>Inside size</span><span>{design.dimensions.length} x {design.dimensions.width} x {design.dimensions.height} cm</span></div>
        <div className="flex justify-between"><span>Style</span><span>{template.shortName} · FEFCO {template.fefco}</span></div>
        <div className="flex justify-between"><span>Board</span><span>{ply.name} {board.flutes.join('')} · ~{board.caliperMm} mm</span></div>
        <div className="flex justify-between"><span>Colour</span><span>{describeColour(design.colorHex)}</span></div>
        <div className="flex justify-between"><span>Artwork</span><span>{design.faceImages.length} image(s), {design.textElements.length} text(s)</span></div>
      </Card>
    </div>
  );
}
