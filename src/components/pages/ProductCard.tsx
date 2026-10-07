/** Product card for the /products grid: image slot, badge, key spec line, Get price and Details links */

import { Link } from 'react-router-dom';
import { MadeSourcedBadge } from '@/components/site/Blocks';
import { Cta } from '@/components/site/Cta';
import { ImageSlot } from '@/components/site/ImageSlot';
import { moqLabel, productPath, type Product } from '@/content/products';
import { quoteHref } from '@/lib/quotePrefill';

export function ProductCard({ product }: { product: Product }) {
  const { slug, name } = product;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-[border-color,box-shadow] duration-quick ease-paper hover:border-foreground/30 hover:shadow-paper">
      {/* Decorative duplicate of the title link, so the image is clickable without a second tab stop */}
      <Link to={productPath(slug)} tabIndex={-1} aria-hidden="true" className="block">
        <ImageSlot
          slot={product.image}
          aspect="4 / 3"
          className="bg-paper-200"
          imgClassName="transition-transform duration-slow ease-paper group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <MadeSourcedBadge kind={product.madeOrSourced} className="self-start" />
        <h3 className="mt-3 font-display text-h3 font-semibold">
          <Link to={productPath(slug)} className="hover:underline focus-visible:underline">
            {name}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{product.short}</p>
        <p className="mt-4 font-mono text-[0.8125rem] font-medium leading-snug text-foreground/80">{product.keySpec}</p>
        <p className="tabular mt-1 text-sm text-muted-foreground">
          {moqLabel(product)} · {product.leadTime}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-1 pt-5">
          <Cta
            id={`products.card.${slug}.quote`}
            intent="quote"
            variant="link"
            className="py-2 font-semibold"
            href={quoteHref({ product: product.quoteProduct, src: `products.${slug}` })}
            meta={{ product: slug }}
            arrow
          >
            Get price
          </Cta>
          <Cta
            id={`products.card.${slug}.details`}
            intent="navigate"
            variant="link"
            className="py-2 text-foreground"
            href={productPath(slug)}
            meta={{ product: slug }}
            aria-label={`Details: ${name}`}
          >
            Details
          </Cta>
        </div>
      </div>
    </article>
  );
}
