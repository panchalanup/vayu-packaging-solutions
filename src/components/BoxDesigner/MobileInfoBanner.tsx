/**
 * Mobile Info Banner Component
 * Fixed top banner suggesting desktop experience for full features
 * Non-dismissible - always visible on mobile
 */

import { motion } from 'framer-motion';
import { Monitor } from 'lucide-react';

export default function MobileInfoBanner() {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full bg-paper-100 border-b border-kraft-300"
    >
      <div className="flex items-center justify-center px-4 py-2 gap-2.5">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-kraft-300/50 flex items-center justify-center">
          <Monitor className="w-4 h-4 text-kraft-700" />
        </div>
        {/* Message */}
        <p className="text-sm font-medium text-ink-900 leading-tight text-center">
          Tip: the desktop version gives you more control.
        </p>
      </div>
    </motion.div>
  );
}
