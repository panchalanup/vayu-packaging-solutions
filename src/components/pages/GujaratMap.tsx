/**
 * Static, schematic SVG map of Gujarat (§9.6). Not to scale: the outline is a simplified hand-drawn shape and the dots
 * are approximate. Routes from the Ahmedabad hub are drawn once on reveal (stroke-dashoffset, 800 ms) and are static
 * under reduced motion. City dots are real <button>s overlaid on the SVG so they get focus rings and 32 px targets.
 * SECURITY: renders static content only; the selected id is validated against CITIES by the parent.
 */

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { CITIES, type City } from '@/content/locations';
import { DUR, EASE } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

const W = 640;
const H = 520;
const LON0 = 68.0;
const LAT_TOP = 24.8;
const PX_PER_LON = 92.3;
const PX_PER_LAT = 99.5;

const project = (lon: number, lat: number): [number, number] => [
  20 + (lon - LON0) * PX_PER_LON,
  20 + (LAT_TOP - lat) * PX_PER_LAT,
];

// Simplified state boundary, clockwise from the west tip of Kutch (lon, lat). Rann, Kutch, Saurashtra and the two gulfs.
const OUTLINE: [number, number][] = [
  [68.15, 23.75], [68.45, 24.05], [68.95, 24.28], [69.6, 24.3], [70.25, 24.3], [70.9, 24.25], [71.3, 24.65],
  [71.9, 24.65], [72.4, 24.55], [72.75, 24.35], [73.1, 24.25], [73.5, 24.05], [73.75, 23.75], [74.1, 23.55],
  [74.2, 23.15], [74.25, 22.75], [74.0, 22.4], [73.7, 22.15], [73.9, 21.95], [73.85, 21.55], [73.7, 21.2],
  [73.75, 20.85], [73.4, 20.6], [73.1, 20.25], [72.95, 20.1], [72.78, 20.45], [72.7, 20.85], [72.6, 21.1],
  [72.55, 21.45], [72.55, 21.65], [72.65, 21.95], [72.55, 22.3], [72.3, 22.25], [72.15, 21.95], [72.15, 21.7],
  [72.0, 21.45], [71.8, 21.1], [71.4, 20.9], [71.0, 20.72], [70.6, 20.8], [70.35, 20.9], [69.95, 21.05],
  [69.65, 21.5], [69.6, 21.65], [69.2, 21.9], [68.97, 22.25], [69.05, 22.48], [69.5, 22.45], [69.85, 22.45],
  [70.1, 22.6], [70.4, 22.9], [70.3, 23.05], [69.9, 22.92], [69.5, 22.9], [69.2, 22.85], [68.9, 23.05],
  [68.6, 23.3], [68.3, 23.45],
];

/** Closed path through segment midpoints with the vertices as control points: soft, hand-drawn corners */
function smoothClosedPath(points: [number, number][]): string {
  const pts = points.map(([lon, lat]) => project(lon, lat));
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const first = mid(pts[pts.length - 1], pts[0]);
  let d = `M${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length]);
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  });
  return `${d}Z`;
}

const OUTLINE_PATH = smoothClosedPath(OUTLINE);

const HUB = CITIES.find((c) => c.hub) ?? CITIES[0];

/** Gently curved route from the hub: control point pushed sideways by 14 % of the length */
function routePath(to: City): string {
  const [x1, y1] = project(HUB.lon, HUB.lat);
  const [x2, y2] = project(to.lon, to.lat);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx - dy * 0.14).toFixed(1)} ${(my + dx * 0.14).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

const LABEL_POS: Record<City['label'], string> = {
  l: 'right-full mr-1.5 top-1/2 -translate-y-1/2',
  r: 'left-full ml-1.5 top-1/2 -translate-y-1/2',
  t: 'bottom-full mb-1 left-1/2 -translate-x-1/2',
  b: 'top-full mt-1 left-1/2 -translate-x-1/2',
};

interface GujaratMapProps {
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export default function GujaratMap({ selectedId, onSelect, className }: GujaratMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const routes = CITIES.filter((c) => !c.hub);

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Schematic map of Gujarat with delivery routes from the Ahmedabad hub. Select a city for details."
      className={cn('relative w-full select-none', className)}
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
        <path d={OUTLINE_PATH} className="fill-paper-200 stroke-ink-900/40" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Great Rann hint: dashed edge along the north of Kutch */}
        <path
          d={`M${project(68.5, 23.95).join(' ')} Q${project(69.4, 24.05).join(' ')} ${project(70.4, 24.0).join(' ')}`}
          className="fill-none stroke-ink-900/25"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <text x={project(69.3, 24.0)[0]} y={project(69.3, 24.0)[1] + 14} className="fill-ink-500 font-mono" fontSize="9" letterSpacing="1.5" textAnchor="middle">
          KUTCH
        </text>
        <text x={project(70.55, 21.65)[0]} y={project(70.55, 21.65)[1]} className="fill-ink-500 font-mono" fontSize="9" letterSpacing="1.5" textAnchor="middle">
          SAURASHTRA
        </text>

        {routes.map((city, i) => {
          const active = city.id === selectedId;
          const common = {
            d: routePath(city),
            fill: 'none',
            strokeLinecap: 'round' as const,
            strokeWidth: active ? 2.5 : 1.25,
            className: cn('transition-colors duration-quick', active ? 'stroke-cyan-700' : 'stroke-green-600/60'),
          };
          // Reduced motion: static lines, no draw-in
          if (reduced) return <path key={city.id} {...common} />;
          return (
            <motion.path
              key={city.id}
              {...common}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: inView ? 1 : 0 }}
              transition={{ duration: DUR.cinematic, ease: EASE.paper, delay: i * 0.03 }}
            />
          );
        })}
      </svg>

      {CITIES.map((city) => {
        const [x, y] = project(city.lon, city.lat);
        const selected = city.id === selectedId;
        return (
          <button
            key={city.id}
            type="button"
            onClick={() => onSelect(city.id)}
            aria-pressed={selected}
            aria-label={city.hub ? `${city.name}, our hub. Show details` : `${city.name}. Show details`}
            style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
            className={cn(
              'group absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              city.hub ? 'z-10 h-9 w-9' : 'h-8 w-8',
              selected && 'z-20'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper-50 transition-[background-color,transform] duration-quick ease-paper group-hover:scale-125',
                city.hub ? 'h-4 w-4 bg-green-600 ring-4 ring-green-600/25' : 'h-2.5 w-2.5 bg-ink-900',
                selected && !city.hub && 'h-3.5 w-3.5 bg-cyan-700 ring-4 ring-cyan-700/25',
                selected && city.hub && 'ring-cyan-700/40'
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute whitespace-nowrap rounded bg-paper-50/85 px-1 py-px text-[10px] font-semibold leading-tight text-ink-900 sm:text-xs',
                LABEL_POS[city.label],
                // On phones only the hub and the selected city carry a label, the list below names the rest
                !city.hub && !selected && 'hidden sm:block'
              )}
            >
              {city.name}
              {city.hub && <span className="ml-1 font-normal text-ink-500">· hub</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
