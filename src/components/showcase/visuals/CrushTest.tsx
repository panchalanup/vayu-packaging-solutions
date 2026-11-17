/**
 * A box compression test as a drawing that plays itself: the press comes down, touches the box, a gauge climbs to the
 * load at which this board is expected to fail (the designer's own McKee estimate), the wall buckles. Restarts
 * whenever `play` changes (new board) and when it first scrolls into view. The numbers are tweened in step with the
 * CSS timeline, so the readout and the gauge agree. With reduced motion it shows the end state.
 */

import { useEffect, useRef } from 'react';
import { AnimatedNumber } from '@/components/fx/Numbers';

const DURATION = 3400; // ms, the whole test
const CONTACT = 0.34; // share of the timeline when the press touches the box
const BREAK = 0.92; // share when the wall gives way

interface CrushTestProps {
  failKg: number;
  safeKg: number;
  /** Changes when the test should run again */
  play: string | number;
  label: string;
}

const GAUGE_TOP = 90;
const GAUGE_BOTTOM = 330;

export default function CrushTest({ failKg, safeKg, play, label }: CrushTestProps) {
  const load = useRef<HTMLSpanElement>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = load.current;
    if (!el) return;
    if (reduced) {
      el.textContent = String(failKg);
      return;
    }
    el.textContent = '0';
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / DURATION;
      const p = Math.min(1, Math.max(0, (t - CONTACT) / (BREAK - CONTACT)));
      el.textContent = String(Math.round(failKg * (p * p * (3 - 2 * p))));
      if (t < 1) frame = requestAnimationFrame(tick);
      else el.textContent = String(failKg);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [play, failKg, reduced]);

  const safeY = GAUGE_BOTTOM - (GAUGE_BOTTOM - GAUGE_TOP) * Math.min(1, safeKg / Math.max(1, failKg));

  return (
    <div>
      {/* the readout sits above the drawing, so the press rod never crosses it */}
      <p className="tabular pointer-events-none flex items-baseline gap-2 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-none text-paper-50" aria-live="off">
        <span ref={load}>{failKg}</span>
        <span className="text-xl text-paper-muted">kg</span>
      </p>
      <p className="label-mono mt-2 text-paper-muted">
        Fails at about <AnimatedNumber value={failKg} className="text-green-400" /> kg
      </p>
      <svg key={String(play)} viewBox="0 0 480 380" role="img" aria-label={label} className={`ct h-auto w-full ${reduced ? 'ct-done' : ''}`} style={{ ['--ct-t' as string]: `${DURATION}ms` }}>
        <line x1="60" y1="330" x2="420" y2="330" stroke="#FBF8F3" strokeOpacity="0.35" strokeWidth="2" />
        {/* the box: front view, squashes under the press */}
        <g className="ct-box">
          <rect x="150" y="210" width="180" height="120" rx="3" fill="#C9A87C" stroke="#8A6440" strokeWidth="2" />
          <path d="M150 226H330" stroke="#8A6440" strokeWidth="1.5" strokeOpacity="0.7" />
          <circle cx="240" cy="282" r="14" fill="#23803A" />
          <path d="M233 279l7 8 9-13" fill="none" stroke="#FBF8F3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path className="ct-crack" d="M300 214l-9 22 12 14-10 20 8 16" fill="none" stroke="#3a2a14" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* the press */}
        <g className="ct-plate">
          <rect x="236" y="-220" width="8" height="412" fill="#A9B4AC" />
          <rect x="130" y="192" width="220" height="18" rx="3" fill="#E9E1D3" stroke="#17231C" strokeOpacity="0.5" />
        </g>
        {/* the gauge */}
        <rect x="412" y={GAUGE_TOP} width="16" height={GAUGE_BOTTOM - GAUGE_TOP} rx="8" fill="#FBF8F3" fillOpacity="0.12" />
        <rect className="ct-fill" x="412" y={GAUGE_TOP} width="16" height={GAUGE_BOTTOM - GAUGE_TOP} rx="8" fill="#3DBA5A" />
        <line x1="404" y1={safeY} x2="436" y2={safeY} stroke="#FBF8F3" strokeWidth="2" strokeDasharray="4 3" />
        <text x="398" y={safeY + 4} textAnchor="end" fontSize="12" fill="#A9B4AC" fontFamily="var(--font-mono)">
          SAFE
        </text>
      </svg>
    </div>
  );
}
