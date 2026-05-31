import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import LinkedIn from 'next-auth/providers/linkedin';

/**
 * Edge-compatible NextAuth config — no Node.js APIs (no Prisma, no bcrypt).
 * Used directly in middleware. Full config (with Credentials + Prisma adapter) lives in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15-minute access token
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isAuthRoute = pathname.startsWith('/auth/');
      const isApiAuthRoute = pathname.startsWith('/api/auth');
      const isPublic = pathname === '/';

      if (isApiAuthRoute) return true;
      if (isPublic) return true;
      if (isAuthRoute) {
        // Redirect already-authed users away from auth pages
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      return isLoggedIn;
    },

    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.region = user.region;
      }
      return token;
    },

    session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.region = token.region;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  ],
};
