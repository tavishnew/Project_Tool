import { useState } from "react";

const COLORS = ["#2F5D50", "#B3402F", "#B8862E", "#3A5A8C", "#6B4A8C"];

export default function ProjectModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: { name: string; description: string; color: string }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const canSave = name.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm border border-line bg-surface p-6 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-wide text-muted">New ledger</p>
        <h2 className="mb-5 font-display text-xl font-medium text-ink">Start a project</h2>

        <label className="mb-1 block text-xs font-medium text-muted">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Website Revamp"
          className="mb-4 w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-ring"
        />

        <label className="mb-1 block text-xs font-medium text-muted">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          rows={2}
          className="mb-4 w-full resize-none rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-ring"
        />

        <label className="mb-2 block text-xs font-medium text-muted">Color tag</label>
        <div className="mb-6 flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Choose color ${c}`}
              className="h-7 w-7 rounded-full transition focus-ring"
              style={{
                backgroundColor: c,
                outline: color === c ? `2px solid ${c}` : "none",
                outlineOffset: 2,
                boxShadow: color === c ? "0 0 0 2px #FAFAF8, 0 0 0 4px " + c : "none",
              }}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-sm px-3 py-2 text-sm text-muted transition hover:text-ink focus-ring active:translate-y-px"
          >
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave({ name: name.trim(), description: description.trim(), color })}
            className="rounded-sm bg-pine px-4 py-2 text-sm font-medium text-paper transition hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-40 focus-ring active:translate-y-px"
          >
            Create project
          </button>
        </div>
      </div>
    </div>
  );
}
