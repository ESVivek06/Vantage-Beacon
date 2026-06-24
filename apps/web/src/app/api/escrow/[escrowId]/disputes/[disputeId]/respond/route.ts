export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { escrowId: string; disputeId: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { escrowId, disputeId } = params;
  let description: string | undefined;

  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      description = formData.get('description') as string | undefined;
    } else {
      const body = await req.json();
      description = body.description;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!description || description.trim().length < 30) {
    return NextResponse.json(
      { error: 'description (min 30 chars) is required' },
      { status: 400 },
    );
  }

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Stub — production: verify user is a party to the escrow/dispute, append message,
  // notify the other party.
  return NextResponse.json({
    id: messageId,
    escrowId,
    disputeId,
    authorName: session.user.name ?? session.user.email ?? 'Unknown',
    authorRole: 'counterparty',
    content: description.trim(),
    createdAt: new Date().toISOString(),
  });
}
