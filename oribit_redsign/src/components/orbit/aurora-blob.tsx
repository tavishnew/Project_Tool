"use client";
import { motion } from "framer-motion";

export function AuroraBlob({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <motion.div
        className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.16 32 / 0.28), transparent 60%)",
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.10 60 / 0.32), transparent 60%)",
        }}
        animate={{ x: [0, -30, 30, 0], y: [0, 20, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
