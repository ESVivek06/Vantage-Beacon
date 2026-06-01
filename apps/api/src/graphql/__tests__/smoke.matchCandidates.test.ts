/**
 * Smoke test: full request path for matchCandidates
 *
 * Validates: frontend GraphQL query → resolver → MatchingService → ML stub → ranked MatchResult[]
 *
 * Uses the actual Apollo schema + resolvers (not just the resolver function) so
 * the entire GraphQL execution layer — field validation, type coercion, resolver
 * dispatch — is exercised. The ML HTTP call is still stubbed so no live service
 * is required.
 */

import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import { DateTimeResolver, JSONResolver } from 'graphql-scalars';
import { typeDefs } from '../schema';
import { resolvers as appResolvers } from '../resolvers';
import type { GraphQLContext } from '../context';
import type { PrismaClient } from '@prisma/client';

// ─── Schema under test ────────────────────────────────────────────────────────

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    ...appResolvers,
    DateTime: DateTimeResolver,
    JSON: JSONResolver,
  },
});

// ─── Query under test ─────────────────────────────────────────────────────────

const MATCH_CANDIDATES_QUERY = /* GraphQL */ `
  query SmokeMatchCandidates($userId: ID!, $role: UserRole!, $limit: Int) {
    matchCandidates(userId: $userId, role: $role, limit: $limit) {
      id
      sourceId
      targetId
      targetType
      score
      matchedAt
      displayName
      region
      role
      explanation {
        semanticScore
        skillOverlap
        regionMatch
        topReasons
      }
    }
  }
`;

// ─── ML mock ─────────────────────────────────────────────────────────────────

const ML_RESULTS = [
  {
    target_id: 'candidate-1',
    target_type: 'user',
    score: 0.92,
    explanation: {
      semantic_score: 0.89,
      skill_overlap: ['React', 'TypeScript'],
      region_match: true,
      top_reasons: ['Strong semantic match', 'Shared skills: React, TypeScript', 'Same region'],
    },
    metadata: { displayName: 'Top Candidate', region: 'UK', role: 'founder' },
  },
  {
    target_id: 'candidate-2',
    target_type: 'user',
    score: 0.78,
    explanation: {
      semantic_score: 0.75,
      skill_overlap: ['Node.js'],
      region_match: false,
      top_reasons: ['Good profile alignment'],
    },
    metadata: { displayName: 'Second Candidate', region: 'NA', role: 'investor' },
  },
];

// ─── DB mock ──────────────────────────────────────────────────────────────────

function makeDb() {
  return {
    profile: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'profile-smoke',
        userId: 'smoke-user-1',
        bio: 'React developer',
        skills: ['React', 'TypeScript'],
        tags: ['fintech'],
        embeddingVector: null,
        user: { region: 'UK', role: 'freelancer' },
      }),
    },
    match: {
      create: jest.fn().mockImplementation((_args: unknown, i = 0) =>
        Promise.resolve({ id: `smoke-match-${i}` }),
      ),
    },
    $transaction: jest.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
  };
}

function makeCtx(db: ReturnType<typeof makeDb>): GraphQLContext {
  return {
    user: { sub: 'smoke-user-1', email: 'smoke@example.com', role: 'freelancer' as const, region: 'UK' as const },
    db: db as unknown as PrismaClient,
  };
}

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ vector: new Array(1536).fill(0), matches: ML_RESULTS }),
    text: async () => '',
  } as unknown as Response);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── Smoke tests ──────────────────────────────────────────────────────────────

describe('matchCandidates smoke — full GraphQL execution path', () => {
  it('executes without errors and returns a non-empty array', async () => {
    const db = makeDb();
    const ctx = makeCtx(db);

    const result = await graphql({
      schema,
      source: MATCH_CANDIDATES_QUERY,
      contextValue: ctx,
      variableValues: { userId: 'smoke-user-1', role: 'freelancer', limit: 10 },
    });

    expect(result.errors).toBeUndefined();
    const candidates = (result.data as { matchCandidates: unknown[] }).matchCandidates;
    expect(Array.isArray(candidates)).toBe(true);
    expect(candidates.length).toBeGreaterThan(0);
  });

  it('top result matches the highest-scored ML candidate', async () => {
    const db = makeDb();
    const ctx = makeCtx(db);

    const result = await graphql({
      schema,
      source: MATCH_CANDIDATES_QUERY,
      contextValue: ctx,
      variableValues: { userId: 'smoke-user-1', role: 'freelancer', limit: 10 },
    });

    expect(result.errors).toBeUndefined();
    const candidates = (result.data as { matchCandidates: Array<{ targetId: string; score: number; displayName: string }> }).matchCandidates;

    expect(candidates[0].targetId).toBe('candidate-1');
    expect(candidates[0].score).toBeCloseTo(0.92, 2);
    expect(candidates[0].displayName).toBe('Top Candidate');
  });

  it('explanation fields are fully populated in the GraphQL response', async () => {
    const db = makeDb();
    const ctx = makeCtx(db);

    const result = await graphql({
      schema,
      source: MATCH_CANDIDATES_QUERY,
      contextValue: ctx,
      variableValues: { userId: 'smoke-user-1', role: 'freelancer', limit: 5 },
    });

    expect(result.errors).toBeUndefined();
    const candidates = (result.data as { matchCandidates: Array<{ explanation: { semanticScore: number; skillOverlap: string[]; regionMatch: boolean; topReasons: string[] } }> }).matchCandidates;

    const explanation = candidates[0].explanation;
    expect(explanation.semanticScore).toBeCloseTo(0.89, 2);
    expect(explanation.skillOverlap).toContain('React');
    expect(explanation.regionMatch).toBe(true);
    expect(explanation.topReasons.length).toBeGreaterThan(0);
  });

  it('latency: resolver resolves within 2000ms for a mocked ML call', async () => {
    const db = makeDb();
    const ctx = makeCtx(db);
    const start = Date.now();

    await graphql({
      schema,
      source: MATCH_CANDIDATES_QUERY,
      contextValue: ctx,
      variableValues: { userId: 'smoke-user-1', role: 'freelancer', limit: 20 },
    });

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('returns a GraphQL error (not a crash) when ML service is unavailable', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    } as unknown as Response);

    const db = makeDb();
    const ctx = makeCtx(db);

    const result = await graphql({
      schema,
      source: MATCH_CANDIDATES_QUERY,
      contextValue: ctx,
      variableValues: { userId: 'smoke-user-1', role: 'freelancer', limit: 5 },
    });

    // GraphQL should surface the error, not crash
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.errors![0].message).toMatch(/ML (match service|embedding) failed/);
  });

  it('returns a GraphQL auth error when no user is in context', async () => {
    const db = makeDb();
    const ctx: GraphQLContext = { user: null, db: db as unknown as PrismaClient };

    const result = await graphql({
      schema,
      source: MATCH_CANDIDATES_QUERY,
      contextValue: ctx,
      variableValues: { userId: 'smoke-user-1', role: 'freelancer', limit: 5 },
    });

    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('the ML service receives source_id and match_type in the POST body', async () => {
    const db = makeDb();
    const ctx = makeCtx(db);

    await graphql({
      schema,
      source: MATCH_CANDIDATES_QUERY,
      contextValue: ctx,
      variableValues: { userId: 'smoke-user-1', role: 'founder', limit: 5 },
    });

    // Even though auth check enforces userId === caller.sub,
    // the route is exercised — just use a founder-authed context
    // We verify whatever fetch was called (embed or match)
    const fetchCalls = (global.fetch as jest.Mock).mock.calls;
    const matchCall = fetchCalls.find(
      ([url]: [string]) => (url as string).includes('/matches/find'),
    );
    expect(matchCall).toBeDefined();
    const body = JSON.parse(matchCall![1].body as string) as { source_id: string; match_type: string };
    expect(body.source_id).toBe('smoke-user-1');
    expect(body.match_type).toBe('founder_to_investor');
  });
});
