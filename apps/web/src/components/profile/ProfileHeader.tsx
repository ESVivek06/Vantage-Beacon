'use client';

import Link from 'next/link';
import { MapPin, MessageSquare, Bookmark, Share2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustBadgeT1 } from '@/components/TrustBadge';
import { initials, roleLabel } from '@/lib/utils';
import { ROLE_COLORS, type ProfileUser, type UserRole } from '@/types/profile';
import { parseTagMeta } from '@/types/profile';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  user: ProfileUser;
  isOwnProfile: boolean;
  onConnect?: () => void;
  connectionSent?: boolean;
  connecting?: boolean;
}

const AVAIL_LABELS: Record<string, { label: string; dotClass: string; chipClass: string }> = {
  open: { label: 'Open to work', dotClass: 'bg-success-500', chipClass: 'bg-success-100 text-success-700' },
  busy: { label: 'Busy', dotClass: 'bg-warning-500', chipClass: 'bg-warning-100 text-warning-700' },
  offline: { label: 'Not available', dotClass: 'bg-neutral-400', chipClass: 'bg-neutral-100 text-neutral-600' },
};

export function ProfileHeader({ user, isOwnProfile, onConnect, connectionSent, connecting }: ProfileHeaderProps) {
  const role = (user.role ?? 'stakeholder') as UserRole;
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.founder;
  const displayName = user.profile?.displayName ?? user.email ?? 'User';
  const meta = parseTagMeta(user.profile?.tags ?? []);
  const availability = meta['availability'] ?? 'open';
  const headline = meta['headline'] ?? '';
  const avail = AVAIL_LABELS[availability] ?? AVAIL_LABELS.open;

  return (
    <div className="bg-neutral-0 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Cover banner */}
      <div className={cn('h-40 sm:h-52 bg-gradient-to-br relative', colors.cover)}>
        {isOwnProfile && (
          <Link
            href="/profile/edit"
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Edit cover"
          >
            <Camera className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-12 sm:-mt-14 mb-4 flex items-end justify-between">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-sm">
            {user.photoUrl && <AvatarImage src={user.photoUrl} alt={displayName} />}
            <AvatarFallback className={cn('text-2xl font-bold', colors.chip)}>
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <Button variant="secondary" size="sm" asChild>
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          )}
        </div>

        {/* Name / headline / badges */}
        <div className="mb-4">
          <h1 className="text-display-sm font-bold text-neutral-900 mb-1">{displayName}</h1>
          {headline && <p className="text-md text-neutral-600 mb-2">{headline}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', colors.chip)}>
              {roleLabel(role)}
            </span>
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', avail.chipClass)}>
              <span className={cn('w-2 h-2 rounded-full', avail.dotClass)} />
              {avail.label}
            </span>
            {user.region && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                <MapPin className="h-3 w-3 text-neutral-500" />
                {user.region}
              </span>
            )}
            {user.profile?.verified && <TrustBadgeT1 />}
          </div>
        </div>

        {/* Action buttons (other's profile) */}
        {!isOwnProfile && (
          <div className="flex flex-wrap gap-2 pb-5 border-b border-neutral-200 mb-5">
            <Button
              variant="primary"
              size="md"
              disabled={connectionSent || connecting}
              onClick={onConnect}
            >
              {connectionSent ? 'Interest Sent' : connecting ? 'Sending…' : 'Express Interest'}
            </Button>
            <Button variant="secondary" size="md" asChild>
              <Link href={`/inbox/${user.id}`}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Link>
            </Button>
            <Button variant="ghost" size="md" aria-label="Save">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="md" aria-label="Share">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
