import type { GraphQLContext } from '../context';
import { requireAuth } from '../../lib/rbac';
import { validate, updateProfileSchema } from '../../lib/validation';
import { getProfile, updateProfile, queueProfileEmbedding } from '../../services/profile.service';
import { getProfilePhotoUploadUrl } from '../../services/s3.service';

export const profileResolvers = {
  Query: {
    profile: async (
      _: unknown,
      { userId }: { userId: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      return getProfile(userId, ctx.user!.region);
    },
  },

  Mutation: {
    updateProfile: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          displayName?: string;
          bio?: string;
          skills?: string[];
          tags?: string[];
          profileData?: Record<string, unknown>;
          photoKey?: string;
        };
      },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      validate(updateProfileSchema, {
        displayName: input.displayName,
        bio: input.bio,
        skills: input.skills,
        tags: input.tags,
      });
      const updated = await updateProfile(ctx.user!.sub, ctx.user!.region, input);
      // Fire-and-forget: re-embed the profile after any content change.
      if (input.bio !== undefined || input.skills !== undefined || input.tags !== undefined) {
        void queueProfileEmbedding(ctx.user!.sub, {
          bio: updated.bio,
          skills: updated.skills,
          tags: updated.tags,
        });
      }
      return updated;
    },

    requestProfilePhotoUpload: async (
      _: unknown,
      { fileName }: { fileName: string },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      return getProfilePhotoUploadUrl(ctx.user!.sub, fileName);
    },
  },

  Profile: {
    user: (parent: Record<string, unknown>) => parent['user'],
  },
};
