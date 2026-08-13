import { cn } from "@/lib/utils";

/**
 * Orbit's compact mark: an open record ring with a forward progress stroke.
 * It inherits `currentColor`, keeping the same asset legible in the header,
 * workspace chrome, footer, and favicon-adjacent contexts.
 */
export function OrbitMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("inline-block shrink-0", className)}
      fill="none"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 5.25A10.75 10.75 0 1 0 26.2 18.8"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="square"
      />
      <path
        d="M17.75 4.75H26.5V13.5"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path d="M26.25 5.75 17 15" stroke="currentColor" strokeWidth="3.25" strokeLinecap="square" />
      <rect x="13.25" y="13.25" width="5.5" height="5.5" fill="currentColor" />
    </svg>
  );
}
