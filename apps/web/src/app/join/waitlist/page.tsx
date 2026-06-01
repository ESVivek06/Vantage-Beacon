'use client';

import { useEffect, useState } from 'react';
import { Check, Linkedin, Mail, BookOpen } from 'lucide-react';
import { RoleBadge } from '@/components/TrustBadge';
import { ReferralNudgeCard } from '@/components/join/ReferralNudgeCard';

const WAITLIST_NODES = [
  { label: 'Registered', active: true },
  { label: 'Profile Review', active: false },
  { label: 'Invitation Sent', active: false },
  { label: 'Go Live', active: false },
];

const WHILE_YOU_WAIT = [
  { icon: <Linkedin className="h-5 w-5 text-primary-600" />, text: 'Follow us on LinkedIn', href: '#' },
  { icon: <Mail className="h-5 w-5 text-neutral-600" />, text: 'Join our newsletter', href: '#' },
  { icon: <BookOpen className="h-5 w-5 text-neutral-600" />, text: 'Read the V.B blog', href: '#' },
];

export default function WaitlistPage() {
  const [role, setRole] = useState<string>('stakeholder');
  const [email, setEmail] = useState<string>('');
  const [userCode, setUserCode] = useState<string>('VB-X4K9P');
  const [queuePosition, setQueuePosition] = useState<number>(47);

  useEffect(() => {
    const r = sessionStorage.getItem('vb_join_role_label') ?? sessionStorage.getItem('vb_join_role');
    if (r) setRole(r);
    const e = sessionStorage.getItem('vb_join_email');
    if (e) setEmail(e);
    const code = sessionStorage.getItem('vb_user_code');
    if (code) setUserCode(code);
    const pos = sessionStorage.getItem('vb_queue_position');
    if (pos) setQueuePosition(Number(pos));
  }, []);

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-neutral-200 bg-neutral-0 p-8 shadow-xl">
      {/* Queue position */}
      <div className="mt-2 text-center">
        <p className="text-md text-neutral-500">You&apos;re</p>
        <p className="text-display-2xl font-bold text-primary-600">#{queuePosition}</p>
        <p className="text-md text-neutral-500">on the waitlist</p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-md text-neutral-600">Joining as:</span>
        <RoleBadge role={role} />
      </div>

      <h1 className="mt-6 text-center text-display-sm font-bold text-neutral-900">
        Welcome to the V.B early access list
      </h1>
      <p className="mt-3 text-center text-md text-neutral-600">
        We&apos;re inviting {roleLabel} members to V.B weekly.
        {email && <> You&apos;ll be notified at <strong>{email}</strong> when your access is ready.</>}
      </p>

      <hr className="my-6 border-neutral-200" />

      {/* Waitlist progress */}
      <div className="flex items-start justify-between gap-2" role="list" aria-label="Waitlist progress">
        {WAITLIST_NODES.map((node, i) => (
          <div key={i} className="relative flex flex-1 flex-col items-center" role="listitem">
            {i < WAITLIST_NODES.length - 1 && (
              <div
                aria-hidden="true"
                className="absolute top-5 left-[calc(50%+20px)] right-0 h-0.5 bg-neutral-200"
              />
            )}
            <div
              className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full"
              style={
                node.active
                  ? { backgroundColor: '#4F46E5' }
                  : { border: '2px solid #E2E8F0', backgroundColor: '#FFFFFF' }
              }
            >
              {node.active
                ? <Check className="h-4 w-4 text-neutral-0" />
                : <div className="h-2 w-2 rounded-full bg-neutral-300" aria-hidden="true" />
              }
            </div>
            <span
              className="mt-2 text-center text-xs"
              style={{ color: node.active ? '#4F46E5' : '#64748B', fontWeight: node.active ? 600 : 400 }}
            >
              {node.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-neutral-500">
        Estimated wait: 3–7 days for {roleLabel} members
      </p>

      <div className="mt-6">
        <ReferralNudgeCard
          userCode={userCode}
          heading="Move up the list — invite a colleague"
          subText="Each colleague who registers using your link moves you up by 5 positions."
        />
      </div>

      {/* While you wait */}
      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">While you wait</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          {WHILE_YOU_WAIT.map(({ icon, text, href }) => (
            <a
              key={text}
              href={href}
              className="flex flex-1 items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 transition-colors hover:border-primary-200 hover:bg-primary-50"
            >
              {icon}
              {text}
            </a>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Questions? Email us at{' '}
        <a href="mailto:hello@vb.app" className="text-primary-600 hover:underline">hello@vb.app</a>
      </p>
    </div>
  );
}
