'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkCanvas from '@/components/ui/NetworkCanvasLazy';

const LINE_ONE = "THE WORLD'S BEST";
const LINE_TWO = 'DEVELOPERS';

export default function IntroSplashSection() {
  // The scroll hint is non-critical chrome, so it can wait for JS — but the
  // headline below is plain server-rendered text so it paints immediately
  // (it's the LCP element; gating it behind JS was the old 14.8s LCP cause).
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="intro"
      className="relative bg-bg-dark flex flex-col items-center justify-center min-h-[100dvh] md:h-full overflow-hidden"
    >
      <NetworkCanvas
        particleCount={100}
        connectionRadius={180}
        particleSize={2}
        particleAlpha={0.4}
        lineAlpha={0.3}
        speed={0.55}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 select-none">
        <h1 className="font-black tracking-tight leading-[1.05]">
          {/* Reveal is pure CSS (animate-splash-line) so the text is present and
              painted on first server render — no JS bundle on the LCP path. */}
          <span className="animate-splash-line block text-4xl sm:text-6xl lg:text-8xl text-primary-50">
            {LINE_ONE}
          </span>
          <span className="animate-splash-line animate-splash-line-2 block text-4xl sm:text-6xl lg:text-8xl text-accent-400 mt-1">
            {LINE_TWO}
            <span className="ml-1 inline-block h-[0.8em] w-[3px] align-middle bg-accent-400 animate-[cursorBlink_1s_ease-in-out_infinite]" />
          </span>
        </h1>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mt-16 flex flex-col items-center gap-3"
            >
              <span className="text-xs tracking-[0.2em] uppercase text-primary-400">
                Scroll to explore
              </span>
              <motion.span
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-accent-400 text-lg"
              >
                ↓
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
