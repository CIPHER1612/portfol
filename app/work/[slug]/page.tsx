import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';
import PageHeader from '@/components/ui/PageHeader';
import { fetchProjectBySlug, fetchAllSlugs } from '@/lib/sanityFetch';
import { isHttpUrl } from '@/lib/url';

interface WorkCaseStudyProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await fetchAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: WorkCaseStudyProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);

  if (!project) {
    return { title: 'Case Study' };
  }

  const ogImage = project.image
    ? [{ url: project.image, alt: project.title }]
    : [{ url: '/logo.jpeg', width: 1200, height: 630, alt: 'PinnacleByte Web Development Studio' }];

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      url: `/work/${slug}`,
      title: project.title,
      description: project.summary,
      images: ogImage,
    },
    twitter: {
      title: project.title,
      description: project.summary,
      images: [ogImage[0].url],
    },
  };
}

function hasValidImage(src?: string): src is string {
  return !!src && (src.startsWith('/') || src.startsWith('http'));
}

export default async function WorkCaseStudyPage({ params }: WorkCaseStudyProps) {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Sanity stores the description as a plain text block — split on blank lines
  // into paragraphs so longer write-ups stay readable.
  const paragraphs = project.description
    ? project.description.split('\n').map((p) => p.trim()).filter(Boolean)
    : [];

  // Only treat the CMS-supplied live URL as a link target if it's http(s).
  const liveUrl = isHttpUrl(project.liveUrl) ? project.liveUrl : undefined;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pinnaclebyte.dev' },
      { '@type': 'ListItem', position: 2, name: 'Work', item: 'https://pinnaclebyte.dev/work' },
      { '@type': 'ListItem', position: 3, name: project.title, item: `https://pinnaclebyte.dev/work/${slug}` },
    ],
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-bg-dark md:h-[100dvh] md:overflow-y-auto">
      <PageHeader backHref="/work" backLabel="Back to work" />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <AuroraBackground />
        <div className="container relative z-10 py-16 md:py-20">
          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
                {project.category}
              </span>
              {project.featured && (
                <span className="inline-block rounded-full border border-accent-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-primary-50 sm:text-5xl">
              {project.title}
            </h1>
            <p className="text-lg leading-8 text-primary-300">{project.summary}</p>
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-bg-dark shadow-teal-glow transition hover:bg-accent-600 hover:shadow-teal-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark"
              >
                Visit live site
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Cover image */}
          {hasValidImage(project.image) && (
            <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
              <Image
                src={project.image}
                alt={project.title}
                fill
                priority
                sizes="(min-width: 1024px) 1100px, 100vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="container grid gap-10 pb-20 lg:grid-cols-[1.4fr_0.7fr]">
        <article className="space-y-6">
          <p className="text-sm uppercase tracking-[0.32em] text-accent-400">Overview</p>
          {paragraphs.length > 0 ? (
            <div className="space-y-5">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="text-lg leading-8 text-primary-300">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-lg leading-8 text-primary-300">{project.summary}</p>
          )}
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <p className="text-sm uppercase tracking-[0.32em] text-accent-400">Category</p>
            <p className="mt-2 text-base font-semibold text-primary-50">{project.category}</p>
          </div>

          {project.tech?.length > 0 && (
            <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
              <p className="text-sm uppercase tracking-[0.32em] text-accent-400">Tech stack</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-xs text-primary-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {liveUrl && (
            <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
              <p className="text-sm uppercase tracking-[0.32em] text-accent-400">Live site</p>
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 break-all text-base font-semibold text-primary-50 transition hover:text-accent-400"
              >
                {liveUrl.replace(/^https?:\/\//, '')}
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom CTA */}
      <section className="border-t border-neutral-800">
        <div className="container flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-primary-50 sm:text-3xl">
              Have a project in mind?
            </h2>
            <p className="mt-2 text-primary-300">
              Let&rsquo;s build something exceptional together.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-bg-dark shadow-teal-glow transition hover:bg-accent-600 hover:shadow-teal-glow-lg"
            >
              Start a project
            </Link>
            <Link
              href="/work"
              className="inline-flex items-center justify-center rounded-full border border-accent-500/30 bg-transparent px-6 py-3 text-sm font-semibold text-accent-400 transition hover:border-accent-500 hover:bg-accent-500/10"
            >
              Back to all work
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
