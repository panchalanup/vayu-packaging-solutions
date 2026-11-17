/** Closing CTA band (ink). Children are Cta components. */

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Section } from '@/components/site/Section';
import { Cta, type CtaProps } from '@/components/site/Cta';

interface CtaBandProps {
  name?: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  note?: ReactNode;
}

export function CtaBand({ name = 'cta', title, lead, children, note }: CtaBandProps) {
  return (
    <Section name={name} theme="ink" aria-labelledby={`${name}-heading`} className="ink-grain light-pools section-y">
      <div className="mx-auto grid max-w-content gap-8 px-4 md:px-6 lg:grid-cols-12 lg:items-end lg:px-10">
        <div className="lg:col-span-7">
          <h2 id={`${name}-heading`} className="font-display text-display-l text-balance">
            {title}
          </h2>
          {lead && <p className="mt-4 max-w-[58ch] text-body-l text-muted-foreground">{lead}</p>}
        </div>
        <div className="lg:col-span-5">
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {/* the travelling edge light goes on the first button only, and only when it is the filled primary one */}
            {Children.map(children, (child, i) =>
              i === 0 && isValidElement(child) && child.type === Cta && !(child.props as CtaProps).variant ? cloneElement(child as ReactElement<CtaProps>, { beam: true }) : child
            )}
          </div>
          {note && <p className="mt-4 text-sm text-muted-foreground lg:text-right">{note}</p>}
        </div>
      </div>
    </Section>
  );
}
