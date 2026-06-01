'use client';

import { useState } from 'react';
import { Gift, Copy, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferralNudgeCardProps {
  userCode: string;
  heading?: string;
  subText?: string;
}

export function ReferralNudgeCard({
  userCode,
  heading = 'Skip the queue — invite a colleague',
  subText = 'You and your colleague both get priority access when they join with your link.',
}: ReferralNudgeCardProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `vb.app/invite/${userCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(`https://${referralUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50 p-6">
      <div className="flex items-center gap-3">
        <Gift className="h-6 w-6 text-primary-600 shrink-0" />
        <h3 className="text-md font-semibold text-neutral-900">{heading}</h3>
      </div>
      <p className="mt-1 text-sm text-neutral-600">{subText}</p>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex h-10 flex-1 items-center rounded-sm border border-primary-300 bg-neutral-0 px-3">
          <span className="text-sm font-medium text-primary-700 truncate">{referralUrl}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={handleCopy} aria-label="Copy referral link">
          <Copy className="mr-1 h-3.5 w-3.5" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div aria-live="polite" className="sr-only">{copied ? 'Link copied to clipboard' : ''}</div>

      <div className="mt-3 flex items-center gap-3 text-sm text-neutral-500">
        <span>Share via:</span>
        <a
          href={`https://www.linkedin.com/shareArticle?url=https%3A%2F%2F${referralUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className="text-primary-600 hover:text-primary-700"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=https%3A%2F%2F${referralUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Twitter"
          className="text-neutral-700 hover:text-neutral-900"
        >
          <Twitter className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
