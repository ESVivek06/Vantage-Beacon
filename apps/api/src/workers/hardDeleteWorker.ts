import { Worker, Job } from 'bullmq';
import { getClientForRegion, Region, AuditAction } from '@vb/database';
import { redisConnection, HardDeleteJobData } from './queues';

/**
 * GDPR Art. 17 hard-delete worker.
 * Runs 30 days after an erasure request is confirmed (scheduled via BullMQ delay).
 * Nulls out all PII columns rather than deleting rows to preserve referential integrity.
 */
export const hardDeleteWorker = new Worker<HardDeleteJobData>(
  'gdpr-hard-delete',
  async (job: Job<HardDeleteJobData>) => {
    const { gdprRequestId, userId, region } = job.data;
    const db = getClientForRegion(region as Region);

    await db.$transaction(async (tx) => {
      // Null out all PII fields on the user row
      await (tx as any).user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}@purged.invalid`,
          passwordHash: null,
          profileData: {},
          deletedAt: new Date(),
        },
      });

      // Anonymise profile display data
      await (tx as any).profile.updateMany({
        where: { userId },
        data: {
          displayName: '[Deleted User]',
          bio: null,
          skills: [],
          tags: [],
          embeddingVector: null,
          deletedAt: new Date(),
        },
      });

      // Soft-delete messages to prevent orphaned content
      await (tx as any).message.updateMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        data: { deletedAt: new Date() },
      });

      // Mark GDPR request as completed
      await (tx as any).gdprRequest.update({
        where: { id: gdprRequestId },
        data: { status: 'completed', completedAt: new Date() },
      });

      // Audit log entry — this is the compliance record
      await (tx as any).auditLog.create({
        data: {
          userId,
          action: AuditAction.erasure_completed,
          entityId: gdprRequestId,
          entityType: 'GdprRequest',
          metadata: { region },
        },
      });
    });

    console.log(`[gdpr-hard-delete] PII purged for user ${userId} (request ${gdprRequestId})`);
  },
  { connection: redisConnection, concurrency: 5 },
);

hardDeleteWorker.on('failed', (job, err) => {
  console.error(`[gdpr-hard-delete] Job ${job?.id} failed:`, err);
});
