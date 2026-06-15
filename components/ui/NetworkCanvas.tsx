'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface NetworkCanvasProps {
  particleCount?: number;
  connectionRadius?: number;
  particleSize?: number;
  particleAlpha?: number;
  lineAlpha?: number;
  speed?: number;
}

export default function NetworkCanvas({
  particleCount = 60,
  connectionRadius = 155,
  particleSize = 1.5,
  particleAlpha = 0.3,
  lineAlpha = 0.18,
  speed = 0.45
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Far fewer particles on small screens. The connection pass is O(n²), so
    // halving the count roughly quarters the per-frame work on mobile CPUs.
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.max(12, Math.round(particleCount * 0.4)) : particleCount;

    let animId = 0;
    let running = false;
    let onScreen = false;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: particleSize + Math.random() * particleSize,
      });
    }

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionRadius) {
            const alpha = (1 - dist / connectionRadius) * lineAlpha;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = `rgba(59, 130, 246, ${particleAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      drawFrame();
      animId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      loop();
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(animId);
    };

    // Only burn CPU while the canvas is on-screen and the tab is focused.
    const sync = () => {
      if (onScreen && !document.hidden) start();
      else stop();
    };

    if (reduceMotion) {
      // Honour the OS setting: paint one static frame, never loop.
      drawFrame();
    } else {
      const io = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        },
        { threshold: 0 }
      );
      io.observe(canvas);
      document.addEventListener('visibilitychange', sync);

      return () => {
        stop();
        io.disconnect();
        document.removeEventListener('visibilitychange', sync);
        window.removeEventListener('resize', resize);
      };
    }

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [particleCount, connectionRadius, particleSize, particleAlpha, lineAlpha, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
