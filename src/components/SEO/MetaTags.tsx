/**
 * MetaTags Component
 * Reusable component for rendering HTML meta tags
 */

import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, OG_DEFAULTS, TWITTER_DEFAULTS } from '@/seo/config';
import { MetaTagsProps } from '@/types/seo';
import { buildFullTitle, canonicalFor, resolveOgImageUrl } from '@/seo/meta';

/** Allows large image previews and full snippets in search results */
const ROBOTS_INDEX = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

export const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  image = SEO_CONFIG.defaultImage,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
  nofollow = false,
}) => {
  const fullTitle = buildFullTitle(title);

  // Canonical: always absolute, never carries a query string or hash (?utm_*, ?template=, ?style= must not
  // become the canonical URL). Falls back to the current path when a page does not pass one.
  const canonicalUrl = canonicalFor(canonical || (typeof window !== 'undefined' ? window.location.pathname : '/'));

  // Share image: only files that really exist are used (see src/seo/meta.ts), else the default image
  const imageUrl = resolveOgImageUrl(image);

  // Robots directive
  const robotsContent = noindex || nofollow
    ? `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`
    : ROBOTS_INDEX;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* Language */}
      <html lang={SEO_CONFIG.defaultLanguage} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content={String(OG_DEFAULTS.imageWidth)} />
      <meta property="og:image:height" content={String(OG_DEFAULTS.imageHeight)} />
      <meta property="og:site_name" content={OG_DEFAULTS.siteName} />
      <meta property="og:locale" content={OG_DEFAULTS.locale} />
      
      {/* Article specific OG tags */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && (
            <meta property="article:author" content={author} />
          )}
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={TWITTER_DEFAULTS.card} />
      <meta name="twitter:site" content={TWITTER_DEFAULTS.site} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {author && <meta name="twitter:creator" content={author} />}
      
      {/* Additional SEO Tags */}
      <meta name="author" content={author || SEO_CONFIG.organizationName} />
      <meta name="publisher" content={SEO_CONFIG.organizationName} />
      
      
      {/* Verification (when available) */}
      {SEO_CONFIG.googleSiteVerification && (
        <meta name="google-site-verification" content={SEO_CONFIG.googleSiteVerification} />
      )}
      {SEO_CONFIG.bingVerification && (
        <meta name="msvalidate.01" content={SEO_CONFIG.bingVerification} />
      )}
    </Helmet>
  );
};

export default MetaTags;
