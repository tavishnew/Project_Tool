import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Orbit } from "lucide-react";
import { OrbitMark } from "@/components/orbit/orbit-mark";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  subtitle,
  children,
  compact = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Uses a tighter desktop rhythm for multi-field flows such as registration. */
  compact?: boolean;
}) {
  return (
    <div className="min-h-svh bg-background paper-grain lg:grid lg:grid-cols-[minmax(0,1.06fr)_minmax(500px,.94fr)] xl:grid-cols-[minmax(0,1.08fr)_minmax(620px,.92fr)]" data-testid="auth-shell">
      <div className="flex min-h-svh flex-col border-b border-border p-5 sm:p-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-10 xl:px-16" data-testid="auth-form-panel">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-8 w-8 items-center justify-center border border-primary bg-primary text-primary-foreground"><OrbitMark size={20} /></span>
            <span className="font-display text-xl font-semibold tracking-tight">Orbit</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 font-ui text-xs font-bold text-muted-foreground transition-colors hover:text-foreground">Return home <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34 }}
          className={cn("mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12 sm:py-14", compact ? "lg:py-0" : "lg:py-8")}
        >
          <p className="ledger-kicker">Orbit / account access</p>
          <h1 className={cn("mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl", compact ? "xl:text-5xl" : "xl:text-6xl")}>{title}</h1>
          <p className={cn("max-w-lg text-base leading-7 text-muted-foreground sm:text-lg", compact ? "mt-3" : "mt-4")}>{subtitle}</p>
          <div className={cn("border-t border-border", compact ? "mt-6 pt-5 lg:mt-4 lg:pt-3" : "mt-9 pt-7")}>{children}</div>
        </motion.main>

        <footer className="flex items-center justify-between gap-4 border-t border-border pt-4 font-ui text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Orbit</span>
          <span className="hidden sm:inline">A considered record of progress.</span>
        </footer>
      </div>

      <aside className="relative hidden overflow-hidden bg-primary px-12 py-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:px-16" data-testid="auth-brand-panel">
        <div className="flex items-center gap-2 font-ui text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/65"><Orbit className="h-4 w-4" /> Workspace ledger</div>
        <div className="relative max-w-lg">
          <div className="absolute -left-4 top-0 h-12 w-12 border border-primary-foreground/30" aria-hidden="true" />
          <p className="relative font-display text-5xl font-semibold leading-[1.02] tracking-tight xl:text-6xl">One clear record for every project, handoff, and next task.</p>
          <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/72 xl:text-lg">Move work across a board your team can read at a glance, without turning planning into another ceremony.</p>
        </div>
        <div className="border-y border-primary-foreground/20 py-5">
          <div className="grid grid-cols-3 divide-x divide-primary-foreground/20">
            <Proof value="01" label="workspace" />
            <Proof value="04" label="statuses" />
            <Proof value="∞" label="next steps" />
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm text-primary-foreground/80"><CheckCircle2 className="h-4 w-4 text-[#C9963F]" /> Your work stays in the room with you.</div>
        </div>
      </aside>
    </div>
  );
}

function Proof({ value, label }: { value: string; label: string }) {
  return <div className="px-3 first:pl-0"><p className="font-display text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 font-ui text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground/60">{label}</p></div>;
}
