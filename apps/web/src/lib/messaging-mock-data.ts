export interface MockThread {
  userId: string;
  name: string;
  role: string;
  photoUrl?: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  unreadCount?: number;
}

export interface MockMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  sentAt: string;
}

export interface MockNotification {
  id: string;
  type: 'match' | 'message' | 'connection' | 'opportunity' | 'system';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actorName?: string;
  actorPhotoUrl?: string;
  actorRole?: string;
}

export const MOCK_THREADS: MockThread[] = [
  {
    userId: 'mock-user-1',
    name: 'Priya Sharma',
    role: 'founder',
    lastMessage: 'Would love to connect and discuss the project further.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    unread: true,
    unreadCount: 3,
  },
  {
    userId: 'mock-user-2',
    name: 'James Okafor',
    role: 'investor',
    lastMessage: `Thanks for the intro — let's schedule a call this week.`,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread: true,
    unreadCount: 1,
  },
  {
    userId: 'mock-user-3',
    name: 'Sofia Reyes',
    role: 'freelancer',
    lastMessage: 'I can start as early as next Monday. Portfolio attached.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    unread: false,
  },
  {
    userId: 'mock-user-4',
    name: 'Marcus Chen',
    role: 'supplier',
    lastMessage: 'Sending over the revised quote now.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unread: false,
  },
  {
    userId: 'mock-user-5',
    name: 'Aisha Patel',
    role: 'founder',
    lastMessage: 'Exciting news — we closed the seed round!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    unread: false,
  },
];

export const MOCK_MESSAGES: Record<string, MockMessage[]> = {
  'mock-user-1': [
    {
      id: 'm1',
      senderId: 'mock-user-1',
      receiverId: 'me',
      content: 'Hi! I came across your profile and I think we could collaborate.',
      read: true,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'm2',
      senderId: 'me',
      receiverId: 'mock-user-1',
      content: 'Thanks for reaching out, Priya! What kind of collaboration did you have in mind?',
      read: true,
      sentAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    },
    {
      id: 'm3',
      senderId: 'mock-user-1',
      receiverId: 'me',
      content: `We're building a B2B SaaS platform and need a strong technical co-founder or lead engineer. Your AI background is exactly what we need.`,
      read: true,
      sentAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
    {
      id: 'm4',
      senderId: 'mock-user-1',
      receiverId: 'me',
      content: 'Would love to connect and discuss the project further.',
      read: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
  ],
  'mock-user-2': [
    {
      id: 'm5',
      senderId: 'me',
      receiverId: 'mock-user-2',
      content: `James, great to connect. I wanted to introduce you to the team at Priya's startup.`,
      read: true,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'm6',
      senderId: 'mock-user-2',
      receiverId: 'me',
      content: `Thanks for the intro — let's schedule a call this week.`,
      read: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
};

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    type: 'match',
    title: 'New AI Match',
    body: 'Priya Sharma (Founder) is an 92% match based on your skills and goals.',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    read: false,
    actionUrl: '/feed',
    actorName: 'Priya Sharma',
    actorRole: 'founder',
  },
  {
    id: 'n2',
    type: 'message',
    title: 'New message from James Okafor',
    body: `Thanks for the intro — let's schedule a call this week.`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    actionUrl: '/inbox/mock-user-2',
    actorName: 'James Okafor',
    actorRole: 'investor',
  },
  {
    id: 'n3',
    type: 'connection',
    title: 'Connection accepted',
    body: 'Sofia Reyes accepted your connection request.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    actionUrl: '/profile/mock-user-3',
    actorName: 'Sofia Reyes',
    actorRole: 'freelancer',
  },
  {
    id: 'n4',
    type: 'opportunity',
    title: 'New opportunity match',
    body: 'A new project matching your skills was posted: "AI Integration for FinTech Platform".',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: true,
    actionUrl: '/opportunities',
  },
  {
    id: 'n5',
    type: 'match',
    title: 'New AI Match',
    body: 'Marcus Chen (Supplier) is an 85% match for your hardware sourcing needs.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true,
    actionUrl: '/feed',
    actorName: 'Marcus Chen',
    actorRole: 'supplier',
  },
  {
    id: 'n6',
    type: 'system',
    title: 'Profile completion reminder',
    body: 'Complete your profile to get 3× more matches. Add your portfolio and skills.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    actionUrl: '/profile',
  },
  {
    id: 'n7',
    type: 'connection',
    title: 'New connection request',
    body: 'Aisha Patel wants to connect with you.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    read: true,
    actionUrl: '/connections',
    actorName: 'Aisha Patel',
    actorRole: 'founder',
  },
];

export const MOCK_USERS: Record<string, { id: string; name: string; role: string; email: string; photoUrl?: string; verified?: boolean }> = {
  'mock-user-1': { id: 'mock-user-1', name: 'Priya Sharma', role: 'founder', email: 'priya@example.com', verified: true },
  'mock-user-2': { id: 'mock-user-2', name: 'James Okafor', role: 'investor', email: 'james@example.com', verified: true },
  'mock-user-3': { id: 'mock-user-3', name: 'Sofia Reyes', role: 'freelancer', email: 'sofia@example.com' },
  'mock-user-4': { id: 'mock-user-4', name: 'Marcus Chen', role: 'supplier', email: 'marcus@example.com' },
  'mock-user-5': { id: 'mock-user-5', name: 'Aisha Patel', role: 'founder', email: 'aisha@example.com' },
};
