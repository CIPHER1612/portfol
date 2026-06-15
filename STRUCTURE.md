# Project Structure Guide

## Overview

PinnacleByte portfolio — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Framer Motion, dark Navy + Electric Blue theme. Content managed via Sanity v3 (Studio embedded at `/studio`).

## Directory Breakdown

### `/app` — Pages & Routing

```
app/
  layout.tsx                    # Root layout — LenisProvider wrapper, GA4 script, full metadata (metadataBase, OG, Twitter, robots)
  page.tsx                      # Server Component — fetches Sanity data in parallel, renders HomePageClient + Organization/WebSite JSON-LD
  sitemap.ts                    # Dynamic sitemap — pulls all Sanity project slugs; served at /sitemap.xml
  robots.ts                     # Robots rules — allow all crawlers, block /studio; served at /robots.txt
  contact/page.tsx              # /contact — server page (exports metadata + BreadcrumbList JSON-LD) → ContactClient
  work/
    page.tsx                    # /work — async server component + BreadcrumbList JSON-LD → WorkGallery
    [slug]/page.tsx             # /work/[slug] — case study, generateMetadata with OG image + BreadcrumbList JSON-LD (SSG via generateStaticParams)
  studio/
    [[...tool]]/page.tsx        # Embedded Sanity Studio (dynamic, Sanity auth)
```

### `/components/HomePageClient.tsx`

`'use client'` — contains all interactive homepage logic: `useRef`, `useSnapScroll`, the snap container layout, the sections array. Receives `projects`, `team` as props from the server component `app/page.tsx` (the `testimonials` prop was removed when the Trust section replaced the Testimonials marquee).

### `/components/ContactClient.tsx` & `/components/work/WorkGallery.tsx`

Client components for the standalone routes. `ContactClient` is the premium `/contact` form (controlled inputs, honeypot field, `AuroraBackground`) that submits via the `submitContact` server action in `app/contact/actions.ts` (Resend send behind honeypot + rate-limit + validation) and renders loading / inline-error / confirmation states. `WorkGallery` is the `/work` gallery with category-filter state whose cards render the real Sanity `project.image`. Both sit outside the snap-scroll shell, so they don't use `Navbar`; they use the shared `PageHeader` and make `<main>` its own desktop scroll container (`md:h-[100dvh] md:overflow-y-auto`).

### `/components/ui` — Shared Primitives

| File | Purpose |
|------|---------|
| `Navbar.tsx` | Fixed top nav. `visible` prop hides it on intro section. Desktop: `goTo()` buttons. Mobile: `<a href="#id">` anchors. |
| `PageHeader.tsx` | Sticky header for standalone routes (`/contact`, `/work`) — logo → `/` + configurable back link. Used instead of `Navbar` (whose `#anchors` only resolve on the homepage). |
| `Footer.tsx` | Mobile-only footer |
| `Button.tsx` | Configurable button variants |
| `NetworkCanvas.tsx` | Canvas particle system. Props: `particleCount`, `connectionRadius`, `particleAlpha`, `lineAlpha`, `speed` |
| `DotGridBackground.tsx` | 18×11 CSS dot grid with outward ripple pulse animation |
| `AuroraBackground.tsx` | 3 large blurred Framer Motion blobs drifting in blue/sky/violet |

### `/components/sections` — Page Sections

| File | Section | Notes |
|------|---------|-------|
| `IntroSplashSection.tsx` | 0 — Intro Splash | One-shot typewriter, NetworkCanvas, navbar hidden |
| `HeroSection.tsx` | 1 — Hero | 120-particle canvas, rotating typewriter eyebrow, word-by-word blur reveal |
| `ServicesSection.tsx` | 2 — Services | Tech icon grid (tech-stack-icons npm), dot grid background |
| `ProcessTimelineSection.tsx` | 3 — Process | Sticky split scrollytelling (IntersectionObserver), internally scrollable w/ nested CSS snap, sticky dot grid |
| `PortfolioSection.tsx` | 4 — Portfolio | 3-col card grid w/ hover lift/glow + "Visit this site" button, internally scrollable. Receives `projects: Project[]` prop. |
| `PricingSection.tsx` | 5 — Pricing | 3 tier cards (Growth highlighted "Most Popular") + full-width dashed Care Plan add-on, aurora background, fits one viewport (no internal scroll). "Get Started" CTA calls `goTo(8)` on desktop / `#contact` anchor on mobile. |
| `TeamSection.tsx` | 6 — Team | Aurora background. Receives `team: TeamMember[]` prop. |
| `TrustSection.tsx` | 7 — Trust | "Fresh studio. Proven craft." — 3 static trust cards + "Start a conversation" CTA (`goTo(8)` / `#contact`), aurora background. **No Sanity data.** Replaced the fabricated Testimonials marquee. |
| `FinalCtaSection.tsx` | 8 — CTA | 60-particle canvas, embedded footer bar |

### `/lib`

| File | Purpose |
|------|---------|
| `sanity.ts` | Sanity client (`createClient`) — `projectId: b3q3iq0h`, `dataset: production`, `useCdn: false` (direct API, no CDN cache) |
| `sanityFetch.ts` | Typed GROQ fetch helpers: `fetchProjects`, `fetchTeam`, `fetchProjectBySlug`, `fetchAllSlugs` (`fetchTestimonials` still exists but is no longer called) |
| `url.ts` | `isHttpUrl()` — validates a CMS-supplied `liveUrl` is `http(s)` before use as an `href` (blocks `javascript:` XSS) |
| `lenis.ts` | Lenis smooth scroll factory (mobile only) |

### `/hooks`

| File | Purpose |
|------|---------|
| `useSnapScroll.ts` | Snap-scroll state machine (`totalSections: 9`). Wheel/keyboard handler. Checks internal scroll position before advancing sections 3 & 4. |
| `useTypewriter.ts` | 4-phase rotating typewriter state machine |

### `/public`

```
public/
  logo.jpeg             # Default Open Graph image (used in og:image for all pages without a cover image)
  icons/
    shopify.svg         # Custom Shopify brand icon (Simple Icons format)
  images/               # Optional local project images (reference as /images/filename.png)
```

### Root files

| File | Purpose |
|------|---------|
| `sanity.config.ts` | Sanity Studio schema — defines `portfolioProject`, `portfolioTestimonial`, `portfolioTeam` document types (`portfolioTestimonial` retained but no longer rendered) |
| `tailwind.config.ts` | Color tokens, glow shadows |
| `next.config.mjs` | `cdn.sanity.io` remotePattern, `reactStrictMode: true`, security headers (HSTS, CSP-Report-Only, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy); `/studio` gets `X-Robots-Tag: noindex` |
| `tsconfig.json` | `moduleResolution: bundler`, TypeScript 6 |

## Sanity Data Flow

```
Sanity Cloud
  ↓  GROQ  (lib/sanityFetch.ts)
app/page.tsx  [Server Component — async]
  ├─ fetchProjects()
  └─ fetchTeam()
  ↓  props
components/HomePageClient.tsx  ['use client']
  ├─ PortfolioSection   (projects prop)
  ├─ TeamSection        (team prop)
  └─ TrustSection       (static content — no Sanity data)
```

`app/work/[slug]/page.tsx` calls `fetchProjectBySlug(slug)` directly (server component).  
`generateStaticParams` calls `fetchAllSlugs()` at build time to pre-render case study pages.

## Deployment (Vercel)

- No environment variables required for public reads (Sanity dataset is public).
- Deploy and visit `/studio` — sign in with your Sanity account to manage all content.
- Content changes appear on the live site within ~60 seconds of publishing (ISR revalidation via `next: { revalidate: 60 }` on all fetch calls).
- For local Studio access, add `http://localhost:3000` to CORS Origins in [sanity.io/manage](https://sanity.io/manage) → API tab.

## Key Styling Conventions

- Background: `bg-bg-dark` (`#0F172A`)
- Headings: `text-primary-50` (`#F8FAFC`)
- Body: `text-primary-300` (`#CBD5E1`)
- Accent: `text-accent-400` / `bg-accent-500` (Electric Blue)
- Cards: `bg-neutral-900` border `border-neutral-700`
- Section padding: `px-6 lg:px-16`
