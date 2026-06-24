export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

type Outcome = 'RESOLVED' | 'REFUNDED' | 'ESCALATED';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { escrowId: string; disputeId: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { escrowId, disputeId } = params;
  let outcome: Outcome | undefined;

  try {
    const body = await req.json();
    outcome = body.outcome;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validOutcomes: Outcome[] = ['RESOLVED', 'REFUNDED', 'ESCALATED'];
  if (!outcome || !validOutcomes.includes(outcome)) {
    return NextResponse.json(
      { error: 'outcome must be one of: RESOLVED, REFUNDED, ESCALATED' },
      { status: 400 },
    );
  }

  // Stub — production: verify user is a party to the escrow/dispute or admin,
  // update dispute status, update escrow status accordingly (COMPLETED or REFUNDED),
  // notify both parties.
  return NextResponse.json({
    escrowId,
    disputeId,
    outcome,
    resolvedAt: new Date().toISOString(),
    resolvedBy: session.user.name ?? session.user.email ?? 'Unknown',
  });
}
