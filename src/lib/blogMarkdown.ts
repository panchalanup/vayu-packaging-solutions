/**
 * Helpers for rendering blog markdown safely.
 * SECURITY: article files are first-party static content in /public/content/blogs, but the renderer still
 * treats them as untrusted: URLs are allow-listed by scheme, and anything else is dropped instead of rendered.
 * Keep this file free of "@/" imports so it stays trivially testable.
 */

/** Removes a leading YAML frontmatter block (LF or CRLF) */
export function stripFrontmatter(text: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

/** Removes a leading "# {title}" line, because the page already renders the title as its H1 */
export function stripLeadingTitle(markdown: string, title: string): string {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return markdown.replace(new RegExp(`^\\s*#\\s+${escaped}\\s*\\r?\\n+`, 'i'), '');
}

/** A missing file on a single-page-app host often comes back as the index.html shell with status 200 */
export const looksLikeHtmlShell = (text: string): boolean => /^\s*<(!doctype|html)/i.test(text);

const hasControlOrSpace = (value: string) => /[\s\u0000-\u001f\u007f]/.test(value);

/** Site-relative path (not protocol-relative) or https. No data:, javascript: or http: images. */
export function isSafeImageSrc(src: string | undefined): src is string {
  if (!src || hasControlOrSpace(src)) return false;
  return (src.startsWith('/') && !src.startsWith('//')) || /^https:\/\/[^/]/i.test(src);
}

export type LinkKind = 'internal' | 'anchor' | 'external' | 'contact' | 'unsafe';

export function classifyHref(href: string | undefined): LinkKind {
  if (!href || hasControlOrSpace(href)) return 'unsafe';
  if (href.startsWith('#')) return 'anchor';
  if (href.startsWith('/') && !href.startsWith('//')) return 'internal';
  if (/^https:\/\/[^/]/i.test(href)) return 'external';
  if (/^(mailto:|tel:)/i.test(href)) return 'contact';
  return 'unsafe';
}

/**
 * Splits markdown at the middle "## " heading (ignoring headings inside code fences) so a card can sit
 * mid-article. Returns a single part when there are fewer than 4 sections.
 */
export function splitAtMidHeading(markdown: string): string[] {
  const lines = markdown.split('\n');
  const headingLines: number[] = [];
  let fence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    else if (!fence && /^##\s+\S/.test(line)) headingLines.push(i);
  });
  if (headingLines.length < 4) return [markdown];
  const at = headingLines[Math.floor(headingLines.length / 2)];
  return [lines.slice(0, at).join('\n'), lines.slice(at).join('\n')];
}
