/** The live playground (lazy chunk): crate letters, boxes, controls, hint and the designer nudge. */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useEventTracker } from '@/hooks/useAnalytics';
import { CTA_HREF, shouldShowCta } from '@/lib/footerPlayground/boxes';
import { CONTROLS_H, type PlaygroundLayout } from '@/lib/footerPlayground/layout';
import { DefsHost, Floor, ShadowEllipse } from './CrateDefs';
import { CrateLetterLayer } from './CrateLetter';
import { MiniBox } from './MiniBox';
import { LETTERS } from './stencilLetters';
import { usePlaygroundPhysics } from './usePlaygroundPhysics';
import type { BoxSticker } from './stickerSet';

const BUTTON =
  'inline-flex min-h-[44px] items-center justify-center rounded-full border border-paper-50/30 bg-ink-800 px-5 text-sm font-medium text-paper-50 transition-colors duration-quick ease-paper hover:border-paper-50/60 hover:bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:cursor-wait disabled:opacity-60';

export default function PlaygroundStage({ layout, onFail }: { layout: PlaygroundLayout; onFail: () => void }) {
  const { trackEvent } = useEventTracker();
  const [stickers, setStickers] = useState<readonly BoxSticker[]>([]);
  const [grabbed, setGrabbed] = useState(false);
  const [dropped, setDropped] = useState(0);
  const tracked = useRef({ grab: false, cta: false });

  useEffect(() => {
    let cancelled = false;
    import('./stickerSet').then((m) => !cancelled && setStickers(m.BOX_STICKERS)).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const p = usePlaygroundPhysics({
    layout,
    stickerCount: stickers.length,
    onFail,
    onGrab: (kind) => {
      setGrabbed(true);
      if (!tracked.current.grab) trackEvent('footer_play_grab', { kind });
      tracked.current.grab = true;
    },
  });

  const drop = (x?: number) => {
    if (!p.dropBox(x)) return;
    setGrabbed(true);
    setDropped((n) => n + 1);
    trackEvent('footer_play_drop_box', { count: p.dropped() });
  };

  const showCta = shouldShowCta(dropped, layout.ctaAfter);
  const hintVisible = !grabbed && !showCta;

  return (
    <div>
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-3 px-4 md:px-6 lg:px-10" style={{ height: CONTROLS_H }}>
        <button type="button" className={BUTTON} disabled={!p.ready} onClick={() => drop()}>
          Drop a box
        </button>
        <button
          type="button"
          className={BUTTON}
          disabled={!p.ready}
          onClick={() => {
            p.tidy();
            setDropped(0);
          }}
        >
          Tidy up
        </button>
      </div>

      <div
        ref={p.stageRef}
        className="relative select-none overflow-hidden"
        style={{ height: layout.stageH }}
        onPointerMove={p.onStagePointerMove}
        onPointerLeave={p.onStagePointerLeave}
      >
        <DefsHost />
        {/* empty floor and air: a click or tap here drops a box at that spot. The page itself keeps scrolling normally. */}
        <div className="absolute inset-0" onClick={(e) => drop(p.toWorld(e.clientX, e.clientY).x)} />
        <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${layout.width} ${layout.stageH}`} className="pointer-events-none absolute inset-0 h-full w-full">
          <Floor layout={layout} />
          {LETTERS.map((l, i) => (
            <ShadowEllipse key={l.char} shadowRef={p.letterShadowRef(i)} />
          ))}
          {p.boxes.map((b) => (
            <ShadowEllipse key={b.id} shadowRef={p.boxShadowRef(b.id)} />
          ))}
          <g fill="#A9B4AC">
            {Array.from({ length: p.puffCount }, (_, i) => (
              <circle key={i} ref={p.puffRef(i)} cx={-99} cy={-99} r={1} opacity={0} />
            ))}
          </g>
        </svg>
        {p.boxes.map((b) => (
          <MiniBox key={b.id} w={b.w} h={b.h} sticker={stickers[b.stickerIdx]?.src} boxRef={p.boxRef(b.id)} onPointerDown={p.grabBox(b.id)} />
        ))}
        {LETTERS.map((letter, i) => (
          <CrateLetterLayer key={letter.char} letter={letter} k={layout.k} layerRef={p.letterRef(i)} onPointerDown={p.grabLetter(i)} />
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-center px-4 text-center">
          <p
            aria-hidden={!hintVisible}
            className={`label-mono text-paper-muted transition-opacity duration-slow ease-paper ${hintVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            Go on, grab a letter
          </p>
          {showCta && (
            <p role="status" className="pointer-events-auto text-center text-sm text-paper-100">
              Full pallet.{' '}
              <Link
                to={CTA_HREF}
                className="inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-green-400 underline decoration-green-400/50 underline-offset-4 hover:decoration-green-400 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                onClick={() => {
                  if (!tracked.current.cta) trackEvent('footer_play_cta', { boxes: dropped });
                  tracked.current.cta = true;
                }}
              >
                Design your own box in 3D <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
