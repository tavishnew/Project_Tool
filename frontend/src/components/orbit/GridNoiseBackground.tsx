import { cn } from "@/lib/utils";

export function GridNoiseBackground({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid-noise-bg absolute inset-0 pointer-events-none opacity-30",
        className,
      )}
      aria-hidden="true"
    />
  );
}