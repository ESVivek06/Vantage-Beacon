export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getClient } from '@vb/database';

export interface MatchScoreItem {
  matchId: string;
  targetId: string;
  targetType: 'user' | 'project';
  score: number;
  isFeatured: boolean;
  isNew: boolean;
  matchedAt: string;
  explainability: {
    topReasons: string[];
    semanticScore?: number;
    skillOverlap?: string[];
  };
  target: {
    displayName: string | null;
    role: string | null;
    region: string | null;
    skills: string[];
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role ?? 'freelancer';
  const queryRole = req.nextUrl.searchParams.get('role') ?? role;
  const limitParam = parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10);
  const limit = Math.min(isNaN(limitParam) ? 20 : limitParam, 100);

  const db = getClient();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const MIN_SCORE = queryRole === 'freelancer' ? 0.5 : 0;

  try {
    const matches = await db.match.findMany({
      where: {
        sourceId: session.user.id,
        score: { gte: MIN_SCORE },
        deletedAt: null,
      },
      orderBy: [{ score: 'desc' }, { matchedAt: 'desc' }],
      take: limit,
    });

    if (matches.length === 0) {
      return NextResponse.json({ matches: [], count: 0, modelCold: true });
    }

    // Fetch target user/profile data for each match
    const targetIds = matches.map((m: { targetId: string }) => m.targetId);
    const targetUsers = await db.user.findMany({
      where: { id: { in: targetIds }, deletedAt: null },
      include: { profile: true },
    });

    const userMap = new Map(targetUsers.map((u: { id: string }) => [u.id, u]));

    const result: MatchScoreItem[] = matches.map((m: {
      id: string;
      targetId: string;
      score: number;
      matchedAt: Date;
      explainability: Record<string, unknown>;
    }) => {
      const target = userMap.get(m.targetId) as {
        role?: string;
        region?: string;
        profile?: { displayName?: string; skills?: string[] };
      } | undefined;
      const expl = (m.explainability ?? {}) as {
        topReasons?: string[];
        semanticScore?: number;
        skillOverlap?: string[];
      };

      return {
        matchId: m.id,
        targetId: m.targetId,
        targetType: 'user' as const,
        score: m.score,
        // Featured: score >= 0.9 AND matched within 24h
        isFeatured: m.score >= 0.9 && m.matchedAt >= oneDayAgo,
        // New: matched within 24h (recency signal)
        isNew: m.matchedAt >= oneDayAgo,
        matchedAt: m.matchedAt.toISOString(),
        explainability: {
          topReasons: expl.topReasons ?? [],
          semanticScore: expl.semanticScore,
          skillOverlap: expl.skillOverlap ?? [],
        },
        target: {
          displayName: target?.profile?.displayName ?? null,
          role: target?.role ?? null,
          region: target?.region ?? null,
          skills: target?.profile?.skills ?? [],
        },
      };
    });

    return NextResponse.json({ matches: result, count: result.length, modelCold: false });
  } catch (err) {
    console.error('[GET /api/matches]', err);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
