import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { escrowId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ escrowId: params.escrowId, status: 'DECLINED', reason: body.reason ?? null });
}
