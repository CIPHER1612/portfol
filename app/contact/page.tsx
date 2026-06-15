import type { Metadata } from 'next';
import ContactClient from '@/components/ContactClient';

export const metadata: Metadata = {
  title: 'Start a Project',
  description:
    'Start a project with PinnacleByte. Tell us about your Next.js app, MERN stack project, Shopify store, or Sanity CMS site — we reply within 1–2 business days.',
  openGraph: {
    url: '/contact',
    title: 'Start a Project | PinnacleByte',
    description:
      'Tell us about your Next.js app, MERN stack project, or Shopify store. We reply within 1–2 business days.',
  },
  twitter: {
    title: 'Start a Project | PinnacleByte',
    description:
      'Tell us about your Next.js app, MERN stack project, or Shopify store. We reply within 1–2 business days.',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pinnaclebyte.dev' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://pinnaclebyte.dev/contact' },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ContactClient />
    </>
  );
}
