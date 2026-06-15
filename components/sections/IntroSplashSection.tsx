'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkCanvas from '@/components/ui/NetworkCanvasLazy';

const LINE_ONE = "THE WORLD'S BEST";
const LINE_TWO = 'DEVELOPERS';
const FULL_LEN = LINE_ONE.length + LINE_TWO.length;
const TYPING_SPEED_MS = 80;
const START_DELAY_MS = 500;

export default function IntroSplashSection() {
  // Default to the FULL headline so it's in the server HTML — it's the page's
  // LCP element and must paint without waiting for JS (mobile + SEO).
  const [charCount, setCharCount] = useState(FULL_LEN);
  // `typing` flips true once the client effect runs. Until then the headline
  // carries `.splash-pretype`, which hides it on DESKTOP ONLY so the JS
  // typewriter can play without a flash of the complete text first. On mobile
  // the CSS hide doesn't apply, so the text stays visible immediately.
  const [typing, setTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobile or reduced-motion: keep the full static headline (fast LCP, no
    // typewriter). Reveal it (remove the desktop hide) and mark complete.
    if (!desktop || reduce) {
      setTyping(true);
      setIsComplete(true);
      return;
    }

    // Desktop: reveal, then type from empty for the cinematic intro.
    setTyping(true);
    setCharCount(0);

    const startTimer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCharCount((prev) => {
          const next = prev + 1;
          if (next >= FULL_LEN) {
            clearInterval(intervalRef.current!);
            setTimeout(() => setIsComplete(true), 400);
          }
          return next;
        });
      }, TYPING_SPEED_MS);
    }, START_DELAY_MS);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const line1 = LINE_ONE.slice(0, Math.min(charCount, LINE_ONE.length));
  const line2 = charCount > LINE_ONE.length ? LINE_TWO.slice(0, charCount - LINE_ONE.length) : '';
  // Cursor only blinks during the desktop typewriter, not on the static headline.
  const showCursor = typing && !isComplete;

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
        <h1
          className={`font-black tracking-tight leading-[1.05] ${typing ? '' : 'splash-pretype'}`}
        >
          <span className="block text-4xl sm:text-6xl lg:text-8xl text-primary-50">
            {line1}
            {line2 === '' && showCursor && (
              <span className="inline-block w-[3px] h-[0.8em] bg-accent-400 ml-1 align-middle animate-[cursorBlink_1s_ease-in-out_infinite]" />
            )}
          </span>
          <span className="block text-4xl sm:text-6xl lg:text-8xl text-accent-400 mt-1">
            {line2}
            {line2 !== '' && showCursor && (
              <span className="inline-block w-[3px] h-[0.8em] bg-accent-400 ml-1 align-middle animate-[cursorBlink_1s_ease-in-out_infinite]" />
            )}
          </span>
        </h1>

        <AnimatePresence>
          {isComplete && (
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
