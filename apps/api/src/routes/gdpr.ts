import { Router, Request, Response } from 'express';
import { AuditAction } from '@vb/database';
import { writeAuditLog } from '../middleware/auditLog';
import { hardDeleteQueue, dataExportQueue } from '../workers/queues';

const router = Router();

const HARD_DELETE_DELAY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * POST /gdpr/erasure
 * GDPR Art. 17 — right to erasure.
 * Soft-deletes the account immediately; schedules hard-delete PII purge at 30 days.
 */
router.post('/erasure', async (req: Request, res: Response) => {
  const db = req.regionalDb!;
  const userId = req.userId!;

  try {
    const scheduledAt = new Date(Date.now() + HARD_DELETE_DELAY_MS);

    const gdprRequest = await (db as any).gdprRequest.create({
      data: {
        userId,
        type: 'erasure',
        status: 'pending',
        scheduledAt,
      },
    });

    // Soft-delete immediately
    await (db as any).user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Audit log
    await writeAuditLog({
      db,
      userId,
      action: AuditAction.erasure_requested,
      req,
      entityId: gdprRequest.id,
      entityType: 'GdprRequest',
    });

    // Schedule BullMQ hard-delete job for 30 days from now
    await hardDeleteQueue.add(
      'hard-delete',
      { gdprRequestId: gdprRequest.id, userId, region: req.userRegion! },
      { delay: HARD_DELETE_DELAY_MS, jobId: `hard-delete:${gdprRequest.id}` },
    );

    res.status(202).json({
      message: 'Erasure request accepted. Your account has been deactivated. All personal data will be permanently deleted after 30 days.',
      gdprRequestId: gdprRequest.id,
      scheduledPurgeAt: scheduledAt.toISOString(),
    });
  } catch (err) {
    console.error('[gdpr/erasure]', err);
    res.status(500).json({ error: 'Failed to process erasure request' });
  }
});

/**
 * POST /gdpr/export
 * GDPR Art. 20 — data portability.
 * Enqueues an async export job; user receives a download link by email within minutes.
 */
router.post('/export', async (req: Request, res: Response) => {
  const db = req.regionalDb!;
  const userId = req.userId!;

  try {
    const user = await (db as any).user.findUnique({
      where: { id: userId },
      select: { email: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const gdprRequest = await (db as any).gdprRequest.create({
      data: { userId, type: 'export', status: 'pending' },
    });

    await writeAuditLog({
      db,
      userId,
      action: AuditAction.data_export_requested,
      req,
      entityId: gdprRequest.id,
      entityType: 'GdprRequest',
    });

    await dataExportQueue.add(
      'data-export',
      {
        gdprRequestId: gdprRequest.id,
        userId,
        region: req.userRegion!,
        userEmail: user.email,
      },
      { jobId: `data-export:${gdprRequest.id}` },
    );

    res.status(202).json({
      message: 'Data export request accepted. You will receive an email with a download link within a few minutes.',
      gdprRequestId: gdprRequest.id,
    });
  } catch (err) {
    console.error('[gdpr/export]', err);
    res.status(500).json({ error: 'Failed to process export request' });
  }
});

/**
 * POST /gdpr/consent
 * Records DPA agreement or cookie consent for the authenticated user.
 * Body: { type: 'dpa' | 'cookie_analytics' | 'cookie_marketing', version: string, accepted: boolean }
 */
router.post('/consent', async (req: Request, res: Response) => {
  const db = req.regionalDb!;
  const userId = req.userId!;
  const { type, version, accepted } = req.body as {
    type: string;
    version: string;
    accepted: boolean;
  };

  const VALID_TYPES = ['dpa', 'cookie_analytics', 'cookie_marketing'];
  if (!VALID_TYPES.includes(type) || !version || typeof accepted !== 'boolean') {
    res.status(400).json({ error: 'Invalid consent payload. Required: type, version, accepted' });
    return;
  }

  try {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      null;

    const consent = await (db as any).userConsent.upsert({
      where: { userId_type_version: { userId, type, version } },
      create: {
        userId,
        type,
        version,
        accepted,
        ipAddress,
        userAgent: req.headers['user-agent'] ?? null,
      },
      update: { accepted, ipAddress, userAgent: req.headers['user-agent'] ?? null },
    });

    const auditAction =
      type === 'dpa' ? AuditAction.dpa_accepted : AuditAction.cookie_consent_given;

    await writeAuditLog({
      db,
      userId,
      action: auditAction,
      req,
      entityId: consent.id,
      entityType: 'UserConsent',
      metadata: { type, version, accepted },
    });

    res.status(200).json({ consentId: consent.id, recorded: true });
  } catch (err) {
    console.error('[gdpr/consent]', err);
    res.status(500).json({ error: 'Failed to record consent' });
  }
});

export default router;
