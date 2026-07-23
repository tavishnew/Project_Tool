import { useRef, useState, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  const [hovering, setHovering] = useState(false);

  function move(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setMx(e.clientX - r.left);
    setMy(e.clientY - r.top);
  }

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors",
        className,
      )}
    >
      {hovering && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(280px circle at ${mx}px ${my}px, oklch(0.68 0.19 32 / 0.08), transparent 60%)`,
            transition: "background 0.1s ease-out",
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}