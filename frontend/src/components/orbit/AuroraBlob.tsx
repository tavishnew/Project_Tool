import { cn } from "@/lib/utils";

export function AuroraBlob({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      <div
        className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.19 32 / 0.28), transparent 60%)",
          animation: "aurora-drift-1 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.10 60 / 0.32), transparent 60%)",
          animation: "aurora-drift-2 22s ease-in-out infinite",
        }}
      />
    </div>
  );
}