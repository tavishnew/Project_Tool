import { useRef, useState, useEffect, MouseEvent } from "react";
import { cn } from "@/lib/utils";

export function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  function handleMove(e: MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setX((e.clientX - (r.left + r.width / 2)) * strength);
    setY((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function reset() {
    setX(0);
    setY(0);
  }

  return (
    <button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.68_0.19_32/0.55)] transition-colors hover:bg-primary/90",
        className,
      )}
    >
      {children}
    </button>
  );
}