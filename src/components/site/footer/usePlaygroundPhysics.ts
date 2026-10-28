/**
 * Drives the footer playground: loads matter-js on demand, runs the world on a fixed-step rAF loop that sleeps when the
 * footer is off-screen, the tab is hidden or everything is at rest, and writes poses straight to the SVG (no React
 * renders per frame). Pointer drag uses window listeners; the wheel is never touched.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createSettleDetector } from '@/lib/footerPlayground/settle';
import { type PlaygroundLayout } from '@/lib/footerPlayground/layout';
import { STEP_MS, type BoxEntity, type Entity, type Impact, type PlaygroundWorld } from '@/lib/footerPlayground/world';
import { LETTER_PAD } from './CrateLetter';
import { BOX_PAD } from './MiniBox';
import { LETTERS } from './stencilLetters';

export interface BoxView {
  id: number;
  w: number;
  h: number;
  stickerIdx: number;
}

interface Options {
  layout: PlaygroundLayout;
  stickerCount: number;
  onGrab: (kind: 'letter' | 'box') => void;
  onFail: () => void;
}

const MAX_LEAN_DEG = 4.5;
const PUFFS = 10;
const PUFF_MS = 520;
/** The drop-in starts when this share of the stage is on screen */
const START_RATIO = 0.35;

const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

interface Puff {
  x: number;
  y: number;
  vx: number;
  t0: number;
  size: number;
  live: boolean;
}

/** Dust at heavy landings only (letters and the hardest box drops); a small pool of circles is reused */
function spawnPuff(puffs: Puff[], L: PlaygroundLayout, hit: Impact) {
  const isLetter = hit.entity.kind === 'letter';
  if (!hit.floor || hit.norm < (isLetter ? 0.55 : 0.95)) return;
  const now = performance.now();
  for (let n = 0; n < (isLetter ? 3 : 2); n++) {
    const p = puffs.find((q) => !q.live);
    if (!p) return;
    const dir = n === 0 ? -1 : n === 1 ? 1 : 0.2;
    Object.assign(p, {
      x: hit.x + dir * L.k * 2,
      y: L.floorY - 2,
      vx: dir * L.k * (isLetter ? 9 : 5),
      t0: now,
      size: L.k * (isLetter ? 4.2 : 2.6),
      live: true,
    });
  }
}

/** Soft contact shadow on the floor: wider and fainter the higher the body is */
function shadowAt(el: SVGEllipseElement | null | undefined, e: Entity, L: PlaygroundLayout, scale = 1) {
  if (!el) return;
  const b = e.body.bounds;
  const gap = Math.max(0, L.floorY - b.max.y);
  const fade = clamp(1 - gap / (L.stageH * 0.7), 0, 1);
  const rx = ((b.max.x - b.min.x) * 0.5 + gap * 0.08) * scale;
  el.setAttribute('cx', String(r2((b.min.x + b.max.x) / 2)));
  el.setAttribute('cy', String(r2(L.floorY + 2)));
  el.setAttribute('rx', String(r2(Math.max(1, rx))));
  el.setAttribute('ry', String(r2(Math.max(1, L.k * 3.2 * scale))));
  el.setAttribute('opacity', String(r2(fade * 0.9)));
}

export function usePlaygroundPhysics({ layout, stickerCount, onGrab, onFail }: Options) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const letterEls = useRef<(SVGSVGElement | null)[]>([]);
  const letterShadows = useRef<(SVGEllipseElement | null)[]>([]);
  const boxEls = useRef(new Map<number, SVGSVGElement>());
  const boxShadows = useRef(new Map<number, SVGEllipseElement>());
  const puffEls = useRef<(SVGCircleElement | null)[]>([]);
  const [boxes, setBoxes] = useState<BoxView[]>([]);
  const [ready, setReady] = useState(false);

  const live = useRef({
    world: null as PlaygroundWorld | null,
    layout,
    raf: 0,
    last: 0,
    acc: 0,
    visible: false,
    ratio: 0,
    pointer: { x: 0, y: 0, active: false },
    lean: LETTERS.map(() => 0),
    puffs: Array.from({ length: PUFFS }, (): Puff => ({ x: 0, y: 0, vx: 0, t0: 0, size: 1, live: false })),
    settle: createSettleDetector(),
    settled: false,
    leanBusy: false,
    activeDrag: false,
    opts: { onGrab, onFail },
  });
  live.current.opts = { onGrab, onFail };
  live.current.layout = layout;

  // ------------------------------------------------------------------ rendering

  const render = useCallback(() => {
    const s = live.current;
    const world = s.world;
    if (!world) return;
    const L = world.layout;

    let leanBusy = false;
    for (const e of world.letters) {
      const el = letterEls.current[e.index];
      if (!el) continue;
      if (!e.added) {
        el.style.visibility = 'hidden';
        continue;
      }
      el.style.visibility = 'visible';
      const b = e.body;
      const resting = b.speed < 1.5 && !e.tween && world.dragging !== e;
      let target = 0;
      if (resting && s.pointer.active) {
        const dx = s.pointer.x - b.position.x;
        const dy = s.pointer.y - b.position.y;
        const infl = Math.pow(Math.max(0, 1 - Math.hypot(dx, dy) / (L.letterH * 1.2)), 1.6);
        target = -Math.sign(dx || 1) * infl * MAX_LEAN_DEG;
      }
      s.lean[e.index] += (target - s.lean[e.index]) * 0.14;
      if (Math.abs(target - s.lean[e.index]) > 0.02) leanBusy = true;
      const sy = 1 - 0.3 * e.squash;
      const sx = 1 + 0.18 * e.squash;
      const w = e.glyph.width;
      const k = L.k;
      const cx = (e.glyph.width / 2) * k;
      const cy = 100 * k;
      const lean = Math.abs(s.lean[e.index]) > 0.01 ? `translate(${r2(b.position.x)}px, ${r2(b.bounds.max.y)}px) rotate(${r2(s.lean[e.index])}deg) translate(${-r2(b.position.x)}px, ${-r2(b.bounds.max.y)}px) ` : '';
      // the element's top-left is letter unit (-pad, -pad); squash pivots on the middle of the base
      el.style.transform = `${lean}translate(${r2(b.position.x)}px, ${r2(b.position.y)}px) rotate(${r2((b.angle * 180) / Math.PI)}deg) translate(${r2(e.local.x + cx)}px, ${r2(e.local.y + cy)}px) scale(${r2(sx)}, ${r2(sy)}) translate(${r2(-cx - LETTER_PAD * k)}px, ${r2(-cy - LETTER_PAD * k)}px)`;
      shadowAt(letterShadows.current[e.index], e, L);
    }

    s.leanBusy = leanBusy;
    for (const e of world.boxes) {
      const el = boxEls.current.get(e.id);
      if (!el) continue;
      const b = e.body;
      const sy = e.scale * (1 - 0.22 * e.squash);
      const sx = e.scale * (1 + 0.14 * e.squash);
      el.style.transform = `translate(${r2(b.position.x)}px, ${r2(b.position.y)}px) rotate(${r2((b.angle * 180) / Math.PI)}deg) scale(${r2(sx)}, ${r2(sy)}) translate(${-(e.w / 2 + BOX_PAD)}px, ${-(e.h / 2 + BOX_PAD)}px)`;
      shadowAt(boxShadows.current.get(e.id), e, L, e.scale);
    }

    const now = performance.now();
    s.puffs.forEach((p, i) => {
      const el = puffEls.current[i];
      if (!el) return;
      if (!p.live) return;
      const t = (now - p.t0) / PUFF_MS;
      if (t >= 1) {
        p.live = false;
        el.setAttribute('opacity', '0');
        return;
      }
      const ease = 1 - Math.pow(1 - t, 2);
      el.setAttribute('cx', String(r2(p.x + p.vx * ease)));
      el.setAttribute('cy', String(r2(p.y - ease * p.size * 1.2)));
      el.setAttribute('r', String(r2(p.size * (0.5 + ease * 1.1))));
      el.setAttribute('opacity', String(r2(0.34 * (1 - t))));
    });
  }, []);

  // ------------------------------------------------------------------ loop

  const frame = useCallback(
    (now: number) => {
      const s = live.current;
      s.raf = 0;
      const world = s.world;
      if (!world || !s.visible || document.hidden) return;
      s.acc += Math.min(50, now - s.last);
      s.last = now;
      let steps = 0;
      while (s.acc >= STEP_MS && steps < 3) {
        world.step();
        s.settled = s.settle.update(world.samples());
        s.acc -= STEP_MS;
        steps++;
      }
      if (steps === 3) s.acc = 0;
      render();

      const squashing = world.entities().some((e) => Math.abs(e.squash) > 0.01 || Math.abs(e.squashV) > 0.01);
      const puffing = s.puffs.some((p) => p.live);
      if (world.dropped && !world.busy && s.settled && !squashing && !puffing && !s.leanBusy) return;
      s.raf = requestAnimationFrame(frame);
    },
    [render],
  );

  const wake = useCallback(() => {
    const s = live.current;
    s.settle.reset();
    s.settled = false;
    if (s.raf || !s.world || !s.visible || document.hidden) return;
    s.last = performance.now();
    s.raf = requestAnimationFrame(frame);
  }, [frame]);

  // ------------------------------------------------------------------ setup

  useEffect(() => {
    let cancelled = false;
    const s = live.current;
    (async () => {
      try {
        const [mod, { PlaygroundWorld: World }] = await Promise.all([import('matter-js'), import('@/lib/footerPlayground/world')]);
        if (cancelled) return;
        const Matter = (mod as unknown as { default?: typeof mod }).default ?? mod;
        const world = new World(Matter as unknown as ConstructorParameters<typeof World>[0], s.layout, Math.floor(Math.random() * 1e6));
        world.stickerCount = Math.max(1, stickerCountRef.current);
        world.onBoxesChange = () => setBoxes(world.boxes.map((b) => ({ id: b.id, w: b.w, h: b.h, stickerIdx: b.stickerIdx })));
        world.onImpact = (hit) => spawnPuff(s.puffs, s.layout, hit);
        s.world = world;
        setReady(true);
        if (s.visible && s.ratio >= START_RATIO) {
          world.startDrop();
          wake();
        }
        render();
      } catch {
        if (!cancelled) s.opts.onFail();
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.world = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stickerCountRef = useRef(stickerCount);
  useEffect(() => {
    stickerCountRef.current = stickerCount;
    if (live.current.world) live.current.world.stickerCount = Math.max(1, stickerCount);
  }, [stickerCount]);

  // new width: rebuild the world for the new layout (keeps the landed state)
  useEffect(() => {
    const world = live.current.world;
    if (world && world.layout.width !== layout.width) {
      world.rebuild(layout);
      wake();
      render();
    }
  }, [layout, wake, render]);

  // visibility: start the entrance when the stage is mostly on screen, sleep when it is not
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const s = live.current;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        s.ratio = entry.intersectionRatio;
        s.visible = entry.isIntersecting;
        if (s.visible && s.world && s.ratio >= START_RATIO && !s.world.dropped) s.world.startDrop();
        if (s.visible) wake();
      },
      { threshold: [0, 0.1, START_RATIO, 0.6] },
    );
    io.observe(el);
    const onVis = () => !document.hidden && wake();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [wake]);

  // ------------------------------------------------------------------ dust

  // ------------------------------------------------------------------ pointer

  const toWorld = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return { x: 0, y: 0 };
    const k = live.current.layout.width / rect.width;
    return { x: (clientX - rect.left) * k, y: (clientY - rect.top) * k };
  };

  const beginGrab = (entity: Entity | undefined, e: React.PointerEvent) => {
    const s = live.current;
    const world = s.world;
    if (!world || !entity || s.activeDrag) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const p = toWorld(e.clientX, e.clientY);
    world.grab(entity, p.x, p.y);
    s.activeDrag = true;
    s.opts.onGrab(entity.kind);
    if (stageRef.current) stageRef.current.style.cursor = 'grabbing';
    const move = (ev: PointerEvent) => {
      const q = toWorld(ev.clientX, ev.clientY);
      s.pointer = { ...q, active: ev.pointerType === 'mouse' };
      world.dragTo(q.x, q.y);
      wake();
    };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      s.activeDrag = false;
      world.release();
      if (stageRef.current) stageRef.current.style.cursor = '';
      wake();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    wake();
  };

  const grabLetter = (index: number) => (e: React.PointerEvent) => beginGrab(live.current.world?.letters[index], e);
  const grabBox = (id: number) => (e: React.PointerEvent) => beginGrab(live.current.world?.boxes.find((b: BoxEntity) => b.id === id), e);

  const onStagePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const p = toWorld(e.clientX, e.clientY);
    live.current.pointer = { ...p, active: true };
    wake();
  };
  const onStagePointerLeave = () => {
    live.current.pointer.active = false;
    wake();
  };

  // ------------------------------------------------------------------ commands

  const dropBox = useCallback(
    (x?: number) => {
      const world = live.current.world;
      if (!world) return null;
      if (!world.dropped) world.startDrop();
      const b = world.dropBox(x);
      wake();
      return b;
    },
    [wake],
  );

  const tidy = useCallback(() => {
    live.current.world?.tidy();
    wake();
  }, [wake]);

  const dropped = () => live.current.world?.droppedBoxes ?? 0;

  return {
    stageRef,
    ready,
    boxes,
    dropBox,
    tidy,
    dropped,
    toWorld,
    grabLetter,
    grabBox,
    onStagePointerMove,
    onStagePointerLeave,
    letterRef: (i: number) => (el: SVGSVGElement | null) => {
      letterEls.current[i] = el;
    },
    letterShadowRef: (i: number) => (el: SVGEllipseElement | null) => {
      letterShadows.current[i] = el;
    },
    boxRef: (id: number) => (el: SVGSVGElement | null) => {
      if (el) boxEls.current.set(id, el);
      else boxEls.current.delete(id);
    },
    boxShadowRef: (id: number) => (el: SVGEllipseElement | null) => {
      if (el) boxShadows.current.set(id, el);
      else boxShadows.current.delete(id);
    },
    puffRef: (i: number) => (el: SVGCircleElement | null) => {
      puffEls.current[i] = el;
    },
    puffCount: PUFFS,
  };
}
