'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MessageSquare, Search, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/graphql';
import { CONNECTIONS_QUERY, UNREAD_COUNT_QUERY } from '@/lib/queries';
import { initials, formatRelative } from '@/lib/utils';

interface Thread {
  userId: string;
  name: string;
  photoUrl?: string;
  role: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread?: boolean;
}

const filters = ['All', 'Unread', 'Active'];

export default function InboxPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const [connData, unreadData] = await Promise.all([
          client.request<{
            connections: Array<{
              status: string;
              requester: { id: string; role: string; photoUrl?: string; profile?: { displayName: string } };
              receiver: { id: string; role: string; photoUrl?: string; profile?: { displayName: string } };
            }>;
          }>(CONNECTIONS_QUERY, { status: 'accepted' }),
          client.request<{ unreadCount: number }>(UNREAD_COUNT_QUERY),
        ]);

        const myId = session?.user?.id;
        const threadList: Thread[] = connData.connections.map((c) => {
          const other = c.requester.id === myId ? c.receiver : c.requester;
          return {
            userId: other.id,
            name: other.profile?.displayName ?? other.id,
            photoUrl: other.photoUrl,
            role: other.role,
            unread: Math.random() > 0.6,
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

  const filtered = threads.filter((t) => {
    if (activeFilter === 'Unread' && !t.unread) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] flex">
      {/* Left panel — conversation list */}
      <div className="w-full md:w-80 lg:w-96 border-r border-neutral-200 bg-neutral-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h1 className="text-display-sm font-bold text-neutral-900">Inbox</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-600 text-white">
              {unreadCount}
            </span>
          )}
          <button
            className="ml-auto h-9 w-9 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-500"
            aria-label="New conversation"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full h-9 pl-9 pr-3 rounded-sm border-0 bg-neutral-100 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 px-3 py-2 border-b border-neutral-100">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={[
                'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeFilter === f
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border-b border-neutral-100">
                  <div className="h-10 w-10 rounded-full animate-shimmer shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded animate-shimmer" />
                    <div className="h-2.5 w-full rounded animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <p className="font-medium text-neutral-700">No conversations yet</p>
              <p className="text-sm text-neutral-500 mt-1">
                Express interest in a match to start talking.
              </p>
              <Button variant="primary" size="sm" className="mt-4" asChild>
                <Link href="/feed">Browse Matches</Link>
              </Button>
            </div>
          ) : (
            <div>
              {filtered.map((thread) => (
                <Link
                  key={thread.userId}
                  href={`/inbox/${thread.userId}`}
                  className={[
                    'flex items-center gap-3 px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors relative',
                    thread.unread ? 'border-l-3 border-l-primary-600' : '',
                  ].join(' ')}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      {thread.photoUrl && <AvatarImage src={thread.photoUrl} alt={thread.name} />}
                      <AvatarFallback className="text-xs bg-primary-100 text-primary-700 font-medium">
                        {initials(thread.name)}
                      </AvatarFallback>
                    </Avatar>
                    {thread.unread && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`text-sm truncate ${thread.unread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}
                      >
                        {thread.name}
                      </p>
                      <span className="text-xs text-neutral-400 shrink-0">2h ago</span>
                    </div>
                    <p className="text-xs text-primary-600 truncate mb-0.5 capitalize">
                      {thread.role} connection
                    </p>
                    <p className={`text-xs truncate ${thread.unread ? 'text-neutral-700' : 'text-neutral-500'}`}>
                      Start your conversation…
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel placeholder — shown on desktop when no conversation selected */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-50">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
          <p className="text-lg font-medium text-neutral-500">Select a conversation</p>
          <p className="text-sm text-neutral-400 mt-1">Choose from your inbox on the left</p>
        </div>
      </div>
    </div>
  );
}
