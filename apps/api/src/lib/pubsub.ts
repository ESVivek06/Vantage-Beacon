import { RedisPubSub } from 'graphql-redis-subscriptions';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

const makeRedisClient = () =>
  new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });

export const pubsub = new RedisPubSub({
  publisher: makeRedisClient(),
  subscriber: makeRedisClient(),
});

export const EVENTS = {
  NEW_MATCH: 'NEW_MATCH',
  CONNECTION_UPDATE: 'CONNECTION_UPDATE',
} as const;
