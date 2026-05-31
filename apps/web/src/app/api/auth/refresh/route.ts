import { type NextRequest, NextResponse } from 'next/server';
import { getClient } from '@vb/database';
import {
  rotateRefreshToken,
  encodeSessionToken,
  SESSION_COOKIE,
  REFRESH_COOKIE,
  SESSION_MAX_AGE,
  REFRESH_TOKEN_TTL,
} from '@/lib/jwt';

const SECURE = process.env.NODE_ENV === 'production';

/**
 * GET /api/auth/refresh?next=<path>
 *
 * Validates the refresh token cookie, rotates it, issues a new 15-min session
 * JWT, and redirects to `next`. Called by the middleware when the access token
 * has expired but a valid refresh token cookie exists.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(req.url);
  const next = searchParams.get('next') ?? '/dashboard';
  const destination = new URL(next, origin);

  const rawRt = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!rawRt) {
    return NextResponse.redirect(new URL('/auth/sign-in', origin));
  }

  const rotated = await rotateRefreshToken(rawRt);
  if (!rotated) {
    // Token not found in Redis — expired or already rotated
    const res = NextResponse.redirect(new URL('/auth/sign-in', origin));
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  const { userId, newToken } = rotated;

  const db = getClient();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, region: true, deletedAt: true },
  });

  if (!user || user.deletedAt) {
    const res = NextResponse.redirect(new URL('/auth/sign-in', origin));
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  const sessionToken = await encodeSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    region: user.region,
  });

  const res = NextResponse.redirect(destination);

  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: SECURE,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  res.cookies.set(REFRESH_COOKIE, newToken, {
    httpOnly: true,
    secure: SECURE,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_TTL,
    path: '/',
  });

  return res;
}
