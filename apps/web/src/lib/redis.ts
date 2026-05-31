import { Redis } from '@upstash/redis';

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
  }
  return new Redis({ url, token });
}

let _redis: Redis | undefined;
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    if (!_redis) _redis = getRedis();
    return (_redis as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export function refreshTokenKey(hash: string): string {
  return `rt:${hash}`;
}
