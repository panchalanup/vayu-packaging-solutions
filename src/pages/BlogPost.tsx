import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import ShareButtons from "@/components/ShareButtons";
import BlogCard from "@/components/BlogCard";
import ReadingProgress from "@/components/ReadingProgress";
import TableOfContents from "@/components/TableOfContents";
import ScrollToTop from "@/components/ScrollToTop";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { getBlogBySlug, getRelatedBlogs, BLOG_AUTHOR } from "@/constants/blogs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import '@/styles/blog.css';
import { MetaTags, StructuredData } from '@/seo';
import { BLOG_SEO_METADATA } from '@/seo/metadata/blogs';
import { getArticleSchema, getBlogBreadcrumbs, getBreadcrumbSchema } from '@/seo/schema';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const post = slug ? getBlogBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedBlogs(slug, 3) : [];

  useEffect(() => {
    const loadContent = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/content/blogs/${slug}.md`);
        const text = await response.text();
        
        // Remove frontmatter (content between --- markers)
        const contentWithoutFrontmatter = text.replace(/^---[\s\S]*?---\n/, '');
        setContent(contentWithoutFrontmatter);
      } catch (error) {
        console.error('Error loading blog content:', error);
        setContent('# Content Loading Error\n\nUnable to load blog content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blogs" replace />;
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const currentUrl = `${window.location.origin}/blogs/${post.slug}`;
  const seoData = slug ? BLOG_SEO_METADATA[slug] : undefined;

  return (
    <Layout>
      {/* SEO Meta Tags */}
      {seoData && (
        <>
          <MetaTags 
            title={post.title}
            description={seoData.metaDescription}
            keywords={seoData.keywords}
            type="article"
            publishedTime={post.date}
            author={post.author}
            image={seoData.ogImage}
          />
          
          {/* Structured Data - Schema.org */}
          <StructuredData type="Article" data={getArticleSchema(post)} />
          <StructuredData 
            type="BreadcrumbList" 
            data={getBreadcrumbSchema(getBlogBreadcrumbs(post.title, post.slug))} 
          />
        </>
      )}
      
      {/* Reading Progress Indicator */}
      <ReadingProgress />
      {/* Scroll to Top Button */}
      <ScrollToTop />
      
      <PageTransition>
        {/* Breadcrumb & Back Button */}
        <section className="pt-6 pb-4 border-b border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <Link 
              to="/blogs"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </section>

        {/* Blog Header */}
        <section className="pt-8 pb-6">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category Badge */}
              <div className="mb-5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-6 bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime}</span>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="pb-6 border-b border-border">
                <ShareButtons 
                  url={currentUrl}
                  title={post.title}
                  description={post.description}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-8">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Table of Contents - Shows on both mobile and desktop */}
            {!loading && content && <TableOfContents content={content} />}
            
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="medium-article"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // Wrap tables in scrollable container
                    table: ({ node, children, ...props }) => (
                      <div className="table-wrapper">
                        <table {...props}>{children}</table>
                      </div>
                    ),
                    // Custom image rendering to handle placeholders
                    img: ({ node, ...props }) => {
                      // Check if it's a placeholder comment
                      return (
                        <div className="my-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                              <svg className="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-sm font-mono text-primary/70 mb-2">📷 Image Placeholder</p>
                            <p className="text-xs text-muted-foreground">
                              Image will be added here - see IMAGE_GUIDE.md for specifications
                            </p>
                          </div>
                        </div>
                      );
                    },
                    // Enhance links to open external links in new tab
                    a: ({ node, href, children, ...props }) => {
                      const isExternal = href?.startsWith('http');
                      const isInternal = href?.startsWith('/');
                      
                      if (isExternal) {
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                            {children}
                          </a>
                        );
                      }
                      
                      if (isInternal) {
                        return (
                          <Link to={href} {...props}>
                            {children}
                          </Link>
                        );
                      }
                      
                      return <a href={href} {...props}>{children}</a>;
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </motion.article>
            )}
          </div>
        </section>

        {/* Share Again at Bottom */}
        <section className="py-8 border-y border-border">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="font-semibold text-foreground mb-1">Found this article helpful?</p>
                <p className="text-sm text-muted-foreground">Share it with your network!</p>
              </div>
              <ShareButtons 
                url={currentUrl}
                title={post.title}
                description={post.description}
              />
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 md:py-16 section-dark">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto mb-10">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Related Articles
                </h2>
                <p className="text-muted-foreground">
                  Continue exploring more insights in {post.category}
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {relatedPosts.map((relatedPost, index) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to discuss your packaging needs?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Our packaging experts are here to help you find the perfect solutions for your business.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default BlogPost;
