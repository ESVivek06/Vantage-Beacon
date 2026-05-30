import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

dotenv.config();

import { regionRoutingMiddleware } from './middleware/regionRouting';
import gdprRouter from './routes/gdpr';
import { unsubscribeRouter } from './routes/unsubscribe';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { buildContext } from './graphql/context';
import { startEmailWorker } from './email/worker';

// Start GDPR workers (BullMQ in-process; extract to dedicated containers post-MVP).
import './workers/hardDeleteWorker';
import './workers/dataExportWorker';

async function main() {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GDPR endpoints — JWT + region routing applied to all /api/gdpr/* routes
  app.use('/api/gdpr', regionRoutingMiddleware, gdprRouter);

  // Unsubscribe — no auth required (HMAC token validates identity)
  app.use('/unsubscribe', unsubscribeRouter);

  // GraphQL endpoint
  const gqlServer = new ApolloServer({ typeDefs, resolvers });
  await gqlServer.start();
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(gqlServer, { context: buildContext }),
  );

  // Email notification worker (in-process for MVP)
  startEmailWorker();

  const server = app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`GraphQL: http://localhost:${PORT}/graphql`);
  });

  const shutdown = async () => {
    const { stopEmailWorker } = await import('./email/worker');
    await stopEmailWorker();
    await gqlServer.stop();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
