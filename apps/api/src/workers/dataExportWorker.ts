import { Worker, Job } from 'bullmq';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getClientForRegion, Region, AuditAction } from '@vb/database';
import { sendEmail } from '../services/emailService';
import { redisConnection, DataExportJobData } from './queues';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'eu-west-2' });
const EXPORT_BUCKET = process.env.GDPR_EXPORT_BUCKET ?? 'vb-gdpr-exports';
const PRESIGNED_TTL_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * GDPR Art. 20 data portability export worker.
 * Collects all user PII into a JSON payload, uploads to S3, generates a 24hr
 * presigned download URL, and emails the link to the user.
 */
export const dataExportWorker = new Worker<DataExportJobData>(
  'gdpr-data-export',
  async (job: Job<DataExportJobData>) => {
    const { gdprRequestId, userId, region, userEmail } = job.data;
    const db = getClientForRegion(region as Region);

    // Collect all user data
    const [user, profile, connections, investments, messages] = await Promise.all([
      (db as any).user.findUnique({ where: { id: userId } }),
      (db as any).profile.findUnique({ where: { userId } }),
      (db as any).connection.findMany({
        where: { OR: [{ requesterId: userId }, { receiverId: userId }] },
      }),
      (db as any).investment.findMany({
        where: { OR: [{ investorId: userId }, { founderId: userId }] },
      }),
      (db as any).message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      }),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      gdprRequestId,
      user: {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        region: user?.region,
        profileData: user?.profileData,
        createdAt: user?.createdAt,
      },
      profile: profile
        ? {
            displayName: profile.displayName,
            bio: profile.bio,
            skills: profile.skills,
            tags: profile.tags,
            verified: profile.verified,
            createdAt: profile.createdAt,
          }
        : null,
      connections,
      investments,
      messages: messages.map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        sentAt: m.sentAt,
      })),
    };

    // Upload to S3
    const s3Key = `exports/${region}/${userId}/${gdprRequestId}.json`;
    await s3.send(
      new PutObjectCommand({
        Bucket: EXPORT_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(exportPayload, null, 2),
        ContentType: 'application/json',
        ServerSideEncryption: 'AES256',
      }),
    );

    // Generate 24hr presigned URL
    const presignedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: EXPORT_BUCKET, Key: s3Key }),
      { expiresIn: PRESIGNED_TTL_SECONDS },
    );

    // Persist URL and mark request complete in one transaction
    await (db as any).$transaction([
      (db as any).gdprRequest.update({
        where: { id: gdprRequestId },
        data: { status: 'completed', completedAt: new Date(), exportUrl: presignedUrl },
      }),
      (db as any).auditLog.create({
        data: {
          userId,
          action: AuditAction.data_export_completed,
          entityId: gdprRequestId,
          entityType: 'GdprRequest',
          metadata: { region, s3Key },
        },
      }),
    ]);

    // Email the download link
    await sendExportEmail(userEmail, presignedUrl);

    console.log(`[gdpr-data-export] Export ready for user ${userId}, request ${gdprRequestId}`);
  },
  { connection: redisConnection, concurrency: 3 },
);

async function sendExportEmail(to: string, downloadUrl: string): Promise<void> {
  const text = [
    'Your personal data export has been prepared as requested.',
    '',
    'Download your data (link expires in 24 hours):',
    downloadUrl,
    '',
    'If you did not request this export, please contact support immediately.',
  ].join('\n');

  await sendEmail({
    to,
    subject: 'Your V.B data export is ready',
    text,
    html: `<p>Your personal data export has been prepared.</p>
<p><a href="${downloadUrl}">Download your data</a> (link expires in 24 hours).</p>
<p>If you did not request this export, please contact support immediately.</p>`,
  });
}

dataExportWorker.on('failed', (job, err) => {
  console.error(`[gdpr-data-export] Job ${job?.id} failed:`, err);
});
