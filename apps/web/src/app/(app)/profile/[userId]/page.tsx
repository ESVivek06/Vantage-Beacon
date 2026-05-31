'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, MapPin, MessageSquare, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/graphql';
import { USER_QUERY, SEND_CONNECTION_MUTATION } from '@/lib/queries';
import { cn, roleLabel, roleColor, initials } from '@/lib/utils';

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
  ownedProjects: Array<{ id: string; title: string; status: string; description?: string; requiredSkills: string[] }>;
}

export default function UserProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectionSent, setConnectionSent] = useState(false);

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
    return <div className="h-64 rounded-lg bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">User not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/users">Browse People</Link>
        </Button>
      </div>
    );
  }

  const displayName = user.profile?.displayName ?? user.email;
  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="max-w-2xl">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              {user.photoUrl && <AvatarImage src={user.photoUrl} alt={displayName} />}
              <AvatarFallback className="text-2xl">{initials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{displayName}</h1>
                {user.profile?.verified && <CheckCircle className="h-5 w-5 text-accent" />}
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', roleColor(user.role))}>
                  {roleLabel(user.role)}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.region}
                </span>
              </div>
              {user.profile?.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{user.profile.bio}</p>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={connectionSent || connecting}
                className="gap-2"
              >
                <Link2 className="h-4 w-4" />
                {connectionSent ? 'Request Sent' : connecting ? 'Sending…' : 'Connect'}
              </Button>
              <Button size="sm" variant="outline" asChild className="gap-2">
                <Link href={`/messages/${userId}`}>
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Link>
              </Button>
            </div>
          )}

          {isOwnProfile && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button size="sm" variant="outline" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {user.profile?.skills && user.profile.skills.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user.profile?.tags && user.profile.tags.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.profile.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user.ownedProjects && user.ownedProjects.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.ownedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-md border border-border p-3 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{project.title}</span>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize', project.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                  )}
                  {project.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.requiredSkills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
