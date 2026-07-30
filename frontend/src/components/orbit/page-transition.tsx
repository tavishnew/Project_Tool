import { motion, AnimatePresence } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        data-testid="page-transition"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}