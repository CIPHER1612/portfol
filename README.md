# PinnacleByte Portfolio

Premium dark-themed web development studio portfolio with energetic animations and Sanity-powered content management.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS** — Dark Navy + Electric Blue theme
- **Framer Motion** — entrance animations, aurora backgrounds, full-page snap scroll
- **Lenis** — smooth scroll on mobile; the Process section reveals via an `IntersectionObserver` scrollytelling pattern (no GSAP)
- **Canvas** — NetworkCanvas particle system with animated connectors
- **Sanity v3** — hosted CMS, Studio embedded at `/studio`

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
```

Public Sanity reads need no token. The only env vars are for the contact form — copy `.env.example` to `.env.local` and set `RESEND_API_KEY` (get one at [resend.com](https://resend.com)) to enable email sending. Without it the site runs fine; the contact form just shows an "email us directly" fallback.

## Content Management (Sanity Studio)

Project and team content is managed through Sanity Studio, embedded at `/studio`. (The homepage no longer shows testimonials — the fabricated marquee was replaced by a static "Fresh studio. Proven craft." Trust section — so the `portfolioTestimonial` type is retained but unused.)

- Visit `http://localhost:3000/studio` in dev, or `https://yoursite.com/studio` after deploying to Vercel.
- Sign in with your Sanity account (the one that owns project `b3q3iq0h`).
- Publish changes in Studio — they appear on the live site within ~60 seconds (ISR revalidation).
- **Local dev**: add `http://localhost:3000` to CORS Origins in [sanity.io/manage](https://sanity.io/manage) → project → API tab.

**Sanity project details:**

| Setting | Value |
|---------|-------|
| Project ID | `b3q3iq0h` |
| Dataset | `production` |
| API version | `2024-01-01` |

**Document types managed in Studio:**
- `portfolioProject` — title, slug, category, summary, description, tech stack, featured flag, image, live URL, order
- `portfolioTestimonial` — quote, author *(retained but no longer rendered on the site)*
- `portfolioTeam` — name, role, description, photo

**Adding project images:**
- Upload images directly in Sanity Studio using the image field — no file system access needed.
- Images are served from `cdn.sanity.io` and rendered with Next.js `<Image>` (domain is whitelisted in `next.config.mjs`).

## Data Flow

```
Sanity Cloud (hosted CMS)
  ↓ GROQ queries (lib/sanityFetch.ts)
app/page.tsx (Server Component)
  ↓ props
components/HomePageClient.tsx (Client Component — snap scroll, hooks)
  ↓ props
PortfolioSection / TeamSection   (TrustSection is static — no Sanity data)
```

Public reads bypass the Sanity CDN (`useCdn: false`) and revalidate every 60 seconds (`next: { revalidate: 60 }`) so Studio changes appear on the live site within ~60 seconds of publishing. `/work/[slug]` routes are pre-rendered at build time via `generateStaticParams` from Sanity slugs.

## Project Structure

```
app/
  layout.tsx                        # Root layout — GA4 script, global metadata (metadataBase, OG, Twitter)
  page.tsx                          # Server Component — fetches Sanity data, renders HomePageClient + JSON-LD
  sitemap.ts                        # Dynamic sitemap — includes all /work/[slug] slugs from Sanity
  robots.ts                         # Robots rules — allow all, block /studio
  studio/[[...tool]]/page.tsx       # Embedded Sanity Studio (dynamic, auth via Sanity account)
  work/
    page.tsx                        # All projects gallery — renders Sanity cover images + category filter
    [slug]/page.tsx                 # Case study — real Sanity description/tech/image/liveUrl + generateMetadata + OG image
  contact/
    page.tsx                        # /contact — server page (metadata) → ContactClient
    actions.ts                      # 'use server' submitContact — honeypot + per-IP rate limit + validation + Resend send
components/
  HomePageClient.tsx                # 'use client' — snap scroll hooks, passes data to sections
  ContactClient.tsx                 # /contact — 'use client' premium form (calls submitContact server action; loading/error/confirmation states), aurora background
  work/
    WorkGallery.tsx                 # /work — 'use client' category filter, cards render Sanity images
  sections/
    IntroSplashSection.tsx          # Section 0 — NetworkCanvas + one-shot typewriter
    HeroSection.tsx                 # Section 1 — 120-particle canvas, blur-reveal headline
    ServicesSection.tsx             # Section 2 — Tech icon grid, dot grid background
    ProcessTimelineSection.tsx      # Section 3 — sticky split scrollytelling (IntersectionObserver), internally scrollable
    PortfolioSection.tsx            # Section 4 — 3-col card grid, internally scrollable, projects prop
    PricingSection.tsx              # Section 5 — tier cards + Care Plan add-on, aurora background, goTo CTA
    TeamSection.tsx                 # Section 6 — Aurora background, team prop
    TrustSection.tsx                # Section 7 — static trust cards + goTo CTA (replaced Testimonials)
    FinalCtaSection.tsx             # Section 8 — CTA + embedded footer
  ui/
    Navbar.tsx                      # Fixed navbar, hidden on intro, snap-nav on desktop
    PageHeader.tsx                  # Sticky header for standalone routes (/contact, /work) — logo + back link
    Footer.tsx                      # Mobile only
    NetworkCanvas.tsx               # Particle system (configurable)
    DotGridBackground.tsx           # 18×11 pulsing dot grid
    AuroraBackground.tsx            # 3 drifting blur blobs
  SnapScrollContainer.tsx           # Desktop full-page snap wrapper
lib/
  sanity.ts                         # Sanity client config (useCdn: false, direct API reads)
  sanityFetch.ts                    # Typed GROQ fetch helpers: fetchProjects, fetchTeam, fetchProjectBySlug, fetchAllSlugs
  url.ts                            # isHttpUrl() — guards CMS liveUrl before use as href (XSS prevention)
  lenis.ts                          # Lenis smooth scroll factory (mobile only)
hooks/
  useSnapScroll.ts                  # Snap-scroll state + wheel/keyboard handlers
  useTypewriter.ts                  # Rotating typewriter state machine
sanity.config.ts                    # Sanity Studio schema (3 document types)
styles/
  globals.css                       # Dark root styles, keyframes
tailwind.config.ts                  # Color tokens, glow shadows
next.config.mjs                     # cdn.sanity.io remotePattern, reactStrictMode, security headers (HSTS + CSP-Report-Only + base 5; /studio noindex)
types/
  index.ts                          # Project, Testimonial, TeamMember, Service interfaces
```

## Sections (desktop snap order)

| Index | Section | Background | Notes |
|-------|---------|------------|-------|
| 0 | IntroSplashSection | Network Graph | Cinematic intro, navbar hidden |
| 1 | HeroSection | Network Graph (enhanced) | 120 particles, rotating typewriter eyebrow |
| 2 | ServicesSection | Dot Grid Pulse | Tech icon grid |
| 3 | ProcessTimelineSection | Dot Grid Pulse (sticky) | Sticky split scrollytelling, internally scrollable w/ nested snap |
| 4 | PortfolioSection | — | 3-col card grid (hover lift/glow + "Visit this site" button), internally scrollable, Sanity data |
| 5 | PricingSection | Aurora Blobs | 3 tier cards (Growth = "Most Popular") + dashed Care Plan add-on, fits one viewport, "Get Started" CTA → contact |
| 6 | TeamSection | Aurora Blobs | Sanity data |
| 7 | TrustSection | Aurora Blobs | Static trust cards + "Start a conversation" CTA → contact (replaced Testimonials) |
| 8 | FinalCtaSection | Network Graph | CTA + embedded footer |

## Snap Scroll Architecture

Sections 3 and 4 scroll internally before the snap advances. `useSnapScroll` handles this via `internalScrollSections`:

```typescript
useSnapScroll({
  totalSections: 9,
  internalScrollSections: [
    { index: 3, panelRef: processTimelinePanelRef },
    { index: 4, panelRef: workPanelRef },
  ],
});
```

Within section 3 (Process), each step is *additionally* a CSS scroll-snap point — the section uses `scroll-snap-type: y mandatory` and each step is a full-viewport `scroll-snap-align: start` block. So scrolling *inside* Process snaps step-by-step: a snap-scroll nested inside the outer page snap-scroll. Native CSS was used (not a second JS wheel handler) so it doesn't fight `useSnapScroll`. Full-viewport `snap-start` steps also keep the outer edge-escape working (`scrollTop: 0` = first step, last step's snap = max scroll).

## Mobile vs Desktop Layout

The breakpoint is `min-width: 768px`.

| Concern | Desktop (≥ 768px) | Mobile (< 768px) |
|---------|-------------------|-------------------|
| Layout | SnapScrollContainer — 100dvh panels | Plain stacked sections |
| Section height | `h-full` resolves to 100dvh | `min-h-[100dvh]` |
| Process & Portfolio scroll | Internal scroller (`md:h-[100dvh] md:overflow-y-auto`) | Natural flow |
| Process active-step observer | root = section element | root = `window` (`null`) |

## SEO

Full SEO layer is in place:

- **Metadata**: `metadataBase` + title template in `layout.tsx`; per-page `title`/`description`/`openGraph`/`twitter` on every route
- **Structured data (JSON-LD)**: `Organization` + `WebSite` schemas on the homepage; `BreadcrumbList` on `/contact`, `/work`, and each `/work/[slug]`
- **Open Graph image**: `public/logo.jpeg` used as default; case study pages use their Sanity cover image as the OG image
- **Sitemap**: `app/sitemap.ts` — dynamically pulls all `/work/[slug]` slugs from Sanity; served at `/sitemap.xml`
- **Robots**: `app/robots.ts` — allows all crawlers, blocks `/studio`; served at `/robots.txt`
- **Analytics**: Google Analytics 4 (`G-34753GHP1F`) loaded via `next/script` with `strategy="afterInteractive"` (no LCP impact)

After deploying: submit `https://pinnaclebyte.dev/sitemap.xml` in Google Search Console and request indexing on the homepage URL.

## Deployment (Vercel)

Deploy the repo to Vercel. The only environment variable is `RESEND_API_KEY` (plus optional `CONTACT_FROM_EMAIL`) for the contact form — add it under **Settings → Environment Variables** (scope: Production) and redeploy, since env vars only take effect on a new deployment. Public Sanity reads need no token. After deploying:

- `/studio` gives you a live content editing UI (log in with your Sanity account)
- Content changes in Sanity Studio appear on the live site within ~60 seconds (ISR, no redeploy needed)
- `/work/[slug]` pages are statically generated at build time from Sanity data — new projects also revalidate every 60 seconds via ISR
- `/sitemap.xml` and `/robots.txt` are served automatically by Next.js from `app/sitemap.ts` and `app/robots.ts`
- **Contact form**: verify your sending domain in Resend (Domains tab) so it can send as `contact@pinnaclebyte.dev`; until then use `onboarding@resend.dev` as `CONTACT_FROM_EMAIL` for testing

## Security

- **HTTP headers** (`next.config.mjs`): `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`, plus `Strict-Transport-Security` (HSTS) and a `Content-Security-Policy-Report-Only` policy. CSP runs in **Report-Only** mode for now (Sanity Studio + Framer Motion need `'unsafe-inline'`/`'unsafe-eval'`) — watch the browser console for violations on the public routes, then promote it to an enforced `Content-Security-Policy`.
- **`/studio`** is served with `X-Robots-Tag: noindex, nofollow`; write access is gated by Sanity authentication (project members only).
- **CMS link safety**: `lib/url.ts` `isHttpUrl()` guards any CMS-supplied `liveUrl` to be `http(s)` before it's used as an `href`, so a `javascript:` value can't execute.
- **Secrets**: public Sanity reads need no token, so nothing sensitive ships in the client bundle. Don't commit `.env*` (gitignored). The contact form's `RESEND_API_KEY` is read only inside the `submitContact` server action, so it never reaches the client bundle.
- **Contact form abuse**: the `submitContact` server action defends the endpoint with a honeypot field (silently drops bots), a per-IP in-memory rate limit (3/min), and server-side validation + length caps on every field. Email is sent as plain text (no HTML = no injection surface). The in-memory limiter is per-instance and resets on serverless cold starts — upgrade to Vercel KV / Upstash only if real abuse appears.

> A more detailed internal audit lives in `SECURITY_AUDIT.md` (gitignored — not published to this public repo).

## Colour Tokens (Dark Theme)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-bg-dark` | `#0F172A` | Page background |
| `text-primary-50` | `#F8FAFC` | Headings |
| `text-primary-300` | `#CBD5E1` | Body text |
| `text-accent-400` | `#60A5FA` | Highlights, eyebrows |
| `bg-accent-500` | `#3B82F6` | CTA buttons, glow |
| `border-neutral-700` | `#334155` | Card borders |
| `bg-neutral-900` | `#1E293B` | Card surfaces |
