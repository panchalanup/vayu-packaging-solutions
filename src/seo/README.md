# SEO Module Documentation

## Overview

This SEO module provides a comprehensive, type-safe, and maintainable SEO implementation for the Vayu Packaging Solutions website. It includes meta tags, Open Graph, Twitter Cards, and Schema.org structured data.

## Folder Structure

```
src/seo/
├── config.ts                    # Central SEO configuration
├── index.ts                     # Main export file
├── metadata/
│   ├── pages.ts                # Page-specific meta tags
│   └── blogs.ts                # Blog SEO metadata
├── schema/
│   ├── organization.ts         # Organization schema
│   ├── localBusiness.ts        # Local business schema
│   ├── article.ts              # Article/blog schema
│   ├── product.ts              # Product schema
│   ├── breadcrumb.ts           # Breadcrumb schema
│   ├── faq.ts                  # FAQ schema
│   └── index.ts                # Schema exports
```

## Quick Start

### 1. Basic Page SEO

```tsx
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getOrganizationSchema, PAGE_BREADCRUMBS, getBreadcrumbSchema } from '@/seo/schema';

const HomePage = () => {
  return (
    <Layout>
      {/* Meta Tags */}
      <MetaTags {...PAGE_METADATA.home} />
      
      {/* Structured Data */}
      <StructuredData type="Organization" data={getOrganizationSchema()} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.home)} />
      
      {/* Page Content */}
      <div>Home page content...</div>
    </Layout>
  );
};
```

### 2. Blog Post SEO

```tsx
import { MetaTags, StructuredData } from '@/seo';
import { BLOG_SEO_METADATA } from '@/seo/metadata/blogs';
import { getArticleSchema, getBlogBreadcrumbs, getBreadcrumbSchema } from '@/seo/schema';

const BlogPost = ({ post }) => {
  const seoData = BLOG_SEO_METADATA[post.slug];
  
  return (
    <Layout>
      {/* Meta Tags */}
      <MetaTags 
        title={post.title}
        description={seoData.metaDescription}
        keywords={seoData.keywords}
        type="article"
        publishedTime={post.date}
        author={post.author}
      />
      
      {/* Structured Data */}
      <StructuredData type="Article" data={getArticleSchema(post)} />
      <StructuredData 
        type="BreadcrumbList" 
        data={getBreadcrumbSchema(getBlogBreadcrumbs(post.title, post.slug))} 
      />
      
      {/* Blog Content */}
      <article>{post.content}</article>
    </Layout>
  );
};
```

### 3. Product Page SEO

```tsx
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { PRODUCT_SCHEMAS, getBreadcrumbSchema, PAGE_BREADCRUMBS } from '@/seo/schema';

const ProductsPage = () => {
  return (
    <Layout>
      {/* Meta Tags */}
      <MetaTags {...PAGE_METADATA.products} />
      
      {/* Structured Data */}
      <StructuredData type="Product" data={PRODUCT_SCHEMAS['3-ply']} />
      <StructuredData type="Product" data={PRODUCT_SCHEMAS['5-ply']} />
      <StructuredData type="Product" data={PRODUCT_SCHEMAS['7-ply']} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.products)} />
      
      {/* Products Content */}
      <div>Product listings...</div>
    </Layout>
  );
};
```

### 4. Adding FAQ Schema

```tsx
import { StructuredData } from '@/seo';
import { getFAQSchema, COMMON_FAQS } from '@/seo/schema';

const ProductsPage = () => {
  return (
    <Layout>
      {/* Other SEO tags... */}
      
      {/* FAQ Schema */}
      <StructuredData type="FAQPage" data={getFAQSchema(COMMON_FAQS.products)} />
      
      {/* FAQ Section in UI */}
      <section>
        <h2>Frequently Asked Questions</h2>
        {COMMON_FAQS.products.map(faq => (
          <div key={faq.question}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </section>
    </Layout>
  );
};
```

## Configuration

### Update SEO_CONFIG (`src/seo/config.ts`)

Update these values with your actual information:

```typescript
export const SEO_CONFIG = {
  siteUrl: 'https://vayupackaging.vercel.app', // Your actual domain
  foundingDate: '2020', // Your founding year
  googleAnalyticsId: 'G-XXXXXXXXXX', // Add when ready
  googleSiteVerification: 'your-verification-code', // Google Search Console
  bingVerification: 'your-bing-code', // Bing Webmaster
  // ... other configs
};
```

### Geo Coordinates

Update the coordinates in `src/seo/schema/localBusiness.ts`:

```typescript
geo: {
  '@type': 'GeoCoordinates',
  latitude: 23.0489,  // Update with actual
  longitude: 72.5075, // Update with actual
},
```

## Adding New Pages

### 1. Add Metadata

In `src/seo/metadata/pages.ts`:

```typescript
export const PAGE_METADATA: Record<string, PageMeta> = {
  // ... existing pages
  
  newPage: {
    title: 'Your Page Title - Vayu Packaging',
    description: 'Compelling description under 160 characters',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    ogImage: '/og-newpage.jpg',
  },
};
```

### 2. Add Breadcrumbs

In `src/seo/schema/breadcrumb.ts`:

```typescript
export const PAGE_BREADCRUMBS = {
  // ... existing breadcrumbs
  
  newPage: [
    { name: 'Home', url: '/' },
    { name: 'Your New Page', url: '/new-page' },
  ],
};
```

### 3. Use in Page Component

```tsx
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { PAGE_BREADCRUMBS, getBreadcrumbSchema } from '@/seo/schema';

const NewPage = () => {
  return (
    <Layout>
      <MetaTags {...PAGE_METADATA.newPage} />
      <StructuredData 
        type="BreadcrumbList" 
        data={getBreadcrumbSchema(PAGE_BREADCRUMBS.newPage)} 
      />
      
      {/* Your content */}
    </Layout>
  );
};
```

## Schema.org Types Available

1. **Organization** - For homepage and footer
2. **LocalBusiness** - For local SEO (contact page)
3. **Article** - For blog posts
4. **Product** - For product pages
5. **BreadcrumbList** - For all pages
6. **FAQPage** - For pages with FAQs

## SEO Best Practices Implemented

✅ **Unique titles and descriptions** for each page  
✅ **Keyword optimization** with focus keywords  
✅ **Structured data** for rich snippets  
✅ **Open Graph** for social sharing  
✅ **Twitter Cards** for Twitter sharing  
✅ **Canonical URLs** to avoid duplicate content  
✅ **Breadcrumbs** for navigation and SEO  
✅ **FAQ schema** for featured snippets  
✅ **Local business schema** for Google Maps  
✅ **Mobile optimization** meta tags  

## Testing Your SEO

### 1. Rich Results Test
https://search.google.com/test/rich-results

Paste your page URL to test structured data.

### 2. Open Graph Debugger
https://developers.facebook.com/tools/debug/

Test how your pages appear when shared on Facebook.

### 3. Twitter Card Validator
https://cards-dev.twitter.com/validator

Test Twitter card appearance.

### 4. Google Search Console
Add your site and monitor:
- Index coverage
- Core Web Vitals
- Mobile usability
- Structured data

## Common Issues & Solutions

### Issue: Helmet not working

**Solution:** Ensure HelmetProvider wraps your app in `main.tsx`:

```tsx
import { HelmetProvider } from 'react-helmet-async';

root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
```

### Issue: Schema validation errors

**Solution:** Test with Google's Rich Results Test and fix reported issues.

### Issue: Duplicate meta tags

**Solution:** Ensure only one `<MetaTags>` component per page.

## Next Steps

1. **Generate Sitemap** - Create XML sitemap for search engines
2. **Add Analytics** - Integrate Google Analytics 4
3. **Monitor Performance** - Set up Google Search Console
4. **Create Blog Content** - Regular SEO-optimized blog posts
5. **Build Backlinks** - Industry directories and partnerships
6. **Local Citations** - List on IndiaMART, JustDial, etc.

## Support

For questions or issues with the SEO implementation, check:
- This documentation
- Schema.org documentation: https://schema.org/
- Google Search Central: https://developers.google.com/search

---

**Last Updated:** January 2025  
**Version:** 1.0.0
