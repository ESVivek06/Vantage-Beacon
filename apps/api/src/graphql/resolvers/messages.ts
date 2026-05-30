import type { GraphQLContext } from '../context';
import {
  getMessages,
  getUnreadCount,
  sendMessage,
  markMessagesRead,
} from '../../services/messageService';

function requireAuth(context: GraphQLContext) {
  if (!context.user || !context.db) {
    throw new Error('Unauthenticated');
  }
  return { userId: context.user.sub, db: context.db };
}

export const messageResolvers = {
  Query: {
    messages: async (
      _: unknown,
      args: { withUserId: string; limit?: number; before?: string },
      context: GraphQLContext,
    ) => {
      const { userId, db } = requireAuth(context);
      return getMessages(db, {
        userId,
        withUserId: args.withUserId,
        limit: args.limit,
        before: args.before,
      });
    },

    unreadCount: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const { userId, db } = requireAuth(context);
      return getUnreadCount(db, userId);
    },
  },

  Mutation: {
    sendMessage: async (
      _: unknown,
      args: { toUserId: string; content: string },
      context: GraphQLContext,
    ) => {
      const { userId, db } = requireAuth(context);
      if (!args.content.trim()) throw new Error('Message content cannot be empty');
      return sendMessage(db, { senderId: userId, receiverId: args.toUserId, content: args.content });
    },

    markMessagesRead: async (
      _: unknown,
      args: { fromUserId: string },
      context: GraphQLContext,
    ) => {
      const { userId, db } = requireAuth(context);
      return markMessagesRead(db, { toUserId: userId, fromUserId: args.fromUserId });
    },
  },

  Message: {
    sentAt: (msg: { sentAt: Date }) => msg.sentAt.toISOString(),
  },
};
