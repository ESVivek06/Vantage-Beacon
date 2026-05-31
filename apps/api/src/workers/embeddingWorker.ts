import { Worker, Job } from 'bullmq';
import { redisConnection, type EmbeddingJobData } from './queues';
import { MlServiceEmbeddingProvider } from '../matching/embeddingService';

const embedder = new MlServiceEmbeddingProvider();

let worker: Worker | null = null;

export function startEmbeddingWorker(): void {
  worker = new Worker<EmbeddingJobData>(
    'embedding',
    async (job: Job<EmbeddingJobData>) => {
      const { entityId, entityType, text } = job.data;
      await embedder.embed(text, entityId, entityType, true);
    },
    { connection: redisConnection, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    console.error(`[embedding-worker] Job ${job?.id} failed:`, err.message);
  });
}

export async function stopEmbeddingWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
