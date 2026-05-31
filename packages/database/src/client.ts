import { PrismaClient } from '@prisma/client';
import { Region } from './enums';

/**
 * Regional DATABASE_URL environment variables.
 * Each region runs a separate Postgres 16 cluster for data residency compliance.
 *
 * UK  → eu-west-2  (UK GDPR / DPA 2018)
 * NA  → us-east-1  (CCPA / PIPEDA)
 * IN  → ap-south-1 (PDPB 2023 — Phase 2)
 *
 * Connection pool size is intentionally conservative for MVP (Fargate 512MB tasks).
 * Tune connection_limit and pool_timeout via the ?connection_limit= query param as
 * traffic grows, or switch to PgBouncer in front of RDS.
 */
const REGIONAL_URLS: Record<Region, string | undefined> = {
  [Region.UK]: process.env.DATABASE_URL_UK ?? process.env.DATABASE_URL,
  [Region.NA]: process.env.DATABASE_URL_NA ?? process.env.DATABASE_URL,
  [Region.IN]: process.env.DATABASE_URL_IN ?? process.env.DATABASE_URL,
};

// Per-region singleton clients — lazily initialised.
const clients: Partial<Record<Region, PrismaClient>> = {};

/** Returns a PrismaClient connected to the given region's cluster. */
export function getClientForRegion(region: Region): PrismaClient {
  if (!clients[region]) {
    const url = REGIONAL_URLS[region];
    if (!url) {
      throw new Error(
        `No DATABASE_URL configured for region "${region}". ` +
          `Set DATABASE_URL_${region} (or DATABASE_URL as fallback) in your environment.`,
      );
    }
    clients[region] = new PrismaClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
  }
  return clients[region]!;
}

/**
 * Default client — uses DATABASE_URL (suitable for local dev and migrations).
 * In production, always route through getClientForRegion() using the user's region
 * claim extracted from the JWT.
 */
export function getClient(): PrismaClient {
  return getClientForRegion(
    (process.env.DEFAULT_REGION as Region | undefined) ?? Region.UK,
  );
}

/** Gracefully disconnect all open regional clients (call on process exit). */
export async function disconnectAll(): Promise<void> {
  await Promise.all(
    Object.values(clients).map((c) => c?.$disconnect()),
  );
}

// Ensure all clients disconnect when the process exits.
process.on('beforeExit', () => void disconnectAll());
