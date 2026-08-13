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
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.max(0, Math.min(1, value));
  const percent = Math.round(normalizedValue * 100);

  return (
    <svg
      data-testid="progress-ring"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${percent}% complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - normalizedValue)}
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
