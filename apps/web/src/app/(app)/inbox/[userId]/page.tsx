'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Send, ChevronLeft, Paperclip, MoreHorizontal, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustBadgeT0, TrustBadgeT1 } from '@/components/TrustBadge';
import { createClient } from '@/lib/graphql';
import { MESSAGES_QUERY, SEND_MESSAGE_MUTATION, MARK_MESSAGES_READ_MUTATION, USER_QUERY } from '@/lib/queries';
import { cn, initials, formatRelative } from '@/lib/utils';
import { MOCK_MESSAGES, MOCK_USERS } from '@/lib/messaging-mock-data';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  sentAt: string;
}

interface OtherUser {
  id: string;
  email: string;
  role: string;
  photoUrl?: string;
  profile?: { displayName: string; verified?: boolean };
}

export default function InboxConversationPage() {
  const params = useParams();
  const { data: session } = useSession();
  const userId = params.userId as string;
  const myId = session?.user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const [msgData, userData] = await Promise.all([
          client.request<{ messages: Message[] }>(MESSAGES_QUERY, { withUserId: userId, limit: 50 }),
          client.request<{ user: OtherUser }>(USER_QUERY, { id: userId }),
        ]);
        const reversed = msgData.messages.slice().reverse();
        if (reversed.length === 0 && MOCK_MESSAGES[userId]) {
          setMessages(MOCK_MESSAGES[userId]);
        } else {
          setMessages(reversed);
        }
        setOtherUser(userData.user);
        await client.request(MARK_MESSAGES_READ_MUTATION, { fromUserId: userId });
      } catch {
        const mockUser = MOCK_USERS[userId];
        if (mockUser) {
          setOtherUser({ id: mockUser.id, email: mockUser.email, role: mockUser.role, profile: { displayName: mockUser.name, verified: mockUser.verified } });
          setMessages(MOCK_MESSAGES[userId] ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || sending) return;

    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      senderId: myId ?? '',
      receiverId: userId,
      content: text,
      read: false,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setContent('');

    try {
      const client = createClient();
      const data = await client.request<{ sendMessage: Message }>(SEND_MESSAGE_MUTATION, {
        toUserId: userId,
        content: text,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? data.sendMessage : m)),
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setContent(text);
    } finally {
      setSending(false);
    }
  }

  const otherName = otherUser?.profile?.displayName ?? otherUser?.email ?? 'User';

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] flex">
      {/* Left panel — list (desktop only) */}
      <div className="hidden md:block w-80 lg:w-96 border-r border-neutral-200 bg-neutral-50">
        <div className="p-4 border-b border-neutral-200 bg-neutral-0">
          <Link
            href="/inbox"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
            All conversations
          </Link>
        </div>
        <div className="p-6 text-center text-sm text-neutral-400">
          Select another conversation from the inbox
        </div>
      </div>

      {/* Right panel — conversation */}
      <div className="flex-1 flex flex-col bg-neutral-0">
        {/* Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-neutral-200 shrink-0">
          <Link
            href="/inbox"
            className="md:hidden h-8 w-8 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-500"
            aria-label="Back to inbox"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <Avatar className="h-10 w-10">
            {otherUser?.photoUrl && <AvatarImage src={otherUser.photoUrl} alt={otherName} />}
            <AvatarFallback className="bg-primary-100 text-primary-700 font-medium">
              {initials(otherName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-md font-semibold text-neutral-900 truncate">{otherName}</p>
              {otherUser?.profile?.verified && <TrustBadgeT1 />}
              {!otherUser?.profile?.verified && <TrustBadgeT0 />}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/profile/${userId}`}>Profile</Link>
            </Button>
            <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-500">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Opportunity anchor — sticky */}
        <div className="px-4 py-2.5 bg-primary-50 border-b border-primary-200 shrink-0">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary-600 shrink-0" />
            <p className="text-sm font-semibold text-primary-700 truncate">
              RE: Connection on V.B
            </p>
            <Link
              href="/opportunities"
              className="ml-auto text-xs text-primary-600 hover:underline shrink-0"
            >
              View
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-10 rounded-lg animate-shimmer',
                    i % 2 === 0 ? 'w-2/3' : 'w-1/2 ml-auto',
                  )}
                />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">
              Start the conversation with {otherName}
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === myId;
              const prevMsg = messages[idx - 1];
              const showDate =
                !prevMsg ||
                new Date(msg.sentAt).toDateString() !== new Date(prevMsg.sentAt).toDateString();

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="text-center text-xs text-neutral-400 my-3">
                      {new Date(msg.sentAt).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                  )}
                  <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    {!isMine && (
                      <Avatar className="h-7 w-7 mr-2 shrink-0 self-end">
                        {otherUser?.photoUrl && (
                          <AvatarImage src={otherUser.photoUrl} alt={otherName} />
                        )}
                        <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                          {initials(otherName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="max-w-[70%]">
                      <div
                        className={cn(
                          'px-4 py-2.5 text-sm leading-relaxed',
                          isMine
                            ? 'bg-primary-600 text-white rounded-lg rounded-br-xs'
                            : 'bg-neutral-100 text-neutral-900 rounded-lg rounded-bl-xs',
                        )}
                      >
                        {msg.content}
                      </div>
                      <p
                        className={cn(
                          'text-2xs text-neutral-400 mt-1',
                          isMine ? 'text-right' : 'text-left',
                        )}
                      >
                        {formatRelative(msg.sentAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 px-4 py-3 border-t border-neutral-200 bg-neutral-0 shrink-0"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            className="h-10 w-10 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as FormEvent);
              }
            }}
            placeholder={`Message ${otherName}…`}
            rows={1}
            className="flex-1 resize-none h-10 max-h-32 py-2.5 px-3 rounded-sm border border-neutral-200 text-sm bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)] placeholder:text-neutral-400 disabled:cursor-not-allowed overflow-y-auto"
            disabled={sending}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="h-10 w-10 flex items-center justify-center rounded-md bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
