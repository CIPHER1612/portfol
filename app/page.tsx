import HomePageClient from '@/components/HomePageClient';
import { fetchProjects, fetchTeam } from '@/lib/sanityFetch';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PinnacleByte',
    url: 'https://pinnaclebyte.dev',
    logo: 'https://pinnaclebyte.dev/logo.jpeg',
    email: 'dev@pinnaclebyte.dev',
    description:
      'PinnacleByte builds high-performance web applications with Next.js, React, and MERN stack — powered by Sanity CMS and Supabase.',
    knowsAbout: [
      'Next.js',
      'React',
      'MERN Stack',
      'Node.js',
      'MongoDB',
      'Sanity CMS',
      'Supabase',
      'Shopify',
      'TypeScript',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PinnacleByte',
    url: 'https://pinnaclebyte.dev',
  },
];

export default async function HomePage() {
  const [projects, team] = await Promise.all([
    fetchProjects(),
    fetchTeam(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient projects={projects} team={team} />
    </>
  );
}
