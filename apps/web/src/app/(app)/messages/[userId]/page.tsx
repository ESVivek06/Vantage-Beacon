'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/graphql';
import { MESSAGES_QUERY, SEND_MESSAGE_MUTATION, MARK_MESSAGES_READ_MUTATION, USER_QUERY } from '@/lib/queries';
import { cn, initials, formatRelative } from '@/lib/utils';

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
  profile?: { displayName: string };
}

export default function ConversationPage() {
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

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const [msgData, userData] = await Promise.all([
          client.request<{ messages: Message[] }>(MESSAGES_QUERY, { withUserId: userId, limit: 50 }),
          client.request<{ user: OtherUser }>(USER_QUERY, { id: userId }),
        ]);
        setMessages(msgData.messages.slice().reverse());
        setOtherUser(userData.user);

        await client.request(MARK_MESSAGES_READ_MUTATION, { fromUserId: userId });
      } catch {
        //
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
    const optimisticMsg: Message = {
      id: `opt-${Date.now()}`,
      senderId: myId ?? '',
      receiverId: userId,
      content: text,
      read: false,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setContent('');

    try {
      const client = createClient();
      const data = await client.request<{ sendMessage: Message }>(SEND_MESSAGE_MUTATION, {
        toUserId: userId,
        content: text,
      });
      setMessages((prev) => prev.map((m) => m.id === optimisticMsg.id ? data.sendMessage : m));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setContent(text);
    } finally {
      setSending(false);
    }
  }

  const otherName = otherUser?.profile?.displayName ?? otherUser?.email ?? 'User';

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border mb-4 shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Avatar className="h-9 w-9">
          {otherUser?.photoUrl && <AvatarFallback style={{ backgroundImage: `url(${otherUser.photoUrl})`, backgroundSize: 'cover' }} />}
          <AvatarFallback>{initials(otherName)}</AvatarFallback>
        </Avatar>
        <div>
          <Link href={`/profile/${userId}`} className="font-medium hover:text-accent text-sm">
            {otherName}
          </Link>
          {otherUser?.role && <p className="text-xs text-muted-foreground capitalize">{otherUser.role}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn('h-10 rounded-2xl bg-muted animate-pulse', i % 2 === 0 ? 'w-2/3' : 'w-1/2 ml-auto')} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Start the conversation with {otherName}
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === myId;
            return (
              <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                {!isMine && (
                  <Avatar className="h-7 w-7 mr-2 shrink-0 self-end">
                    {otherUser?.photoUrl && <AvatarFallback style={{ backgroundImage: `url(${otherUser.photoUrl})`, backgroundSize: 'cover' }} />}
                    <AvatarFallback className="text-xs">{initials(otherName)}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div
                    className={cn(
                      'max-w-xs lg:max-w-md rounded-2xl px-4 py-2 text-sm',
                      isMine
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-neutral-100 text-neutral-900 rounded-bl-sm',
                    )}
                  >
                    {msg.content}
                  </div>
                  <p className={cn('text-xs text-muted-foreground mt-0.5', isMine ? 'text-right' : 'text-left')}>
                    {formatRelative(msg.sentAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t border-border shrink-0">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message ${otherName}…`}
          className="flex-1"
          disabled={sending}
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!content.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
