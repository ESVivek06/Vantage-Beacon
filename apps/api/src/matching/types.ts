export type MatchType = 'freelancer_to_project' | 'founder_to_investor' | 'user_to_user';
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
