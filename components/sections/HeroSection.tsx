'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import NetworkCanvas from '@/components/ui/NetworkCanvasLazy';
import { useTypewriter } from '@/hooks/useTypewriter';
import heroImage from '@/components/image/hero.png';

const HEADLINE_WORDS = ['Premium', 'digital', 'products', 'built', 'for', 'growth.'];
const EYEBROW_PHRASES = [
  'Web development studio',
  'MERN & Shopify specialists',
  'Built for growth',
];

export default function HeroSection() {
  const { displayText, isTyping } = useTypewriter({
    phrases: EYEBROW_PHRASES,
    startDelay: 600,
  });

  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-bg-dark flex items-center">
      <NetworkCanvas
        particleCount={120}
        connectionRadius={180}
        particleSize={2.5}
        particleAlpha={0.45}
        lineAlpha={0.35}
        speed={0.55}
      />

      <div className="container relative z-10 grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16">

        {/* Left — text content */}
        <div>

          {/* Eyebrow */}
          <motion.p
            aria-live="off"
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="text-sm uppercase tracking-[0.32em] text-accent-400"
          >
            {displayText}
            <span
              aria-hidden="true"
              style={{
                animation: isTyping ? 'none' : 'cursorBlink 1s step-start infinite',
                opacity: isTyping ? 1 : undefined,
                marginLeft: '1px',
              }}
            >
              |
            </span>
          </motion.p>

          {/* Headline — word by word */}
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-primary-50 sm:text-6xl lg:text-7xl leading-[1.12]">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.22em]"
                initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: 0.12 + i * 0.09,
                  duration: 0.6,
                  ease: [0.25, 0.4, 0.55, 1],
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.78, duration: 0.65, ease: 'easeOut' }}
            className="mt-6 text-lg leading-8 text-primary-300 sm:text-xl"
          >
            PinnacleByte crafts custom MERN and MEAN applications, Shopify storefronts, and WordPress marketing sites with clarity, performance, and a polished experience.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.5, ease: 'easeOut' }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button variant="primary" onClick={() => window.location.hash = '#process'}>
              See how we work
            </Button>
            <Button variant="ghost" onClick={() => window.location.hash = '#work'}>
              View our work
            </Button>
          </motion.div>

        </div>

        {/* Right — hero image */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: 48, filter: 'blur(12px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.4, duration: 0.85, ease: [0.25, 0.4, 0.55, 1] }}
        >
          <Image
            src={heroImage}
            alt="PinnacleByte — Premium digital products"
            className="w-full h-auto"
            priority
          />
        </motion.div>

      </div>
    </section>
  );
}
