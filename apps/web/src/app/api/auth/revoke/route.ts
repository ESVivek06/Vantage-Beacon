import { type NextRequest, NextResponse } from 'next/server';
import { revokeRefreshToken, REFRESH_COOKIE, SESSION_COOKIE } from '@/lib/jwt';

/**
 * POST /api/auth/revoke
 *
 * Deletes the refresh token from Redis and clears both auth cookies.
 * Should be called alongside NextAuth's signOut() to fully invalidate the session.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawRt = req.cookies.get(REFRESH_COOKIE)?.value;
  if (rawRt) {
    await revokeRefreshToken(rawRt);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(REFRESH_COOKIE);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
