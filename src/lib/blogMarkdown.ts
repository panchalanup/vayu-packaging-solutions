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

// ---------------------------------------------------------------------------------------------------------------
// SEO helpers (shared by the blog page, the build-time prerender and the SEO tests). Pure string functions.
// ---------------------------------------------------------------------------------------------------------------

/** Plain text of a markdown fragment: links keep their label, images and formatting marks are dropped */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, ' ')
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const countWords = (markdown: string): number => {
  const text = markdownToPlainText(markdown);
  return text ? text.split(' ').length : 0;
};

/** Reading time at 220 words per minute (never below 1) */
export const readingMinutes = (markdown: string): number => Math.max(1, Math.round(countWords(markdown) / 220));

export interface MarkdownHeading {
  level: 2 | 3;
  text: string;
}

/** "##" and "###" headings outside code fences */
export function extractHeadings(markdown: string): MarkdownHeading[] {
  const out: MarkdownHeading[] = [];
  let fence = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    else if (!fence) {
      const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
      if (m) out.push({ level: m[1].length as 2 | 3, text: markdownToPlainText(m[2]) });
    }
  }
  return out;
}

export interface MarkdownFaq {
  question: string;
  answer: string;
}

const FAQ_HEADING = /^##\s+(frequently asked questions|faqs?|common questions|questions and answers)\s*$/i;

/**
 * Question and answer pairs from an article's FAQ section: a "## Frequently asked questions" heading followed by
 * "### Question" headings, each with answer paragraphs. Answers are plain text (what FAQPage schema expects).
 */
export function extractFaqs(markdown: string): MarkdownFaq[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((l) => FAQ_HEADING.test(l.trim()));
  if (start < 0) return [];
  const faqs: MarkdownFaq[] = [];
  let question = '';
  let answer: string[] = [];
  const flush = () => {
    const text = markdownToPlainText(answer.join('\n'));
    if (question && text) faqs.push({ question, answer: text });
    question = '';
    answer = [];
  };
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line) || /^---+\s*$/.test(line.trim())) break;
    const q = /^###\s+(.+?)\s*$/.exec(line);
    if (q) {
      flush();
      question = markdownToPlainText(q[1]);
    } else if (question) answer.push(line);
  }
  flush();
  return faqs;
}

export interface MarkdownImage {
  alt: string;
  src: string;
}

/** Markdown images, ![alt](src), outside code fences */
export function extractImages(markdown: string): MarkdownImage[] {
  return [...markdown.replace(/```[\s\S]*?```/g, '').matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => ({ alt: m[1].trim(), src: m[2] }));
}

/** Site-internal link targets (path only, without hash or query) */
export function extractInternalLinks(markdown: string): string[] {
  const body = markdown.replace(/```[\s\S]*?```/g, '');
  return [...body.matchAll(/(?<!!)\[[^\]]*\]\((\/[^)\s#?]*)[^)]*\)/g)].map((m) => m[1].replace(/\/$/, '') || '/');
}

/** Heading text to an anchor id: lowercase [a-z0-9-], at most 60 characters */
export const slugifyHeading = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'section';

/** Hands out unique heading ids in document order ("intro", "intro-2", ...). One instance per rendered article. */
export function createHeadingIds(): (text: string) => string {
  const used = new Set<string>();
  return (text: string) => {
    const base = slugifyHeading(text);
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  };
}
