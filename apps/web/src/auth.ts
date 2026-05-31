import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getClient } from '@vb/database';
import { authConfig } from './auth.config';

let _db: ReturnType<typeof getClient> | undefined;
function db() {
  if (!_db) _db = getClient();
  return _db;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db()),
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db().user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            region: true,
            deletedAt: true,
          },
        });

        if (!user || user.deletedAt || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role,
          region: user.region,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Delegate to base config first, then enrich from DB for OAuth sign-ins
      const base = authConfig.callbacks!.jwt!({ token, user, account, trigger: 'signIn', session: undefined });
      const t = await Promise.resolve(base);

      // For OAuth users, role/region come from the DB record (not provider)
      if (account && account.type !== 'credentials' && t && t.sub) {
        const dbUser = await db().user.findUnique({
          where: { id: t.sub },
          select: { role: true, region: true },
        });
        if (dbUser) {
          t.role = dbUser.role;
          t.region = dbUser.region;
        }
      }
      return t;
    },
  },
  events: {
    async createUser({ user }) {
      // OAuth users are created with DB defaults (stakeholder/UK).
      // If the provider supplied a name, ensure it's persisted.
      if (user.id && user.name) {
        await db().user.update({
          where: { id: user.id },
          data: { name: user.name },
        });
      }
    },
  },
});
