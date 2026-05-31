'use client';

import { signIn } from 'next-auth/react';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = ['freelancer', 'founder', 'investor', 'supplier', 'stakeholder'] as const;
const REGIONS = ['UK', 'NA', 'IN'] as const;

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'stakeholder', region: 'UK' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Sign-up failed. Please try again.');
      setLoading(false);
      return;
    }

    // Auto-sign-in after successful registration
    await signIn('credentials', { email: form.email, password: form.password, callbackUrl: '/dashboard' });
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1>Create your V.B account</h1>

      <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} style={{ width: '100%', marginBottom: 8 }}>
        Continue with Google
      </button>
      <button onClick={() => signIn('linkedin', { callbackUrl: '/dashboard' })} style={{ width: '100%', marginBottom: 24 }}>
        Continue with LinkedIn
      </button>

      <hr />

      <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        {[
          { id: 'name', label: 'Name', type: 'text', required: false },
          { id: 'email', label: 'Email', type: 'email', required: true },
          { id: 'password', label: 'Password (min 8 chars)', type: 'password', required: true },
        ].map(({ id, label, type, required }) => (
          <div key={id} style={{ marginBottom: 12 }}>
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              type={type}
              value={form[id as keyof typeof form]}
              onChange={(e) => set(id, e.target.value)}
              required={required}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="role">Role</label>
          <select id="role" value={form.role} onChange={(e) => set('role', e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4 }}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="region">Region</label>
          <select id="region" value={form.region} onChange={(e) => set('region', e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4 }}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account? <a href="/auth/sign-in">Sign in</a>
      </p>
    </main>
  );
}
