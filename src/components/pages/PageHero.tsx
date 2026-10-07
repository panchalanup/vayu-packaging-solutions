/** Inner-page hero (paper): mono index, H1 in Clash Display, lead, optional actions and a side slot */

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/site/Section';
import { reveal } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  /** Analytics section name (also names the CTAs inside) */
  name?: string;
  index: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  /** Extra content under the actions (fact strip, breadcrumb note) */
  footer?: ReactNode;
  /** Right-hand column (image, illustration) */
  aside?: ReactNode;
  className?: string;
}

export function PageHero({ name = 'hero', index, title, lead, actions, footer, aside, className }: PageHeroProps) {
  return (
    <Section name={name} aria-labelledby="page-title" className={cn('pb-12 pt-10 md:pb-16 md:pt-16', className)}>
      <div className={cn('mx-auto grid max-w-content grid-cols-1 gap-10 px-4 md:px-6 lg:px-10', aside && 'lg:grid-cols-12 lg:items-center lg:gap-12')}>
        <motion.div {...reveal} className={cn(aside && 'lg:col-span-7')}>
          <p className="label-mono mb-4 text-muted-foreground">{index}</p>
          <h1 id="page-title" className="max-w-[20ch] font-display text-display-l text-balance">
            {title}
          </h1>
          {lead && <p className="mt-5 max-w-[62ch] text-body-l text-muted-foreground">{lead}</p>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
          {footer && <div className="mt-8">{footer}</div>}
        </motion.div>
        {aside && <div className="lg:col-span-5">{aside}</div>}
      </div>
    </Section>
  );
}
