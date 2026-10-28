/**
 * Internal link audit for the blog: how many internal links each article carries and which articles nothing links to.
 * Pure function over markdown, shared by the SEO test and the report script (npm run seo:report).
 */

import { extractInternalLinks } from '@/lib/blogMarkdown';

export interface PostLinkStats {
  slug: string;
  /** Distinct internal link targets inside the article body */
  outbound: string[];
  /** Distinct other articles linking to this one from their body */
  inbound: string[];
  /** Links to other articles / to designer pages / to other site pages (quote, products...) */
  toPosts: number;
  toDesigner: number;
  toOther: number;
}

export interface LinkAudit {
  posts: PostLinkStats[];
  /** Fewer than `minLinks` distinct internal links */
  thin: PostLinkStats[];
  /** No other article links to them (they are still reachable from the blog index, footer and related lists) */
  orphans: PostLinkStats[];
  /** Links to /blogs/<slug> that do not exist */
  broken: { from: string; to: string }[];
}

export function auditBlogLinks(markdownBySlug: Record<string, string>, minLinks = 3): LinkAudit {
  const slugs = Object.keys(markdownBySlug);
  const known = new Set(slugs);
  const outbound = new Map<string, string[]>();
  const broken: LinkAudit['broken'] = [];
  for (const slug of slugs) {
    const targets = [...new Set(extractInternalLinks(markdownBySlug[slug]).filter((t) => t !== `/blogs/${slug}`))];
    outbound.set(slug, targets);
    for (const t of targets) {
      const m = /^\/blogs\/([^/]+)$/.exec(t);
      if (m && !known.has(m[1])) broken.push({ from: slug, to: t });
    }
  }
  const posts: PostLinkStats[] = slugs.map((slug) => {
    const out = outbound.get(slug) ?? [];
    return {
      slug,
      outbound: out,
      inbound: slugs.filter((s) => s !== slug && (outbound.get(s) ?? []).includes(`/blogs/${slug}`)),
      toPosts: out.filter((t) => /^\/blogs\/[^/]+$/.test(t)).length,
      toDesigner: out.filter((t) => t.startsWith('/box-designer')).length,
      toOther: out.filter((t) => !/^\/blogs\/[^/]+$/.test(t) && !t.startsWith('/box-designer')).length,
    };
  });
  return { posts, thin: posts.filter((p) => p.outbound.length < minLinks), orphans: posts.filter((p) => p.inbound.length === 0), broken };
}
