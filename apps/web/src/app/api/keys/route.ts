import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getClient } from '@vb/database';
import { generateRawApiKey, hashApiKey, keyPrefix } from '@/lib/api-keys';

/**
 * GET /api/keys — list API keys for the authenticated user (prefix + metadata only, never raw key)
 */
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getClient();
  const keys = await db.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: {
      id: true,
      prefix: true,
      name: true,
      createdAt: true,
      expiresAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ keys });
}

/**
 * POST /api/keys — generate a new API key
 * Body: { name: string }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only supplier role can generate API keys
  if (session.user.role !== 'supplier') {
    return NextResponse.json({ error: 'Only supplier accounts can generate API keys' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: '`name` is required' }, { status: 400 });

  const rawKey = generateRawApiKey();
  const db = getClient();

  const record = await db.apiKey.create({
    data: {
      userId: session.user.id,
      keyHash: hashApiKey(rawKey),
      prefix: keyPrefix(rawKey),
      name,
    },
  });

  // Return the raw key exactly once — it will never be retrievable again
  return NextResponse.json({ id: record.id, key: rawKey, prefix: record.prefix, name: record.name }, { status: 201 });
}

/**
 * DELETE /api/keys — revoke an API key
 * Body: { id: string }
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === 'string' ? body.id : null;
  if (!id) return NextResponse.json({ error: '`id` is required' }, { status: 400 });

  const db = getClient();
  const key = await db.apiKey.findUnique({ where: { id } });

  if (!key || key.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
