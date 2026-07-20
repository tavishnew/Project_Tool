import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="bg-measured min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-widest text-muted">Error 404</p>
        <h1 className="font-display text-5xl font-medium tracking-tight text-ink">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">This entry isn't in the ledger.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-wide text-pine hover:underline focus-ring"
        >
          ← Back to projects
        </Link>
      </div>
    </div>
  );
}
