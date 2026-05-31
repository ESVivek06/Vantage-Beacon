import { Router, Request, Response } from 'express';
import { regionRoutingMiddleware } from '../middleware/regionRouting';
import { MatchingService } from '../matching/matchingService';
import { MlServiceEmbeddingProvider } from '../matching/embeddingService';
import type { MatchType, MatchFilter } from '../matching/types';

const router = Router();

// All /api/match routes require a valid JWT (region claim used for DB routing).
router.use(regionRoutingMiddleware);

function getMatchingService(req: Request): MatchingService {
  return new MatchingService(req.regionalDb!, new MlServiceEmbeddingProvider());
}

/**
 * POST /api/match
 * Returns ranked matches for the authenticated user.
 * Body: { matchType, filters?, limit? }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { matchType, filters, limit } = req.body as {
      matchType: MatchType;
      filters?: MatchFilter;
      limit?: number;
    };

    if (!matchType) {
      return res.status(400).json({ error: 'matchType is required' });
    }

    const validMatchTypes: MatchType[] = [
      'freelancer_to_project',
      'founder_to_investor',
      'user_to_user',
    ];
    if (!validMatchTypes.includes(matchType)) {
      return res.status(400).json({ error: `matchType must be one of: ${validMatchTypes.join(', ')}` });
    }

    const svc = getMatchingService(req);
    const matches = await svc.findMatches({
      userId: req.userId!,
      matchType,
      filters,
      limit: Math.min(limit ?? 20, 100),
    });

    return res.json({ matches, count: matches.length });
  } catch (err) {
    console.error('[POST /api/match]', err);
    return res.status(500).json({ error: 'Matching failed' });
  }
});

/**
 * POST /api/match/feedback
 * Records accept/reject signal for a match.
 * Body: { matchId, action: "accepted"|"rejected", reason? }
 */
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { matchId, action, reason } = req.body as {
      matchId: string;
      action: string;
      reason?: string;
    };

    if (!matchId || !action) {
      return res.status(400).json({ error: 'matchId and action are required' });
    }
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'action must be "accepted" or "rejected"' });
    }

    const db = req.regionalDb!;
    await db.matchFeedback.upsert({
      where: { matchId_userId: { matchId, userId: req.userId! } },
      create: {
        matchId,
        userId: req.userId!,
        action: action as 'accepted' | 'rejected',
        reason: reason ?? null,
      },
      update: {
        action: action as 'accepted' | 'rejected',
        reason: reason ?? null,
      },
    });

    return res.json({ recorded: true });
  } catch (err) {
    console.error('[POST /api/match/feedback]', err);
    return res.status(500).json({ error: 'Feedback recording failed' });
  }
});

/**
 * GET /api/match/metrics
 * Evaluation harness: returns match acceptance rate.
 * Query: ?since=ISO8601
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const db = req.regionalDb!;
    const since = req.query['since'] ? new Date(req.query['since'] as string) : undefined;

    const whereClause = since ? { createdAt: { gte: since } } : {};

    const [total, accepted] = await Promise.all([
      db.matchFeedback.count({ where: whereClause }),
      db.matchFeedback.count({
        where: { ...whereClause, action: 'accepted' },
      }),
    ]);

    const rate = total > 0 ? accepted / total : 0;

    return res.json({
      accepted,
      total,
      rate: parseFloat(rate.toFixed(4)),
      ratePercent: `${(rate * 100).toFixed(1)}%`,
      target: '> 30%',
      meetingTarget: rate > 0.3,
      since: since?.toISOString() ?? null,
    });
  } catch (err) {
    console.error('[GET /api/match/metrics]', err);
    return res.status(500).json({ error: 'Metrics query failed' });
  }
});

export default router;
