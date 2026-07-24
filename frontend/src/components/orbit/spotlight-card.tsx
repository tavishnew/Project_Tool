"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionValue, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MouseEvent } from "react";

export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, oklch(0.68 0.19 32 / 0.08), transparent 60%)`;

  function move(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  return (
    <div
      onMouseMove={move}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors",
        className,
      )}
    >
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: bg }} />
      <div className="relative">{children}</div>
    </div>
  );
}
