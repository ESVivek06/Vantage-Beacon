import type { PrismaClient } from '@prisma/client';

const PAGE_SIZE = 50;

/** Fetch messages in a conversation between two users, ordered oldest-first. */
export async function getMessages(
  db: PrismaClient,
  opts: {
    userId: string;
    withUserId: string;
    limit?: number | null;
    before?: string | null;
  },
) {
  const limit = Math.min(opts.limit ?? PAGE_SIZE, 100);

  return db.message.findMany({
    where: {
      deletedAt: null,
      OR: [
        { senderId: opts.userId, receiverId: opts.withUserId },
        { senderId: opts.withUserId, receiverId: opts.userId },
      ],
      ...(opts.before ? { sentAt: { lt: new Date(opts.before) } } : {}),
    },
    orderBy: { sentAt: 'asc' },
    take: limit,
  });
}

/** Count unread messages received by userId. */
export async function getUnreadCount(db: PrismaClient, userId: string): Promise<number> {
  return db.message.count({
    where: { receiverId: userId, read: false, deletedAt: null },
  });
}

/** Send a text message from senderId to receiverId. */
export async function sendMessage(
  db: PrismaClient,
  opts: { senderId: string; receiverId: string; content: string },
) {
  return db.message.create({
    data: {
      senderId: opts.senderId,
      receiverId: opts.receiverId,
      content: opts.content,
    },
  });
}

/** Mark all unread messages from fromUserId to toUserId as read. Returns count updated. */
export async function markMessagesRead(
  db: PrismaClient,
  opts: { toUserId: string; fromUserId: string },
): Promise<number> {
  const result = await db.message.updateMany({
    where: {
      senderId: opts.fromUserId,
      receiverId: opts.toUserId,
      read: false,
      deletedAt: null,
    },
    data: { read: true },
  });
  return result.count;
}
