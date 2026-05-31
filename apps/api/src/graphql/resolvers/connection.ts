import type { GraphQLContext } from '../context';
import { requireAuth } from '../../lib/rbac';
import { sendConnection, respondToConnection, listConnections } from '../../services/connection.service';
import type { ConnectionKind, ConnectionStatus } from '@vb/database';

export const connectionResolvers = {
  Query: {
    connections: async (
      _: unknown,
      { status }: { status?: ConnectionStatus },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      return listConnections(ctx.user!.sub, ctx.user!.region, status);
    },
  },

  Mutation: {
    sendConnection: async (
      _: unknown,
      { input }: { input: { receiverId: string; kind: ConnectionKind } },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      return sendConnection(ctx.user!.sub, ctx.user!.region, input.receiverId, input.kind);
    },

    respondToConnection: async (
      _: unknown,
      { id, accept }: { id: string; accept: boolean },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      return respondToConnection(id, ctx.user!.sub, ctx.user!.region, accept);
    },
  },

  Connection: {
    requester: (parent: Record<string, unknown>) => parent['requester'],
    receiver: (parent: Record<string, unknown>) => parent['receiver'],
  },
};
