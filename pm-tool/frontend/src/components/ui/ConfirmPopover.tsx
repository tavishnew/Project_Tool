import { useEffect, useRef } from "react";

export default function ConfirmPopover({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onConfirm, onCancel]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="tick-frame absolute right-0 top-9 z-50 w-60 rounded-sm border border-line bg-surface p-3 shadow-pop"
    >
      <p className="mb-3 text-sm text-ink">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-sm px-2 py-1 text-sm text-muted transition hover:text-ink focus-ring"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-sm bg-brick px-2 py-1 text-sm font-medium text-paper transition hover:bg-brick/90 active:translate-y-px focus-ring"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
