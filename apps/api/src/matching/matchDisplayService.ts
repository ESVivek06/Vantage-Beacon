import type {
  MatchResult,
  MatchDisplayResult,
  MatchBand,
  MatchReason,
  TractionSignal,
  SkillOverlapItem,
  RolePair,
} from './types';

// ─── Band thresholds (from VAN-140 spec: 85/65/40) ───────────────────────────

export function computeMatchBand(score: number): MatchBand {
  if (score >= 0.85) return 'strong';
  if (score >= 0.65) return 'good';
  if (score >= 0.40) return 'possible';
  return 'weak';
}

// ─── Match reason chips ───────────────────────────────────────────────────────

const MAX_REASONS = 5;
const MAX_LABEL_LENGTH = 30;

function toKey(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function truncateLabel(label: string): string {
  return label.length > MAX_LABEL_LENGTH ? label.slice(0, MAX_LABEL_LENGTH - 1) + '…' : label;
}

export function buildMatchReasons(topReasons: string[]): MatchReason[] {
  return topReasons.slice(0, MAX_REASONS).map((reason) => {
    const label = truncateLabel(reason);
    return { label, key: toKey(reason) };
  });
}

// ─── AI rationale (copy rules from VAN-138 §5) ───────────────────────────────

const MAX_RATIONALE_WORDS = 50;

function trimToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '.';
}

/**
 * Derives the role pair from the caller's role and the matched target's role/type.
 * Used to select the correct aiRationale copy pattern per VAN-138 §5.
 */
export function deriveRolePair(
  callerRole: string,
  targetRole: string | null | undefined,
  targetType: 'user' | 'project',
): RolePair {
  if (callerRole === 'freelancer' && (targetType === 'project' || (targetType === 'user' && targetRole === 'founder'))) return 'freelancer';
  if (callerRole === 'founder' && targetType === 'user') {
    if (targetRole === 'freelancer' || targetRole === 'supplier') return 'founder_freelancer';
    if (targetRole === 'investor') return 'founder_investor';
  }
  if (callerRole === 'investor' && targetType === 'user' && targetRole === 'founder') return 'investor';
  return 'generic';
}

/**
 * Generates aiRationale following the copy rules from VAN-138 §5.
 * Never includes raw scores or promotional language.
 * Max 2 sentences, ~50 words.
 */
export function buildAiRationale(
  rolePair: RolePair,
  explanation: MatchResult['explanation'],
  metadata: MatchResult['metadata'],
): string {
  const { skillOverlap, regionMatch, topReasons, semanticScore } = explanation;
  const name = metadata.displayName ?? 'This match';
  const region = metadata.region;

  let rationale: string;

  switch (rolePair) {
    case 'freelancer': {
      // Format: [skill+relevance] — focus on skills + opportunity fit
      const topSkills = skillOverlap.slice(0, 2);
      const skillText =
        topSkills.length > 0
          ? `requires ${topSkills.join(' and ')} — your top skill${topSkills.length > 1 ? 's' : ''}`
          : 'aligns with your skill set';
      const contextReason = topReasons.find((r) => !r.toLowerCase().includes('skill')) ?? null;
      const context = regionMatch && region
        ? `The team is based in the ${region} region${contextReason ? ' and ' + contextReason.toLowerCase() : ''}.`
        : contextReason
          ? `${contextReason}.`
          : 'Your profile aligns closely with what this opportunity needs.';
      rationale = `This opportunity ${skillText}. ${context}`;
      break;
    }

    case 'founder_freelancer': {
      // Format: [experience+availability] — candidate's experience + availability signal
      const topSkills = skillOverlap.slice(0, 2);
      const skillText =
        topSkills.length > 0
          ? `brings ${topSkills.join(' and ')} experience`
          : 'has a relevant background';
      const availSignal = topReasons.find((r) =>
        r.toLowerCase().includes('availab') || r.toLowerCase().includes('region') || r.toLowerCase().includes('same'),
      );
      const context = availSignal
        ? availSignal.charAt(0).toUpperCase() + availSignal.slice(1) + '.'
        : regionMatch
          ? 'They are in the same region and available for new work.'
          : 'Their profile closely matches your opportunity requirements.';
      rationale = `${name} ${skillText}. ${context}`;
      break;
    }

    case 'founder_investor': {
      // Format: [thesis+deployment] — investor thesis relevance + active deployment signal
      const thesisReason =
        topReasons.find((r) => r.toLowerCase().includes('match') || r.toLowerCase().includes('align')) ??
        topReasons[0] ??
        'Strong profile alignment';
      const deploySignal = topReasons.find((r) => r.toLowerCase().includes('region') || r.toLowerCase().includes('active')) ?? null;
      const context = deploySignal
        ? `${deploySignal.charAt(0).toUpperCase() + deploySignal.slice(1)}.`
        : semanticScore > 0.75
          ? 'Their investment thesis closely aligns with your stage and sector.'
          : 'Their focus areas overlap with your company profile.';
      rationale = `${name} — ${thesisReason.toLowerCase()}. ${context}`;
      break;
    }

    case 'investor': {
      // Format: [stage/sector alignment + notable traction signal]
      const alignReason =
        topReasons.find((r) =>
          r.toLowerCase().includes('semantic') || r.toLowerCase().includes('profile') || r.toLowerCase().includes('match'),
        ) ?? topReasons[0] ?? 'Strong profile match';
      const tractionReason =
        topReasons.find((r) =>
          !r.toLowerCase().includes('semantic') && !r.toLowerCase().includes('profile'),
        ) ?? null;
      const context = tractionReason
        ? tractionReason.charAt(0).toUpperCase() + tractionReason.slice(1) + '.'
        : skillOverlap.length > 0
          ? `Their domain expertise includes ${skillOverlap.slice(0, 2).join(' and ')}.`
          : 'Their stage and sector align with your investment thesis.';
      rationale = `${name} — ${alignReason.toLowerCase()}. ${context}`;
      break;
    }

    default: {
      const reason = topReasons[0] ?? 'Strong semantic profile match';
      rationale = `${name} matches your profile. ${reason}.`;
    }
  }

  return trimToWords(rationale, MAX_RATIONALE_WORDS);
}

// ─── Traction signals (investor view) ────────────────────────────────────────

const MAX_TRACTION_SIGNALS = 4;

/**
 * Derives traction signals from the ML explanation for the Investor MatchCard.
 * positive=true → success chip, positive=false → warning chip, positive=null → neutral.
 */
export function buildTractionSignals(
  topReasons: string[],
  skillOverlap: string[],
  semanticScore: number,
): TractionSignal[] {
  const signals: TractionSignal[] = [];

  for (const reason of topReasons) {
    const lower = reason.toLowerCase();
    if (signals.length >= MAX_TRACTION_SIGNALS) break;

    if (lower.includes('strong') || lower.includes('high') || lower.includes('growth')) {
      signals.push({ label: truncateLabel(reason), icon: 'TrendingUp', positive: true });
    } else if (lower.includes('region') || lower.includes('same')) {
      signals.push({ label: truncateLabel(reason), icon: 'MapPin', positive: true });
    } else if (lower.includes('complementary') || lower.includes('good')) {
      signals.push({ label: truncateLabel(reason), icon: 'Zap', positive: null });
    } else {
      signals.push({ label: truncateLabel(reason), icon: 'Info', positive: null });
    }
  }

  // Add a skill signal if we have overlap and still have room
  if (signals.length < MAX_TRACTION_SIGNALS && skillOverlap.length > 0) {
    const label = `${skillOverlap.length} domain skill${skillOverlap.length > 1 ? 's' : ''} match`;
    signals.push({ label: truncateLabel(label), icon: 'CheckCircle', positive: true });
  }

  // Add a semantic alignment signal if score is meaningful
  if (signals.length < MAX_TRACTION_SIGNALS && semanticScore > 0.6) {
    signals.push({ label: 'Strong thesis alignment', icon: 'Star', positive: true });
  }

  return signals.slice(0, MAX_TRACTION_SIGNALS);
}

// ─── Skill overlap chips ──────────────────────────────────────────────────────

const MAX_SKILL_OVERLAP = 6;

/**
 * Builds the skill overlap array for Freelancer/Founder MatchCard variants.
 * matchedSkills = skills returned by ML (intersection of caller's skills + opportunity skills).
 * requiredSkills = full list of skills required by the opportunity (if available).
 */
export function buildSkillOverlap(
  matchedSkills: string[],
  requiredSkills: string[] = [],
): SkillOverlapItem[] {
  const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));
  const items: SkillOverlapItem[] = [];

  // Add matched skills first (success chips)
  for (const skill of matchedSkills.slice(0, MAX_SKILL_OVERLAP)) {
    items.push({ skill, matched: true });
  }

  // Add unmatched required skills (neutral chips), up to the limit
  for (const skill of requiredSkills) {
    if (items.length >= MAX_SKILL_OVERLAP) break;
    if (!matchedSet.has(skill.toLowerCase())) {
      items.push({ skill, matched: false });
    }
  }

  return items;
}

// ─── Full display result builder ──────────────────────────────────────────────

/**
 * Transforms a raw MatchResult from the ML engine into the full UI display
 * contract required by the MatchCard component (VAN-140 data contract).
 */
export function buildMatchDisplayResult(
  result: MatchResult,
  callerRole: string,
  requiredSkills: string[] = [],
): MatchDisplayResult {
  const rolePair = deriveRolePair(callerRole, result.metadata.role, result.targetType);
  const matchBand = computeMatchBand(result.score);
  const matchReasons = buildMatchReasons(result.explanation.topReasons);
  const aiRationale = buildAiRationale(rolePair, result.explanation, result.metadata);

  const isInvestorView = rolePair === 'investor';
  const isFreelancerOrFounderView = rolePair === 'freelancer' || rolePair === 'founder_freelancer';

  const tractionSignals: TractionSignal[] | null = isInvestorView
    ? buildTractionSignals(
        result.explanation.topReasons,
        result.explanation.skillOverlap,
        result.explanation.semanticScore,
      )
    : null;

  const skillOverlap: SkillOverlapItem[] | null = isFreelancerOrFounderView
    ? buildSkillOverlap(result.explanation.skillOverlap, requiredSkills)
    : null;

  return {
    ...result,
    matchBand,
    matchStatus: 'ready',
    matchReasons,
    aiRationale,
    tractionSignals,
    skillOverlap,
  };
}
