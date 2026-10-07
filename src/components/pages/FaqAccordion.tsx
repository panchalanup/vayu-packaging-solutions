/** Visible FAQ list. Pair it with <StructuredData type="FAQPage" data={getFAQSchema(items)} /> using the SAME items. */

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items, idPrefix, className }: { items: readonly FaqItem[]; idPrefix: string; className?: string }) {
  return (
    <Accordion type="single" collapsible className={cn('border-t border-border', className)}>
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={`${idPrefix}-${i}`} className="border-border">
          <AccordionTrigger className="min-h-14 text-left text-base font-semibold hover:no-underline md:text-lg">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="max-w-[68ch] text-base text-muted-foreground">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
