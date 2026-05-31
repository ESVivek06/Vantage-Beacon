'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MapPin,
  MessageSquare,
  Bookmark,
  Share2,
  CheckCircle2,
  Briefcase,
  Calendar,
  BadgeCheck,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustBadgeT0, TrustBadgeT1, RoleBadge } from '@/components/TrustBadge';
import { createClient } from '@/lib/graphql';
import { USER_QUERY, SEND_CONNECTION_MUTATION } from '@/lib/queries';
import { initials, roleLabel } from '@/lib/utils';

interface UserData {
  id: string;
  email: string;
  role: string;
  region: string;
  photoUrl?: string;
  profile?: {
    displayName: string;
    bio?: string;
    skills: string[];
    tags: string[];
    verified: boolean;
  };
  ownedProjects: Array<{
    id: string;
    title: string;
    status: string;
    description?: string;
    requiredSkills: string[];
  }>;
}

const roleColors: Record<string, string> = {
  freelancer: 'from-[#7C3AED]/20 to-transparent',
  founder: 'from-[#0D9488]/20 to-transparent',
  investor: 'from-[#D97706]/20 to-transparent',
  supplier: 'from-[#DB2777]/20 to-transparent',
};

export default function UserProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionSent, setConnectionSent] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const data = await client.request<{ user: UserData }>(USER_QUERY, { id: userId });
        setUser(data.user);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const client = createClient();
      await client.request(SEND_CONNECTION_MUTATION, {
        input: { receiverId: userId, kind: 'collaboration' },
      });
      setConnectionSent(true);
    } catch {
      //
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-64 rounded-xl animate-shimmer mb-4" />
        <div className="h-40 rounded-xl animate-shimmer" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-display-sm font-semibold text-neutral-700 mb-2">User not found</h2>
        <p className="text-neutral-500 mb-6">This profile may have been removed.</p>
        <Button variant="ghost" asChild>
          <Link href="/discover/talent">Browse Talent</Link>
        </Button>
      </div>
    );
  }

  const displayName = user.profile?.displayName ?? user.email;
  const isOwnProfile = session?.user?.id === userId;
  const coverGradient = roleColors[user.role] ?? 'from-primary-100 to-transparent';
  const bio = user.profile?.bio ?? '';
  const bioTruncated = bio.length > 300;
  const shownBio = bioExpanded || !bioTruncated ? bio : bio.slice(0, 300) + '…';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero section */}
      <div className="bg-neutral-0 rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Cover band */}
        <div className={`h-32 sm:h-48 bg-gradient-to-r ${coverGradient} bg-primary-50`} />

        <div className="px-6 pb-6">
          {/* Avatar — overlapping cover */}
          <div className="-mt-12 sm:-mt-16 mb-4">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-neutral-0 shadow-sm">
              {user.photoUrl && <AvatarImage src={user.photoUrl} alt={displayName} />}
              <AvatarFallback className="text-2xl font-semibold bg-primary-100 text-primary-700">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name + role + trust */}
          <div className="mb-4">
            <h1 className="text-display-sm font-bold text-neutral-900 mb-1">{displayName}</h1>
            {user.profile?.bio && (
              <p className="text-lg text-neutral-600 mb-2">{user.profile.bio.split('.')[0]}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              {user.region && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  <MapPin className="h-3 w-3 text-neutral-500" />
                  {user.region}
                </span>
              )}
              {user.profile?.verified && <TrustBadgeT1 />}
            </div>
          </div>

          {/* Action row */}
          {!isOwnProfile ? (
            <div className="flex flex-wrap gap-2 pb-5 border-b border-neutral-200 mb-5">
              <Button
                variant="primary"
                size="lg"
                disabled={connectionSent || connecting}
                onClick={handleConnect}
              >
                {connectionSent ? 'Interest Sent' : connecting ? 'Sending…' : 'Express Interest'}
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href={`/inbox/${userId}`}>
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Link>
              </Button>
              <Button variant="ghost" size="lg" aria-label="Save profile">
                <Bookmark className="h-4 w-4" />
                Save
              </Button>
              <Button variant="ghost" size="lg" aria-label="Share profile">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 pb-5 border-b border-neutral-200 mb-5">
              <Button variant="secondary" size="md" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-xl font-bold text-primary-600">
                {user.ownedProjects?.length ?? 0}
              </p>
              <p className="text-xs text-neutral-500">Opportunities</p>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center">
              <p className="text-xl font-bold text-primary-600">
                {user.profile?.skills?.length ?? 0}
              </p>
              <p className="text-xs text-neutral-500">Skills</p>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center">
              <p className="text-xs text-neutral-500">Member since</p>
              <p className="text-sm font-medium text-neutral-700">2024</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {bio && (
            <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-3">About</h2>
              <p className="text-md text-neutral-700 leading-relaxed">{shownBio}</p>
              {bioTruncated && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="mt-2 text-sm text-primary-600 hover:underline font-medium"
                >
                  {bioExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </section>
          )}

          {/* Skills */}
          {user.profile?.skills && user.profile.skills.length > 0 && (
            <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Skills &amp; Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {user.profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm font-medium px-3 py-1 rounded-full bg-neutral-100 text-neutral-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {user.profile.tags && user.profile.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-1 rounded-md border border-neutral-200 text-neutral-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Opportunities / Projects */}
          {user.ownedProjects && user.ownedProjects.length > 0 && (
            <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Open Opportunities</h2>
              <div className="space-y-3">
                {user.ownedProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/opportunities/${project.id}`}
                    className="block rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-neutral-900">{project.title}</span>
                      <span
                        className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          project.status === 'open'
                            ? 'bg-success-100 text-success-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-neutral-500 line-clamp-2">{project.description}</p>
                    )}
                    {project.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.requiredSkills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Open To */}
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Open To
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-success-600" />
                Contract work
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-success-600" />
                Full-time roles
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-success-600" />
                Advisory
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500 mt-3">
                <Calendar className="h-4 w-4" />
                <span>Availability: Immediate</span>
              </div>
            </div>
          </section>

          {/* Verified Credentials */}
          <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Verified Credentials
            </h2>
            <div className="space-y-2">
              {user.profile?.verified && (
                <div className="flex items-center gap-2">
                  <TrustBadgeT1 />
                </div>
              )}
              <div className="flex items-center gap-2">
                <TrustBadgeT0 />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
