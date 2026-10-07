import { describe, expect, it } from 'vitest';
import { classifyHref, isSafeImageSrc, looksLikeHtmlShell, splitAtMidHeading, stripFrontmatter, stripLeadingTitle } from '../blogMarkdown';

describe('blogMarkdown', () => {
  it('strips LF and CRLF frontmatter', () => {
    expect(stripFrontmatter('---\ntitle: x\n---\n# Hi')).toBe('# Hi');
    expect(stripFrontmatter('---\r\ntitle: x\r\n---\r\n# Hi')).toBe('# Hi');
    expect(stripFrontmatter('# No frontmatter')).toBe('# No frontmatter');
  });

  it('removes the duplicate leading title, including regex characters', () => {
    expect(stripLeadingTitle('# GSM (A+B)?\n\nBody', 'GSM (A+B)?')).toBe('Body');
    expect(stripLeadingTitle('Body only', 'Anything')).toBe('Body only');
  });

  it('detects an index.html shell served in place of a missing file', () => {
    expect(looksLikeHtmlShell('<!doctype html><html></html>')).toBe(true);
    expect(looksLikeHtmlShell('  <html lang="en">')).toBe(true);
    expect(looksLikeHtmlShell('# Heading')).toBe(false);
  });

  it('only allows site-relative and https image sources', () => {
    expect(isSafeImageSrc('/images/a.png')).toBe(true);
    expect(isSafeImageSrc('https://example.com/a.png')).toBe(true);
    expect(isSafeImageSrc('//evil.example/a.png')).toBe(false);
    expect(isSafeImageSrc('http://example.com/a.png')).toBe(false);
    expect(isSafeImageSrc('javascript:alert(1)')).toBe(false);
    expect(isSafeImageSrc('data:image/svg+xml;base64,AAAA')).toBe(false);
    expect(isSafeImageSrc('/a b.png')).toBe(false);
    expect(isSafeImageSrc(undefined)).toBe(false);
  });

  it('classifies link targets and drops unsafe schemes', () => {
    expect(classifyHref('/products')).toBe('internal');
    expect(classifyHref('#section')).toBe('anchor');
    expect(classifyHref('https://example.com')).toBe('external');
    expect(classifyHref('mailto:a@b.co')).toBe('contact');
    expect(classifyHref('//evil.example')).toBe('unsafe');
    expect(classifyHref('javascript:alert(1)')).toBe('unsafe');
    expect(classifyHref('JaVaScRiPt:alert(1)')).toBe('unsafe');
    expect(classifyHref('http://example.com')).toBe('unsafe');
  });

  it('splits at the middle section heading and ignores headings inside code fences', () => {
    const md = ['## A', 'x', '## B', 'x', '```', '## not a heading', '```', '## C', 'x', '## D', 'x'].join('\n');
    const [first, second] = splitAtMidHeading(md);
    expect(first.startsWith('## A')).toBe(true);
    expect(second.startsWith('## C')).toBe(true);
    expect(splitAtMidHeading('## A\n## B\n## C')).toHaveLength(1);
  });
});
