import { cn } from "@/lib/utils";

export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  color = "var(--color-primary)",
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const percent = Math.round(pct * 100);
  return (
    <svg
<<<<<<< HEAD
      width={size}
      height={size}
      className="shrink-0"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${percent}% complete`}
=======
      data-testid="progress-ring"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
>>>>>>> 2766c08 (final updates)
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 400ms ease" }}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground"
        style={{ fontSize: size * 0.26, fontWeight: 600, fontFamily: "var(--font-display)" }}
      >
        {percent}%
      </text>
    </svg>
  );
}