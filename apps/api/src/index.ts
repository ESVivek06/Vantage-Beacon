import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

dotenv.config();

import { regionRoutingMiddleware } from './middleware/regionRouting';
import gdprRouter from './routes/gdpr';
import { unsubscribeRouter } from './routes/unsubscribe';
import matchRouter from './routes/match';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { buildContext, buildSubscriptionContext } from './graphql/context';
import { startEmailWorker } from './email/worker';
import { startEmbeddingWorker, stopEmbeddingWorker } from './workers/embeddingWorker';

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

  // AI matching engine — POST /api/match, POST /api/match/feedback, GET /api/match/metrics
  app.use('/api/match', matchRouter);

  // Build executable schema once so HTTP and WS servers share the same instance.
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const httpServer = http.createServer(app);

  // WebSocket server for GraphQL subscriptions (graphql-ws protocol).
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
  const wsCleanup = useServer(
    { schema, context: buildSubscriptionContext },
    wsServer,
  );

  const gqlServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await wsCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await gqlServer.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(gqlServer, { context: buildContext }),
  );

  // Email notification worker (in-process for MVP)
  startEmailWorker();

  // Embedding worker: generates pgvector embeddings for profiles/projects via BullMQ.
  startEmbeddingWorker();

  await new Promise<void>((resolve) => httpServer.listen(PORT, resolve));
  console.log(`API server running on port ${PORT}`);
  console.log(`GraphQL (HTTP):  http://localhost:${PORT}/graphql`);
  console.log(`GraphQL (WS):    ws://localhost:${PORT}/graphql`);

  const shutdown = async () => {
    const { stopEmailWorker } = await import('./email/worker');
    await Promise.all([stopEmailWorker(), stopEmbeddingWorker()]);
    await gqlServer.stop();
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
