import { motion } from 'framer-motion';
import type { ScoredResult, UserInput } from '@/types/packaging';
import { DUR, EASE, STAGGER } from '@/lib/motion/tokens';
import { useSiteTier } from '@/lib/motion/siteTier';
import { Cta } from '@/components/site/Cta';
import { ResultCard } from './ResultCard';
import { PRICE_NOTE } from './pricing';

interface ResultsOverviewProps {
  results: ScoredResult[];
  input: UserInput;
}

export function ResultsOverview({ results, input }: ResultsOverviewProps) {
  const site = useSiteTier();
  const animate = !site.reducedMotion && site.tier !== 'low';

  if (results.length === 0) {
    return (
      <div role="status" className="rounded-lg border border-border bg-card p-6 md:p-8">
        <h3 className="font-display text-h3">No close match found</h3>
        <p className="mt-2 text-muted-foreground">We could not match those details. Try one of these:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Remove the weight or size</li>
          <li>Pick a different transport type</li>
          <li>Remove the maximum price</li>
        </ul>
        <p className="mt-4 text-sm">Or ask us directly, we will spec it by hand.</p>
        <Cta id="finder.nomatch.quote" intent="quote" href="/quote?src=finder.nomatch" arrow className="mt-4">
          Get a quote
        </Cta>
      </div>
    );
  }

  return (
    <div>
      <p className="max-w-[68ch] text-sm text-muted-foreground">
        {PRICE_NOTE} Share these specs with your supplier, check them against your product, and test a sample before a bulk order.
      </p>
      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {results.map((result, index) => (
          <motion.li
            key={result.id}
            initial={animate ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.slow, ease: EASE.paper, delay: index * STAGGER * 2 }}
            className="min-w-0"
          >
            <ResultCard result={result} input={input} index={index} />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
