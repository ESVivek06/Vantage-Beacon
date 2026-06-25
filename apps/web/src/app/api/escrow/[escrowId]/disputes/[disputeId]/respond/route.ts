import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { escrowId: string; disputeId: string } },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') ?? '';
  let description = '';
  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    description = (fd.get('description') as string) ?? '';
  } else {
    const body = await req.json().catch(() => ({}));
    description = body.description ?? '';
  }

  if (!description || description.trim().length < 30) {
    return NextResponse.json({ error: 'description must be at least 30 characters' }, { status: 400 });
  }

  const message = {
    id: `msg_${Date.now()}`,
    authorName: (session.user as { name?: string })?.name ?? 'User',
    authorRole: 'counterparty',
    content: description,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ escrowId: params.escrowId, disputeId: params.disputeId, message }, { status: 201 });
}
