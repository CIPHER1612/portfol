# Design Decisions

This repository is built for PinnacleByte with a premium studio feel.

## Color Palette

The palette is Electric Blue on deep navy — chosen to feel technical, premium, and modern without being flashy.

- Deep navy `#0F172A` (`bg-bg-dark`) as the base — darker than typical charcoal, gives a space-like depth
- `primary` scale (slate) for text: `#F8FAFC` headings, `#CBD5E1` body, `#94A3B8` muted labels
- Electric Blue `#3B82F6` (`accent-500`) for CTAs, highlights, glow effects, and interactive states. Light variant `#60A5FA` (`accent-400`) for eyebrows and inline accents
- `neutral-700/800/900` for borders and card surfaces — subtle, never harsh
- Ambient glow blobs (`bg-accent-500/8` with `blur-[130px]`) add depth without adding visual noise

## Typography

Inter (sans-serif) for all UI — clean, highly legible, and widely used in modern SaaS and studio sites. Strong hierarchical contrast through weight (`font-semibold` / `font-bold`) and size jumps rather than mixing typefaces. Tracking (`tracking-[0.32em]`) on eyebrow labels creates premium spacing.

## Motion Philosophy

All animations use Framer Motion. The guiding principle: **reveal, don't just appear**.

- **Word-by-word blur reveals**: headlines split into individual `motion.span` elements, each animating `opacity`, `y`, and `filter: blur()` with a stagger. Creates a sense that text is materialising rather than jumping in.
- **Blur dissolve** (`blur(10px) → blur(0px)` paired with `opacity 0→1`): used on all major text entrances; feels high-end and intentional.
- **Spring physics on icons**: `type: 'spring', stiffness: 220, damping: 18` gives tech icons a natural, bouncy settle — subtle but tactile.
- **Cubic-bezier `[0.25, 0.4, 0.55, 1]`** on text reveals: accelerates quickly then eases gently, giving a snappy but not jarring feel.
- **Load vs scroll animations**: HeroSection uses `animate` (fires on mount). All other sections use `whileInView` with `once: true` (fires once when the section slides into the snap viewport).
- **Scroll-driven reveals** (ProcessTimelineSection): an `IntersectionObserver` detects which step is centered and replays a word-by-word title reveal + drawing accent underline as you scroll. GSAP was removed — Framer Motion `variants` plus the observer cover everything the old ScrollTrigger timeline did.
- **No `scale` on large text**: the Process step numbers are gradient-filled (`bg-clip-text`) and spring in via `translateY` only. Animating `scale` on huge text makes the browser rasterize the glyph and stretch the bitmap, so it goes blurry mid-animation — translateY (and opacity) keeps it razor-sharp.

## Navbar Architecture

The navbar is `position: fixed` (not sticky). This is intentional:

- `sticky` places the element in document flow and reduces available height for the snap-scroll container. With a `57px` navbar, sections would be clipped by `57px` at the bottom.
- `fixed` takes the navbar out of flow — the snap container starts at `y=0` and each panel fills a clean `100dvh`.
- A `h-[57px]` spacer div is added in the mobile layout path only, since the mobile page scrolls normally and needs the space reserved.

## Hero Section Layout

Two-column grid (`lg:grid-cols-2`) on desktop: text content left, illustration right. The hero image (`components/image/hero.png`) is a transparent-background PNG and must float directly on the dark section — **do not wrap it in a bordered or rounded container**, or the transparent areas will show a box outline.

## Full-Page Snap Scroll

Desktop-only. All sections live in the DOM simultaneously (no mount/unmount). Framer Motion translates the inner stack by `-currentIndex * 100dvh`. Benefits:

- ProcessTimelineSection's `IntersectionObserver` registers once and persists (no re-init when navigating away and back)
- Carousel state is preserved when navigating away and back
- Section animations using `whileInView` fire naturally when the panel translates into the viewport

The trade-off: all section JS runs immediately. This is acceptable for a portfolio with 8 content sections.

## Nested Snap Inside Process

The Process section (an internal scroller) additionally uses **native CSS scroll-snap** (`scroll-snap-type: y mandatory`), with each step a full-viewport `scroll-snap-align: start` block — so scrolling within it snaps step-by-step, a snap-scroll nested inside the outer page snap-scroll. Native CSS was chosen over a second JS wheel handler specifically so it doesn't fight the outer `useSnapScroll` wheel handler. Full-viewport `snap-start` steps also keep the outer edge-escape working (`scrollTop: 0` = first step, the last step's snap = max scroll, so the existing atTop/atBottom detection still fires). The trade-off: CSS scroll-snap has no duration knob, so the snap glide speed is browser-controlled — a tunable/slower snap would require a JS wheel-driven implementation.

## Pricing Section (one-viewport, goTo CTA)

The Pricing section (index 5, between Portfolio and Team) is **not** an internal scroller like Process/Portfolio — a pricing comparison only works if all tiers are visible at once, so it's sized to fit a single `100dvh` snap panel (compact spacing, `text-sm` feature lists, `text-3xl` prices, the Care Plan rendered as a slim full-width dashed banner rather than a fourth tall card). Keeping it out of `internalScrollSections` / `INTERNAL_SCROLL_INDICES` also means no extra panelRef wiring.

Because the panel is `overflow:hidden` (content taller than the viewport clips silently rather than scrolling), the height budget is tight: it uses a **compact inline heading** instead of the shared centered `SectionHeading` (whose `lg:text-6xl` title was too tall). The first pass was 868px and clipped the "Most Popular" badge + Care Plan banner on a 1366×768 laptop; after tightening (smaller heading, `py-10 md:py-6`, `text-3xl` prices, reduced feature gaps, featured lift `md:-translate-y-2`) it measures ~742px — verified via Playwright to fit 1366×768 with ~13px margin top and bottom. **If you add a feature row or a longer tagline, re-check this height** — it clips, it doesn't scroll.

Inserting a section mid-deck shifts every later index, so the change touched three index registrations: `HomePageClient` (`totalSections` 8→9 + the sections array), and `Navbar` (added Pricing→5, Team→6, Contact→8, "Start a Project"→`goTo(8)`). The Growth tier is highlighted as "Most Popular" with an accent border + `shadow-teal-glow-lg` + a small `md:-translate-y-3` lift.

The "Get Started" CTA mirrors the navbar's contact behavior: on desktop the section receives `goTo` and the button calls `goTo(8)` (the contact panel) — a plain `#contact` anchor can't move a transform-translated snap deck. On mobile `goTo` is omitted (`isDesktop ? goTo : undefined`) and the button falls back to a real `<a href="#contact">` anchor, which works because mobile is a normally-scrolling stacked page.

## Mobile Responsive Strategy

The breakpoint that switches between the snap deck and a stacked page is `min-width: 768px` — Tailwind's `md:` prefix. Below it, every section becomes a normal block that flows in document order.

**Section heights — `min-h-[100dvh] md:h-full`**

On desktop, each section is wrapped in a 100dvh panel inside SnapScrollContainer, so `h-full` resolves correctly. On mobile there is no parent height — `<main>` flows naturally — so a bare `h-full` collapses to content height and sections shrink-wrap. Symptoms: the intro splash compresses to a thin strip; adjacent sections overlap. The fix is two-step: `min-h-[100dvh]` guarantees each mobile section is at least one viewport tall, and `md:h-full` preserves the desktop snap behavior. This pattern applies to every section that previously used a bare `h-full`.

**Sections 3 & 4 drop their internal scroller on mobile**

ProcessTimeline and Portfolio are 100dvh internal scrollers on desktop — the snap-scroll system relies on this to detect edge escapes. On mobile, the same pattern would mean users only ever see one timeline step or one portfolio card before having to discover an internal scroll gesture. So the inline `height: 100dvh; overflow-y: auto` was replaced with `md:h-[100dvh] md:overflow-y-auto` — desktop keeps the internal scroller, mobile flows naturally.

**Observer root follows the section**

`ProcessTimelineSection` tracks the active (centered) step with an `IntersectionObserver`. Its root must match whatever is actually scrolling: `desktop ? sectionRef.current : null` (the window). The observer is rebuilt on a `matchMedia('(min-width: 768px)')` change so it always points at the live scroll container — without this the active step never updates on the wrong breakpoint.

**Fixed navbar clearance**

The navbar is `position: fixed` at 57px tall. A mobile-only `<div h-[57px]>` spacer at the top of `<main>` pushes the first section below the bar. For elements that anchor to viewport top after the first section — anchor-link targets, sticky headers — use `scroll-mt-16` (or `sticky top-[57px] md:top-0`) so they clear the navbar.

**Honest trust section over fabricated testimonials**

The original section 7 was a testimonials marquee fed by `portfolioTestimonial` Sanity docs — but the content was fabricated (invented names/companies like "Alex Chen, CTO at Innovate Digital"). For a brand-new studio courting professional international clients who do due diligence, fake reviews are a liability: one reverse-image-search or LinkedIn lookup and trust is gone. The marquee was replaced with `TrustSection` — "Fresh studio. Proven craft." — which reframes the absence of testimonials as transparency: three trust cards (craft over credentials / direct founder access / building reputation one project at a time) plus a "Start a conversation" CTA. It's static, local content (no Sanity data), so there's nothing to fabricate. The `portfolioTestimonial` schema and `fetchTestimonials` helper were left in place (removing the schema would orphan CMS docs) but are no longer wired into the site.

**Standalone routes are their own desktop scroll container**

`globals.css` locks the document on desktop (`html, body { overflow: hidden; height: 100% }` at `≥768px`) so the homepage snap-scroll owns the wheel. Standalone routes (`/contact`, `/work`, `/work/[slug]`) have no snap container, so without intervention their content is clipped at one viewport with no way to scroll. Fix: each route's `<main>` becomes its own scroll area — `md:h-[100dvh] md:overflow-y-auto` (plus `overflow-x-hidden` to clip the aurora). `h-[100dvh]` is viewport-relative, so it doesn't depend on the parent chain's height, and `LenisProvider` is a no-op fragment on desktop. These routes also use a shared sticky `PageHeader` instead of the homepage `Navbar`, whose `#anchor` links only resolve on the homepage.

**Server-page / client-component split for `/contact`**

`app/contact/page.tsx` stays a server component (so it can `export const metadata` for SEO) and renders `ContactClient` (`'use client'`) for the interactive form — the same pattern as `app/page.tsx` → `HomePageClient`. Submission calls the `submitContact` **server action** (`app/contact/actions.ts`), which keeps the `RESEND_API_KEY` server-only and runs the honeypot → rate-limit → validate → Resend-send pipeline; `handleSubmit` just maps the result to loading / inline-error / confirmation UI. Keeping the action separate from the markup means the send mechanism can change (CRM, autoresponder) without touching the form.

**Tech icon tile background**

Some brand icons (Tailwind cyan, CSS3 blue, Docker blue) have low contrast against the navy background and the `tech-stack-icons` library's `dark`/`grayscale` variants don't help — they're either the same brand color or a flat gray. Solution: wrap every icon in a uniform `bg-neutral-900/50 border` tile. Treats every icon the same and gives dim ones a contrasting backdrop without per-icon styling.

## Why next/image for Static Assets

Local PNG/JPG imports via `next/image` give automatic width/height (no layout shift), WebP/AVIF conversion at build time, and lazy loading by default. Hero image uses `priority` to skip lazy loading since it's above the fold.

## Architecture Choices

- App Router is the Next.js standard for new projects.
- `components/ui/` — reusable primitives (Button, Navbar, Footer)
- `components/sections/` — page-specific layout sections
- `components/image/` — static assets imported directly (e.g. `hero.png`)
- `public/images/` — optional local project images (reference as `/images/filename.png`)
- `hooks/` — custom hooks (`useSnapScroll`, `useTypewriter`)
- `lib/` — Sanity client + fetch helpers, Lenis factory

## Sanity CMS Migration (May 2026)

The original data layer used local JSON files (`data/db/*.json`) managed by a custom `/admin` dashboard. This was replaced with Sanity v3 for two reasons:

1. **Vercel filesystem is read-only** — `fs.writeFile` does not persist between deploys. The admin dashboard only worked locally, requiring a local edit + GitHub push to publish changes.
2. **Sanity Studio is purpose-built** — a hosted, authenticated CMS UI with image upload, field validation, and history — better in every dimension than a hand-rolled dashboard.

**What changed:**
- `data/db/*.json` and `data/*.ts` re-exports deleted; `lib/db.ts` deleted; `actions/*.ts` (CRUD) deleted; `app/admin/` and `components/admin/` deleted; `proxy.ts` deleted.
- `lib/sanity.ts` (client config) and `lib/sanityFetch.ts` (typed GROQ helpers) added.
- `sanity.config.ts` (schema for 3 document types) added; `app/studio/[[...tool]]/page.tsx` embeds the Studio at `/studio`.
- `app/page.tsx` converted from `'use client'` to an `async` server component that fetches data in parallel. Its interactive logic (hooks, snap scroll) was extracted to `components/HomePageClient.tsx` (`'use client'`).
- `PortfolioSection`, `TeamSection`, `TestimonialsSection`, `SelectedWorkSection` were changed from bundle-time JSON imports to accepting data as props passed from `HomePageClient`. *(`TestimonialsSection` was later removed entirely — see "Honest trust section over fabricated testimonials" above.)*

**Why server component for `app/page.tsx`:**
Client components cannot be `async`, so data fetching had to be lifted to a server component parent. The server component calls `Promise.all([fetchProjects(), fetchTestimonials(), fetchTeam()])` and passes results as props. This is the standard Next.js App Router pattern for server-fetched + client-interactive pages.
