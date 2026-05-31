import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const EVENTS = {
  NEW_MATCH: 'NEW_MATCH',
  CONNECTION_UPDATE: 'CONNECTION_UPDATE',
} as const;
