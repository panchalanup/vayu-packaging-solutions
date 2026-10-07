import { motion } from "framer-motion";
import { ReactNode } from "react";

// Quiet 150 ms fade (§8.3). No exit animation: routes are no longer wrapped in AnimatePresence.
const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, ease: "easeOut" }}>
    {children}
  </motion.div>
);

export default PageTransition;
