import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { escrowId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  const body = formData
    ? { reason: formData.get('reason') as string, description: formData.get('description') as string }
    : await req.json().catch(() => ({}));

  if (!body.reason || !body.description) {
    return NextResponse.json({ error: 'reason and description are required' }, { status: 400 });
  }
  if ((body.description as string).trim().length < 30) {
    return NextResponse.json({ error: 'description must be at least 30 characters' }, { status: 400 });
  }

  const dispute = {
    id: `dis_${Date.now()}`,
    ref: `DIS-${Math.floor(Math.random() * 90000) + 10000}`,
    status: 'OPEN',
    reason: body.reason,
    description: body.description,
    openedBy: (session.user as { name?: string })?.name ?? 'User',
    openedAt: new Date().toISOString(),
    messages: [],
  };

  return NextResponse.json({ escrowId: params.escrowId, dispute }, { status: 201 });
}
