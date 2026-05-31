'use client';

import { useState } from 'react';

interface DpaModalProps {
  userRegion: 'UK' | 'EU';
  userId: string;
  apiBase?: string;
  onAccepted: () => void;
}

const DPA_VERSION = '1.0';

/**
 * Data Processing Agreement acceptance modal shown to UK/EU users at onboarding.
 * Calls POST /api/gdpr/consent once the user clicks Accept, then invokes onAccepted.
 * The modal cannot be dismissed without explicitly accepting or declining.
 */
export function DpaModal({ userRegion, userId: _userId, apiBase = '/api', onAccepted }: DpaModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (userRegion !== 'UK' && userRegion !== 'EU') {
    return null;
  }

  async function handleAccept() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/gdpr/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'dpa', version: DPA_VERSION, accepted: true }),
      });
      if (!res.ok) {
        throw new Error('Failed to record your agreement. Please try again.');
      }
      onAccepted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dpa-title"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          maxWidth: 560,
          width: '90%',
          padding: '2rem',
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
        }}
      >
        <h2 id="dpa-title" style={{ marginTop: 0 }}>
          Data Processing Agreement
        </h2>
        <p>
          As a {userRegion} user, V.B processes your personal data in accordance with the{' '}
          {userRegion === 'UK' ? 'UK GDPR and the Data Protection Act 2018' : 'EU GDPR (Regulation 2016/679)'}.
        </p>
        <p>
          Your data is stored exclusively in the {userRegion === 'UK' ? 'UK (eu-west-2)' : 'EU'} region and is
          never transferred to clusters outside your jurisdiction.
        </p>
        <p>
          By clicking <strong>Accept</strong> you acknowledge you have read and agree to our{' '}
          <a href="/legal/dpa" target="_blank" rel="noopener noreferrer">
            Data Processing Agreement (v{DPA_VERSION})
          </a>{' '}
          and{' '}
          <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </p>
        {error && (
          <p role="alert" style={{ color: 'red' }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={handleAccept}
            disabled={loading}
            style={{
              padding: '0.6rem 1.4rem',
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {loading ? 'Recording…' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
