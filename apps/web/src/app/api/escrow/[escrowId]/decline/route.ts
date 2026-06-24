export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { escrowId: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { escrowId } = params;
  let reason: string | undefined;
  try {
    const body = await req.json();
    reason = body.reason;
  } catch {
    // reason is optional
  }

  // Stub — production: verify user is the counterparty, update status to DECLINED,
  // record reason, send notification to founder.
  return NextResponse.json({ escrowId, status: 'DECLINED', reason });
}
