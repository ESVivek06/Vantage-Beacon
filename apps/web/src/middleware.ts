import NextAuth from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/auth.config';
import { redis, REFRESH_TOKEN_TTL, refreshTokenKey } from '@/lib/redis';
import { hashToken, generateRefreshToken, REFRESH_COOKIE } from '@/lib/jwt';

const { auth } = NextAuth(authConfig);

const API_AUTH_PREFIX = '/api/auth';
// Routes that are always public
const PUBLIC_PATHS = new Set(['/', '/about', '/auth/sign-in', '/auth/sign-up', '/auth/error']);
// Static asset patterns handled before the matcher, but guard here too
const STATIC_PREFIXES = ['/_next/', '/favicon.ico'];

export default auth(async function middleware(req: NextRequest & { auth: unknown }) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Pass through NextAuth's own API routes
  if (pathname.startsWith(API_AUTH_PREFIX)) return NextResponse.next();
  // Pass through static assets
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const session = (req as unknown as { auth: { user?: { id?: string } } | null }).auth;
  const isLoggedIn = !!session?.user;
  const isPublic = PUBLIC_PATHS.has(pathname) || pathname.startsWith('/auth/');

  if (isPublic) {
    if (isLoggedIn) return NextResponse.redirect(new URL('/dashboard', nextUrl));
    return NextResponse.next();
  }

  // ── Protected path ────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    const rtCookie = req.cookies.get(REFRESH_COOKIE)?.value;
    if (rtCookie) {
      // Valid RT → send through the refresh endpoint which will rotate and reissue
      const refreshUrl = new URL('/api/auth/refresh', nextUrl.origin);
      refreshUrl.searchParams.set('next', pathname + nextUrl.search);
      return NextResponse.redirect(refreshUrl);
    }
    const signIn = new URL('/auth/sign-in', nextUrl.origin);
    signIn.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signIn);
  }

  // ── Logged in — lazily mint a refresh token if one is not yet set ─────────
  const rtCookie = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!rtCookie && session?.user?.id) {
    const rawRt = generateRefreshToken();
    const hash = hashToken(rawRt);
    await redis.set(refreshTokenKey(hash), session.user.id, { ex: REFRESH_TOKEN_TTL });

    const res = NextResponse.next();
    res.cookies.set(REFRESH_COOKIE, rawRt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL,
      path: '/',
    });
    return res;
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
