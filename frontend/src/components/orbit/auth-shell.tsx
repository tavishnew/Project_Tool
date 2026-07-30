import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { OrbitMark } from "@/components/orbit/orbit-mark";
import { AuroraBlob } from "@/components/orbit/aurora-blob";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background lg:grid lg:grid-cols-2" data-testid="auth-shell">
      <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12" data-testid="auth-form-panel">
        <Link to="/" className="flex items-center gap-2">
          <OrbitMark />
          <span className="font-display text-lg font-bold tracking-tight">Orbit</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-sm"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Orbit</p>
      </div>
      <div className="relative hidden overflow-hidden bg-secondary/50 lg:block" data-testid="auth-brand-panel">
        <AuroraBlob className="pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-16 text-center">
          <div className="relative">
            <OrbitMark size={140} />
          </div>
          <p className="mt-10 max-w-md font-display text-2xl leading-snug tracking-tight">
            "Orbit is the first project tool my team actually keeps open all day."
          </p>
          <p className="mt-3 text-sm text-muted-foreground">— Milo Ray, Head of Product</p>
        </div>
      </div>
    </div>
  );
}
