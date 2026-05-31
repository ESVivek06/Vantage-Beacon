import type { GraphQLContext } from '../context';
import { requireAuth, requireRole } from '../../lib/rbac';
import { validate, registerSchema } from '../../lib/validation';
import { registerUser, loginUser, getUserById, listUsers } from '../../services/user.service';
import type { UserRole, Region } from '@vb/database';

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return null;
      return getUserById(ctx.user.sub, ctx.user.region);
    },

    user: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return getUserById(id, ctx.user!.region);
    },

    users: async (
      _: unknown,
      args: { role?: UserRole; region?: Region; limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      return listUsers(ctx.user!.region, args);
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { input }: {
        input: {
          email: string;
          password: string;
          role: UserRole;
          region: Region;
          displayName: string;
        };
      },
    ) => {
      validate(registerSchema, {
        email: input.email,
        password: input.password,
        displayName: input.displayName,
      });
      return registerUser(input);
    },

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
    ) => {
      return loginUser(input);
    },
  },

  User: {
    photoUrl: (parent: { profileData: unknown }) => {
      const data = parent.profileData as Record<string, unknown> | null;
      return (data?.photoUrl as string | undefined) ?? null;
    },
    profile: (parent: Record<string, unknown>) => parent['profile'] ?? null,
    ownedProjects: (parent: Record<string, unknown>) => parent['ownedProjects'] ?? [],
    sentConnections: (parent: Record<string, unknown>) => parent['sentConnections'] ?? [],
    receivedConnections: (parent: Record<string, unknown>) => parent['receivedConnections'] ?? [],
  },
};
