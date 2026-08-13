import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Columns3,
  FolderKanban,
  UsersRound,
} from "lucide-react";
import { OrbitMark } from "@/components/orbit/orbit-mark";

export const Route = createFileRoute("/")({
  component: Landing,
});

const easing = [0.22, 1, 0.36, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-64px" },
  transition: { duration: 0.64, ease: easing },
};

const heroSequence = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
};

const heroItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.68, ease: easing } },
};

function Landing() {
  const reduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <div className="relative min-h-svh overflow-hidden bg-background text-foreground paper-grain">
        <LandingAtmosphere reduceMotion={reduceMotion} />

        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, ease: easing }}
          className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between border-b border-border px-5 py-4 sm:px-8"
          data-testid="landing-header"
        >
          <Link to="/" className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <motion.span whileHover={reduceMotion ? undefined : { rotate: -8, scale: 1.06 }} transition={{ type: "spring", stiffness: 420, damping: 18 }} className="flex h-8 w-8 items-center justify-center border border-primary bg-primary text-primary-foreground">
              <OrbitMark size={20} />
            </motion.span>
            <span className="font-display text-xl font-semibold tracking-tight">Orbit</span>
          </Link>
          <nav className="hidden items-center gap-7 font-ui text-sm font-semibold text-muted-foreground md:flex" aria-label="Marketing navigation">
            <motion.a whileHover={reduceMotion ? undefined : { y: -2 }} href="#work" className="transition-colors hover:text-foreground">How it works</motion.a>
            <motion.a whileHover={reduceMotion ? undefined : { y: -2 }} href="#proof" className="transition-colors hover:text-foreground">The ledger</motion.a>
          </nav>
          <div className="flex items-center gap-2 font-ui text-sm font-semibold">
            <Link to="/login" className="px-3 py-2 text-foreground transition-colors hover:text-muted-foreground">Sign in</Link>
            <Link to="/register" className="ledger-action relative inline-flex items-center gap-2 overflow-hidden border border-primary bg-primary px-4 py-2.5 text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <motion.span aria-hidden="true" className="absolute inset-y-0 -left-12 w-8 bg-primary-foreground/10 blur-sm" animate={reduceMotion ? undefined : { x: [-36, 180] }} transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 4.4, ease: "easeInOut" }} />
              <span className="relative">Start a workspace</span><ArrowRight className="ledger-arrow relative h-4 w-4" />
            </Link>
          </div>
        </motion.header>

        <main className="relative z-10">
          <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-16 sm:px-8 md:pb-20 md:pt-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)] lg:items-center">
            <motion.div variants={heroSequence} initial="initial" animate="animate">
              <motion.p variants={heroItem} className="ledger-kicker flex items-center gap-2"><motion.span className="h-2 w-2 bg-primary" aria-hidden="true" animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [1, 1.42, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} /> A calmer record of work</motion.p>
              <motion.h1 variants={heroItem} className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Keep the work moving. <motion.span className="inline-block text-muted-foreground" animate={reduceMotion ? undefined : { y: [0, -2, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}>Keep the room clear.</motion.span>
              </motion.h1>
              <motion.p variants={heroItem} className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Orbit gives small teams one considered workspace to name projects, capture the next task, and follow every handoff through to done.
              </motion.p>
              <motion.div variants={heroItem} className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register" className="ledger-action inline-flex items-center gap-2 border border-primary bg-primary px-5 py-3 font-ui text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  Create your workspace <ArrowRight className="ledger-arrow h-4 w-4" />
                </Link>
                <motion.div whileHover={reduceMotion ? undefined : { y: -3 }} transition={{ type: "spring", stiffness: 420, damping: 22 }}>
                  <Link to="/login" className="inline-flex items-center gap-2 border border-border bg-card px-5 py-3 font-ui text-sm font-bold transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Sign in to Orbit
                  </Link>
                </motion.div>
              </motion.div>
              <motion.p variants={heroItem} className="mt-5 font-ui text-xs text-muted-foreground">Projects, people, and tasks — in one shared record.</motion.p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 38, rotate: 1.6 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.84, delay: 0.18, ease: easing }}
            >
              <ProductEvidence reduceMotion={reduceMotion} />
            </motion.div>
          </section>

          <section className="ledger-rule" aria-hidden="true" />

          <section id="proof" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:py-14 xl:py-16">
            <motion.div {...reveal} className="grid gap-6 xl:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] xl:items-end xl:gap-10">
              <div>
                <p className="ledger-kicker">The open ledger</p>
                <h2 className="mt-3 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">Make progress visible, not noisy.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">The work itself stays central. Orbit keeps a clear project context, plain progress proof, and the next useful action close at hand — without a dashboard of competing decorations.</p>
            </motion.div>

            <motion.div {...reveal} transition={{ duration: 0.6, delay: 0.1, ease: easing }} whileHover={reduceMotion ? undefined : { y: -3 }} className="ledger-frame mt-8 overflow-hidden lg:mt-9">
              <div className="flex flex-col gap-3 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <div>
                  <p className="ledger-caption text-muted-foreground">Workspace record / week 32</p>
                  <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">What your team can act on now</h3>
                </div>
                <motion.span className="flex w-fit items-center gap-2 border border-border bg-secondary px-3 py-1.5 font-ui text-xs font-bold text-muted-foreground" animate={reduceMotion ? undefined : { borderColor: ["hsl(var(--border))", "hsl(var(--primary) / .65)", "hsl(var(--border))"] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}><span className="h-1.5 w-1.5 bg-success" />Updated continuously</motion.span>
              </div>
              <div className="ledger-proof-row">
                <ProofItem value="08" label="active tasks" note="Work currently in motion" index={0} reduceMotion={reduceMotion} />
                <ProofItem value="03" label="project boards" note="Clear homes for active work" index={1} reduceMotion={reduceMotion} />
                <ProofItem value="62%" label="completion" note="Plain progress, always in context" index={2} reduceMotion={reduceMotion} />
              </div>
            </motion.div>
          </section>

          <section id="work" className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 lg:pb-14 xl:pb-16">
            <div className="grid gap-4 md:grid-cols-3 lg:gap-5">
              {[
                { icon: FolderKanban, title: "Give every project a clear home", text: "Name the work, set a small identity marker, and step straight into a focused board." },
                { icon: Columns3, title: "Move the next real task", text: "Drag when it is faster. Use the status menu when you need the keyboard. Every state stays legible." },
                { icon: UsersRound, title: "Invite people with context", text: "See who has access, what is pending, and what needs a decision before work is shared." },
              ].map((item, index) => (
                <motion.article {...reveal} transition={{ duration: 0.52, delay: index * 0.12, ease: easing }} whileHover={reduceMotion ? undefined : { y: -9, rotate: index === 1 ? 0 : index === 0 ? -0.4 : 0.4 }} key={item.title} className="ledger-panel group relative overflow-hidden p-5 xl:p-6">
                  <motion.div whileHover={reduceMotion ? undefined : { rotate: -10, scale: 1.08 }} transition={{ type: "spring", stiffness: 360, damping: 16 }} className="flex h-9 w-9 items-center justify-center border border-primary bg-primary text-primary-foreground"><item.icon className="h-4 w-4" /></motion.div>
                  <p className="ledger-caption mt-6 text-muted-foreground">0{index + 1} / the work loop</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
                  <motion.span aria-hidden="true" className="absolute bottom-0 left-0 h-1 bg-primary" initial={{ width: "0%" }} whileInView={{ width: index === 0 ? "42%" : index === 1 ? "68%" : "100%" }} viewport={{ once: true, margin: "-48px" }} transition={{ duration: 0.9, delay: 0.18 + index * 0.12, ease: easing }} />
                </motion.article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 md:pb-24">
            <motion.div {...reveal} transition={{ duration: 0.62, ease: easing }} className="ledger-panel--dark relative grid gap-8 overflow-hidden p-7 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <motion.div aria-hidden="true" className="absolute -right-24 -top-24 h-52 w-52 border border-primary-foreground/20" animate={reduceMotion ? undefined : { rotate: [0, 90, 180], scale: [1, 1.08, 1] }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} />
              <div className="relative">
                <p className="ledger-caption text-primary-foreground/65">A workspace, not another ceremony</p>
                <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Start with one project and the next useful task.</h2>
                <p className="mt-4 max-w-xl text-primary-foreground/75">Orbit keeps the path short: create the project, invite only when you are ready, and move work as it becomes real.</p>
              </div>
              <Link to="/register" className="ledger-action relative inline-flex items-center justify-center gap-2 border border-primary-foreground bg-card px-5 py-3 font-ui text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Start with Orbit <ArrowRight className="ledger-arrow h-4 w-4" />
              </Link>
            </motion.div>
          </section>
        </main>

        <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-border px-5 py-6 font-ui text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8" data-testid="landing-footer">
          <div className="flex items-center gap-2"><OrbitMark size={17} /><span>Orbit — a considered record of progress.</span></div>
          <div className="flex items-center gap-4"><span>Built for small teams</span><span className="hidden sm:inline">•</span><span>© {new Date().getFullYear()} Orbit</span></div>
        </footer>
      </div>
    </MotionConfig>
  );
}

function LandingAtmosphere({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[hsl(var(--accent))] blur-3xl" animate={reduceMotion ? undefined : { x: [0, 76, 14, 0], y: [0, -36, 30, 0], scale: [1, 1.1, 0.94, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute right-[8%] top-[22rem] h-48 w-48 border border-primary/10" animate={reduceMotion ? undefined : { rotate: [0, 90, 180, 270, 360], y: [0, -20, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute -right-20 bottom-[20%] h-72 w-72 rounded-full bg-success/10 blur-3xl" animate={reduceMotion ? undefined : { x: [0, -56, 0], y: [0, 38, 0], scale: [0.92, 1.07, 0.92] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

function ProofItem({ value, label, note, index, reduceMotion }: { value: string; label: string; note: string; index: number; reduceMotion: boolean | null }) {
  return (
    <motion.div
      className="min-w-0 px-4 py-4.5 sm:px-5 sm:py-5 xl:px-6"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-36px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: easing }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      <p className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">{value}</p>
      <p className="ledger-caption mt-2 text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{note}</p>
    </motion.div>
  );
}

function ProductEvidence({ reduceMotion }: { reduceMotion: boolean | null }) {
  const columns = [
    { name: "Backlog", count: 3, tasks: ["Confirm launch notes", "Draft member guide"] },
    { name: "In progress", count: 2, tasks: ["Invite the pilot team", "Review task taxonomy"] },
    { name: "In review", count: 1, tasks: ["Check accessibility pass"] },
    { name: "Completed", count: 4, tasks: ["Create the project"] },
  ];

  return (
    <div className="relative">
      <motion.div aria-hidden="true" className="absolute -inset-5 -z-10 bg-primary/10 blur-3xl" animate={reduceMotion ? undefined : { opacity: [0.24, 0.55, 0.24], scale: [0.94, 1.06, 0.94] }} transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="ledger-frame overflow-hidden" aria-label="Example Orbit project board" whileHover={reduceMotion ? undefined : { y: -7, rotate: -0.45 }} transition={{ type: "spring", stiffness: 180, damping: 19 }}>
        <div className="flex items-center justify-between gap-4 border-b border-border bg-secondary/60 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2"><motion.span className="h-2 w-2 shrink-0 bg-success" animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], scale: [1, 1.45, 1] }} transition={{ duration: 1.55, repeat: Infinity, ease: "easeInOut" }} /><span className="ledger-caption truncate text-muted-foreground">Project / Spring release</span></div>
          <div className="flex shrink-0 items-center gap-2"><span className="font-ui text-xs font-bold text-muted-foreground">62% complete</span><span className="hidden h-1 w-12 overflow-hidden bg-border sm:block"><motion.span className="block h-full bg-primary" initial={{ width: 0 }} animate={{ width: "62%" }} transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : 0.35, ease: "easeOut" }} /></span></div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border p-px sm:grid-cols-4">
          {columns.map((column, index) => (
            <motion.div key={column.name} className="min-w-0 bg-card p-3" initial={{ opacity: 0, y: 16 }} animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, index % 2 === 0 ? -5 : 5, 0] }} transition={reduceMotion ? { duration: 0.01 } : { opacity: { duration: 0.42, delay: 0.22 + index * 0.12 }, y: { duration: 4.3 + index * 0.42, delay: 0.9 + index * 0.22, repeat: Infinity, ease: "easeInOut" } }} whileHover={reduceMotion ? undefined : { y: -8 }}>
              <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
                <p className="font-ui text-[11px] font-bold leading-tight text-foreground">{column.name}</p>
                <span className="font-ui text-[11px] tabular-nums text-muted-foreground">{column.count}</span>
              </div>
              <div className="mt-3 space-y-2">
                {column.tasks.map((task, taskIndex) => (
                  <motion.div key={task} className="border border-border bg-background p-2 shadow-[1px_2px_0_hsl(var(--foreground)/0.06)]" whileHover={reduceMotion ? undefined : { x: 4, scale: 1.025 }} transition={{ duration: 0.16 }}>
                    <div className="flex items-center gap-1.5"><motion.span className={`h-1.5 w-1.5 ${index === 3 ? "bg-success" : taskIndex === 0 ? "bg-primary" : "bg-warning"}`} animate={index === 1 && taskIndex === 0 && !reduceMotion ? { opacity: [0.45, 1, 0.45] } : undefined} transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }} /><span className="line-clamp-2 font-ui text-[10px] font-semibold leading-4 text-foreground">{task}</span></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border px-4 py-3 font-ui text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Move work forward one clear status at a time.</div>
      </motion.div>
    </div>
  );
}
