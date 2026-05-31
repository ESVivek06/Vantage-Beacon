import { withFilter } from 'graphql-subscriptions';
import { pubsub, EVENTS } from '../../lib/pubsub';
import { requireAuth } from '../../lib/rbac';
import type { GraphQLContext } from '../context';

export const subscriptionResolvers = {
  Subscription: {
    newMatch: {
      subscribe: withFilter(
        (_: unknown, __: unknown, ctx: GraphQLContext) => {
          requireAuth(ctx);
          return pubsub.asyncIterator([EVENTS.NEW_MATCH]) as AsyncIterator<unknown>;
        },
        (payload: { newMatch: { userId: string } }, _: unknown, ctx: GraphQLContext) => {
          return payload.newMatch.userId === ctx.user?.sub;
        },
      ),
    },

    connectionUpdate: {
      subscribe: withFilter(
        (_: unknown, __: unknown, ctx: GraphQLContext) => {
          requireAuth(ctx);
          return pubsub.asyncIterator([EVENTS.CONNECTION_UPDATE]) as AsyncIterator<unknown>;
        },
        (
          payload: { connectionUpdate: { requesterId: string; receiverId: string } },
          _: unknown,
          ctx: GraphQLContext,
        ) => {
          const uid = ctx.user?.sub;
          return (
            payload.connectionUpdate.requesterId === uid ||
            payload.connectionUpdate.receiverId === uid
          );
        },
      ),
    },
  },
};
