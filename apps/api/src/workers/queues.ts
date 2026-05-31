import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redisConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const hardDeleteQueue = new Queue<HardDeleteJobData>('gdpr-hard-delete', {
  connection: redisConnection,
});

export const dataExportQueue = new Queue<DataExportJobData>('gdpr-data-export', {
  connection: redisConnection,
});

export const embeddingQueue = new Queue<EmbeddingJobData>('embedding', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export interface HardDeleteJobData {
  gdprRequestId: string;
  userId: string;
  region: string;
}

export interface DataExportJobData {
  gdprRequestId: string;
  userId: string;
  region: string;
  userEmail: string;
}

export interface EmbeddingJobData {
  entityId: string;
  entityType: 'user' | 'project';
  text: string;
}
