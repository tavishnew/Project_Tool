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
    <div className={cn("grid-noise-bg min-h-svh", className)} data-testid="grid-noise-bg">
      <div className="noise-overlay" aria-hidden />
      <div className="relative" data-testid="grid-noise-content">{children}</div>
    </div>
  );
}
