'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import NetworkCanvas from '@/components/ui/NetworkCanvasLazy';

export default function FinalCtaSection() {
  return (
    <section id="contact" className="relative bg-bg-dark flex flex-col min-h-[100dvh] md:h-full overflow-hidden">

      <NetworkCanvas />

      {/* Main CTA */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10">
        <motion.p
          className="text-sm uppercase tracking-[0.32em] text-accent-400 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Let's build
        </motion.p>

        <motion.h2
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-50 leading-[1.1] mb-8 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Ready to build something{' '}
          <span className="text-accent-400">exceptional?</span>
        </motion.h2>

        <motion.p
          className="text-lg text-primary-300 max-w-xl mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Start with a short conversation. We'll craft a website that performs,
          converts, and feels premium from day one.
        </motion.p>

        <motion.div
          className="flex flex-col items-center sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button onClick={() => (window.location.href = '/contact')}>
            Contact the studio
          </Button>
          <Button variant="ghost" onClick={() => (window.location.href = '/work')}>
            Browse full work
          </Button>
        </motion.div>
      </div>

      {/* Minimal footer bar — desktop only; mobile uses the dedicated Footer.tsx rendered after sections */}
      <div className="hidden md:block relative z-10 border-t border-neutral-800 py-5 px-6 shrink-0">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-primary-400">
          <p>© 2026 PinnacleByte. All rights reserved.</p>
          <a
            href="mailto:hello@pinnaclebyte.dev"
            className="text-accent-400 hover:text-accent-300 transition-colors"
          >
            hello@pinnaclebyte.dev
          </a>
          <div className="flex gap-6">
            <a href="/work" className="hover:text-primary-200 transition-colors">Work</a>
            <a href="/contact" className="hover:text-primary-200 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </section>
  );
}
