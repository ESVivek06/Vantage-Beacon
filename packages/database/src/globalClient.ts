// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobalPrismaClient = any;

let _globalClient: GlobalPrismaClient | undefined;

/**
 * Returns the singleton Prisma client connected to the global metadata cluster.
 * This cluster stores ONLY userId → region; absolutely no PII.
 *
 * Requires:
 *   1. `prisma generate --schema prisma/schema.global.prisma` to have been run.
 *   2. DATABASE_URL_GLOBAL set in your environment.
 */
export function getGlobalClient(): GlobalPrismaClient {
  if (!_globalClient) {
    const url = process.env.DATABASE_URL_GLOBAL;
    if (!url) {
      throw new Error(
        'DATABASE_URL_GLOBAL is not set. The global metadata cluster requires its own connection string.',
      );
    }
    // Loaded at runtime so this module compiles before the client is generated.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('../node_modules/.prisma/global-client') as {
      PrismaClient: new (opts: Record<string, unknown>) => GlobalPrismaClient;
    };
    _globalClient = new PrismaClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return _globalClient;
}

export async function disconnectGlobal(): Promise<void> {
  await _globalClient?.$disconnect();
}

process.on('beforeExit', () => void disconnectGlobal());
