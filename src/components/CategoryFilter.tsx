import { motion } from "framer-motion";
import { BLOG_CATEGORIES, BlogCategory } from "@/constants/blogs";

interface CategoryFilterProps {
  activeCategory: BlogCategory;
  onCategoryChange: (category: BlogCategory) => void;
}

const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {BLOG_CATEGORIES.map((category, index) => (
        <motion.button
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onCategoryChange(category)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeCategory === category
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
          }`}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;
