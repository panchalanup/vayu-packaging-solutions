import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { BlogPost } from "@/constants/blogs";
import { useEventTracker } from "@/hooks/useAnalytics";
import { BLOG_IMAGES } from "@/constants/images";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

const BlogCard = ({ post, index }: BlogCardProps) => {
  const { trackEvent } = useEventTracker();
  
  // Format date
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleBlogClick = () => {
    trackEvent('blog_click', {
      blogTitle: post.title,
      blogSlug: post.slug,
      blogCategory: post.category,
      readingTime: post.readingTime,
      publishDate: post.date,
    });
  };

  // Category colors
  const categoryColors: Record<string, string> = {
    'Buying Guide': 'bg-blue-100 text-blue-700',
    'Technical Guide': 'bg-purple-100 text-purple-700',
    'Quality Standards': 'bg-green-100 text-green-700',
    'Industry Insights': 'bg-orange-100 text-orange-700',
  };

  const categoryColor = categoryColors[post.category] || 'bg-gray-100 text-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/blogs/${post.slug}`} onClick={handleBlogClick}>
        <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative aspect-[16/9] bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
            <img
              src={BLOG_IMAGES.defaultThumbnail}
              alt={BLOG_IMAGES.alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColor}`}>
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-heading text-lg font-bold text-foreground mb-2.5 line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2 flex-1">
              {post.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                Read More
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
