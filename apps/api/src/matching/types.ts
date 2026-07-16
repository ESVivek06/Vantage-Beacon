export type MatchType = 'freelancer_to_project' | 'founder_to_investor' | 'user_to_user' | 'supplier_to_founder' | 'stakeholder_to_project';
export type Region = 'UK' | 'IN' | 'NA';

export interface MatchFilter {
  region?: Region;
  requiredSkills?: string[];
  domain?: string;
  targetType?: 'user' | 'project';
  targetRole?: string;
}

export interface MatchRequest {
  userId: string;
  matchType: MatchType;
  filters?: MatchFilter;
  limit?: number;
}

export interface MatchExplanation {
  semanticScore: number;
  skillOverlap: string[];
  regionMatch: boolean;
  topReasons: string[];
}

export interface MatchResult {
  matchId: string;
  targetId: string;
  targetType: 'user' | 'project';
  score: number;
  explanation: MatchExplanation;
  metadata: {
    displayName?: string | null;
    region?: string | null;
    role?: string | null;
  };
}

export interface EmbeddingProvider {
  embed(text: string, entityId?: string, entityType?: 'user' | 'project', persist?: boolean): Promise<number[]>;
  modelName: string;
  dimensions: number;
}

// ─── UI Display Contract ──────────────────────────────────────────────────────
// Types for the MatchCard display layer (VAN-140)

/** Pre-computed quality band — never expose raw score to UI (anchoring bias). */
export type MatchBand = 'strong' | 'good' | 'possible' | 'weak';

/** Processing state of the AI match generation. */
export type MatchStatus = 'ready' | 'processing' | 'failed';

/** A reason chip shown on the MatchCard. key is analytics-only. */
export interface MatchReason {
  label: string; // max 30 chars
  key: string;
}

/** A traction signal chip for the Investor MatchCard variant. */
export interface TractionSignal {
  label: string;
  icon: string;
  /** true = success chip, false = warning chip, null = neutral chip */
  positive: boolean | null;
}

/** A skill chip on Freelancer/Founder MatchCard variants. */
export interface SkillOverlapItem {
  skill: string;
  /** true = success chip (matched), false = neutral chip (required but unmatched) */
  matched: boolean;
}

/** Full UI-ready match result with all MatchCard display fields. */
export interface MatchDisplayResult extends MatchResult {
  matchBand: MatchBand;
  matchStatus: MatchStatus;
  matchReasons: MatchReason[];
  aiRationale: string | null;
  tractionSignals: TractionSignal[] | null;
  skillOverlap: SkillOverlapItem[] | null;
}

/** Role pair context used to select the correct aiRationale copy rule. */
export type RolePair =
  | 'freelancer'            // freelancer seeing a project opportunity
  | 'founder_freelancer'   // founder seeing a freelancer candidate
  | 'founder_investor'     // founder seeing an investor
  | 'investor'             // investor seeing a startup
  | 'supplier'             // supplier seeing a project that needs supply
  | 'stakeholder'          // stakeholder seeing an open project
  | 'generic';             // fallback
