import { createHash, randomBytes } from 'crypto';
import { encode } from 'next-auth/jwt';
import { redis, REFRESH_TOKEN_TTL, refreshTokenKey } from './redis';

export const SESSION_MAX_AGE = 15 * 60; // 15 minutes in seconds

export const SESSION_COOKIE =
  process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

export const REFRESH_COOKIE = 'vb.rt';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

/** Store a new refresh token in Redis; returns the raw token to set as cookie. */
export async function createRefreshToken(userId: string): Promise<string> {
  const rt = generateRefreshToken();
  const hash = hashToken(rt);
  await redis.set(refreshTokenKey(hash), userId, { ex: REFRESH_TOKEN_TTL });
  return rt;
}

/** Rotate a refresh token: delete old, create new. Returns new raw token or null if invalid. */
export async function rotateRefreshToken(
  rawToken: string,
): Promise<{ userId: string; newToken: string } | null> {
  const hash = hashToken(rawToken);
  const key = refreshTokenKey(hash);
  const userId = await redis.get<string>(key);
  if (!userId) return null;

  await redis.del(key);
  const newToken = await createRefreshToken(userId);
  return { userId, newToken };
}

/** Revoke a refresh token immediately. */
export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const hash = hashToken(rawToken);
  await redis.del(refreshTokenKey(hash));
}

/** Encode a signed NextAuth session JWT for the given user. */
export async function encodeSessionToken(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  region: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return encode({
    token: {
      sub: user.id,
      email: user.email,
      name: user.name ?? user.email,
      role: user.role,
      region: user.region,
      iat: now,
      exp: now + SESSION_MAX_AGE,
    },
    secret: process.env.AUTH_SECRET!,
    maxAge: SESSION_MAX_AGE,
    salt: SESSION_COOKIE,
  });
}
