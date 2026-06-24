export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(
  _req: Request,
  { params }: { params: { escrowId: string; milestoneId: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { escrowId, milestoneId } = params;

  // Stub — production: verify user is the founder, escrow not disputed,
  // milestone is PENDING, trigger payment processing, update milestone to RELEASED,
  // record timeline event, send notification to counterparty.
  return NextResponse.json({
    escrowId,
    milestoneId,
    status: 'RELEASED',
    releasedAt: new Date().toISOString(),
  });
}
