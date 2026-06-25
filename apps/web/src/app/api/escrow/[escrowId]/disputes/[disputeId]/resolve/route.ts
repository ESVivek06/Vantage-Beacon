import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const VALID_OUTCOMES = ['RESOLVED', 'REFUNDED', 'ESCALATED'] as const;

export async function PATCH(
  req: Request,
  { params }: { params: { escrowId: string; disputeId: string } },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!VALID_OUTCOMES.includes(body.outcome)) {
    return NextResponse.json({ error: `outcome must be one of: ${VALID_OUTCOMES.join(', ')}` }, { status: 400 });
  }

  return NextResponse.json({
    escrowId: params.escrowId,
    disputeId: params.disputeId,
    outcome: body.outcome,
    resolvedAt: new Date().toISOString(),
  });
}
