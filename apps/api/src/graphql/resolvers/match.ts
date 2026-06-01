import type { GraphQLContext } from '../context';
import { requireAuth } from '../../lib/rbac';
import { MatchingService } from '../../matching/matchingService';
import { MlServiceEmbeddingProvider } from '../../matching/embeddingService';
import type { MatchType, MatchFilter } from '../../matching/types';

type UserRole = 'freelancer' | 'founder' | 'investor' | 'supplier' | 'stakeholder';

function roleToMatchType(role: UserRole): MatchType {
  if (role === 'freelancer') return 'freelancer_to_project';
  if (role === 'founder' || role === 'investor') return 'founder_to_investor';
  return 'user_to_user';
}

function getMatchingService(ctx: GraphQLContext): MatchingService {
  return new MatchingService(ctx.db!, new MlServiceEmbeddingProvider());
}

export const matchResolvers = {
  Query: {
    matches: async (
      _: unknown,
      {
        matchType,
        filters,
        limit,
      }: {
        matchType: MatchType;
        filters?: MatchFilter;
        limit?: number;
      },
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx);
      const svc = getMatchingService(ctx);
      const results = await svc.findMatches({
        userId: user.sub,
        matchType,
        filters,
        limit: Math.min(limit ?? 20, 100),
      });
      return results.map((r) => ({
        id: r.matchId,
        sourceId: user.sub,
        targetId: r.targetId,
        targetType: r.targetType,
        score: r.score,
        explanation: r.explanation,
        matchedAt: new Date(),
      }));
    },

    matchCandidates: async (
      _: unknown,
      { userId, role, limit }: { userId: string; role: UserRole; limit?: number },
      ctx: GraphQLContext,
    ) => {
      const caller = requireAuth(ctx);
      // Users may query their own candidates; callers with different IDs need same-user constraint.
      if (caller.sub !== userId) {
        throw new Error('Forbidden: you can only fetch candidates for your own profile');
      }
      const svc = getMatchingService(ctx);
      const matchType = roleToMatchType(role);
      const results = await svc.findMatches({
        userId,
        matchType,
        limit: Math.min(limit ?? 20, 100),
      });
      return results.map((r) => ({
        id: r.matchId,
        sourceId: userId,
        targetId: r.targetId,
        targetType: r.targetType,
        score: r.score,
        explanation: r.explanation,
        matchedAt: new Date(),
        displayName: r.metadata?.displayName ?? null,
        region: r.metadata?.region ?? null,
        role: r.metadata?.role ?? null,
      }));
    },

    matchMetrics: async (
      _: unknown,
      { since }: { since?: Date },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      const db = ctx.db!;
      const whereClause = since ? { createdAt: { gte: since } } : {};
      const [total, accepted] = await Promise.all([
        db.matchFeedback.count({ where: whereClause }),
        db.matchFeedback.count({ where: { ...whereClause, action: 'accepted' } }),
      ]);
      const rate = total > 0 ? accepted / total : 0;
      return {
        accepted,
        total,
        rate: parseFloat(rate.toFixed(4)),
        ratePercent: `${(rate * 100).toFixed(1)}%`,
        meetingTarget: rate > 0.3,
      };
    },
  },

  Mutation: {
    submitMatchFeedback: async (
      _: unknown,
      {
        matchId,
        action,
        reason,
      }: { matchId: string; action: string; reason?: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireAuth(ctx);
      if (!['accepted', 'rejected'].includes(action)) {
        throw new Error('action must be "accepted" or "rejected"');
      }
      await ctx.db!.matchFeedback.upsert({
        where: { matchId_userId: { matchId, userId: user.sub } },
        create: {
          matchId,
          userId: user.sub,
          action: action as 'accepted' | 'rejected',
          reason: reason ?? null,
        },
        update: {
          action: action as 'accepted' | 'rejected',
          reason: reason ?? null,
        },
      });
      return true;
    },
  },
};
