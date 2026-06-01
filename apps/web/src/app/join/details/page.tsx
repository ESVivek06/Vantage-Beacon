'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressStepBar } from '@/components/join/ProgressStepBar';

const LOCATIONS = [
  { value: 'UK', label: '🇬🇧 United Kingdom' },
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'NA', label: '🌎 North America' },
  { value: 'OTHER', label: '🌍 Other' },
];

const ATTRIBUTION_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter (X)' },
  { value: 'word_of_mouth', label: 'Word of mouth' },
  { value: 'bd_outreach', label: 'BD outreach' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' },
];

interface FormState {
  name: string;
  email: string;
  location: string;
  attribution: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  location?: string;
}

export default function DetailsPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: '', email: '', location: '', attribution: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Redirect back to role selection if role not chosen
    const role = sessionStorage.getItem('vb_join_role');
    if (!role) {
      router.replace('/join/role');
      return;
    }
    // Restore saved form state
    const saved = sessionStorage.getItem('vb_join_details');
    if (saved) {
      try { setForm(JSON.parse(saved)); } catch {}
    }
    // Pick up referral code from session
    const code = sessionStorage.getItem('vb_referral_code');
    if (code) {
      setReferralCode(code);
      setForm((f) => ({ ...f, attribution: 'referral' }));
    }
  }, [router]);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address';
    if (!form.location) e.location = 'Please select your location';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const role = sessionStorage.getItem('vb_join_role') ?? 'stakeholder';
    sessionStorage.setItem('vb_join_details', JSON.stringify(form));

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role, referralCode }),
      });

      if (!res.ok) throw new Error('Submission failed');

      const data = await res.json();
      // Store user code for referral card display
      if (data.userCode) sessionStorage.setItem('vb_user_code', data.userCode);
      sessionStorage.setItem('vb_join_email', form.email);
      sessionStorage.setItem('vb_join_role_label', role);

      if (data.waitlisted) {
        sessionStorage.setItem('vb_queue_position', String(data.queuePosition ?? ''));
        router.push('/join/waitlist');
      } else {
        router.push('/join/confirmed');
      }
    } catch {
      setLoading(false);
      setErrors({ email: 'Something went wrong. Please try again.' });
    }
  }

  const isAttributionReadOnly = !!referralCode;

  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-neutral-200 bg-neutral-0 p-8 shadow-xl">
      <ProgressStepBar currentStep={2} totalSteps={3} />

      <h1 className="mt-8 text-display-sm font-bold text-neutral-900">Tell us about yourself</h1>
      <p className="mt-2 mb-6 text-md text-neutral-500">
        Just the basics — you can fill in the rest after joining.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Full name */}
        <div>
          <Label htmlFor="name" className="mb-1 text-sm font-medium text-neutral-700">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={!!errors.name}
            required
            minLength={2}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-error-600" role="alert">{errors.name}</p>
          )}
        </div>

        {/* Work email */}
        <div>
          <Label htmlFor="email" className="mb-1 text-sm font-medium text-neutral-700">Work email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            error={!!errors.email}
            required
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-error-600" role="alert">{errors.email}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location" className="mb-1 text-sm font-medium text-neutral-700">Location</Label>
          <select
            id="location"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            required
            aria-describedby={errors.location ? 'location-error' : undefined}
            className="flex h-10 w-full rounded-sm border border-neutral-300 bg-neutral-0 px-3 text-sm text-neutral-900 transition-all focus-visible:border-primary-500 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-primary-100)]"
          >
            <option value="">Select your region</option>
            {LOCATIONS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          {errors.location && (
            <p id="location-error" className="mt-1 text-sm text-error-600" role="alert">{errors.location}</p>
          )}
        </div>

        {/* Attribution */}
        <div>
          <Label htmlFor="attribution" className="mb-1 text-sm font-medium text-neutral-700">
            How did you hear about V.B?{' '}
            {!isAttributionReadOnly && <span className="text-xs font-normal text-neutral-400">(optional)</span>}
          </Label>
          {isAttributionReadOnly ? (
            <div className="flex h-10 w-full items-center rounded-sm border border-neutral-200 bg-neutral-100 px-3 text-sm text-neutral-600">
              Referral
            </div>
          ) : (
            <select
              id="attribution"
              value={form.attribution}
              onChange={(e) => set('attribution', e.target.value)}
              className="flex h-10 w-full rounded-sm border border-neutral-300 bg-neutral-0 px-3 text-sm text-neutral-900 transition-all focus-visible:border-primary-500 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-primary-100)]"
            >
              <option value="">Select an option</option>
              {ATTRIBUTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Privacy notice */}
        <div className="flex gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
          <p className="text-xs text-neutral-500">
            We take privacy seriously. Your data stays private and is never sold.{' '}
            <a href="/privacy" className="text-primary-600 underline">Privacy Policy</a>
          </p>
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Submitting…' : 'Complete registration →'}
        </Button>
      </form>

      <Link
        href="/join/role"
        className="mt-3 block text-center text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
      >
        ← Back
      </Link>
    </div>
  );
}
