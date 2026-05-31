'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Search, Plus, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/graphql';
import { PROJECTS_QUERY } from '@/lib/queries';
import { cn, statusColor, initials, formatRelative } from '@/lib/utils';

const REGIONS = ['', 'UK', 'IN', 'NA'];

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  requiredSkills: string[];
  budget?: { min?: number; max?: number; currency?: string };
  region: string;
  createdAt: string;
  owner: {
    id: string;
    role: string;
    photoUrl?: string;
    profile?: { displayName: string };
  };
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');

  async function loadProjects() {
    setLoading(true);
    try {
      const client = createClient();
      const data = await client.request<{ projects: Project[] }>(PROJECTS_QUERY, {
        filter: { region: region || undefined },
        limit: 50,
      });
      setProjects(data.projects);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [region]);

  const filtered = projects.filter((p) => {
    if (!search) return true;
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.requiredSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const isFounder = session?.user?.role === 'founder';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {isFounder && (
          <Button asChild className="gap-2">
            <Link href="/projects/create">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects or skills…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All regions</SelectItem>
            {REGIONS.filter(Boolean).map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No projects found.</p>
          {isFounder && (
            <Button className="mt-4" asChild>
              <Link href="/projects/create">Create your first project</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((project) => {
            const ownerName = project.owner.profile?.displayName ?? 'Unknown';
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <Link href={`/projects/${project.id}`} className="text-lg font-semibold hover:text-accent">
                        {project.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusColor(project.status))}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{project.region}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />{formatRelative(project.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/projects/${project.id}`}>View</Link>
                    </Button>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                  )}

                  {project.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.requiredSkills.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Avatar className="h-6 w-6">
                      {project.owner.photoUrl && <AvatarImage src={project.owner.photoUrl} alt={ownerName} />}
                      <AvatarFallback className="text-xs">{initials(ownerName)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      by{' '}
                      <Link href={`/profile/${project.owner.id}`} className="hover:text-accent font-medium">
                        {ownerName}
                      </Link>
                    </span>
                    {project.budget && (
                      <span className="ml-auto text-xs font-medium text-muted-foreground">
                        {project.budget.currency ?? '£'}{project.budget.min ?? '?'} – {project.budget.max ?? '?'}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
