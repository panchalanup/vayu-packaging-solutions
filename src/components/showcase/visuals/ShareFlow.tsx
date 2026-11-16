/**
 * Share and approve, as a drawing that plays itself: a laptop sends a link, a phone opens the box, a page gets
 * signed. Inline SVG with CSS keyframes (transform, opacity and stroke-dashoffset only), started when it scrolls
 * into view and paused when it leaves. With reduced motion it shows the finished state.
 * Generic shapes on purpose: no messaging-app logos, no UI replicas.
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ShareFlowProps {
  tone?: 'paper' | 'ink';
  className?: string;
  /** Three words under the three devices */
  labels?: [string, string, string];
}

/** A small isometric box drawn from three faces */
function MiniBox({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <polygon points="0,-18 26,-6 0,6 -26,-6" fill="#E2C79B" />
      <polygon points="-26,-6 0,6 0,34 -26,22" fill="#B98F5C" />
      <polygon points="26,-6 0,6 0,34 26,22" fill="#C9A87C" />
      <path d="M-13,-12 L13,0" stroke="#9C7647" strokeWidth="1.4" fill="none" />
    </g>
  );
}

export default function ShareFlow({ tone = 'paper', className, labels = ['Share', 'Open', 'Approve'] }: ShareFlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRunning(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ink = tone === 'ink';
  const line = ink ? '#FBF8F3' : '#0F1A14';
  const soft = ink ? 'rgba(251,248,243,0.16)' : 'rgba(15,26,20,0.14)';
  const fill = ink ? '#17231C' : '#FBF8F3';
  const label = ink ? '#A9B4AC' : '#4A5A50';

  return (
    <div ref={ref} className={cn('sf', running && 'sf-run', className)}>
      <svg viewBox="0 0 640 250" className="h-auto w-full" role="img" aria-label="A laptop sends a link, a phone opens the 3D box, and the proof page gets signed.">
        {/* connectors */}
        <path className="sf-dash" d="M176 106 H284" stroke={soft} strokeWidth="2" strokeDasharray="6 6" fill="none" />
        <path className="sf-dash" d="M356 106 H504" stroke={soft} strokeWidth="2" strokeDasharray="6 6" fill="none" />

        {/* laptop */}
        <g>
          <rect x="22" y="58" width="140" height="92" rx="9" fill={fill} stroke={line} strokeWidth="2" />
          <path d="M6 158 H178 L168 172 H16 Z" fill={fill} stroke={line} strokeWidth="2" strokeLinejoin="round" />
          <MiniBox x={92} y={96} s={0.95} />
        </g>

        {/* phone */}
        <g className="sf-bob">
          <rect x="288" y="36" width="64" height="138" rx="13" fill={fill} stroke={line} strokeWidth="2" />
          <rect x="310" y="44" width="20" height="4" rx="2" fill={soft} />
          <MiniBox x={320} y={102} s={0.8} />
        </g>

        {/* proof page */}
        <g>
          <rect x="510" y="44" width="92" height="124" rx="6" fill={fill} stroke={line} strokeWidth="2" />
          <path d="M526 68 H586 M526 82 H574 M526 96 H586" stroke={soft} strokeWidth="3" strokeLinecap="round" />
          <path d="M526 146 H578" stroke={line} strokeWidth="1.5" />
          <path className="sf-check" d="M530 130 L543 142 L572 112" stroke="#3DBA5A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* rings that pulse where the link lands and where the page is signed */}
        <circle className="sf-ring" cx="320" cy="105" r="46" />
        <circle className="sf-ring sf-ring2" cx="556" cy="106" r="58" />

        {/* the link, then the approval, travelling along the connectors */}
        <g className="sf-chip sf-chip1">
          <rect x="174" y="95" width="24" height="22" rx="11" fill="#3DBA5A" />
          <path d="M182 106 H190" stroke="#0F1A14" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        <g className="sf-chip sf-chip2">
          <rect x="356" y="95" width="24" height="22" rx="11" fill="#3DBA5A" />
          <path d="M363 106 L367 110 L374 101" stroke="#0F1A14" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {[92, 320, 556].map((x, i) => (
          <text key={x} x={x} y="226" textAnchor="middle" fontSize="13" fill={label} fontFamily="var(--font-mono)" letterSpacing="1.4">
            {labels[i].toUpperCase()}
          </text>
        ))}
      </svg>
    </div>
  );
}
