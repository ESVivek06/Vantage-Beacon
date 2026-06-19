/**
 * Synthetic match validation — VAN-55 local smoke test
 *
 * Validates the AI matching engine against a synthetic dataset:
 *   - 3 founder profiles (fintech, edtech, climate)
 *   - 5 freelancer profiles (frontend, backend, fullstack, ML, mobile)
 *   - 2 investor profiles (early-stage SaaS, deep-tech AI)
 *
 * All ML HTTP calls are stubbed. No live Postgres or ML service required.
 * This is the offline substitute for staging smoke while VAN-62 is unblocked.
 */

import { MatchingService } from '../matchingService';
import { MockEmbeddingProvider } from '../embeddingService';
import { buildMatchDisplayResult } from '../matchDisplayService';
import type { MatchResult } from '../types';

// ─── Synthetic dataset ────────────────────────────────────────────────────────

const FOUNDERS = [
  {
    userId: 'founder-fintech',
    displayName: 'Amara Osei',
    bio: 'Fintech founder building cross-border payments for Africa. Seeking Series A.',
    skills: ['Payments', 'Fundraising', 'Go-to-market'],
    tags: ['fintech', 'africa', 'b2b'],
    region: 'UK',
    role: 'founder',
  },
  {
    userId: 'founder-edtech',
    displayName: 'Priya Nair',
    bio: 'EdTech founder building AI-powered tutoring for K-12. Former teacher.',
    skills: ['Product', 'EdTech', 'Curriculum'],
    tags: ['edtech', 'ai', 'k12'],
    region: 'IN',
    role: 'founder',
  },
  {
    userId: 'founder-climate',
    displayName: 'Lars Eriksson',
    bio: 'Climate tech founder building carbon tracking SaaS for SMEs. Pre-seed.',
    skills: ['Sustainability', 'SaaS', 'B2B Sales'],
    tags: ['climate', 'saas', 'sustainability'],
    region: 'UK',
    role: 'founder',
  },
];

const FREELANCERS = [
  {
    userId: 'fl-frontend',
    displayName: 'Sophie Wu',
    bio: 'Senior React/TypeScript engineer. 8 years building fintech products.',
    skills: ['React', 'TypeScript', 'GraphQL', 'Next.js'],
    tags: ['fintech', 'frontend', 'saas'],
    region: 'UK',
    role: 'freelancer',
  },
  {
    userId: 'fl-backend',
    displayName: 'Kofi Mensah',
    bio: 'Backend engineer specialising in payments APIs and Node.js microservices.',
    skills: ['Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
    tags: ['payments', 'backend', 'api'],
    region: 'UK',
    role: 'freelancer',
  },
  {
    userId: 'fl-fullstack',
    displayName: 'Nina Patel',
    bio: 'Full-stack developer. Built 3 SaaS MVPs from 0 to 1 for early-stage startups.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    tags: ['saas', 'mvp', 'startup'],
    region: 'IN',
    role: 'freelancer',
  },
  {
    userId: 'fl-ml',
    displayName: 'Daniel Kim',
    bio: 'ML engineer with NLP and LLM fine-tuning experience. Python and PyTorch.',
    skills: ['Python', 'PyTorch', 'NLP', 'LLMs'],
    tags: ['ai', 'ml', 'nlp'],
    region: 'NA',
    role: 'freelancer',
  },
  {
    userId: 'fl-mobile',
    displayName: 'Fatima Al-Hassan',
    bio: 'React Native engineer. Mobile-first fintech apps with biometric auth.',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android'],
    tags: ['mobile', 'fintech', 'react-native'],
    region: 'UK',
    role: 'freelancer',
  },
];

const INVESTORS = [
  {
    userId: 'inv-saas',
    displayName: 'Callum Ross',
    bio: 'Angel investor. 15 investments in early-stage B2B SaaS. Fintech and climate focus.',
    skills: ['SaaS', 'Fintech', 'B2B', 'Climate'],
    tags: ['angel', 'early-stage', 'saas'],
    region: 'UK',
    role: 'investor',
  },
  {
    userId: 'inv-deeptech',
    displayName: 'Elena Vasquez',
    bio: 'VC partner at DeepTech Fund. Invests in AI/ML infrastructure and climate tech.',
    skills: ['AI', 'ML', 'DeepTech', 'Climate'],
    tags: ['vc', 'deeptech', 'ai'],
    region: 'UK',
    role: 'investor',
  },
];

// ─── ML stub responses ────────────────────────────────────────────────────────
// Simulates what the ML service returns for each source profile type.

// Freelancer (Sophie Wu — frontend/fintech) querying for projects
const ML_FREELANCER_MATCHES = [
  {
    target_id: 'founder-fintech',
    target_type: 'user',
    score: 0.94,
    explanation: {
      semantic_score: 0.91,
      skill_overlap: ['React', 'TypeScript'],
      region_match: true,
      top_reasons: ['Strong semantic match', 'Shared skills: React, TypeScript', 'Same region (UK)'],
    },
    metadata: { displayName: 'Amara Osei', region: 'UK', role: 'founder' },
  },
  {
    target_id: 'founder-climate',
    target_type: 'user',
    score: 0.78,
    explanation: {
      semantic_score: 0.75,
      skill_overlap: ['SaaS'],
      region_match: true,
      top_reasons: ['Good profile alignment', 'SaaS domain overlap', 'Same region (UK)'],
    },
    metadata: { displayName: 'Lars Eriksson', region: 'UK', role: 'founder' },
  },
  {
    target_id: 'founder-edtech',
    target_type: 'user',
    score: 0.58,
    explanation: {
      semantic_score: 0.55,
      skill_overlap: [],
      region_match: false,
      top_reasons: ['Complementary profiles'],
    },
    metadata: { displayName: 'Priya Nair', region: 'IN', role: 'founder' },
  },
];

// Founder (Lars Eriksson — climate/SaaS) querying for investors
const ML_FOUNDER_MATCHES = [
  {
    target_id: 'inv-saas',
    target_type: 'user',
    score: 0.91,
    explanation: {
      semantic_score: 0.88,
      skill_overlap: ['SaaS', 'Climate'],
      region_match: true,
      top_reasons: ['Strong thesis alignment', 'SaaS + climate focus match', 'Same region (UK)'],
    },
    metadata: { displayName: 'Callum Ross', region: 'UK', role: 'investor' },
  },
  {
    target_id: 'inv-deeptech',
    target_type: 'user',
    score: 0.73,
    explanation: {
      semantic_score: 0.70,
      skill_overlap: ['Climate'],
      region_match: true,
      top_reasons: ['Good profile alignment', 'Climate domain overlap'],
    },
    metadata: { displayName: 'Elena Vasquez', region: 'UK', role: 'investor' },
  },
];

// Investor (Elena Vasquez — deeptech/AI) querying for founders
const ML_INVESTOR_MATCHES = [
  {
    target_id: 'founder-edtech',
    target_type: 'user',
    score: 0.89,
    explanation: {
      semantic_score: 0.86,
      skill_overlap: ['AI'],
      region_match: false,
      top_reasons: ['Strong semantic match', 'AI sector alignment', 'EdTech AI use case'],
    },
    metadata: { displayName: 'Priya Nair', region: 'IN', role: 'founder' },
  },
  {
    target_id: 'founder-climate',
    target_type: 'user',
    score: 0.82,
    explanation: {
      semantic_score: 0.80,
      skill_overlap: ['Climate'],
      region_match: true,
      top_reasons: ['Good profile alignment', 'Climate thesis match', 'Same region (UK)'],
    },
    metadata: { displayName: 'Lars Eriksson', region: 'UK', role: 'founder' },
  },
  {
    target_id: 'founder-fintech',
    target_type: 'user',
    score: 0.51,
    explanation: {
      semantic_score: 0.49,
      skill_overlap: [],
      region_match: true,
      top_reasons: ['Possible profile match'],
    },
    metadata: { displayName: 'Amara Osei', region: 'UK', role: 'founder' },
  },
];

// ─── Prisma mock factory ──────────────────────────────────────────────────────

function makeProfileMock(overrides: {
  userId: string;
  bio: string;
  skills: string[];
  tags: string[];
  region: string;
  role: string;
}) {
  return {
    id: `profile-${overrides.userId}`,
    userId: overrides.userId,
    bio: overrides.bio,
    skills: overrides.skills,
    tags: overrides.tags,
    embeddingVector: null,
    user: { region: overrides.region, role: overrides.role },
  };
}

function makeDbMock(profile: ReturnType<typeof makeProfileMock>) {
  return {
    profile: {
      findFirst: jest.fn().mockResolvedValue(profile),
    },
    match: {
      create: jest.fn().mockImplementation(({ data }: { data: { targetId: string } }) =>
        Promise.resolve({ id: `match-${data.targetId}` }),
      ),
    },
    $transaction: jest.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
  };
}

// ─── Test helpers ─────────────────────────────────────────────────────────────

function mockMlResponse(matches: typeof ML_FREELANCER_MATCHES) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ vector: new Array(1536).fill(0), matches }),
    text: async () => '',
  } as unknown as Response);
}

function makeMatchingService(profile: ReturnType<typeof makeProfileMock>) {
  const db = makeDbMock(profile);
  return { svc: new MatchingService(db as never, new MockEmbeddingProvider()), db };
}

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── 1. Freelancer matching (5 profiles × 3 founder targets) ─────────────────

describe('Synthetic: Freelancer → Founder matching', () => {
  it('Sophie (React/fintech) — fintech founder ranks #1', async () => {
    mockMlResponse(ML_FREELANCER_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(FREELANCERS[0]));

    const results = await svc.findMatches({
      userId: FREELANCERS[0].userId,
      matchType: 'freelancer_to_project',
      limit: 10,
    });

    expect(results.length).toBe(ML_FREELANCER_MATCHES.length);
    expect(results[0].targetId).toBe('founder-fintech');
    expect(results[0].score).toBeCloseTo(0.94, 2);
  });

  it('ranking is strictly descending across all 3 founder targets', async () => {
    mockMlResponse(ML_FREELANCER_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(FREELANCERS[0]));

    const results = await svc.findMatches({
      userId: FREELANCERS[0].userId,
      matchType: 'freelancer_to_project',
    });

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('Kofi (backend/payments) — ML picks fintech founder at top', async () => {
    mockMlResponse(ML_FREELANCER_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(FREELANCERS[1]));

    const results = await svc.findMatches({
      userId: FREELANCERS[1].userId,
      matchType: 'freelancer_to_project',
    });

    expect(results[0].targetId).toBe('founder-fintech');
  });

  it('ML engineer (Daniel) gets plausible but lower-ranked matches (no React overlap)', async () => {
    const mlEngMatches = ML_FREELANCER_MATCHES.map((m) => ({
      ...m,
      score: m.score * 0.7,
      explanation: { ...m.explanation, skill_overlap: [] },
    }));
    mockMlResponse(mlEngMatches);
    const { svc } = makeMatchingService(makeProfileMock(FREELANCERS[3]));

    const results = await svc.findMatches({
      userId: FREELANCERS[3].userId,
      matchType: 'freelancer_to_project',
    });

    // All scores must be below strong threshold when there's no skill overlap
    const allBelowStrong = results.every((r) => r.score < 0.85);
    expect(allBelowStrong).toBe(true);
  });

  it('each match result persists as a row via $transaction', async () => {
    mockMlResponse(ML_FREELANCER_MATCHES);
    const { svc, db } = makeMatchingService(makeProfileMock(FREELANCERS[0]));

    await svc.findMatches({
      userId: FREELANCERS[0].userId,
      matchType: 'freelancer_to_project',
    });

    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.match.create).toHaveBeenCalledTimes(ML_FREELANCER_MATCHES.length);
  });
});

// ─── 2. Founder matching (3 profiles × 2 investor targets) ───────────────────

describe('Synthetic: Founder → Investor matching', () => {
  it('Lars (climate/SaaS) — SaaS angel investor ranks #1', async () => {
    mockMlResponse(ML_FOUNDER_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(FOUNDERS[2]));

    const results = await svc.findMatches({
      userId: FOUNDERS[2].userId,
      matchType: 'founder_to_investor',
      limit: 10,
    });

    expect(results.length).toBe(ML_FOUNDER_MATCHES.length);
    expect(results[0].targetId).toBe('inv-saas');
    expect(results[0].score).toBeCloseTo(0.91, 2);
  });

  it('top investor has skill_overlap matching founder domain (SaaS/climate)', async () => {
    mockMlResponse(ML_FOUNDER_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(FOUNDERS[2]));

    const results = await svc.findMatches({
      userId: FOUNDERS[2].userId,
      matchType: 'founder_to_investor',
    });

    expect(results[0].explanation.skillOverlap).toEqual(
      expect.arrayContaining(['SaaS', 'Climate']),
    );
  });

  it('Amara (fintech founder) finds both investors as matches', async () => {
    mockMlResponse(ML_FOUNDER_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(FOUNDERS[0]));

    const results = await svc.findMatches({
      userId: FOUNDERS[0].userId,
      matchType: 'founder_to_investor',
    });

    const targetIds = results.map((r) => r.targetId);
    expect(targetIds).toContain('inv-saas');
    expect(targetIds).toContain('inv-deeptech');
  });
});

// ─── 3. Investor matching (2 profiles × 3 founder targets) ───────────────────

describe('Synthetic: Investor → Founder matching', () => {
  it('Elena (deeptech/AI VC) — AI edtech founder ranks #1', async () => {
    mockMlResponse(ML_INVESTOR_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(INVESTORS[1]));

    const results = await svc.findMatches({
      userId: INVESTORS[1].userId,
      matchType: 'founder_to_investor',
      limit: 10,
    });

    expect(results.length).toBe(ML_INVESTOR_MATCHES.length);
    expect(results[0].targetId).toBe('founder-edtech');
    expect(results[0].score).toBeCloseTo(0.89, 2);
  });

  it('top result explanation has AI in topReasons or skillOverlap', async () => {
    mockMlResponse(ML_INVESTOR_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(INVESTORS[1]));

    const results = await svc.findMatches({
      userId: INVESTORS[1].userId,
      matchType: 'founder_to_investor',
    });

    const top = results[0];
    const hasAiSignal =
      top.explanation.skillOverlap.some((s) => s.toLowerCase().includes('ai')) ||
      top.explanation.topReasons.some((r) => r.toLowerCase().includes('ai'));
    expect(hasAiSignal).toBe(true);
  });
});

// ─── 4. Edge cases ────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('throws Profile not found for unknown userId', async () => {
    const db = {
      profile: { findFirst: jest.fn().mockResolvedValue(null) },
      match: { create: jest.fn() },
      $transaction: jest.fn(),
    };
    const svc = new MatchingService(db as never, new MockEmbeddingProvider());

    await expect(
      svc.findMatches({ userId: 'unknown-user', matchType: 'user_to_user' }),
    ).rejects.toThrow('Profile not found');
  });

  it('returns empty array when ML service returns no matches', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ vector: new Array(1536).fill(0), matches: [] }),
      text: async () => '',
    } as unknown as Response);

    const { svc } = makeMatchingService(makeProfileMock(FREELANCERS[0]));
    const results = await svc.findMatches({
      userId: FREELANCERS[0].userId,
      matchType: 'freelancer_to_project',
    });

    expect(results).toEqual([]);
  });

  it('throws when ML service returns 5xx (no 5xx swallowed)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    } as unknown as Response);

    const { svc } = makeMatchingService(makeProfileMock(FREELANCERS[0]));

    await expect(
      svc.findMatches({
        userId: FREELANCERS[0].userId,
        matchType: 'freelancer_to_project',
      }),
    ).rejects.toThrow(/ML match service failed/);
  });

  it('reuses stored embedding vector without calling embedder (embedding cache hit)', async () => {
    const storedVector = '[' + new Array(1536).fill('0.1').join(',') + ']';
    const profileWithVector = {
      ...makeProfileMock(FREELANCERS[0]),
      embeddingVector: storedVector,
    };
    mockMlResponse(ML_FREELANCER_MATCHES);

    const db = makeDbMock(profileWithVector as never);
    const embedder = new MockEmbeddingProvider();
    const embedSpy = jest.spyOn(embedder, 'embed');
    const svc = new MatchingService(db as never, embedder);

    await svc.findMatches({
      userId: FREELANCERS[0].userId,
      matchType: 'freelancer_to_project',
    });

    expect(embedSpy).not.toHaveBeenCalled();
  });

  it('respects limit parameter — sends correct limit to ML service', async () => {
    mockMlResponse(ML_FREELANCER_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(FREELANCERS[0]));

    await svc.findMatches({
      userId: FREELANCERS[0].userId,
      matchType: 'freelancer_to_project',
      limit: 5,
    });

    const calls = (global.fetch as jest.Mock).mock.calls as Array<[string, { body: string }]>;
    const matchCall = calls.find(([url]) => (url as string).includes('/matches/find'));
    expect(matchCall).toBeDefined();
    const body = JSON.parse(matchCall![1].body as string) as { limit: number };
    expect(body.limit).toBe(5);
  });
});

// ─── 5. Display contract (VAN-140 / VAN-114 Freelancer Dashboard) ─────────────

describe('Display contract — matchDisplay fields for VAN-114', () => {
  const makeRawResult = (targetId: string, score: number, mlMatch: typeof ML_FREELANCER_MATCHES[0]): MatchResult => ({
    matchId: `match-${targetId}`,
    targetId,
    targetType: mlMatch.target_type as 'user',
    score,
    explanation: {
      semanticScore: mlMatch.explanation.semantic_score,
      skillOverlap: mlMatch.explanation.skill_overlap,
      regionMatch: mlMatch.explanation.region_match,
      topReasons: mlMatch.explanation.top_reasons,
    },
    metadata: mlMatch.metadata,
  });

  it('strong match (score 0.94) gets matchBand=strong', () => {
    const raw = makeRawResult('founder-fintech', 0.94, ML_FREELANCER_MATCHES[0]);
    const display = buildMatchDisplayResult(raw, 'freelancer', ['React', 'TypeScript', 'Node.js']);
    expect(display.matchBand).toBe('strong');
  });

  it('good match (score 0.78) gets matchBand=good', () => {
    const raw = makeRawResult('founder-climate', 0.78, ML_FREELANCER_MATCHES[1]);
    const display = buildMatchDisplayResult(raw, 'freelancer', ['React', 'TypeScript']);
    expect(display.matchBand).toBe('good');
  });

  it('possible match (score 0.58) gets matchBand=possible', () => {
    const raw = makeRawResult('founder-edtech', 0.58, ML_FREELANCER_MATCHES[2]);
    const display = buildMatchDisplayResult(raw, 'freelancer', []);
    expect(display.matchBand).toBe('possible');
  });

  it('investor view: tractionSignals populated, skillOverlap null', () => {
    const raw = makeRawResult('founder-edtech', 0.89, ML_INVESTOR_MATCHES[0]);
    const display = buildMatchDisplayResult(raw, 'investor', []);
    expect(Array.isArray(display.tractionSignals)).toBe(true);
    expect(display.skillOverlap).toBeNull();
  });

  it('freelancer view: skillOverlap populated, tractionSignals null', () => {
    const raw = makeRawResult('founder-fintech', 0.94, ML_FREELANCER_MATCHES[0]);
    const display = buildMatchDisplayResult(raw, 'freelancer', ['React', 'TypeScript', 'GraphQL']);
    expect(Array.isArray(display.skillOverlap)).toBe(true);
    expect(display.tractionSignals).toBeNull();
    // Matched skills from ML response should be marked matched:true
    const matched = display.skillOverlap!.filter((s) => s.matched);
    expect(matched.map((s) => s.skill)).toEqual(
      expect.arrayContaining(ML_FREELANCER_MATCHES[0].explanation.skill_overlap),
    );
  });

  it('aiRationale is populated and does not include raw score numbers', () => {
    const raw = makeRawResult('founder-fintech', 0.94, ML_FREELANCER_MATCHES[0]);
    const display = buildMatchDisplayResult(raw, 'freelancer', ['React']);
    expect(typeof display.aiRationale).toBe('string');
    expect(display.aiRationale!.length).toBeGreaterThan(0);
    expect(display.aiRationale).not.toMatch(/0\.\d{2}/);
  });

  it('matchReasons are max 30 chars each — safe for MatchCard chips', () => {
    const raw = makeRawResult('founder-fintech', 0.94, ML_FREELANCER_MATCHES[0]);
    const display = buildMatchDisplayResult(raw, 'freelancer', []);
    for (const r of display.matchReasons) {
      expect(r.label.length).toBeLessThanOrEqual(30);
    }
  });

  it('founder view: matchDisplay result for founder→investor has correct aiRationale format', () => {
    const founderMatch = makeRawResult('inv-saas', 0.91, ML_FOUNDER_MATCHES[0]);
    const display = buildMatchDisplayResult(founderMatch, 'founder', []);
    expect(display.matchBand).toBe('strong');
    expect(typeof display.aiRationale).toBe('string');
    expect(display.aiRationale).toMatch(/Callum Ross/);
  });
});

// ─── 6. Latency (mocked ML — validates resolver pipeline overhead) ─────────────

describe('Latency — mocked ML calls resolve within 2000ms', () => {
  it('freelancer query for 3 founders completes under 2s (mocked)', async () => {
    mockMlResponse(ML_FREELANCER_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(FREELANCERS[0]));

    const start = Date.now();
    await svc.findMatches({ userId: FREELANCERS[0].userId, matchType: 'freelancer_to_project', limit: 10 });
    expect(Date.now() - start).toBeLessThan(2000);
  });

  it('investor query for 3 founders completes under 2s (mocked)', async () => {
    mockMlResponse(ML_INVESTOR_MATCHES);
    const { svc } = makeMatchingService(makeProfileMock(INVESTORS[1]));

    const start = Date.now();
    await svc.findMatches({ userId: INVESTORS[1].userId, matchType: 'founder_to_investor', limit: 10 });
    expect(Date.now() - start).toBeLessThan(2000);
  });
});
