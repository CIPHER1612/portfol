import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import '../styles/globals.css';
import LenisProvider from '@/components/LenisProvider';

const GA_ID = 'G-34753GHP1F';

const SITE_URL = 'https://pinnaclebyte.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PinnacleByte | Next.js & MERN Web Development Studio',
    template: '%s | PinnacleByte',
  },
  description:
    'PinnacleByte builds high-performance web applications with Next.js, React, and MERN stack — powered by Sanity CMS and Supabase. Custom apps, Shopify stores, and headless websites built for scale.',
  keywords: [
    'Next.js development',
    'MERN stack developer',
    'custom web application',
    'React developer',
    'Sanity CMS development',
    'Supabase developer',
    'Shopify development',
    'headless CMS',
    'TypeScript developer',
    'web development studio',
  ],
  authors: [{ name: 'PinnacleByte', url: SITE_URL }],
  creator: 'PinnacleByte',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'PinnacleByte',
    title: 'PinnacleByte | Next.js & MERN Web Development Studio',
    description:
      'High-performance web applications built with Next.js, React, MERN stack, Sanity CMS, and Supabase.',
    images: [
      {
        url: '/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'PinnacleByte Web Development Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PinnacleByte | Next.js & MERN Web Development Studio',
    description:
      'High-performance web applications built with Next.js, React, MERN stack, Sanity CMS, and Supabase.',
    images: ['/logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-primary-900 antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
