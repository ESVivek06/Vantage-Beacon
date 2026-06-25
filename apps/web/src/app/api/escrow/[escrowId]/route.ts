import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: { escrowId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PATCH(req: Request, { params }: { params: { escrowId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ escrowId: params.escrowId, ...body });
}
