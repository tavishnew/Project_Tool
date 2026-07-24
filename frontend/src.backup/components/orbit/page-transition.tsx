import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const key = useLocation().pathname;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
