/**
 * Print-ready check (#25): a quiet one-line status that expands into a list of issues.
 * Tapping an issue selects that surface so it can be fixed straight away.
 */

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronDown, XCircle } from 'lucide-react';
import type { BoxDesign, BoxFace } from '@/types/boxDesigner';
import { FACE_LABELS } from '@/lib/boxDesigner/constants';
import { FaceSizes, ImagePixelSizes, runPrintChecks } from '@/lib/boxDesigner/printChecks';

interface PrintCheckProps {
  design: BoxDesign;
  faceSizes: FaceSizes;
  onSelectFace: (face: BoxFace) => void;
}

const pixelCache = new Map<string, { width: number; height: number }>();

/** Natural pixel size of each face image (decoded once per image) */
function useImagePixels(images: BoxDesign['faceImages']): ImagePixelSizes {
  const [sizes, setSizes] = useState<ImagePixelSizes>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: ImagePixelSizes = {};
      for (const image of images) {
        let size = pixelCache.get(image.imageUrl);
        if (!size) {
          try {
            const img = new Image();
            img.src = image.imageUrl;
            await img.decode();
            // SVG templates have no meaningful pixel size: treat them as sharp
            size = image.imageUrl.startsWith('data:image/svg')
              ? { width: 4000, height: 4000 }
              : { width: img.naturalWidth, height: img.naturalHeight };
            pixelCache.set(image.imageUrl, size);
            if (pixelCache.size > 24) pixelCache.delete(pixelCache.keys().next().value as string);
          } catch {
            continue;
          }
        }
        next[image.face] = size;
      }
      if (!cancelled) setSizes(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [images]);
  return sizes;
}

export default function PrintCheck({ design, faceSizes, onSelectFace }: PrintCheckProps) {
  const pixels = useImagePixels(design.faceImages);
  const issues = useMemo(() => runPrintChecks(design, faceSizes, pixels), [design, faceSizes, pixels]);
  const [open, setOpen] = useState(false);
  const hasArtwork = design.faceImages.length > 0 || design.textElements.some((t) => t.text.trim());
  if (!hasArtwork) return null;

  const errors = issues.filter((i) => i.severity === 'error').length;
  const status = issues.length === 0 ? 'ok' : errors ? 'error' : 'warning';
  const Icon = status === 'ok' ? CheckCircle2 : status === 'error' ? XCircle : AlertTriangle;
  const tone = status === 'ok' ? 'text-green-700' : status === 'error' ? 'text-destructive' : 'text-amber-700';

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => issues.length && setOpen((v) => !v)}
        aria-expanded={issues.length ? open : undefined}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm"
      >
        <Icon className={`h-4 w-4 shrink-0 ${tone}`} aria-hidden="true" />
        <span className="flex-1 font-medium">
          {status === 'ok' ? 'Print check: looks ready to print' : `Print check: ${issues.length} thing${issues.length > 1 ? 's' : ''} to fix`}
        </span>
        {issues.length > 0 && <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-quick ${open ? 'rotate-180' : ''}`} />}
      </button>
      <AnimatePresence initial={false}>
        {open && issues.length > 0 && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => onSelectFace(issue.face)}
                  className="flex w-full gap-2 px-3 py-2 text-left hover:bg-foreground/5"
                >
                  {issue.severity === 'error' ? (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" aria-label="Must fix" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" aria-label="Check" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold">
                      {issue.title} <span className="font-normal text-muted-foreground">· {FACE_LABELS[issue.face]}</span>
                    </span>
                    <span className="block text-xs text-muted-foreground">{issue.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
