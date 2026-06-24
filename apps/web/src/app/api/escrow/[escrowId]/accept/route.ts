export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function PATCH(
  _req: Request,
  { params }: { params: { escrowId: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { escrowId } = params;

  // Stub — production: verify user is the counterparty, update status to ACCEPTED,
  // record timeline event, send notification to founder.
  return NextResponse.json({ escrowId, status: 'ACCEPTED' });
}
