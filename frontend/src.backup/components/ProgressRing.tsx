interface ProgressRingProps {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

export default function ProgressRing({
  value,
  size = 40,
  stroke = 4,
  color = 'var(--accent)',
  label,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;
  return (
    <span className="ring" style={{ width: size, height: size }} title={`${Math.round(clamped)}%`}>
      <svg width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      {label != null && <span className="ring-label">{label}</span>}
    </span>
  );
}
