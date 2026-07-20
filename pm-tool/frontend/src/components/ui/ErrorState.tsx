export default function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="tick-frame rounded-sm border border-brick/40 bg-surface px-8 py-12 text-center shadow-card"
    >
      <p className="mb-1 font-display text-lg text-ink">{title}</p>
      <p className="mb-5 text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-sm bg-pine px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-pine-dark active:translate-y-px focus-ring"
        >
          Try again
        </button>
      )}
    </div>
  );
}
