'use client';

import dynamic from 'next/dynamic';

// The particle canvas is purely decorative (aria-hidden, not LCP/SEO content),
// so we load it client-side only — its chunk stays off the initial render path
// and doesn't compete with hydration on slow mobile devices.
const NetworkCanvas = dynamic(() => import('./NetworkCanvas'), { ssr: false });

export default NetworkCanvas;
