/**
 * Presentation mode for meetings: the page hides all chrome; this overlay adds a large, quiet spec card and a
 * small control bar that fades out when the pointer rests.
 *   ← / →  step through the style's fold stops (flat, open, closed)
 *   ↑ / ↓  step through variants: your saved designs (when you have two or more), otherwise board colours
 *   Space  turntable on/off      Esc  leave
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Pause, Play, X } from 'lucide-react';
import type { BoxDesign } from '@/types/boxDesigner';
import { getStyle } from '@/lib/boxDesigner/styles';
import { BOX_COLOR_OPTIONS, PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import { formatDimensions } from '@/lib/boxDesigner/units';
import { describeColour } from '@/lib/boxDesigner/shareUtils';
import { listDesigns, loadVersion } from '@/lib/boxDesigner/myDesigns';
import { loadBrandKit } from '@/lib/boxDesigner/brandKit';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { COMPANY_INFO } from '@/constants';
import { DUR, EASE } from '@/lib/motion/tokens';

interface PresentationModeProps {
  design: BoxDesign;
  fold: number;
  onFold: (percent: number) => void;
  autoRotate: boolean;
  onToggleRotate: () => void;
  onReplace: (design: BoxDesign) => void;
  onColour: (hex: string) => void;
  onExit: () => void;
}

interface Variant {
  label: string;
  apply: () => void;
}

export default function PresentationMode({ design, fold, onFold, autoRotate, onToggleRotate, onReplace, onColour, onExit }: PresentationModeProps) {
  const style = getStyle(design.template);
  const stops = style.foldStops;
  const [idle, setIdle] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const idleTimer = useRef<number>();

  const variants: Variant[] = useMemo(() => {
    const saved = listDesigns();
    if (saved.length >= 2) {
      return saved.map((entry) => ({
        label: entry.name,
        apply: () => {
          const d = loadVersion(entry);
          if (d) onReplace(d);
        },
      }));
    }
    const colours = Array.from(new Set([...loadBrandKit().colours, design.colorHex.toUpperCase(), ...BOX_COLOR_OPTIONS.map((c) => c.color.toUpperCase())]));
    return colours.map((hex) => ({ label: describeColour(hex), apply: () => onColour(hex) }));
    // Variants are fixed when presentation starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 1600);
  };

  const stepFold = useCallback(
    (dir: 1 | -1) => {
      const current = stops.reduce((best, s, i) => (Math.abs(s.value - fold) < Math.abs(stops[best].value - fold) ? i : best), 0);
      const next = stops[Math.min(stops.length - 1, Math.max(0, current + dir))];
      onFold(next.value);
      flash(next.label);
    },
    [stops, fold, onFold]
  );

  const stepVariant = useCallback(
    (dir: 1 | -1) => {
      if (!variants.length) return;
      const next = (variantIndex + dir + variants.length) % variants.length;
      setVariantIndex(next);
      variants[next].apply();
      flash(`${next + 1}/${variants.length} · ${variants[next].label}`);
    },
    [variants, variantIndex]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') stepFold(1);
      else if (e.key === 'ArrowLeft') stepFold(-1);
      else if (e.key === 'ArrowUp') stepVariant(-1);
      else if (e.key === 'ArrowDown') stepVariant(1);
      else if (e.key === 'Escape') onExit();
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [stepFold, stepVariant, onExit]);

  // Controls fade after 2.5 s without pointer movement
  useEffect(() => {
    const wake = () => {
      setIdle(false);
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setIdle(true), 2500);
    };
    wake();
    window.addEventListener('pointermove', wake);
    window.addEventListener('pointerdown', wake);
    return () => {
      window.clearTimeout(idleTimer.current);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
    };
  }, []);

  const ply = PLY_OPTIONS.find((p) => p.id === design.ply);
  const board = getBoardSpec(design.ply, design.flutes);
  const currentStop = stops.reduce((best, s) => (Math.abs(s.value - fold) < Math.abs(best.value - fold) ? s : best), stops[0]);
  const ctl = 'flex h-11 w-11 items-center justify-center rounded-full text-paper-50 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400';

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* Spec card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.slow, ease: EASE.paper }}
        className="absolute bottom-5 left-5 max-w-[min(90vw,26rem)] rounded-2xl bg-ink-900/85 p-5 text-paper-50 shadow-2xl backdrop-blur md:bottom-8 md:left-8 md:p-6"
      >
        <p className="label-mono text-green-400">{COMPANY_INFO.name}</p>
        <p className="mt-1 font-display text-2xl leading-tight md:text-4xl">{design.name.trim() || style.name}</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm md:text-base">
          <dt className="text-paper-muted">Inside</dt>
          <dd className="tabular font-semibold">{formatDimensions(design.dimensions, design.unit)}</dd>
          <dt className="text-paper-muted">Style</dt>
          <dd>
            {style.shortName}
            {style.fefco ? ` · FEFCO ${style.fefco}` : ''}
          </dd>
          <dt className="text-paper-muted">Board</dt>
          <dd>
            {ply?.name} {board.flutes.join('')} · {ply?.wall}
          </dd>
          <dt className="text-paper-muted">Colour</dt>
          <dd>
            {describeColour(design.colorHex)} · {design.finish}
          </dd>
          <dt className="text-paper-muted">Quantity</dt>
          <dd className="tabular">{design.quantity.toLocaleString('en-IN')}</dd>
        </dl>
      </motion.div>

      {/* Step feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-6 flex justify-center"
          >
            <span className="rounded-full bg-ink-900/80 px-4 py-2 text-sm font-medium text-paper-50 backdrop-blur">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <motion.div
        animate={{ opacity: idle ? 0 : 1 }}
        transition={{ duration: DUR.base }}
        className="pointer-events-auto absolute bottom-5 right-5 flex items-center gap-1 rounded-full bg-ink-900/80 p-1.5 backdrop-blur md:bottom-8 md:right-8"
      >
        <button type="button" className={ctl} onClick={() => stepFold(-1)} aria-label="Previous fold step">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-[5.5rem] text-center text-xs font-medium text-paper-100">{currentStop.label}</span>
        <button type="button" className={ctl} onClick={() => stepFold(1)} aria-label="Next fold step">
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="mx-1 h-6 w-px bg-white/20" />
        <button type="button" className={ctl} onClick={() => stepVariant(-1)} aria-label="Previous variant">
          <ChevronUp className="h-5 w-5" />
        </button>
        <button type="button" className={ctl} onClick={() => stepVariant(1)} aria-label="Next variant">
          <ChevronDown className="h-5 w-5" />
        </button>
        <button type="button" className={ctl} onClick={onToggleRotate} aria-label={autoRotate ? 'Stop turntable' : 'Start turntable'} aria-pressed={autoRotate}>
          {autoRotate ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <span className="mx-1 h-6 w-px bg-white/20" />
        <button type="button" className={ctl} onClick={onExit} aria-label="Leave presentation">
          <X className="h-5 w-5" />
        </button>
      </motion.div>
    </div>
  );
}
