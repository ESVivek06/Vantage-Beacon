'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, X, MessageSquare, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/graphql';
import { CONNECTIONS_QUERY, RESPOND_TO_CONNECTION_MUTATION } from '@/lib/queries';
import { cn, statusColor, initials, roleLabel, formatRelative } from '@/lib/utils';

type Tab = 'all' | 'pending' | 'accepted';

interface Connection {
  id: string;
  status: string;
  kind: string;
  createdAt: string;
  requester: { id: string; role: string; photoUrl?: string; profile?: { displayName: string } };
  receiver: { id: string; role: string; photoUrl?: string; profile?: { displayName: string } };
}

export default function ConnectionsPage() {
  const { data: session } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [responding, setResponding] = useState<Record<string, boolean>>({});

  async function loadConnections() {
    setLoading(true);
    try {
      const client = createClient();
      const data = await client.request<{ connections: Connection[] }>(CONNECTIONS_QUERY, {});
      setConnections(data.connections);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConnections();
  }, []);

  async function handleRespond(id: string, accept: boolean) {
    setResponding((p) => ({ ...p, [id]: true }));
    try {
      const client = createClient();
      await client.request(RESPOND_TO_CONNECTION_MUTATION, { id, accept });
      setConnections((prev) =>
        prev.map((c) => c.id === id ? { ...c, status: accept ? 'accepted' : 'declined' } : c),
      );
    } catch {
      //
    } finally {
      setResponding((p) => ({ ...p, [id]: false }));
    }
  }

  const myId = session?.user?.id;

  const filtered = connections.filter((c) => {
    if (tab === 'pending') return c.status === 'pending';
    if (tab === 'accepted') return c.status === 'accepted';
    return true;
  });

  const pendingCount = connections.filter((c) => c.status === 'pending' && c.receiver.id === myId).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Connections</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 w-fit">
        {(['all', 'pending', 'accepted'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors',
              tab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t}{t === 'pending' && pendingCount > 0 && <span className="ml-1.5 bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 text-xs">{pendingCount}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>{tab === 'pending' ? 'No pending requests.' : 'No connections yet.'}</p>
          <Button className="mt-4" asChild>
            <Link href="/users">Find People</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((conn) => {
            const isRequester = conn.requester.id === myId;
            const other = isRequester ? conn.receiver : conn.requester;
            const otherName = other.profile?.displayName ?? other.id;
            const isPending = conn.status === 'pending';
            const isIncoming = isPending && conn.receiver.id === myId;

            return (
              <Card key={conn.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {other.photoUrl && <AvatarImage src={other.photoUrl} alt={otherName} />}
                      <AvatarFallback>{initials(otherName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${other.id}`} className="font-medium hover:text-accent truncate">
                          {otherName}
                        </Link>
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusColor(conn.status))}>
                          {conn.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {roleLabel(other.role)} · {conn.kind} · {formatRelative(conn.createdAt)}
                        {isPending && (isIncoming ? ' · Incoming request' : ' · Request sent')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {conn.status === 'accepted' && (
                        <Button size="sm" variant="outline" asChild className="gap-1">
                          <Link href={`/messages/${other.id}`}>
                            <MessageSquare className="h-3.5 w-3.5" /> Message
                          </Link>
                        </Button>
                      )}
                      {isIncoming && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleRespond(conn.id, true)}
                            disabled={responding[conn.id]}
                            className="gap-1"
                          >
                            <Check className="h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespond(conn.id, false)}
                            disabled={responding[conn.id]}
                            className="gap-1"
                          >
                            <X className="h-3.5 w-3.5" /> Decline
                          </Button>
                        </>
                      )}
                    </div>
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
