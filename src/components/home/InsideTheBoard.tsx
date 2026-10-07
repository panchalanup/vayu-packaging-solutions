/**
 * S3 "Inside the Board" (§6, §8.5): ink floods in, then the board changes 3 → 5 → 7 ply.
 * High tier desktop: pinned scroll timeline with snapping. Elsewhere: tabs. Reduced motion: three static sections.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Section } from '@/components/site/Section';
import { SectionHeader } from '@/components/site/Blocks';
import { Cta } from '@/components/site/Cta';
import { useSiteTier } from '@/lib/motion/siteTier';
import { useEventTracker } from '@/hooks/useAnalytics';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import type { PlyType } from '@/types/boxDesigner';
import { cn } from '@/lib/utils';
import { BoardCrossSection } from './BoardCrossSection';

const PLIES: PlyType[] = ['3-ply', '5-ply', '7-ply'];
const WALL: Record<PlyType, string> = { '3-ply': 'single wall', '5-ply': 'double wall', '7-ply': 'triple wall' };
// VERIFY-LATER[FACT-16]: "best for" guidance is a default, not owner-confirmed
const BEST_FOR: Record<PlyType, string> = {
  '3-ply': 'Light e-commerce, retail, FMCG inner cartons',
  '5-ply': 'Heavier e-com, FMCG outers, appliances',
  '7-ply': 'Industrial parts, export, heavy stacking',
};
const LABEL_AT: Record<PlyType, number> = { '3-ply': 0.25, '5-ply': 0.55, '7-ply': 0.85 };
const plyAt = (p: number): PlyType => (p < 0.4 ? '3-ply' : p < 0.7 ? '5-ply' : '7-ply');

function Datasheet({ ply }: { ply: PlyType }) {
  const spec = getBoardSpec(ply);
  const n = ply.charAt(0);
  const rows: [string, string][] = [
    ['Ply', `${ply} · ${WALL[ply]}`],
    ['Flutes', spec.flutes.join(' + ')],
    ['Caliper', `≈ ${spec.caliperMm.toFixed(1)} mm (indicative)`],
    ['Best for', BEST_FOR[ply]],
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-5 md:p-6">
      <p className="label-mono mb-4 text-paper-muted">Datasheet</p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-border last:border-0">
              <th scope="row" className="label-mono w-28 py-3 pr-4 text-left align-top font-medium text-paper-muted">
                {k}
              </th>
              <td className="tabular py-3">{v}</td>
            </tr>
          ))}
          {/* VERIFY-LATER[FACT-17]: BCT / ECT / burst / GSM / BF rows appear once lab or supplier reports exist */}
          <tr>
            <th scope="row" className="label-mono w-28 py-3 pr-4 text-left align-top font-medium text-paper-muted">
              BCT / ECT
            </th>
            <td className="py-3">
              <Cta id="home.anatomy.report" intent="quote" variant="link" href={`/quote?product=${ply}&src=home.anatomy.report`} meta={{ ply }}>
                Test report on request
              </Cta>
            </td>
          </tr>
        </tbody>
      </table>
      <Cta id="home.anatomy.finder" intent="finder" href={`/compare-quote?ply=${n}`} meta={{ ply }} arrow className="mt-5 w-full sm:w-auto">
        Which ply do I need?
      </Cta>
    </div>
  );
}

export default function InsideTheBoard() {
  const site = useSiteTier();
  const { trackEvent } = useEventTracker();
  const [ply, setPly] = useState<PlyType>('3-ply');
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const floodRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<{ start: number; end: number } | null>(null);
  const flood = site.desktop && !site.reducedMotion;

  useEffect(() => {
    trackEvent('anatomy_ply_view', { ply });
  }, [ply, trackEvent]);

  useLayoutEffect(() => {
    if (!flood && !site.pinning) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (cancelled || !sectionRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        if (flood && floodRef.current) {
          gsap.fromTo(
            floodRef.current,
            { clipPath: 'circle(0% at 88% 0%)' },
            {
              clipPath: 'circle(150% at 88% 0%)',
              ease: 'none',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', end: 'top 15%', scrub: 0.4 },
            }
          );
        }
        if (site.pinning && pinRef.current) {
          const st = ScrollTrigger.create({
            trigger: pinRef.current,
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 0.6,
            snap: { snapTo: [0, 0.25, 0.55, 0.85, 1], duration: { min: 0.2, max: 0.48 }, ease: 'power1.inOut', delay: 0.1 },
            onUpdate: (self) => setPly(plyAt(self.progress)),
            onRefresh: (self) => {
              triggerRef.current = { start: self.start, end: self.end };
            },
          });
          triggerRef.current = { start: st.start, end: st.end };
        }
      }, sectionRef);
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      revert = () => {
        triggerRef.current = null;
        ctx.revert();
      };
    })();
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [flood, site.pinning]);

  const choose = (next: PlyType) => {
    const t = triggerRef.current;
    if (site.pinning && t) {
      window.scrollTo({ top: t.start + (t.end - t.start) * LABEL_AT[next], behavior: 'smooth' });
    } else {
      setPly(next);
    }
  };

  const onTabKey = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = PLIES[(index + (event.key === 'ArrowRight' ? 1 : PLIES.length - 1)) % PLIES.length];
    choose(next);
    document.getElementById(`ply-tab-${next}`)?.focus();
  };

  return (
    <Section name="anatomy" id="anatomy" aria-labelledby="anatomy-heading" ref={sectionRef} className="bg-paper-50">
      <div ref={pinRef}>
        <div
          ref={floodRef}
          data-theme="ink"
          className="section-y bg-ink-900"
          style={flood ? { clipPath: 'circle(0% at 88% 0%)' } : undefined}
        >
          <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
            <SectionHeader
              id="anatomy-heading"
              index="02 — Strength"
              title="Strength you can specify."
              lead="Every Vayu box starts with the right board. Pick a wall and see what's inside."
              size="display"
            />

            {site.reducedMotion ? (
              <div className="mt-12 grid gap-10 lg:grid-cols-3">
                {PLIES.map((p) => (
                  <div key={p}>
                    <BoardCrossSection ply={p} animate={false} compact={!site.desktop} className="w-full" />
                    <div className="mt-4">
                      <Datasheet ply={p} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-7">
                  <div role="tablist" aria-label="Board construction" className="mb-6 flex gap-2">
                    {PLIES.map((p, i) => (
                      <button
                        key={p}
                        id={`ply-tab-${p}`}
                        role="tab"
                        type="button"
                        aria-selected={ply === p}
                        aria-controls="ply-panel"
                        tabIndex={ply === p ? 0 : -1}
                        onClick={() => choose(p)}
                        onKeyDown={(e) => onTabKey(e, i)}
                        className={cn(
                          'min-h-11 rounded-full border px-5 text-sm font-semibold transition-colors duration-quick',
                          ply === p ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-paper-muted'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <BoardCrossSection ply={ply} compact={!site.desktop} className="w-full" />
                </div>
                <div id="ply-panel" role="tabpanel" aria-labelledby={`ply-tab-${ply}`} className="lg:col-span-5">
                  <Datasheet ply={ply} />
                </div>
              </div>
            )}

            {site.pinning && (
              <a href="#range" className="link-draw mt-8 inline-block text-sm text-paper-muted hover:text-paper-50">
                Skip animation ↓
              </a>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
