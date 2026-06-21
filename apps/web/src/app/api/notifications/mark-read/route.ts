export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

interface MarkReadBody {
  ids?: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: MarkReadBody = {};
  try {
    body = await req.json();
  } catch {
    // all notifications when body is missing/empty
  }

  // In production: mark body.ids (or all) as read in DB for this user.
  // MVP: mock response
  return NextResponse.json({ ok: true, markedIds: body.ids ?? 'all' });
}
