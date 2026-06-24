export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { escrowId: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { escrowId } = params;

  // Parse multipart form or JSON
  let reason: string | undefined;
  let description: string | undefined;
  const contentType = req.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      reason = formData.get('reason') as string | undefined;
      description = formData.get('description') as string | undefined;
      // Evidence files would be uploaded and stored via formData.getAll('evidence')
    } else {
      const body = await req.json();
      reason = body.reason;
      description = body.description;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!reason || !description || description.trim().length < 30) {
    return NextResponse.json(
      { error: 'reason and description (min 30 chars) are required' },
      { status: 400 },
    );
  }

  const disputeId = `dis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const ref = `DIS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  // Stub — production: verify user is a party to the escrow, set escrow status to DISPUTED,
  // pause pending payments, create dispute record, notify both parties.
  return NextResponse.json(
    {
      id: disputeId,
      ref,
      escrowId,
      status: 'OPEN',
      reason,
      description: description.trim(),
      openedBy: session.user.name ?? session.user.email ?? 'Unknown',
      openedAt: new Date().toISOString(),
    },
    { status: 201 },
  );
}
