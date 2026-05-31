import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function roleLabel(role: string) {
  const map: Record<string, string> = {
    freelancer: 'Freelancer',
    founder: 'Founder',
    investor: 'Investor',
    supplier: 'Supplier',
    stakeholder: 'Stakeholder',
  };
  return map[role] ?? role;
}

export function roleColor(role: string) {
  const map: Record<string, string> = {
    freelancer: 'bg-violet-100 text-violet-700',
    founder: 'bg-teal-100 text-teal-700',
    investor: 'bg-amber-100 text-amber-700',
    supplier: 'bg-pink-100 text-pink-700',
    stakeholder: 'bg-neutral-100 text-neutral-700',
  };
  return map[role] ?? 'bg-neutral-100 text-neutral-700';
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-purple-100 text-purple-700',
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
