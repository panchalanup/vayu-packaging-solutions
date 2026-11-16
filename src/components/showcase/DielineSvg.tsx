/**
 * The dieline as an on-page SVG (not the print file: dielineToSvg/Pdf stay the source of truth for downloads).
 *
 * Built for smooth scroll animation:
 *  - all cut lines are ONE path, so "drawing" them is a single stroke-dashoffset (a plotter sweep)
 *  - every reveal is an opacity or dash offset read from CSS variables (--d-cut, --d-score, --d-panel, --d-depth,
 *    --d-glue, --d-blank, --d-legend) that the stage writes imperatively, so scrolling never re-renders React
 *  - line widths and text are sized in screen pixels (via --u, millimetres per pixel), so they stay crisp and
 *    readable on a phone even when a 1 m wide blank is shrunk to 340 px
 * Without the variables (Ch. 3, reduced motion) every var() falls back to 1: fully drawn.
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { StageStore } from '@/lib/showcase/stage';
import type { BoxFace } from '@/types/boxDesigner';
import { dielineBlankBottom, isFooterLabel, type Dieline, type DielineDim } from '@/lib/boxDesigner/dieline';
import { cn } from '@/lib/utils';
import { BELOW_MM } from './flat';

export type DielineTone = 'paper' | 'ink';

interface DielineSvgProps {
  dieline: Dieline;
  tone?: DielineTone;
  /** Face lit on the flat blank (and, through the stage, on the 3D box) */
  highlight?: BoxFace | null;
  /** Makes panels hoverable, focusable and tappable */
  onFace?: (face: BoxFace | null) => void;
  /** Accessible description of what the drawing shows */
  label: string;
  /** A dimension group to emphasise (chapter 3 hotspots) */
  emphasis?: 'cut' | 'fold' | 'panel' | 'glue' | 'flap' | 'blank' | null;
  /** A glowing head that rides the end of the cut line while it draws (needs the stage store for the progress) */
  laser?: StageStore;
  /** 'width' flows in the page at the container width; 'contain' fits the whole drawing inside a fixed-size box */
  fit?: 'width' | 'contain';
  className?: string;
}

/** Space (mm) under the blank that still belongs to the drawing: the dimension lines and their captions */
const BELOW = BELOW_MM;

const r = (n: number) => Math.round(n * 10) / 10;

/** A panel's size line sits under its name; the dieline puts it 7 mm lower, which is a few pixels when shrunk, so use pixels */
const SIZE_LINE = /\d\s*x\s*\d/;
const labelY = (t: { y: number; size: number; text: string }, u: number) => (t.size < 10 && SIZE_LINE.test(t.text) ? t.y - 7 + 14 * u : t.y);

const pathOf = (lines: { x1: number; y1: number; x2: number; y2: number }[]) =>
  lines.map((l) => `M${r(l.x1)} ${r(l.y1)}L${r(l.x2)} ${r(l.y2)}`).join('');

/** One dimension: the line, two end ticks and its caption, with sizes in screen pixels (u = mm per pixel) */
function Dim({ dim: base, u }: { dim: DielineDim; u: number }) {
  const vertical = Math.abs(base.x1 - base.x2) < 1e-6;
  // the whole-sheet dimensions sit a comfortable 16 screen pixels off the edge, however small the drawing is shown
  let dim = base;
  if (base.group === 'blank') {
    if (vertical) {
      const dx = Math.max(0, 16 * u - (20 - base.x1));
      dim = { ...base, x1: base.x1 - dx, x2: base.x2 - dx };
    } else {
      const dy = Math.max(0, 16 * u - 8);
      dim = { ...base, y1: base.y1 + dy, y2: base.y2 + dy };
    }
  }
  const tick = 3.5 * u;
  const lift = 4.5 * u;
  const d = vertical
    ? `M${r(dim.x1)} ${r(dim.y1)}L${r(dim.x2)} ${r(dim.y2)}M${r(dim.x1 - tick)} ${r(dim.y1)}L${r(dim.x1 + tick)} ${r(dim.y1)}M${r(dim.x2 - tick)} ${r(dim.y2)}L${r(dim.x2 + tick)} ${r(dim.y2)}`
    : `M${r(dim.x1)} ${r(dim.y1)}L${r(dim.x2)} ${r(dim.y2)}M${r(dim.x1)} ${r(dim.y1 - tick)}L${r(dim.x1)} ${r(dim.y1 + tick)}M${r(dim.x2)} ${r(dim.y2 - tick)}L${r(dim.x2)} ${r(dim.y2 + tick)}`;
  const tx = vertical ? dim.x1 - lift : (dim.x1 + dim.x2) / 2;
  const ty = vertical ? (dim.y1 + dim.y2) / 2 : dim.y1 - lift;
  return (
    <g>
      <path d={d} className="dl-dim" />
      <text
        x={r(tx)}
        y={r(ty)}
        className="dl-dim-text"
        textAnchor="middle"
        transform={vertical ? `rotate(-90 ${r(tx)} ${r(ty)})` : undefined}
      >
        {dim.text}
      </text>
    </g>
  );
}

export default function DielineSvg({ dieline, tone = 'paper', highlight = null, onFace, label, emphasis = null, fit = 'width', laser, className }: DielineSvgProps) {
  const titleId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const cutRef = useRef<SVGPathElement>(null);
  const laserRef = useRef<SVGGElement>(null);
  // millimetres per CSS pixel: how big one screen pixel is in the drawing
  const [u, setU] = useState(1.6);

  const vbW = dieline.width;
  const vbH = dielineBlankBottom(dieline) + BELOW;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      // the drawing is as wide as the box, or as the box's height allows when it is contain-fitted
      const px = fit === 'contain' ? Math.min(el.clientWidth, (el.clientHeight * vbW) / vbH) : el.clientWidth;
      if (px > 0) setU(Math.round((vbW / px) * 100) / 100);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [vbW, vbH, fit]);

  const geometry = useMemo(() => {
    const cuts = dieline.lines.filter((l) => l.kind === 'cut');
    const scores = dieline.lines.filter((l) => l.kind === 'score');
    const dims = dieline.dims ?? [];
    const panelLabels = dieline.labels.filter((t) => !isFooterLabel(dieline, t));
    return { cuts: pathOf(cuts), scores: pathOf(scores), dims, panelLabels, panels: dieline.panels ?? [] };
  }, [dieline]);

  // the laser head sits where the cut line has been drawn to: one point on the same path, per eased frame
  useEffect(() => {
    const path = cutRef.current;
    const head = laserRef.current;
    if (!laser || !path || !head) return;
    let total = 0;
    try {
      total = path.getTotalLength();
    } catch {
      return;
    }
    const place = (cut: number) => {
      const show = total > 0 && cut > 0.012 && cut < 0.992;
      head.style.opacity = show ? '1' : '0';
      if (show) {
        const pt = path.getPointAtLength(total * cut);
        head.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      }
    };
    place(laser.get().scene.cut);
    return laser.subscribe((s) => place(s.scene.cut));
  }, [laser, geometry.cuts]);

  // a name that does not fit its panel on screen is left out (the panel still highlights and is still sized by its dimension line)
  const fittingLabels = useMemo(
    () =>
      geometry.panelLabels.filter((t) => {
        const panel = geometry.panels.find((pn) => t.x >= pn.x0 && t.x <= pn.x1 && t.y >= pn.y0 && t.y <= pn.y1);
        if (!panel) return true;
        const fontPx = t.size >= 10 ? 13 : 10.5;
        const needPx = t.text.length * fontPx * 0.58 + 8;
        return (panel.x1 - panel.x0) / u >= needPx;
      }),
    [geometry, u]
  );

  const group = (g: DielineDim['group']) => geometry.dims.filter((d) => d.group === g);
  const interactive = !!onFace;

  return (
    <div ref={wrapRef} className={cn('dl w-full', fit === 'contain' && 'h-full', className)} data-tone={tone} style={{ ['--u' as string]: u }}>
      <svg
        viewBox={`0 0 ${r(vbW)} ${r(vbH)}`}
        className={cn('block w-full overflow-visible', fit === 'contain' ? 'h-full' : 'h-auto')}
        role="img"
        aria-labelledby={titleId}
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={titleId}>{label}</title>

        {/* panels: highlight fill and hit areas, under the lines */}
        <g>
          {geometry.panels.map((pn, i) => {
            const active = highlight === pn.face;
            return (
              <rect
                key={`${pn.face}-${i}`}
                x={r(pn.x0)}
                y={r(pn.y0)}
                width={r(pn.x1 - pn.x0)}
                height={r(pn.y1 - pn.y0)}
                className={cn('dl-panel', active && 'dl-panel-on')}
                tabIndex={interactive ? 0 : undefined}
                role={interactive ? 'button' : undefined}
                aria-label={interactive ? `Show the ${pn.face.replace('-', ' ')} panel on the box` : undefined}
                aria-pressed={interactive ? active : undefined}
                onPointerEnter={interactive ? (e) => e.pointerType === 'mouse' && onFace?.(pn.face) : undefined}
                onPointerLeave={interactive ? (e) => e.pointerType === 'mouse' && onFace?.(null) : undefined}
                onFocus={interactive ? () => onFace?.(pn.face) : undefined}
                onBlur={interactive ? () => onFace?.(null) : undefined}
                // touch and keyboard toggle on click; a mouse already lit the panel on hover
                onClick={
                  interactive
                    ? (e) => {
                        const type = (e.nativeEvent as PointerEvent).pointerType;
                        if (type === 'mouse') return;
                        onFace?.(active ? null : pn.face);
                      }
                    : undefined
                }
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === 'Escape') onFace?.(null);
                        else if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onFace?.(active ? null : pn.face);
                        }
                      }
                    : undefined
                }
              />
            );
          })}
        </g>

        {/* fold lines: dashed, fade in after the cut lines */}
        <path
          d={geometry.scores}
          className="dl-score"
          style={{ opacity: emphasis && emphasis !== 'fold' ? 0.28 : undefined }}
        />
        {/* cut lines: one path, drawn by sweeping the dash offset */}
        <path
          ref={cutRef}
          d={geometry.cuts}
          pathLength={100}
          className="dl-cut"
          style={{ opacity: emphasis && emphasis !== 'cut' ? 0.28 : undefined }}
        />

        {laser && (
          <g ref={laserRef} style={{ opacity: 0 }} aria-hidden="true">
            <circle r={14 * u} fill="#3DBA5A" opacity="0.22" />
            <circle r={6 * u} fill="#3DBA5A" opacity="0.55" />
            <circle r={2.6 * u} fill="#ffffff" />
          </g>
        )}

        {/* names and sizes written on the panels */}
        <g className="dl-step" style={{ opacity: `var(--d-panel, ${emphasis && emphasis !== 'panel' ? 0.28 : 1})` }} aria-hidden="true">
          {fittingLabels.map((t, i) => (
            <text key={i} x={r(t.x)} y={r(labelY(t, u))} className={t.size >= 10 ? 'dl-name' : 'dl-sub'} textAnchor="middle">
              {t.text}
            </text>
          ))}
          {group('panel').map((d, i) => (
            <Dim key={`p${i}`} dim={d} u={u} />
          ))}
        </g>
        <g className="dl-step" style={{ opacity: `var(--d-depth, ${emphasis && emphasis !== 'flap' ? 0.28 : 1})` }} aria-hidden="true">
          {group('depth').map((d, i) => (
            <Dim key={`d${i}`} dim={d} u={u} />
          ))}
        </g>
        <g className="dl-step" style={{ opacity: `var(--d-glue, ${emphasis && emphasis !== 'glue' ? 0.28 : 1})` }} aria-hidden="true">
          {group('glue').map((d, i) => (
            <Dim key={`g${i}`} dim={d} u={u} />
          ))}
        </g>
        <g className="dl-step" style={{ opacity: `var(--d-blank, ${emphasis && emphasis !== 'blank' ? 0.28 : 1})` }} aria-hidden="true">
          {group('blank').map((d, i) => (
            <Dim key={`b${i}`} dim={d} u={u} />
          ))}
        </g>
      </svg>
    </div>
  );
}
