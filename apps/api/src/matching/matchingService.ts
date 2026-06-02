import type { PrismaClient } from '@prisma/client';
import type { MatchRequest, MatchResult, EmbeddingProvider } from './types';
import { buildProfileText } from './embeddingService';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';

export class MatchingService {
  constructor(
    private db: PrismaClient,
    private embedder: EmbeddingProvider,
  ) {}

  async findMatches(request: MatchRequest): Promise<MatchResult[]> {
    const profile = await this.db.profile.findFirst({
      where: { userId: request.userId, deletedAt: null },
      include: { user: true },
    });
    if (!profile) throw new Error(`Profile not found for user ${request.userId}`);

    // Ensure requester has an embedding; generate + persist if missing.
    // embeddingVector is a pgvector Unsupported() column — Prisma doesn't type it; cast via unknown.
    const profileAny = profile as unknown as Record<string, unknown>;
    let queryVector: number[];
    if (!profileAny['embeddingVector']) {
      const text = buildProfileText({
        bio: profile.bio,
        skills: profile.skills,
        tags: profile.tags,
      });
      queryVector = await this.embedder.embed(text, profile.userId, 'user', true);
    } else {
      // embeddingVector comes back as a string like "[0.1,0.2,...]" from the raw DB driver.
      queryVector = parseVector(profileAny['embeddingVector'] as string);
    }

    const mlResponse = await this._callMlService(request, queryVector);

    // Persist match rows in a single transaction.
    const persistedMatches = await this.db.$transaction(
      mlResponse.map((m) =>
        this.db.match.create({
          data: {
            sourceId: request.userId,
            targetId: m.targetId,
            score: m.score,
            explainability: {
              kind: request.matchType,
              targetType: m.targetType,
              semanticScore: m.explanation.semanticScore,
              skillOverlap: m.explanation.skillOverlap,
              regionMatch: m.explanation.regionMatch,
              topReasons: m.explanation.topReasons,
            },
          },
        }),
      ),
    );

    return mlResponse.map((m, i) => ({
      ...m,
      matchId: persistedMatches[i].id,
    }));
  }

  private async _callMlService(
    request: MatchRequest,
    queryVector: number[],
  ): Promise<Omit<MatchResult, 'matchId'>[]> {
    const res = await fetch(`${ML_SERVICE_URL}/matches/find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_id: request.userId,
        query_vector: queryVector,
        match_type: request.matchType,
        filters: {
          region: request.filters?.region ?? null,
          required_skills: request.filters?.requiredSkills ?? [],
          domain: request.filters?.domain ?? null,
          target_type: request.filters?.targetType ?? null,
          target_role: request.filters?.targetRole ?? null,
        },
        limit: request.limit ?? 20,
      }),
    });

    if (!res.ok) {
      throw new Error(`ML match service failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      matches: Array<{
        target_id: string;
        target_type: 'user' | 'project';
        score: number;
        explanation: {
          semantic_score: number;
          skill_overlap: string[];
          region_match: boolean;
          top_reasons: string[];
        };
        metadata: { displayName?: string | null; region?: string | null; role?: string | null };
      }>;
    };

    return data.matches.map((m) => ({
      targetId: m.target_id,
      targetType: m.target_type,
      score: m.score,
      explanation: {
        semanticScore: m.explanation.semantic_score,
        skillOverlap: m.explanation.skill_overlap,
        regionMatch: m.explanation.region_match,
        topReasons: m.explanation.top_reasons,
      },
      metadata: m.metadata,
    }));
  }
}

function parseVector(raw: string | number[]): number[] {
  if (Array.isArray(raw)) return raw;
  // pgvector returns "[0.1,0.2,...]"
  return JSON.parse(raw.replace(/^\[/, '[').replace(/\]$/, ']')) as number[];
}
