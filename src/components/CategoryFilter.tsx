import { BLOG_CATEGORIES, BlogCategory } from '@/constants/blogs';
import { cn } from '@/lib/utils';
import { CATEGORY_META } from './BlogMeta';

interface CategoryFilterProps {
  activeCategory: BlogCategory;
  onCategoryChange: (category: BlogCategory) => void;
  /** Optional post count per category, shown in each chip */
  counts?: Partial<Record<BlogCategory, number>>;
  className?: string;
}

/** Toggle buttons (aria-pressed), one active at a time; scrolls sideways on phones instead of wrapping */
const CategoryFilter = ({ activeCategory, onCategoryChange, counts, className }: CategoryFilterProps) => (
  <div
    role="group"
    aria-label="Filter articles by category"
    className={cn('-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0', className)}
  >
    {BLOG_CATEGORIES.map((category) => {
      const { icon: Icon } = CATEGORY_META[category];
      const pressed = activeCategory === category;
      return (
        <button
          key={category}
          type="button"
          aria-pressed={pressed}
          onClick={() => onCategoryChange(category)}
          className={cn(
            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            pressed ? 'border-foreground bg-foreground text-background' : 'border-foreground/20 hover:border-foreground/50'
          )}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
          {category}
          {counts?.[category] !== undefined && <span className="tabular text-xs opacity-70">{counts[category]}</span>}
        </button>
      );
    })}
  </div>
);

export default CategoryFilter;
