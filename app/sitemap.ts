import type { MetadataRoute } from 'next';
import { fetchAllSlugs } from '@/lib/sanityFetch';

const SITE_URL = 'https://pinnaclebyte.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await fetchAllSlugs();

  const caseStudyUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...caseStudyUrls,
  ];
}
