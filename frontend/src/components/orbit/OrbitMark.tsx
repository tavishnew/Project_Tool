import { cn } from "@/lib/utils";

export function OrbitMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 rounded-full border-2"
        style={{
          borderColor: "hsl(var(--primary) / 0.4)",
          animation: "orbit-rotate 14s linear infinite",
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          backgroundColor: "hsl(var(--primary))",
          width: size * 0.28,
          height: size * 0.28,
          animation: "orbit-pulse 2.4s ease-in-out infinite",
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          backgroundColor: "hsl(var(--primary) / 0.7)",
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