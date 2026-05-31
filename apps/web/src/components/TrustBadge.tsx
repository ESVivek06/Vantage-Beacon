import { BadgeCheck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrustBadgeT0() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
      <BadgeCheck className="h-3 w-3" />
      Verified
    </span>
  );
}

export function TrustBadgeT1() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#E8F4FD] text-[#0A66C2] border border-[#B3D9F5]">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      LinkedIn
    </span>
  );
}

export function GeoTag({ location }: { location: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
      <MapPin className="h-3 w-3 text-neutral-500" />
      {location}
    </span>
  );
}

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  freelancer: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  founder: { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' },
  investor: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  supplier: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
};

const roleLabels: Record<string, string> = {
  freelancer: 'Freelancer',
  founder: 'Founder',
  investor: 'Investor',
  supplier: 'Supplier',
};

export function RoleBadge({ role }: { role: string }) {
  const colors = roleColors[role] ?? { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
  const label = roleLabels[role] ?? role;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border"
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      {label}
    </span>
  );
}
