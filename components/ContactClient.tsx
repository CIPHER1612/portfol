'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, Globe, Check, ChevronDown, Loader2 } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';
import PageHeader from '@/components/ui/PageHeader';
import { submitContact } from '@/app/contact/actions';

const STUDIO_EMAIL = 'hello@pinnaclebyte.dev';

const projectTypes = ['Custom web app', 'Shopify store', 'WordPress site', 'Not sure yet'];

// Field styling mirrors the dark theme tokens used across the site.
const fieldBase =
  'w-full rounded-xl border border-neutral-700 bg-neutral-900/60 px-4 py-3 text-base text-primary-50 placeholder:text-primary-500 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30';
const labelBase = 'mb-2 block text-sm font-medium text-primary-300';

interface FormState {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
  // Honeypot — hidden from users, only bots fill it.
  companyUrl: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  company: '',
  projectType: projectTypes[0],
  message: '',
  companyUrl: '',
};

export default function ContactClient() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Submit through the server action — validates, rate-limits, and emails via Resend.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitContact(form);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Something went wrong. Please email us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-bg-dark md:h-[100dvh] md:overflow-y-auto">
      <AuroraBackground />

      <PageHeader />

      <div className="container relative z-10 py-16 md:py-20">
        {/* Heading */}
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-sm uppercase tracking-[0.32em] text-accent-400">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-primary-50 sm:text-5xl">
            Let&rsquo;s start something exceptional.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-primary-300">
            Tell us about your project and we&rsquo;ll get back to you within 1&ndash;2 business days
            with next steps, a timeline, and a clear path forward.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          {/* Form card */}
          <motion.div
            className="rounded-3xl border border-neutral-700 bg-neutral-900/50 p-6 backdrop-blur-sm sm:p-8 md:p-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            {submitted ? (
              <ConfirmationPanel
                onReset={() => {
                  setForm(EMPTY_FORM);
                  setSubmitted(false);
                  setError(null);
                }}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelBase}>
                      Name
                    </label>
                    <input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={fieldBase}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelBase}>
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className={fieldBase}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company" className={labelBase}>
                      Company / Website{' '}
                      <span className="text-primary-500">(optional)</span>
                    </label>
                    <input
                      id="company"
                      value={form.company}
                      onChange={(e) => update('company', e.target.value)}
                      className={fieldBase}
                      placeholder="acme.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="projectType" className={labelBase}>
                      Project type
                    </label>
                    <div className="relative">
                      <select
                        id="projectType"
                        value={form.projectType}
                        onChange={(e) => update('projectType', e.target.value)}
                        className={`${fieldBase} appearance-none pr-10`}
                      >
                        {projectTypes.map((type) => (
                          <option key={type} value={type} className="bg-neutral-900 text-primary-50">
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className={labelBase}>
                    Tell us about your project
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className={`${fieldBase} resize-none`}
                    placeholder="Goals, timeline, references you love, anything that helps us understand the work."
                  />
                </div>

                {/* Honeypot — visually hidden, off the tab order, never autofilled. */}
                <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                  <label htmlFor="companyUrl">Company URL (leave blank)</label>
                  <input
                    id="companyUrl"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.companyUrl}
                    onChange={(e) => update('companyUrl', e.target.value)}
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-bg-dark shadow-teal-glow transition hover:bg-accent-600 hover:shadow-teal-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending&hellip;
                    </>
                  ) : (
                    'Send inquiry'
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Info sidebar */}
          <motion.aside
            className="space-y-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <InfoCard icon={<Mail className="h-5 w-5" />} label="Email">
              <a
                href={`mailto:${STUDIO_EMAIL}`}
                className="text-base font-semibold text-primary-50 transition hover:text-accent-400"
              >
                {STUDIO_EMAIL}
              </a>
            </InfoCard>

            <InfoCard icon={<Clock className="h-5 w-5" />} label="Response time">
              <p className="text-base text-primary-300">Within 1&ndash;2 business days.</p>
            </InfoCard>

            <InfoCard icon={<Globe className="h-5 w-5" />} label="Studio">
              <p className="text-base text-primary-300">
                Remote-first with a global client focus.
              </p>
            </InfoCard>

            <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
              <p className="text-sm uppercase tracking-[0.32em] text-accent-400">
                What happens next
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  'We review your message and goals.',
                  'You get a reply with next steps and a rough timeline.',
                  'We schedule a short call to align on scope.',
                ].map((step) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-primary-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
        {icon}
      </span>
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary-400">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function ConfirmationPanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/15 text-accent-400 shadow-teal-glow">
        <Check className="h-7 w-7" />
      </span>
      <h2 className="mt-6 text-2xl font-semibold text-primary-50">Message sent — thank you.</h2>
      <p className="mt-3 max-w-md text-primary-300">
        We&rsquo;ve received your inquiry and will reply within 1&ndash;2 business days. You can also
        reach us directly at{' '}
        <a
          href={`mailto:${STUDIO_EMAIL}`}
          className="font-semibold text-accent-400 transition hover:text-accent-300"
        >
          {STUDIO_EMAIL}
        </a>
        .
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 inline-flex items-center justify-center rounded-full border border-accent-500/30 bg-transparent px-6 py-3 text-sm font-semibold text-accent-400 transition hover:border-accent-500 hover:bg-accent-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark"
      >
        Send another message
      </button>
    </div>
  );
}
