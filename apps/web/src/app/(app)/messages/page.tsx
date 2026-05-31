'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/graphql';
import { CONNECTIONS_QUERY, UNREAD_COUNT_QUERY } from '@/lib/queries';
import { initials, formatRelative } from '@/lib/utils';

interface ThreadPreview {
  userId: string;
  name: string;
  photoUrl?: string;
  role: string;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<ThreadPreview[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const [connData, unreadData] = await Promise.all([
          client.request<{ connections: Array<{ status: string; requester: { id: string; role: string; photoUrl?: string; profile?: { displayName: string } }; receiver: { id: string; role: string; photoUrl?: string; profile?: { displayName: string } } }> }>(
            CONNECTIONS_QUERY, { status: 'accepted' },
          ),
          client.request<{ unreadCount: number }>(UNREAD_COUNT_QUERY),
        ]);

        const myId = session?.user?.id;
        const threadList: ThreadPreview[] = connData.connections.map((c) => {
          const other = c.requester.id === myId ? c.receiver : c.requester;
          return {
            userId: other.id,
            name: other.profile?.displayName ?? other.id,
            photoUrl: other.photoUrl,
            role: other.role,
          };
        });

        setThreads(threadList);
        setUnreadCount(unreadData.unreadCount);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        {unreadCount > 0 && (
          <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
            {unreadCount} unread
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Connect with people to start messaging.</p>
          <Button className="mt-4" asChild>
            <Link href="/connections">View Connections</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <Link
              key={thread.userId}
              href={`/messages/${thread.userId}`}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
            >
              <Avatar className="h-10 w-10">
                {thread.photoUrl && <AvatarFallback style={{ backgroundImage: `url(${thread.photoUrl})`, backgroundSize: 'cover' }} />}
                <AvatarFallback>{initials(thread.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{thread.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{thread.role}</p>
              </div>
              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
