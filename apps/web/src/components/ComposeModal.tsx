'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Search, Send, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { cn, initials } from '@/lib/utils';
import { MOCK_USERS } from '@/lib/messaging-mock-data';

interface Recipient {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  onSend?: (recipientId: string, message: string) => void;
  initialRecipientId?: string;
}

const roleColors: Record<string, string> = {
  freelancer: 'text-violet-700 bg-violet-50',
  founder: 'text-teal-700 bg-teal-50',
  investor: 'text-amber-700 bg-amber-50',
  supplier: 'text-pink-700 bg-pink-50',
};

export function ComposeModal({ open, onClose, onSend, initialRecipientId }: ComposeModalProps) {
  const allUsers = Object.values(MOCK_USERS);
  const [query, setQuery] = useState('');
  const [recipient, setRecipient] = useState<Recipient | null>(
    initialRecipientId ? (MOCK_USERS[initialRecipientId] ?? null) : null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setSent(false);
      setMessage('');
      if (!initialRecipientId) {
        setRecipient(null);
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    }
  }, [open, initialRecipientId]);

  const suggestions = query.length > 0
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.role.toLowerCase().includes(query.toLowerCase()),
      )
    : allUsers;

  function selectRecipient(user: Recipient) {
    setRecipient(user);
    setQuery('');
    setShowDropdown(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function handleSend() {
    if (!recipient || !message.trim() || sending) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    onSend?.(recipient.id, message.trim());
    setSending(false);
    setSent(true);
    setTimeout(() => {
      onClose();
      setSent(false);
    }, 1200);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label="New message"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">New Message</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* To field */}
        <div className="flex items-start gap-2 px-4 py-2.5 border-b border-neutral-100">
          <span className="text-xs text-neutral-400 mt-2 shrink-0 w-6">To:</span>
          <div className="flex-1 relative">
            {recipient ? (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-primary-50 text-primary-700 rounded-full pl-1 pr-2 py-0.5">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[9px] bg-primary-100 text-primary-700">
                      {initials(recipient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{recipient.name}</span>
                  <button
                    onClick={() => setRecipient(null)}
                    className="text-primary-400 hover:text-primary-700 ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by name or role…"
                  className="w-full h-8 pl-7 pr-3 text-sm bg-neutral-50 rounded-md border border-neutral-200 focus:outline-none focus:border-primary-400 placeholder:text-neutral-400"
                />
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg max-h-48 overflow-y-auto z-20">
                    {suggestions.length === 0 ? (
                      <p className="text-xs text-neutral-400 px-3 py-2">No results</p>
                    ) : (
                      suggestions.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => selectRecipient(u)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-neutral-50 text-left"
                        >
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="text-xs bg-neutral-100 text-neutral-600">
                              {initials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{u.name}</p>
                            <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                          </div>
                          <span
                            className={cn(
                              'text-2xs px-1.5 py-0.5 rounded-full font-medium capitalize shrink-0',
                              roleColors[u.role] ?? 'text-neutral-600 bg-neutral-100',
                            )}
                          >
                            {u.role}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message area */}
        <div className="flex-1 px-4 py-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
            }}
            placeholder={recipient ? `Message ${recipient.name}…` : 'Select a recipient first'}
            disabled={!recipient || sending || sent}
            rows={6}
            className="w-full resize-none text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent disabled:cursor-not-allowed"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
          <p className="text-2xs text-neutral-400">⌘ + Enter to send</p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!recipient || !message.trim() || sending || sent}
            className="gap-2"
          >
            {sent ? (
              'Sent!'
            ) : sending ? (
              'Sending…'
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
