import { createHash, randomBytes } from 'crypto';

const ENV_PREFIX = process.env.NODE_ENV === 'production' ? 'live' : 'test';

/** Generate a new raw API key of the form `vb_<env>_<40 hex chars>`. */
export function generateRawApiKey(): string {
  const secret = randomBytes(20).toString('hex'); // 40 chars
  return `vb_${ENV_PREFIX}_${secret}`;
}

/** SHA-256 hash of a raw API key — the value stored in the database. */
export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/** First 12 chars of the key (safe to show in UI after creation). */
export function keyPrefix(rawKey: string): string {
  return rawKey.slice(0, 12);
}
