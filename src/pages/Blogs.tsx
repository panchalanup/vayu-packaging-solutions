import { useState } from "react";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import BlogCard from "@/components/BlogCard";
import CategoryFilter from "@/components/CategoryFilter";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { BLOG_POSTS, getBlogsByCategory, BlogCategory } from "@/constants/blogs";

const Blogs = () => {
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('All');
  const filteredBlogs = getBlogsByCategory(activeCategory);

  return (
    <Layout>
      <PageTransition>
        {/* Hero Section */}
        <section className="pt-6 sm:pt-8 md:pt-10 pb-10 md:pb-12 section-dark">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
              </div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
                Knowledge Hub
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                Corrugated Packaging Insights & Guides
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                Expert insights on choosing the right packaging, understanding quality standards, and making informed decisions for your business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter - Sticky */}
        <section className="sticky top-[72px] z-40 py-6 border-b border-border bg-background/95 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-6">
            <CategoryFilter 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory}
            />
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6">
            {/* Results count */}
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <p className="text-muted-foreground text-sm font-medium">
                {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'}
                {activeCategory !== 'All' && ` in ${activeCategory}`}
              </p>
            </motion.div>

            {/* Blog Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((post, index) => (
                <BlogCard key={post.slug} post={post} index={index} />
              ))}
            </div>

            {/* Empty State */}
            {filteredBlogs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                  No articles found
                </h3>
                <p className="text-muted-foreground">
                  Try selecting a different category to explore more content.
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 section-dark">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Need expert guidance on your packaging?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Our team is here to help you choose the perfect corrugated packaging solutions for your business needs.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all"
              >
                Get Expert Consultation
              </a>
            </motion.div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Blogs;
