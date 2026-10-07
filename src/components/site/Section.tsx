import { createContext, forwardRef, useContext, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const SectionContext = createContext<string>('page');

export const useSectionName = () => useContext(SectionContext);

/** Names a non-section region (nav, footer) for Cta analytics */
export const SectionNameProvider = SectionContext.Provider;

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Analytics section name, e.g. "hero" */
  name: string;
  theme?: 'paper' | 'ink' | 'kraft';
  children: ReactNode;
}

/** A page section that tells every Cta inside it which section it belongs to, and sets its colour theme */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { name, theme = 'paper', className, children, ...rest },
  ref
) {
  return (
    <SectionContext.Provider value={name}>
      <section ref={ref} data-theme={theme} data-section={name} className={cn('relative', className)} {...rest}>
        {children}
      </section>
    </SectionContext.Provider>
  );
});
