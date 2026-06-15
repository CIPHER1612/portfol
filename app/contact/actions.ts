'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// Contact form server action.
// Pipeline: honeypot → rate limit → validate → send via Resend.
// All of this runs server-side, so the Resend key never ships to the client.
// ---------------------------------------------------------------------------

const STUDIO_EMAIL = 'hello@pinnaclebyte.dev';
// Resend requires the `from` domain to be verified. Defaults to the studio
// domain; override with CONTACT_FROM_EMAIL if you send from a subdomain.
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'PinnacleByte <contact@pinnaclebyte.dev>';

// Allowed project types — must match the <select> options in ContactClient.
const PROJECT_TYPES = ['Custom web app', 'Shopify store', 'WordPress site', 'Not sure yet'];

// Length caps keep the email small and block oversized-payload abuse.
const LIMITS = {
  name: 100,
  email: 200,
  company: 200,
  message: 5000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
  // Honeypot: hidden field humans never fill. Named to look real to bots.
  companyUrl: string;
}

export type ContactResult = { ok: true } | { ok: false; error: string };

// --- In-memory rate limiter ------------------------------------------------
// Good-enough friction for a portfolio form: blocks naive floods without any
// external infra. It's per-instance and resets on cold start (serverless), so
// it's leaky by design — upgrade to Vercel KV / Upstash only if real abuse appears.
const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the Map doesn't grow unbounded between cold starts.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  // x-forwarded-for is a comma-separated list; the first entry is the client.
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return h.get('x-real-ip') ?? 'unknown';
}

export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  // 1. Honeypot — if filled, a bot submitted it. Pretend success, send nothing.
  if (payload.companyUrl?.trim()) {
    return { ok: true };
  }

  // 2. Rate limit by IP.
  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return { ok: false, error: 'Too many requests. Please wait a minute and try again.' };
  }

  // 3. Validate + normalise.
  const name = payload.name?.trim() ?? '';
  const email = payload.email?.trim() ?? '';
  const company = payload.company?.trim() ?? '';
  const projectType = payload.projectType?.trim() ?? '';
  const message = payload.message?.trim() ?? '';

  if (!name || name.length > LIMITS.name) {
    return { ok: false, error: 'Please enter your name.' };
  }
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (company.length > LIMITS.company) {
    return { ok: false, error: 'Company name is too long.' };
  }
  if (!PROJECT_TYPES.includes(projectType)) {
    return { ok: false, error: 'Please choose a valid project type.' };
  }
  if (message.length < 10 || message.length > LIMITS.message) {
    return { ok: false, error: 'Please tell us a little more about your project (10+ characters).' };
  }

  // 4. Send. Missing key is a server misconfig, not a user error — log it.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set — cannot send inquiry.');
    return { ok: false, error: 'Something went wrong on our end. Please email us directly.' };
  }

  const resend = new Resend(apiKey);

  // Values are interpolated into a plain-text email only (no HTML), so there's
  // no injection surface; newlines in `message` are harmless in text/plain.
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company && `Company / Website: ${company}`,
    `Project type: ${projectType}`,
    '',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: STUDIO_EMAIL,
      replyTo: email,
      subject: `New project inquiry — ${name}`,
      text,
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return { ok: false, error: 'Something went wrong sending your message. Please email us directly.' };
    }

    return { ok: true };
  } catch (err) {
    console.error('[contact] Unexpected send failure:', err);
    return { ok: false, error: 'Something went wrong sending your message. Please email us directly.' };
  }
}
