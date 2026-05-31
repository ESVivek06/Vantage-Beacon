'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/graphql';
import { USERS_QUERY } from '@/lib/queries';
import { cn, roleLabel, roleColor, initials } from '@/lib/utils';

const ROLES = ['', 'freelancer', 'founder', 'investor', 'supplier', 'stakeholder'];
const REGIONS = ['', 'UK', 'IN', 'NA'];

interface User {
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [region, setRegion] = useState('');
  const [search, setSearch] = useState('');

  async function loadUsers() {
    setLoading(true);
    try {
      const client = createClient();
      const data = await client.request<{ users: User[] }>(USERS_QUERY, {
        role: role || undefined,
        region: region || undefined,
        limit: 50,
      });
      setUsers(data.users);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [role, region]);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const name = u.profile?.displayName ?? u.email;
    return name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.includes(search.toLowerCase()) ||
      u.profile?.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Browse People</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or skill…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            {ROLES.filter(Boolean).map((r) => (
              <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No users found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => {
            const name = user.profile?.displayName ?? user.email;
            return (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Link href={`/profile/${user.id}`}>
                      <Avatar className="h-12 w-12">
                        {user.photoUrl && <AvatarFallback style={{ backgroundImage: `url(${user.photoUrl})`, backgroundSize: 'cover' }} />}
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Link href={`/profile/${user.id}`} className="font-semibold text-sm hover:text-accent truncate">
                          {name}
                        </Link>
                        {user.profile?.verified && <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', roleColor(user.role))}>
                          {roleLabel(user.role)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{user.region}
                        </span>
                      </div>
                    </div>
                  </div>

                  {user.profile?.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{user.profile.bio}</p>
                  )}

                  {user.profile?.skills && user.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {user.profile.skills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                      {user.profile.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{user.profile.skills.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  <Button size="sm" variant="outline" asChild className="w-full">
                    <Link href={`/profile/${user.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
