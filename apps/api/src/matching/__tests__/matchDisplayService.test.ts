import {
  computeMatchBand,
  buildMatchReasons,
  buildAiRationale,
  buildTractionSignals,
  buildSkillOverlap,
  buildMatchDisplayResult,
  deriveRolePair,
} from '../matchDisplayService';
import type { MatchResult } from '../types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeExplanation(overrides: Partial<MatchResult['explanation']> = {}): MatchResult['explanation'] {
  return {
    semanticScore: 0.82,
    skillOverlap: ['React', 'TypeScript'],
    regionMatch: true,
    topReasons: ['Strong semantic profile match', 'Shared skills: React, TypeScript', 'Same region'],
    ...overrides,
  };
}

function makeMetadata(overrides: Partial<MatchResult['metadata']> = {}): MatchResult['metadata'] {
  return { displayName: 'Test Target', region: 'UK', role: 'freelancer', ...overrides };
}

function makeMatchResult(overrides: Partial<MatchResult> = {}): MatchResult {
  return {
    matchId: 'match-1',
    targetId: 'target-1',
    targetType: 'user',
    score: 0.87,
    explanation: makeExplanation(),
    metadata: makeMetadata(),
    ...overrides,
  };
}

// ─── computeMatchBand ────────────────────────────────────────────────────────

describe('computeMatchBand', () => {
  it('returns strong for score >= 0.85', () => {
    expect(computeMatchBand(0.85)).toBe('strong');
    expect(computeMatchBand(1.0)).toBe('strong');
    expect(computeMatchBand(0.90)).toBe('strong');
  });

  it('returns good for 0.65–0.84', () => {
    expect(computeMatchBand(0.65)).toBe('good');
    expect(computeMatchBand(0.84)).toBe('good');
    expect(computeMatchBand(0.72)).toBe('good');
  });

  it('returns possible for 0.40–0.64', () => {
    expect(computeMatchBand(0.40)).toBe('possible');
    expect(computeMatchBand(0.64)).toBe('possible');
    expect(computeMatchBand(0.50)).toBe('possible');
  });

  it('returns weak for score < 0.40', () => {
    expect(computeMatchBand(0.39)).toBe('weak');
    expect(computeMatchBand(0.0)).toBe('weak');
  });
});

// ─── buildMatchReasons ───────────────────────────────────────────────────────

describe('buildMatchReasons', () => {
  it('maps reasons to { label, key } pairs', () => {
    const reasons = buildMatchReasons(['React expertise', 'UK timezone match']);
    expect(reasons).toEqual([
      { label: 'React expertise', key: 'react_expertise' },
      { label: 'UK timezone match', key: 'uk_timezone_match' },
    ]);
  });

  it('caps at 5 items', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    expect(buildMatchReasons(input)).toHaveLength(5);
  });

  it('truncates labels longer than 30 chars', () => {
    const long = 'This is a very long reason that exceeds the limit';
    const result = buildMatchReasons([long]);
    expect(result[0].label.length).toBeLessThanOrEqual(30);
    expect(result[0].label.endsWith('…')).toBe(true);
  });

  it('returns empty array for no reasons', () => {
    expect(buildMatchReasons([])).toEqual([]);
  });
});

// ─── deriveRolePair ──────────────────────────────────────────────────────────

describe('deriveRolePair', () => {
  it('freelancer + project → freelancer', () => {
    expect(deriveRolePair('freelancer', null, 'project')).toBe('freelancer');
  });

  it('founder + freelancer user → founder_freelancer', () => {
    expect(deriveRolePair('founder', 'freelancer', 'user')).toBe('founder_freelancer');
  });

  it('founder + supplier user → founder_freelancer', () => {
    expect(deriveRolePair('founder', 'supplier', 'user')).toBe('founder_freelancer');
  });

  it('founder + investor user → founder_investor', () => {
    expect(deriveRolePair('founder', 'investor', 'user')).toBe('founder_investor');
  });

  it('investor + founder user → investor', () => {
    expect(deriveRolePair('investor', 'founder', 'user')).toBe('investor');
  });

  it('unknown combo → generic', () => {
    expect(deriveRolePair('stakeholder', 'freelancer', 'user')).toBe('generic');
  });
});

// ─── buildAiRationale ────────────────────────────────────────────────────────

describe('buildAiRationale', () => {
  const explanation = makeExplanation();
  const metadata = makeMetadata();

  it('freelancer rationale mentions skills', () => {
    const text = buildAiRationale('freelancer', explanation, metadata);
    expect(text).toMatch(/react/i);
    expect(text.split(' ').length).toBeLessThanOrEqual(50);
  });

  it('founder_freelancer rationale mentions the candidate name', () => {
    const text = buildAiRationale('founder_freelancer', explanation, metadata);
    expect(text).toMatch(/Test Target/);
    expect(text.split(' ').length).toBeLessThanOrEqual(50);
  });

  it('founder_investor rationale mentions the investor name', () => {
    const text = buildAiRationale('founder_investor', explanation, makeMetadata({ role: 'investor' }));
    expect(text).toMatch(/Test Target/);
    expect(text.split(' ').length).toBeLessThanOrEqual(50);
  });

  it('investor rationale mentions the startup name', () => {
    const text = buildAiRationale('investor', explanation, makeMetadata({ role: 'founder' }));
    expect(text).toMatch(/Test Target/);
    expect(text.split(' ').length).toBeLessThanOrEqual(50);
  });

  it('never includes raw score numbers', () => {
    for (const role of ['freelancer', 'founder_freelancer', 'founder_investor', 'investor', 'generic'] as const) {
      const text = buildAiRationale(role, explanation, metadata);
      expect(text).not.toMatch(/0\.\d{2}/);  // no decimal scores like 0.82
      expect(text).not.toMatch(/\d{2}%/);    // no percentage scores
    }
  });

  it('does not use promotional language', () => {
    for (const role of ['freelancer', 'founder_freelancer', 'founder_investor', 'investor'] as const) {
      const text = buildAiRationale(role, explanation, metadata);
      expect(text.toLowerCase()).not.toMatch(/you'll love|perfect match|amazing/);
    }
  });
});

// ─── buildTractionSignals ────────────────────────────────────────────────────

describe('buildTractionSignals', () => {
  it('returns at most 4 signals', () => {
    const signals = buildTractionSignals(
      ['Strong semantic', 'Same region', 'Good profile', 'High growth', 'Extra reason'],
      ['React'],
      0.85,
    );
    expect(signals.length).toBeLessThanOrEqual(4);
  });

  it('each signal has label, icon, and positive field', () => {
    const signals = buildTractionSignals(['Strong match'], ['React'], 0.8);
    for (const s of signals) {
      expect(s).toHaveProperty('label');
      expect(s).toHaveProperty('icon');
      expect(s).toHaveProperty('positive');
    }
  });

  it('positive is boolean or null (not undefined)', () => {
    const signals = buildTractionSignals(['Good alignment', 'Same region'], [], 0.65);
    for (const s of signals) {
      expect(s.positive === true || s.positive === false || s.positive === null).toBe(true);
    }
  });

  it('strong/growth reasons produce positive:true signals', () => {
    const signals = buildTractionSignals(['Strong semantic profile match'], [], 0.5);
    const posSignal = signals.find((s) => s.positive === true);
    expect(posSignal).toBeDefined();
  });

  it('returns empty array for no input', () => {
    const signals = buildTractionSignals([], [], 0.3);
    expect(signals).toEqual([]);
  });
});

// ─── buildSkillOverlap ───────────────────────────────────────────────────────

describe('buildSkillOverlap', () => {
  it('marks matched skills as matched:true', () => {
    const items = buildSkillOverlap(['React', 'TypeScript'], ['React', 'TypeScript', 'Node.js']);
    const matched = items.filter((i) => i.matched);
    expect(matched.map((i) => i.skill)).toEqual(expect.arrayContaining(['React', 'TypeScript']));
  });

  it('marks unmatched required skills as matched:false', () => {
    const items = buildSkillOverlap(['React'], ['React', 'Node.js', 'AWS']);
    const unmatched = items.filter((i) => !i.matched);
    expect(unmatched.map((i) => i.skill)).toEqual(expect.arrayContaining(['Node.js', 'AWS']));
  });

  it('returns at most 6 items', () => {
    const matched = ['a', 'b', 'c', 'd'];
    const required = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    expect(buildSkillOverlap(matched, required).length).toBeLessThanOrEqual(6);
  });

  it('works with no required skills (no unmatched chips)', () => {
    const items = buildSkillOverlap(['React', 'TypeScript'], []);
    expect(items.every((i) => i.matched)).toBe(true);
  });

  it('does not duplicate skills already in matched list', () => {
    const items = buildSkillOverlap(['React'], ['React', 'Node.js']);
    const reactItems = items.filter((i) => i.skill === 'React');
    expect(reactItems).toHaveLength(1);
  });
});

// ─── buildMatchDisplayResult ─────────────────────────────────────────────────

describe('buildMatchDisplayResult', () => {
  it('produces all required display fields', () => {
    const result = makeMatchResult();
    const display = buildMatchDisplayResult(result, 'freelancer', ['React', 'Node.js']);

    expect(display.matchBand).toBeDefined();
    expect(display.matchStatus).toBe('ready');
    expect(Array.isArray(display.matchReasons)).toBe(true);
    expect(typeof display.aiRationale).toBe('string');
  });

  it('sets matchStatus to ready', () => {
    const display = buildMatchDisplayResult(makeMatchResult(), 'investor', []);
    expect(display.matchStatus).toBe('ready');
  });

  it('populates tractionSignals for investor view', () => {
    const result = makeMatchResult({ metadata: makeMetadata({ role: 'founder' }) });
    const display = buildMatchDisplayResult(result, 'investor', []);
    expect(Array.isArray(display.tractionSignals)).toBe(true);
    expect(display.skillOverlap).toBeNull();
  });

  it('populates skillOverlap for freelancer view, no tractionSignals', () => {
    const result = makeMatchResult({ targetType: 'project', metadata: makeMetadata({ role: null }) });
    const display = buildMatchDisplayResult(result, 'freelancer', ['React', 'Node.js']);
    expect(Array.isArray(display.skillOverlap)).toBe(true);
    expect(display.tractionSignals).toBeNull();
  });

  it('matchBand strong for score >= 0.85', () => {
    const result = makeMatchResult({ score: 0.90 });
    const display = buildMatchDisplayResult(result, 'freelancer', []);
    expect(display.matchBand).toBe('strong');
  });

  it('matchReasons respects 5-item cap', () => {
    const result = makeMatchResult({
      explanation: makeExplanation({
        topReasons: ['a', 'b', 'c', 'd', 'e', 'f'],
      }),
    });
    const display = buildMatchDisplayResult(result, 'founder', []);
    expect(display.matchReasons.length).toBeLessThanOrEqual(5);
  });

  it('matchReasons labels are max 30 chars', () => {
    const result = makeMatchResult({
      explanation: makeExplanation({
        topReasons: ['This is a very long reason label that definitely exceeds thirty characters'],
      }),
    });
    const display = buildMatchDisplayResult(result, 'freelancer', []);
    for (const r of display.matchReasons) {
      expect(r.label.length).toBeLessThanOrEqual(30);
    }
  });
});
