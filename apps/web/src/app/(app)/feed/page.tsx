'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { RefreshCw, UserCheck, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/graphql';
import { USERS_QUERY, SEND_CONNECTION_MUTATION } from '@/lib/queries';
import { cn, roleLabel, roleColor, initials } from '@/lib/utils';

interface UserMatch {
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
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  async function loadMatches() {
    setLoading(true);
    try {
      const client = createClient();
      const data = await client.request<{ users: UserMatch[] }>(USERS_QUERY, { limit: 20 });
      const filtered = data.users.filter((u) => u.id !== session?.user?.id);
      setMatches(filtered.slice(0, 20));
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, [session]);

  async function handleConnect(userId: string) {
    if (!session?.user) return;
    setConnecting((p) => ({ ...p, [userId]: true }));
    try {
      const client = createClient();
      await client.request(SEND_CONNECTION_MUTATION, {
        input: { receiverId: userId, kind: 'collaboration' },
      });
      setConnected((p) => ({ ...p, [userId]: true }));
    } catch {
      // handle
    } finally {
      setConnecting((p) => ({ ...p, [userId]: false }));
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Feed</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">Top matches for your profile</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadMatches} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No matches yet</p>
          <p className="text-sm mt-1">Check back soon as more users join the platform.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((user) => {
            const name = user.profile?.displayName ?? user.email;
            const isConnected = connected[user.id];
            const isConnecting = connecting[user.id];

            return (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Link href={`/profile/${user.id}`}>
                      <Avatar className="h-12 w-12">
                        {user.photoUrl && <AvatarImage src={user.photoUrl} alt={name} />}
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${user.id}`} className="font-semibold hover:text-accent truncate block">
                        {name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', roleColor(user.role))}>
                          {roleLabel(user.role)}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.region}</span>
                      </div>
                    </div>
                  </div>

                  {user.profile?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{user.profile.bio}</p>
                  )}

                  {user.profile?.skills && user.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.profile.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {user.profile.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.profile.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/profile/${user.id}`}>View Profile</Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={isConnected || isConnecting}
                      onClick={() => handleConnect(user.id)}
                    >
                      {isConnected ? 'Requested' : isConnecting ? 'Sending…' : 'Connect'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Browse Projects</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Discover open projects looking for collaborators.
        </p>
        <Button variant="outline" asChild>
          <Link href="/projects">Browse all projects</Link>
        </Button>
      </div>
    </div>
  );
}
