import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GridNoiseBackground({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid-noise-bg min-h-svh", className)}>
      <div className="noise-overlay" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}
