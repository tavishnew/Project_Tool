import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  KanbanSquare,
  Sparkles,
  Users,
  Zap,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { OrbitMark } from "@/components/orbit/orbit-mark";
import { AuroraBlob } from "@/components/orbit/aurora-blob";
import { SpotlightCard } from "@/components/orbit/spotlight-card";
import { MagneticButton } from "@/components/orbit/magnetic-button";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbit — Project management for teams that ship" },
      {
        name: "description",
        content:
          "Orbit is a focused, calm project management workspace. Kanban boards, lists, and members without the clutter.",
      },
      { property: "og:title", content: "Orbit — Project management for teams that ship" },
      {
        property: "og:description",
        content: "A calm project workspace with kanban, lists, and members.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <AuroraBlob className="pointer-events-none absolute inset-0" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <OrbitMark />
          <span className="font-display text-xl font-bold tracking-tight">Orbit</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#workflow" className="hover:text-foreground">Workflow</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Sign in
          </Link>
          <MagneticButton onClick={() => navigate({ to: "/register" })} className="px-5 py-2.5 text-sm">
            Get started
          </MagneticButton>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-16 text-center md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          New: adaptive kanban with animated flow
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
        >
          Project work,{" "}
          <span className="text-primary">calmly orchestrated.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Orbit gives small teams a single, quiet surface for projects, tasks, and members.
          No plugins, no ceremony — just the flow you already run.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton onClick={() => navigate({ to: "/register" })}>
            Start for free
            <ArrowRight className="ml-2 h-4 w-4" />
          </MagneticButton>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-secondary"
          >
            See a live demo
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <PreviewSurface />
        </motion.div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Everything, nothing more
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            The pieces that actually move work forward.
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <SpotlightCard>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="workflow" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-border bg-secondary/60 p-10 md:p-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                From backlog to shipped in one calm surface.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Move a card, invite a teammate, see progress in a glance. Orbit gets out of the way
                so your team can stay in it.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 text-sm">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <PreviewBoard />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-3xl px-6 pb-32 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Bring your team into Orbit.
        </h2>
        <p className="mt-4 text-muted-foreground">Free while in beta. No card, no fuss.</p>
        <div className="mt-8">
          <MagneticButton onClick={() => navigate({ to: "/register" })}>
            Create your workspace <ArrowRight className="ml-2 h-4 w-4" />
          </MagneticButton>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between border-t border-border px-6 py-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <OrbitMark size={20} />
          <span>© {new Date().getFullYear()} Orbit</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: KanbanSquare,
    title: "Adaptive kanban",
    desc: "Drag cards across columns with animated flow. Everything stays in place — even the ones you didn't touch.",
  },
  {
    icon: Users,
    title: "Members without noise",
    desc: "Invite by email, assign in one click. Role badges, avatars, and nothing else fighting for your attention.",
  },
  {
    icon: Zap,
    title: "Fast by default",
    desc: "Zero-config, local-first data, and a UI that stays fluid at any project size.",
  },
  {
    icon: ShieldCheck,
    title: "Secure sessions",
    desc: "httpOnly JWT cookies, session persistence, and no third-party trackers.",
  },
  {
    icon: Layers,
    title: "Board and list, together",
    desc: "The same project, two lenses. Pivot between kanban and structured list without losing context.",
  },
  {
    icon: Sparkles,
    title: "Delight in the details",
    desc: "Motion, typography, and empty states designed to make everyday planning feel a little lighter.",
  },
];

const steps = [
  "Create a project and pick a color.",
  "Invite teammates with a single email.",
  "Drop tasks into columns. Watch them flow.",
  "Ship. Review. Repeat.",
];

function PreviewSurface() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_120px_-40px_oklch(0.68_0.19_32/0.25)]">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="ml-4 rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
          orbit.app / projects / aurora-launch
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3 p-6">
        {["Backlog", "In progress", "Review", "Done"].map((col, ci) => (
          <div key={col} className="rounded-xl bg-secondary/50 p-3">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>{col}</span>
              <span>{[4, 3, 2, 5][ci]}</span>
            </div>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="mb-2 h-2 w-3/4 rounded-full bg-muted" />
                  <div className="h-2 w-1/2 rounded-full bg-muted" />
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                      style={{
                        background: "oklch(0.68 0.19 32 / 0.1)",
                        color: "oklch(0.55 0.19 32)",
                      }}
                    >
                      High
                    </span>
                    <span className="h-5 w-5 rounded-full bg-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewBoard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      {[
        { title: "Onboarding v2", pct: 62, color: "#ff5a4e" },
        { title: "Design tokens", pct: 40, color: "#f59e0b" },
        { title: "Marketing site", pct: 84, color: "#6366f1" },
      ].map((p) => (
        <div key={p.title} className="flex items-center gap-4 border-b border-border py-3 last:border-b-0">
          <span className="h-8 w-8 rounded-lg" style={{ backgroundColor: p.color }} />
          <div className="flex-1">
            <div className="text-sm font-semibold">{p.title}</div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${p.pct}%` }} />
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground">{p.pct}%</span>
        </div>
      ))}
    </div>
  );
}
