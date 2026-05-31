import { Request } from 'express';
import { AuditAction } from '@vb/database';
import { PrismaClient } from '@prisma/client';

interface AuditParams {
  db: PrismaClient;
  userId: string;
  action: AuditAction;
  req: Request;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Writes an append-only audit log entry to the regional cluster.
 * Call this after every sensitive mutation; never await it on the critical path
 * unless you need the audit to be transactional.
 */
export async function writeAuditLog(params: AuditParams): Promise<void> {
  const { db, userId, action, req, entityId, entityType, metadata = {} } = params;

  const ipAddress =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    null;

  await (db as any).auditLog.create({
    data: {
      userId,
      action,
      entityId: entityId ?? null,
      entityType: entityType ?? null,
      ipAddress,
      metadata,
    },
  });
}
