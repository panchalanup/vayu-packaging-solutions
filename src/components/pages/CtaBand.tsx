/** Closing CTA band (ink). Children are Cta components. */

import type { ReactNode } from 'react';
import { Section } from '@/components/site/Section';

interface CtaBandProps {
  name?: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  note?: ReactNode;
}

export function CtaBand({ name = 'cta', title, lead, children, note }: CtaBandProps) {
  return (
    <Section name={name} theme="ink" aria-labelledby={`${name}-heading`} className="section-y">
      <div className="mx-auto grid max-w-content gap-8 px-4 md:px-6 lg:grid-cols-12 lg:items-end lg:px-10">
        <div className="lg:col-span-7">
          <h2 id={`${name}-heading`} className="font-display text-display-l text-balance">
            {title}
          </h2>
          {lead && <p className="mt-4 max-w-[58ch] text-body-l text-muted-foreground">{lead}</p>}
        </div>
        <div className="lg:col-span-5">
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">{children}</div>
          {note && <p className="mt-4 text-sm text-muted-foreground lg:text-right">{note}</p>}
        </div>
      </div>
    </Section>
  );
}
