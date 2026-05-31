import type { EmbeddingProvider } from './types';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';

/**
 * Delegates embedding generation to the Python ML microservice.
 * The microservice handles OpenAI calls and optional persistence to pgvector.
 */
export class MlServiceEmbeddingProvider implements EmbeddingProvider {
  readonly modelName = 'text-embedding-3-small';
  readonly dimensions = 1536;

  async embed(
    text: string,
    entityId?: string,
    entityType?: 'user' | 'project',
    persist = false,
  ): Promise<number[]> {
    const res = await fetch(`${ML_SERVICE_URL}/embeddings/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        entity_id: entityId ?? null,
        entity_type: entityType ?? null,
        persist,
      }),
    });
    if (!res.ok) {
      throw new Error(`ML embedding failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { vector: number[] };
    return data.vector;
  }
}

/**
 * Deterministic mock: all-zeros vector.
 * Used in tests and local dev without OPENAI_API_KEY.
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly modelName = 'mock-zeros';
  readonly dimensions = 1536;

  async embed(): Promise<number[]> {
    return new Array(this.dimensions).fill(0) as number[];
  }
}

export function buildProfileText(profile: {
  bio?: string | null;
  skills?: string[];
  tags?: string[];
  domain?: string | null;
}): string {
  const parts: string[] = [];
  if (profile.bio) parts.push(profile.bio);
  if (profile.skills?.length) parts.push(`Skills: ${profile.skills.join(', ')}`);
  if (profile.tags?.length) parts.push(`Tags: ${profile.tags.join(', ')}`);
  if (profile.domain) parts.push(`Domain: ${profile.domain}`);
  return parts.join('\n');
}
