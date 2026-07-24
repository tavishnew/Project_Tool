import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function OrbitMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-primary/40"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="absolute rounded-full bg-primary"
        style={{ width: size * 0.28, height: size * 0.28 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <span
        className="absolute rounded-full bg-primary/70"
        style={{
          width: size * 0.14,
          height: size * 0.14,
          top: 0,
          left: "50%",
          transform: "translate(-50%, -30%)",
        }}
      />
    </div>
  );
}
