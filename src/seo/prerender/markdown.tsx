/**
 * Build-time markdown renderer for the prerendered articles.
 * Same pipeline as the live page (react-markdown + remark-gfm + rehype-raw, same URL allow-lists), but renders to a
 * static HTML string with real <a href> links, heading ids, and width/height on images.
 * Never imported by the app entry, so react-dom/server never reaches the browser bundle.
 */

import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { classifyHref, createHeadingIds, isSafeImageSrc } from '@/lib/blogMarkdown';
import { blogImageSize } from '@/content/blogImageSizes';

/** Same list as src/pages/BlogPost.tsx */
const DISALLOWED = ['script', 'iframe', 'object', 'embed', 'style', 'form'];

export interface RenderedHeading {
  level: 2 | 3;
  text: string;
  id: string;
}

const textOf = (node: ReactNode): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (typeof node === 'object' && 'props' in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return '';
};

export function renderArticleHtml(markdown: string): { html: string; headings: RenderedHeading[]; imagesWithoutAlt: string[] } {
  const nextId = createHeadingIds();
  const headings: RenderedHeading[] = [];
  const imagesWithoutAlt: string[] = [];

  const heading = (level: 2 | 3) =>
    function Heading({ node: _node, children }: { node?: unknown; children?: ReactNode }) {
      const text = textOf(children).trim();
      const id = nextId(text);
      headings.push({ level, text, id });
      return level === 2 ? <h2 id={id}>{children}</h2> : <h3 id={id}>{children}</h3>;
    };

  const components: Components = {
    // The page title is the only H1; a stray "# " heading in an article becomes an H2 (as on the live page)
    h1: heading(2),
    h2: heading(2),
    h3: heading(3),
    table: ({ node: _node, children }) => (
      <div className="table-wrapper">
        <table>{children}</table>
      </div>
    ),
    img: ({ node: _node, src, alt }) => {
      if (!isSafeImageSrc(src)) return null;
      if (!alt || !alt.trim()) imagesWithoutAlt.push(src);
      const size = blogImageSize(src);
      return <img src={src} alt={alt ?? ''} width={size?.width} height={size?.height} loading="lazy" decoding="async" />;
    },
    a: ({ node: _node, href, children }) => {
      switch (classifyHref(href)) {
        case 'internal':
        case 'anchor':
        case 'contact':
          return <a href={href}>{children}</a>;
        case 'external':
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        default:
          return <span>{children}</span>;
      }
    },
  };

  const html = renderToStaticMarkup(
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} disallowedElements={DISALLOWED} components={components}>
      {markdown}
    </ReactMarkdown>,
  );
  return { html, headings, imagesWithoutAlt };
}
