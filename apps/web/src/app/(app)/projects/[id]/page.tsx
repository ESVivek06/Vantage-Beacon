'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin, Calendar, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/graphql';
import { PROJECT_QUERY, DELETE_PROJECT_MUTATION, SEND_CONNECTION_MUTATION } from '@/lib/queries';
import { cn, statusColor, initials, formatDate, roleLabel } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  requiredSkills: string[];
  budget?: { min?: number; max?: number; currency?: string };
  region: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    email: string;
    role: string;
    photoUrl?: string;
    profile?: { displayName: string; bio?: string };
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const data = await client.request<{ project: Project }>(PROJECT_QUERY, { id: projectId });
        setProject(data.project);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  async function handleApply() {
    if (!project) return;
    setApplying(true);
    try {
      const client = createClient();
      await client.request(SEND_CONNECTION_MUTATION, {
        input: { receiverId: project.owner.id, kind: 'collaboration' },
      });
      setApplied(true);
    } catch {
      //
    } finally {
      setApplying(false);
    }
  }

  async function handleDelete() {
    if (!project || !confirm('Delete this project?')) return;
    setDeleting(true);
    try {
      const client = createClient();
      await client.request(DELETE_PROJECT_MUTATION, { id: project.id });
      router.push('/projects');
    } catch {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="h-64 rounded-lg bg-muted animate-pulse" />;
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/projects">Browse Projects</Link>
        </Button>
      </div>
    );
  }

  const ownerName = project.owner.profile?.displayName ?? project.owner.email;
  const isOwner = session?.user?.id === project.owner.id;

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusColor(project.status))}>
              {project.status.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />{project.region}
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />Posted {formatDate(project.createdAt)}
            </span>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-1">
              <Trash2 className="h-3.5 w-3.5" /> {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>About this project</CardTitle></CardHeader>
        <CardContent>
          {project.description ? (
            <p className="text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No description provided.</p>
          )}

          {project.budget && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium">Budget</p>
              <p className="text-sm text-muted-foreground mt-1">
                {project.budget.currency ?? '£'}{project.budget.min ?? '?'} – {project.budget.currency ?? '£'}{project.budget.max ?? '?'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {project.requiredSkills.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Required Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle>Posted by</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {project.owner.photoUrl && <AvatarFallback style={{ backgroundImage: `url(${project.owner.photoUrl})`, backgroundSize: 'cover' }} />}
              <AvatarFallback>{initials(ownerName)}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/profile/${project.owner.id}`} className="font-medium hover:text-accent">
                {ownerName}
              </Link>
              <p className="text-xs text-muted-foreground">{roleLabel(project.owner.role)}</p>
            </div>
            {!isOwner && (
              <Button size="sm" variant="outline" asChild className="ml-auto">
                <Link href={`/profile/${project.owner.id}`}>View Profile</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!isOwner && project.status === 'open' && (
        <div className="flex gap-3">
          <Button
            onClick={handleApply}
            disabled={applied || applying}
            size="lg"
            className="gap-2"
          >
            {applied ? 'Interest Expressed' : applying ? 'Submitting…' : 'Express Interest'}
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={`/messages/${project.owner.id}`}>Message Owner</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
