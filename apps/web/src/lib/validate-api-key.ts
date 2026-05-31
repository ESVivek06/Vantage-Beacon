import { type NextRequest, NextResponse } from 'next/server';
import { getClient } from '@vb/database';
import { hashApiKey } from './api-keys';

/**
 * Validate a bearer API key from the Authorization header.
 * Returns the associated userId on success, or a 401 NextResponse on failure.
 *
 * Usage in a route handler:
 *   const result = await validateApiKey(req);
 *   if (result instanceof NextResponse) return result;
 *   const { userId } = result;
 */
export async function validateApiKey(
  req: NextRequest,
): Promise<{ userId: string } | NextResponse> {
  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey.startsWith('vb_')) {
    return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 });
  }

  const keyHash = hashApiKey(rawKey);
  const db = getClient();

  const record = await db.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, userId: true, revokedAt: true, expiresAt: true },
  });

  if (!record || record.revokedAt) {
    return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 });
  }

  if (record.expiresAt && record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'API key has expired' }, { status: 401 });
  }

  // Fire-and-forget lastUsedAt update — don't block the request
  void db.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return { userId: record.userId };
}
