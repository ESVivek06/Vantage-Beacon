import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { Pencil, CheckCircle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/graphql';
import { ME_QUERY } from '@/lib/queries';
import { roleLabel, roleColor, initials, cn } from '@/lib/utils';

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect('/auth/sign-in');

  let userData: {
    me: {
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
      ownedProjects: Array<{ id: string; title: string; status: string; region: string }>;
    };
  } | null = null;

  try {
    const client = createClient();
    userData = await client.request(ME_QUERY);
  } catch {
    // fallback to session data
  }

  const user = userData?.me;
  const displayName = user?.profile?.displayName ?? session.user.name ?? session.user.email ?? 'User';
  const role = user?.role ?? session.user.role ?? 'stakeholder';
  const region = user?.region ?? session.user.region ?? 'UK';

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display-sm font-bold">My Profile</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile/edit" className="gap-2 inline-flex items-center">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              {user?.photoUrl && <AvatarImage src={user.photoUrl} alt={displayName} />}
              <AvatarFallback className="text-2xl">{initials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{displayName}</h2>
                {user?.profile?.verified && (
                  <CheckCircle className="h-5 w-5 text-accent" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', roleColor(role))}>
                  {roleLabel(role)}
                </span>
                <span className="flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {region}
                </span>
              </div>
              {user?.profile?.bio && (
                <p className="mt-3 text-sm text-neutral-500">{user.profile.bio}</p>
              )}
              {!user?.profile?.bio && (
                <p className="mt-3 text-sm text-neutral-500 italic">No bio yet. Add one to help others find you.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.profile?.skills && user.profile.skills.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user?.profile?.tags && user.profile.tags.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.profile.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user?.ownedProjects && user.ownedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.ownedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-sm">{project.title}</span>
                  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize', project.status === 'open' ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600')}>
                    {project.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-500">
              Complete your profile to start matching with others.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/profile/edit">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
