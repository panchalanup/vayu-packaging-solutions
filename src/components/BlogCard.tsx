import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/constants/blogs';
import { useEventTracker } from '@/hooks/useAnalytics';
import { BLOG_IMAGES, BLOG_IMAGE_CREDITS } from '@/constants/images';
import { ImageCredit } from '@/components/site/ImageCredit';
import { reveal } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { CategoryChip, formatBlogDate } from './BlogMeta';

interface BlogCardProps {
  post: BlogPost;
  /** Kept for API compatibility; reveal is no longer staggered (§8.3, quiet motion) */
  index?: number;
  /** "featured" is the large first card on /blogs */
  variant?: 'default' | 'featured';
}

const BlogCard = ({ post, variant = 'default' }: BlogCardProps) => {
  const { trackEvent } = useEventTracker();
  const featured = variant === 'featured';
  const image = BLOG_IMAGES[post.thumbnail as keyof typeof BLOG_IMAGES] || BLOG_IMAGES.defaultThumbnail;
  const credit = BLOG_IMAGE_CREDITS[post.thumbnail as keyof typeof BLOG_IMAGE_CREDITS];

  const handleBlogClick = () => {
    // Non-personal analytics only
    trackEvent('blog_click', {
      blogTitle: post.title,
      blogSlug: post.slug,
      blogCategory: post.category,
      readingTime: post.readingTime,
      publishDate: post.date,
    });
  };

  return (
    <motion.article {...reveal} className="group h-full">
      <Link
        to={`/blogs/${post.slug}`}
        onClick={handleBlogClick}
        className={cn(
          'flex h-full overflow-hidden rounded-[14px] border border-border bg-card transition-[border-color,box-shadow] duration-quick ease-paper hover:border-foreground/30 hover:shadow-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          featured ? 'flex-col lg:flex-row' : 'flex-col'
        )}
      >
        <div className={cn('relative overflow-hidden bg-paper-200', featured ? 'aspect-[16/9] lg:aspect-auto lg:w-[55%]' : 'aspect-[16/9]')}>
          <img
            src={image}
            alt=""
            loading={featured ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-paper group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Plain text here: the whole card is a link and anchors cannot nest. The full credit link is on the article. */}
          {credit && <ImageCredit credit={credit} asText />}
        </div>

        <div className={cn('flex flex-1 flex-col p-5 sm:p-6', featured && 'lg:justify-center lg:p-10')}>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {featured && <span className="label-mono text-muted-foreground">Featured</span>}
            <CategoryChip category={post.category} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock aria-hidden="true" className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>

          <h3
            className={cn(
              'font-display font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4',
              featured ? 'text-h3 lg:text-h2 lg:leading-[1.1]' : 'line-clamp-3 text-h3'
            )}
          >
            {post.title}
          </h3>

          <p className={cn('mt-3 text-sm text-muted-foreground md:text-base', featured ? 'line-clamp-4' : 'line-clamp-2 flex-1')}>
            {post.description}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
            <time dateTime={post.date} className="tabular text-muted-foreground">
              {formatBlogDate(post.date)}
            </time>
            <span className="inline-flex items-center gap-1 font-semibold text-accent">
              Read article
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-quick ease-paper group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;
