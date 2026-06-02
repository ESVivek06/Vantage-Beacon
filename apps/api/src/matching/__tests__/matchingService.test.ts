import { MatchingService } from '../matchingService';
import { MockEmbeddingProvider } from '../embeddingService';

// Minimal Prisma client mock
function makePrismaMock(profileOverride: Record<string, unknown> = {}) {
  return {
    profile: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        bio: 'React developer',
        skills: ['React', 'TypeScript'],
        tags: ['fintech'],
        embeddingVector: null,
        user: { region: 'UK', role: 'freelancer' },
        ...profileOverride,
      }),
    },
    match: {
      create: jest.fn().mockResolvedValue({ id: 'match-1' }),
    },
    $transaction: jest.fn().mockImplementation((ops: Promise<unknown>[]) =>
      Promise.all(ops),
    ),
  };
}

// Mock the global fetch used by MlServiceEmbeddingProvider and MatchingService
const mockMlMatches = [
  {
    target_id: 'user-2',
    target_type: 'user',
    score: 0.91,
    explanation: {
      semantic_score: 0.88,
      skill_overlap: ['React'],
      region_match: true,
      top_reasons: ['Strong semantic profile match', 'Shared skills: React'],
    },
    metadata: { displayName: 'Bob', region: 'UK', role: 'founder' },
  },
];

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ vector: new Array(1536).fill(0), matches: mockMlMatches }),
    text: async () => '',
  } as unknown as Response);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('MatchingService.findMatches', () => {
  it('returns ranked matches with matchId, score, and explanation', async () => {
    const db = makePrismaMock() as unknown as ConstructorParameters<typeof MatchingService>[0];
    const svc = new MatchingService(db, new MockEmbeddingProvider());

    const results = await svc.findMatches({
      userId: 'user-1',
      matchType: 'user_to_user',
      limit: 10,
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      matchId: 'match-1',
      targetId: 'user-2',
      targetType: 'user',
      score: 0.91,
    });
    expect(results[0].explanation.topReasons.length).toBeGreaterThan(0);
  });

  it('throws when profile is not found', async () => {
    const db = {
      profile: { findFirst: jest.fn().mockResolvedValue(null) },
      match: { create: jest.fn() },
      $transaction: jest.fn(),
    } as unknown as ConstructorParameters<typeof MatchingService>[0];

    const svc = new MatchingService(db, new MockEmbeddingProvider());

    await expect(
      svc.findMatches({ userId: 'unknown', matchType: 'user_to_user' }),
    ).rejects.toThrow('Profile not found');
  });

  it('calls embedder.embed when embeddingVector is null', async () => {
    const db = makePrismaMock({ embeddingVector: null }) as unknown as ConstructorParameters<typeof MatchingService>[0];
    const embedder = new MockEmbeddingProvider();
    const embedSpy = jest.spyOn(embedder, 'embed');

    const svc = new MatchingService(db, embedder);
    await svc.findMatches({ userId: 'user-1', matchType: 'user_to_user' });

    // MockEmbeddingProvider.embed is used to produce the query vector
    expect(embedSpy).toHaveBeenCalledWith(
      expect.any(String),
      'user-1',
      'user',
      true,
    );
  });

  it('skips embedder.embed when vector already stored', async () => {
    const storedVector = '[' + new Array(1536).fill('0.1').join(',') + ']';
    const db = makePrismaMock({ embeddingVector: storedVector }) as unknown as ConstructorParameters<typeof MatchingService>[0];
    const embedder = new MockEmbeddingProvider();
    const embedSpy = jest.spyOn(embedder, 'embed');

    const svc = new MatchingService(db, embedder);
    await svc.findMatches({ userId: 'user-1', matchType: 'user_to_user' });

    expect(embedSpy).not.toHaveBeenCalled();
  });

  it('persists each match result as a Match row', async () => {
    const db = makePrismaMock() as unknown as ConstructorParameters<typeof MatchingService>[0];
    const svc = new MatchingService(db, new MockEmbeddingProvider());

    await svc.findMatches({ userId: 'user-1', matchType: 'user_to_user' });

    expect((db as unknown as ReturnType<typeof makePrismaMock>).$transaction).toHaveBeenCalledTimes(1);
  });
});
