import { describe, expect, it } from 'vitest';
import { SEO_CONFIG } from '../config';
import { buildFullTitle, canonicalFor, compactTitle, resolveOgImagePath, TITLE_BUDGET } from '../meta';

describe('titles', () => {
  it('adds the brand when it fits and keeps titles with a separator as written', () => {
    expect(buildFullTitle('Flute types')).toBe(`Flute types | ${SEO_CONFIG.siteName}`);
    expect(buildFullTitle('A | B')).toBe('A | B');
  });

  it('drops the brand when the title would be too long, and shortens very long titles to their main clause', () => {
    const long = 'Understanding Different Types of Corrugated Boxes: A Complete Guide for Buyers and Packers';
    expect(compactTitle(long)).toBe('Understanding Different Types of Corrugated Boxes');
    const full = buildFullTitle(long);
    expect(full.length).toBeLessThanOrEqual(TITLE_BUDGET);
    expect(full).toBe('Understanding Different Types of Corrugated Boxes');
  });

  it('leaves short titles and titles that cannot be split alone', () => {
    expect(compactTitle('Short title')).toBe('Short title');
    const unsplittable = 'An extremely long title without any natural break that just keeps going and going on';
    expect(compactTitle(unsplittable)).toBe(unsplittable);
  });
});

describe('canonical URLs', () => {
  it('are absolute and never carry a query string, hash or trailing slash', () => {
    expect(canonicalFor('/box-designer?template=x&utm_source=blog#top')).toBe(`${SEO_CONFIG.siteUrl}/box-designer`);
    expect(canonicalFor('/blogs/x/')).toBe(`${SEO_CONFIG.siteUrl}/blogs/x`);
    expect(canonicalFor('/')).toBe(`${SEO_CONFIG.siteUrl}/`);
    expect(canonicalFor(`${SEO_CONFIG.siteUrl}/quote?src=a`)).toBe(`${SEO_CONFIG.siteUrl}/quote`);
  });
});

describe('share images', () => {
  it('only uses images that exist, else the default', () => {
    expect(resolveOgImagePath('/blog-images/uc-cake-og.png')).toBe('/blog-images/uc-cake-og.png');
    expect(resolveOgImagePath('/og/box-designer-mailer-box.png')).toBe('/og/box-designer-mailer-box.png');
    expect(resolveOgImagePath('/og-contact.jpg')).toBe(SEO_CONFIG.defaultImage);
    expect(resolveOgImagePath(undefined)).toBe(SEO_CONFIG.defaultImage);
  });
});
