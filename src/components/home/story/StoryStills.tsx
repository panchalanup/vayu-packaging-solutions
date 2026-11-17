/**
 * Fallback for the low tier, no WebGL, Save-Data and reduced motion (and the VITE_STORY_3D=off kill switch): the same
 * story as a swipeable row of still cards, one phrase each. Nothing moves and no 3D is loaded.
 * Phase D swaps the plain cards for stills exported from the real 3D scene (public/images/story).
 */

import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { CHAPTER_LABELS, SCENE_WORDS, STORY_CTA, STORY_HEADING } from '@/content/story';
import { SCENES } from './beats';

export default function StoryStills() {
  const cards = SCENES.filter((s) => SCENE_WORDS[s.id]);
  return (
    <Section name="story" theme="ink" aria-labelledby="story-heading" className="section-y bg-ink-950 text-paper-50">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <p className="label-mono text-paper-50/60">One box, one journey</p>
        <h2 id="story-heading" className="sr-only">
          {STORY_HEADING}
        </h2>
        <ol className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 scroll-px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {cards.map((s, i) => (
            <li key={s.id} className="flex aspect-[4/5] w-[68%] shrink-0 snap-start flex-col justify-between rounded-[14px] border border-white/10 bg-ink-900 p-5 sm:w-[44%] md:w-auto">
              <span className="label-mono text-paper-50/50">
                {String(i + 1).padStart(2, '0')} · {CHAPTER_LABELS[s.chapter]}
              </span>
              <span className="font-display text-h2 text-balance">{SCENE_WORDS[s.id]}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Cta id="home.story.design" intent="designer" href="/box-designer" size="lg" arrow>
            {STORY_CTA.design}
          </Cta>
          <Cta id="home.story.quote" intent="quote" href="/quote?src=home.story.quote" size="lg" variant="secondary">
            {STORY_CTA.quote}
          </Cta>
        </div>
      </div>
    </Section>
  );
}
