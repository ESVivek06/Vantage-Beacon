import Link from 'next/link';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { TrustBadgeT0, TrustBadgeT1, GeoTag, RoleBadge } from './TrustBadge';
import { initials } from '@/lib/utils';

export interface ProfileCardProps {
  id: string;
  name: string;
  title?: string;
  role: string;
  location?: string;
  skills?: string[];
  photoUrl?: string;
  verified?: boolean;
  linkedIn?: boolean;
  onExpressInterest?: (id: string) => void;
  interestSent?: boolean;
}

export function ProfileCard({
  id,
  name,
  title,
  role,
  location,
  skills = [],
  photoUrl,
  verified,
  linkedIn,
  onExpressInterest,
  interestSent,
}: ProfileCardProps) {
  const maxSkills = 3;
  const extraSkills = skills.length > maxSkills ? skills.length - maxSkills : 0;

  return (
    <div className="group relative flex flex-col bg-neutral-0 border border-neutral-200 rounded-lg shadow-sm p-5 hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-normal cursor-pointer w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link href={`/profile/${id}`} className="flex items-center gap-3">
          <Avatar className="h-16 w-16 shrink-0">
            {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
            <AvatarFallback className="text-xl font-semibold bg-primary-100 text-primary-700">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <RoleBadge role={role} />
      </div>

      {/* Name + Title */}
      <Link href={`/profile/${id}`} className="block mb-1">
        <h3 className="text-lg font-semibold text-neutral-900 leading-tight hover:text-primary-600 transition-colors">
          {name}
        </h3>
      </Link>
      {title && (
        <p className="text-sm text-neutral-600 mb-2 line-clamp-1">{title}</p>
      )}

      {/* Location + Trust badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {location && <GeoTag location={location} />}
        {linkedIn && <TrustBadgeT1 />}
        {verified && !linkedIn && <TrustBadgeT0 />}
      </div>

      <div className="border-t border-neutral-200 my-3" />

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {skills.slice(0, maxSkills).map((skill) => (
            <span
              key={skill}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700"
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
              +{extraSkills} more
            </span>
          )}
        </div>
      )}

      <div className="border-t border-neutral-200 mb-3" />

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          disabled={interestSent}
          onClick={() => onExpressInterest?.(id)}
        >
          {interestSent ? 'Interest Sent' : 'Express Interest'}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/profile/${id}`}>View</Link>
        </Button>
      </div>
    </div>
  );
}
