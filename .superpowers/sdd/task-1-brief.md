# Task 1: Migrate Landing Page (index.tsx)

**Files:**
- Modify: frontend/src/routes/index.tsx

**Interfaces:**
- Consumes: useAuth from @/auth, Orbit components (OrbitMark, AuroraBlob, SpotlightCard, MagneticButton, GridNoiseBackground), Link from @tanstack/react-router, lucide-react icons
- Produces: Full Orbit landing page at /

**Reference:** orbit_redsign/src/routes/index.tsx

## Steps

1. Replace routes/index.tsx with full Orbit landing design
2. Build check - cd frontend && npx tsc --noEmit  
3. Commit - git add frontend/src/routes/index.tsx && git commit -m "feat: replace landing page with full Orbit design"

## Context

The landing page at / is currently a bare placeholder (h1 + paragraph). It needs to be replaced with Orbit's full landing page design from orbit_redsign/src/routes/index.tsx. That source uses TanStack Router already (same as our frontend), so routing patterns are compatible. Adapt:

- Replace mock auth check with useAuth() from @/auth
- Keep all TanStack Router imports (createFileRoute, Link)
- Use framer-motion for animations
- Include: fixed nav with OrbitMark, AuroraBlob hero, features grid with SpotlightCards, workflow preview, pricing CTA, footer
- Use Link from @tanstack/react-router instead of <a> tags
